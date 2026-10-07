import "server-only";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { EmailMessage } from "./email.server";
import { required } from "./milo-config.server";

export type PaidOrder = { sessionId: string; paymentIntentId: string; email: string; livemode: boolean; productCode: string; productCodes?: string[]; releaseVersion: string };
export type DeliverySnapshot = EmailMessage | { deliveries: { message: EmailMessage; resendId?: string }[] };
type Row = { status: string; message: DeliverySnapshot };
// This query contract also runs against an embedded PostgreSQL engine in tests.
export type Database = { query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };

export class DeliveryStore {
  constructor(private readonly db: Database) {}

  async ready() {
    await this.db.query("SELECT session_id, product_code, product_codes, release_version FROM milo_deliveries LIMIT 0");
  }

  async find(sessionId: string): Promise<Row | undefined> {
    const result = await this.db.query("SELECT status, message FROM milo_deliveries WHERE session_id = $1", [sessionId]);
    return result.rows[0] as Row | undefined;
  }

  async prepare(order: PaidOrder, message: DeliverySnapshot) {
    await this.db.query(`INSERT INTO milo_deliveries
      (session_id, payment_intent_id, livemode, recipient, message, product_code, release_version, product_codes)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8) ON CONFLICT (session_id) DO NOTHING`,
    [order.sessionId, order.paymentIntentId, order.livemode, order.email, JSON.stringify(message), order.productCode, order.releaseVersion, order.productCodes ?? [order.productCode]]);
  }

  async reviewLegacy(order: PaidOrder) {
    await this.db.query(`INSERT INTO milo_deliveries
      (session_id, payment_intent_id, livemode, recipient, message, product_code, release_version, status)
      VALUES ($1, $2, $3, $4, '{}'::jsonb, $5, $6, 'manual_review') ON CONFLICT (session_id) DO NOTHING`,
    [order.sessionId, order.paymentIntentId, order.livemode, order.email, order.productCode, order.releaseVersion]);
  }

  async claim(sessionId: string): Promise<{ token: string; message: DeliverySnapshot } | "sent"> {
    // Resend remembers keys for 24h. A 23h cutoff leaves a safety margin.
    // Ambiguous old sends require reconciliation, never an expired-key resend.
    await this.db.query(`UPDATE milo_deliveries SET status = 'manual_review'
      WHERE session_id = $1 AND status IN ('pending', 'sending')
      AND first_attempt_at <= now() - interval '23 hours'
      AND (lease_until IS NULL OR lease_until < now())`, [sessionId]);
    const token = randomUUID();
    const result = await this.db.query(`UPDATE milo_deliveries SET
      status = 'sending', lease_token = $2, lease_until = now() + interval '2 minutes',
      first_attempt_at = COALESCE(first_attempt_at, now()), attempts = attempts + 1
      WHERE session_id = $1 AND status IN ('pending', 'sending')
      AND (lease_until IS NULL OR lease_until < now())
      AND (first_attempt_at IS NULL OR first_attempt_at > now() - interval '23 hours')
      RETURNING message`, [sessionId, token]);
    if (result.rows[0]) return { token, message: result.rows[0].message as DeliverySnapshot };
    if ((await this.find(sessionId))?.status === "sent") return "sent";
    throw new Error("Delivery busy or requires reconciliation");
  }

  async recordDelivery(sessionId: string, token: string, index: number, resendId: string) {
    const result = await this.db.query(`UPDATE milo_deliveries
      SET message = jsonb_set(message, ARRAY['deliveries', $3::text, 'resendId'], to_jsonb($4::text))
      WHERE session_id = $1 AND lease_token = $2 AND status = 'sending' RETURNING session_id`,
    [sessionId, token, index, resendId]);
    if (!result.rows.length) throw new Error("Delivery lease lost");
  }

  async complete(sessionId: string, token: string, resendId: string) {
    const result = await this.db.query(`UPDATE milo_deliveries SET status = 'sent',
      resend_id = $3, sent_at = now(), lease_until = NULL, lease_token = NULL
      WHERE session_id = $1 AND lease_token = $2 AND status = 'sending' RETURNING session_id`,
    [sessionId, token, resendId]);
    if (!result.rows.length) throw new Error("Delivery lease lost");
  }

  async release(sessionId: string, token: string) {
    await this.db.query(`UPDATE milo_deliveries SET status = 'pending', lease_until = NULL, lease_token = NULL
      WHERE session_id = $1 AND lease_token = $2 AND status = 'sending'`, [sessionId, token]);
  }
}

let pool: Pool | undefined;
export function deliveryStore() {
  pool ??= new Pool({ connectionString: required("DATABASE_URL"), max: 3,
    connectionTimeoutMillis: 5_000, idleTimeoutMillis: 10_000, statement_timeout: 10_000 });
  // Connection errors may contain credentials/host details; do not log them.
  if (pool.listenerCount("error") === 0) pool.on("error", () => {});
  return new DeliveryStore(pool);
}
