import "server-only";
import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import type Stripe from "stripe";
import { auditPool } from "./sales-audit-store.server";
import type { Database, PaidOrder } from "./milo-store.server";
import { miloAssignments } from "./milo-assignments";
import { appOrigin, required } from "./milo-config.server";
import { sendEmail } from "./email.server";

export const CONSENT_VERSION = "occasional-milo-updates-2026-10-20";
export const CONSENT_WORDING = "Yes, keep me updated. I agree to occasional emails from Simple Digital Help about Milo improvements, free resources, complementary Sales and Marketing Milos, and customer offers. I can unsubscribe at any time.";
export function accountsEnabled() { return process.env.CUSTOMER_ACCOUNTS_ENABLED === "true"; }
export type PurchaseItem = { productCode: string; slug: string; region: string; agentId: string; releaseVersion: string };
export type Purchase = { session_id: string; payment_intent_id: string; delivery_id: string; purchased_at: Date; amount_paid: number; subtotal: number; currency: string; discount_amount: number; discounts: unknown[]; items: PurchaseItem[]; status: string; refunded_amount: number };
export class CustomerAccounts {
 constructor(private db: Database = auditPool()) {}
 async recordPurchase(session: Stripe.Checkout.Session, order: PaidOrder, deliveryId = order.sessionId, adjustments?: {subtotal: number; discount: number; discounts: unknown[]}) {
  if ((session.payment_status !== "paid" && !(session.amount_total === 0 && session.payment_status === "no_payment_required")) || session.status !== "complete" || session.id !== order.sessionId || session.livemode !== order.livemode || session.amount_total === null || session.currency === null) throw new Error("Confirmed paid session required");
  const email = order.email.trim().toLowerCase();
  const items = (order.productCodes ?? [order.productCode]).map(code => {
   const a = miloAssignments.find(a => a.productCode === code); if (!a) throw new Error("Unknown paid assignment");
   return { productCode: code, slug: a.slug, region: a.region, agentId: a.agentId, releaseVersion: order.releaseVersion };
  });
  const customer = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  // The profile exists for guests; email_verified and registered_at stay unset until authentication.
  await this.db.query(`INSERT INTO milo_customer_profiles(id,email,livemode,stripe_customer_id) VALUES($1,$2,$3,$4)
   ON CONFLICT(email,livemode) DO UPDATE SET stripe_customer_id=COALESCE(milo_customer_profiles.stripe_customer_id,EXCLUDED.stripe_customer_id)`, [randomUUID(),email,order.livemode,customer]);
  await this.db.query(`INSERT INTO milo_purchases(session_id,payment_intent_id,customer_id,livemode,delivery_id,purchased_at,amount_paid,subtotal,currency,discount_amount,discounts,items)
   SELECT $1,$2,id,$3,$12,to_timestamp($5),$6,$7,$8,$9,$10::jsonb,$11::jsonb FROM milo_customer_profiles WHERE email=$4 AND livemode=$3
   ON CONFLICT(session_id) DO NOTHING`, [session.id,order.paymentIntentId,order.livemode,email,session.created,session.amount_total,adjustments?.subtotal ?? session.amount_subtotal,session.currency,adjustments?.discount ?? session.total_details?.amount_discount ?? 0,JSON.stringify(adjustments?.discounts ?? session.discounts ?? []),JSON.stringify(items),deliveryId]);
  // Refunds can arrive before or after a delayed Checkout webhook. Never revive access on retry.
  await this.db.query(`UPDATE milo_purchases p SET refunded_amount=r.amount,status=CASE WHEN r.full_refund THEN 'refunded' ELSE 'partially_refunded' END
   FROM milo_purchase_refunds r WHERE p.payment_intent_id=r.payment_intent_id AND p.session_id=$1`,[session.id]);
  const click = session.metadata?.recommendation_click_id;
  if (click && /^[0-9a-f-]{36}$/.test(click)) await this.db.query(`UPDATE milo_purchases p SET recommendation_click_id=c.id FROM milo_recommendation_clicks c
   WHERE p.session_id=$1 AND c.id=$2 AND c.customer_id=p.customer_id AND c.created_at>p.purchased_at-interval '30 days'
   AND EXISTS(SELECT 1 FROM jsonb_array_elements(p.items) i WHERE i->>'slug'=c.slug)`, [session.id,click]);
 }
 async refund(charge: Stripe.Charge) {
  const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!intent) return;
  await this.db.query(`INSERT INTO milo_purchase_refunds(payment_intent_id,amount,full_refund) VALUES($1,$2,$3)
   ON CONFLICT(payment_intent_id) DO UPDATE SET amount=GREATEST(milo_purchase_refunds.amount,EXCLUDED.amount),full_refund=milo_purchase_refunds.full_refund OR EXCLUDED.full_refund`,[intent,charge.amount_refunded,charge.refunded]);
  await this.db.query(`UPDATE milo_purchases p SET refunded_amount=r.amount,status=CASE WHEN r.full_refund THEN 'refunded' ELSE 'partially_refunded' END FROM milo_purchase_refunds r WHERE p.payment_intent_id=r.payment_intent_id AND p.payment_intent_id=$1`,[intent]);
 }
 async purchases(customerId: string, live: boolean): Promise<Purchase[]> {
  return (await this.db.query("SELECT * FROM milo_purchases WHERE customer_id=$1 AND livemode=$2 ORDER BY purchased_at DESC,session_id",[customerId,live])).rows as unknown as Purchase[];
 }
 async purchase(customerId: string, live: boolean, id: string) {
  return (await this.db.query("SELECT * FROM milo_purchases WHERE customer_id=$1 AND livemode=$2 AND session_id=$3",[customerId,live,id])).rows[0] as unknown as Purchase | undefined;
 }
 async attachment(customerId: string, live: boolean, id: string, code: string, kind: "txt"|"pdf") {
  const purchase = await this.purchase(customerId,live,id);
  if (!purchase || purchase.status !== "paid" || !purchase.items.some(i=>i.productCode===code)) return null;
  const row = (await this.db.query("SELECT message,product_codes,product_code FROM milo_deliveries WHERE session_id=$1 AND livemode=$2",[purchase.delivery_id,live])).rows[0];
  if (!row) return null;
  // Snapshot bytes preserve the exact version that was purchased, including historical packages.
  const snapshot = row.message as {attachments?: {filename:string;content:string}[];deliveries?: {message:{attachments?: {filename:string;content:string}[]}}[]};
  const codes = (row.product_codes ?? [row.product_code]) as string[];
  const index = codes.indexOf(code); if (index < 0) return null;
  const message = snapshot.deliveries ? snapshot.deliveries[index]?.message : codes.length === 1 ? snapshot : null;
  return message?.attachments?.find(a=>a.filename.toLowerCase().endsWith(`.${kind}`)) ?? null;
 }
 async consent(customerId: string, granted: boolean, source: "account-preferences"|"email-unsubscribe", send?: typeof sendEmail) {
  const eventId=randomUUID();
  const result=await this.db.query(`WITH previous AS (SELECT id,email,marketing_consent FROM milo_customer_profiles WHERE id=$2 FOR UPDATE),
   event AS (INSERT INTO milo_consent_events(id,customer_id,granted,source,wording_version,wording)
    SELECT $1,id,$3,$4,$5,$6 FROM previous WHERE marketing_consent IS DISTINCT FROM $3 RETURNING customer_id,recorded_at),
   updated AS (UPDATE milo_customer_profiles p SET marketing_consent=$3,marketing_consent_at=event.recorded_at,updated_at=now() FROM event WHERE p.id=event.customer_id RETURNING p.email)
   SELECT email FROM updated`,[eventId,customerId,granted,source,CONSENT_VERSION,CONSENT_WORDING]);
  if(!granted||!send||!result.rows.length)return "saved";
  try{
   await send({to:result.rows[0].email as string,subject:"You’re subscribed to Simple Digital Help updates",text:`Thanks for subscribing. You’ll receive occasional Milo improvements, free resources, and customer offers. Manage your preferences: ${appOrigin()}/account/preferences\n\nUnsubscribe at any time: ${appOrigin()}/account/unsubscribe?token=${unsubscribeToken(customerId)}`,idempotencyKey:`account-subscription/${eventId}`});
   return "confirmed";
  }catch{return "email-unconfirmed";}
 }
 async register(customerId: string, send = sendEmail) {
  await this.db.query("UPDATE milo_customer_profiles SET registered_at=COALESCE(registered_at,now()) WHERE id=$1 AND email_verified=true",[customerId]);
  // Claim once before attempting delivery: ignored invitations are never resent, even after ambiguous provider acceptance.
  const row = (await this.db.query("UPDATE milo_customer_profiles SET permission_invited_at=now() WHERE id=$1 AND email_verified=true AND permission_invited_at IS NULL RETURNING email",[customerId])).rows[0];
  if (!row) return;
  await send({to:row.email as string,subject:"Would you like to hear from us occasionally?",text:`Your free Simple Digital Help account is ready. With your permission, we may send occasional, relevant emails about Milo upgrades and improvements, free tools and resources, complementary Sales and Marketing Milos, and special customer offers.\n\nYes, keep me updated: ${appOrigin()}/account/preferences\n\nNothing is enabled unless you choose to opt in. You can unsubscribe at any time. Ignoring this invitation keeps promotional messages disabled.`,idempotencyKey:`account-permission/${customerId}`}).catch(()=>{});
 }
}
export function unsubscribeToken(id: string) {
 const secret=required("BETTER_AUTH_SECRET"); if(secret.length<32)throw new Error("Invalid authentication secret");
 return `${id}.${createHmac("sha256",secret).update(`marketing-unsubscribe/v1/${id}`).digest("hex")}`;
}
export function unsubscribeIdentity(token: string) {
 if(!/^[A-Za-z0-9-]{1,64}\.[0-9a-f]{64}$/.test(token))return null;
 const id=token.split(".")[0],expected=unsubscribeToken(id);
 return expected.length===token.length&&timingSafeEqual(Buffer.from(expected),Buffer.from(token))?id:null;
}
