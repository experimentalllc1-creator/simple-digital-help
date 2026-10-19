import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { auditPool, getAudit, type AuditRow } from "./sales-audit-store.server";
import { auditCookie, tokenAuditId } from "./sales-audit-http.server";
import { appOrigin, paymentConfig, required } from "./milo-config.server";
import { deliveryStore } from "./milo-store.server";
import { fulfillOrder } from "./milo-fulfillment.server";
import { sendEmail } from "./email.server";

export function customerToken(id: string) {
  const secret = process.env.MILO_CUSTOMER_ACCESS_SECRET?.trim() || required("AUDIT_ACCESS_SECRET");
  if (secret.length < 32) throw new Error("Customer access secret must have at least 32 characters");
  return `${id}.${createHmac("sha256", secret).update(`milo-customer-v1/${id}`).digest("hex")}`;
}
function customerId(token: string) {
  if (!/^[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(token)) return null;
  const id = token.split(".")[0];
  return timingSafeEqual(Buffer.from(token), Buffer.from(customerToken(id))) ? id : null;
}
export async function verifiedMiloCustomer(request: Request) {
  const auditAccess = auditCookie(request);
  if (auditAccess.endsWith(".verified")) {
    const id = tokenAuditId(auditAccess); const audit = id ? await getAudit(id) : undefined;
    if (audit?.status === "paid" && audit.livemode === paymentConfig().livemode) return { email: audit.email, livemode: audit.livemode, audit };
  }
  const token = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith("sdh_milo_customer="))?.slice("sdh_milo_customer=".length) ?? "";
  const id = customerId(token);
  if (!id) return null;
  const row = (await auditPool().query("SELECT email,livemode FROM milo_customer_sessions WHERE id=$1 AND verified_at IS NOT NULL AND expires_at>now()", [id])).rows[0];
  if (!row || row.livemode !== paymentConfig().livemode) return null;
  const audit = (await auditPool().query("SELECT * FROM sales_audits WHERE email=$1 AND livemode=$2 AND status='paid' AND credit_used_order IS NULL AND credit_expires_at>now()+interval '31 minutes' ORDER BY delivered_at LIMIT 1", [row.email, row.livemode])).rows[0] as AuditRow | undefined;
  return { email: row.email as string, livemode: row.livemode as boolean, audit };
}
export async function requestCustomerVerification(email: string, send = sendEmail, ledger = deliveryStore()) {
  email = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("Enter a valid email");
  const mode = paymentConfig().livemode;
  const client = await auditPool().connect();
  let id: string;
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`milo-login/${mode}/${email}`]);
    const recent = (await client.query("SELECT id FROM milo_customer_sessions WHERE email=$1 AND livemode=$2 AND created_at>now()-interval '1 minute' ORDER BY created_at DESC LIMIT 1", [email, mode])).rows[0];
    id = recent?.id ?? randomUUID();
    if (!recent) await client.query("INSERT INTO milo_customer_sessions(id,email,livemode,expires_at) VALUES($1,$2,$3,now()+interval '30 minutes')", [id, email, mode]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  const token = customerToken(id);
  await fulfillOrder({ sessionId: `milo-login/${id}`, paymentIntentId: `identity/${id}`, email, livemode: mode, productCode: "MILO-IDENTITY", releaseVersion: "2.4" }, ledger, async () => ({
    to: email, subject: "Verify your Milo purchase email", text: `Open this private link within 30 minutes to verify your email and see cumulative Milo pricing: ${appOrigin()}/checkout/milos#${token}\nKeep the link private. No purchase or charge has been made.`, idempotencyKey: `milo-login/${id}`,
  }), send);
}
export async function restoreCustomer(token: string) {
  const id = customerId(token);
  if (!id) throw new Error("Invalid verification link");
  const result = await auditPool().query("UPDATE milo_customer_sessions SET verified_at=COALESCE(verified_at,now()),expires_at=now()+interval '30 days' WHERE id=$1 AND expires_at>now() AND created_at>now()-interval '30 minutes' AND livemode=$2 RETURNING id", [id, paymentConfig().livemode]);
  if (!result.rows.length) throw new Error("Expired verification link");
  return `sdh_milo_customer=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${appOrigin().startsWith("https:") ? "; Secure" : ""}`;
}
