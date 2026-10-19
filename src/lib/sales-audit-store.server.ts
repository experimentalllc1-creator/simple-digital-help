import "server-only";
import { Pool } from "pg";
import { required } from "./milo-config.server";
import type { AuditAnswers, Recommendation } from "./sales-audit";
import { matchSalesAudit } from "./sales-audit";
import type { Database } from "./milo-store.server";
import { approvedAuditBookingUrl } from "./sales-audit-booking";
export type AuditRow = { id: string; checkout_id: string | null; payment_intent_id: string | null; email: string; livemode: boolean; status: string; answers: AuditAnswers | null; report: ReturnType<typeof matchSalesAudit> | null; delivered_at: Date | null; credit_expires_at: Date | null; credit_used_order: string | null; refund_status: string; booking_url: string | null; booking_status: string };
let pool: Pool;
// Dependency injection for isolated embedded-Postgres acceptance tests.
export function setAuditDatabaseForTests(database: Pool) {
  if (process.env.NODE_ENV !== "test") throw new Error("Test database override requires test mode");
  pool = database;
}
export function auditPool() {
  pool ??= new Pool({ connectionString: required("DATABASE_URL"), max: 3, connectionTimeoutMillis: 5000, statement_timeout: 15000 });
  if (!pool.listenerCount("error")) pool.on("error", () => {});
  return pool;
}
export async function getAudit(id: string): Promise<AuditRow | undefined> { return (await auditPool().query("SELECT * FROM sales_audits WHERE id=$1", [id])).rows[0]; }
export async function submitAudit(id: string, answers: AuditAnswers) {
  const report = matchSalesAudit(answers);
  const booking = approvedAuditBookingUrl;
  await auditPool().query(`UPDATE sales_audits SET answers=$2,report=$3,delivered_at=now(),refund_status=$4,booking_url=$5,
    credit_expires_at=CASE WHEN $4='none' THEN now()+interval '30 days' ELSE NULL END
    WHERE id=$1 AND status='paid' AND delivered_at IS NULL`, [id, answers, report, report.recommendations.length ? "none" : "approval_required", booking]);
  return getAudit(id);
}
export async function ownedAssignments(email: string, livemode: boolean, db: Database = auditPool()) {
  // Eligibility is shared across both storefront and Audit purchases. Live
  // activation separately requires historical refund reconciliation.
  const orders = await db.query("SELECT products FROM sales_audit_orders WHERE email=$1 AND livemode=$2 AND status='paid'", [email, livemode]);
  const result = orders.rows.flatMap(r => r.products as string[]);
  const legacy = await db.query(`SELECT product_codes FROM milo_deliveries d WHERE lower(recipient)=$1 AND livemode=$2 AND session_id NOT LIKE 'audit-%'
      AND NOT EXISTS (SELECT 1 FROM sales_audit_ownership_exclusions e WHERE e.payment_intent_id=d.payment_intent_id)`, [email, livemode]);
  const { miloAssignments } = await import("./milo-assignments");
  result.push(...legacy.rows.flatMap(r => (r.product_codes as string[] ?? []).flatMap(code => miloAssignments.filter(a => a.productCode === code).map(a => a.slug))));
  return [...new Set(result)];
}
export function creditEligible(audit: AuditRow, now = Date.now()) { return audit.status === "paid" && !!audit.delivered_at && !!audit.credit_expires_at && !!audit.report?.recommendations.length && !audit.credit_used_order && now < new Date(audit.credit_expires_at).getTime(); }
export function checkoutCreditEligible(audit: AuditRow) { return creditEligible(audit, Date.now() + 31 * 60000); }
export type { Recommendation };
