import "server-only";
import { accountsEnabled, CustomerAccounts } from "./customer-accounts.server";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import Stripe from "stripe";
import type { PoolClient } from "pg";
import { appOrigin, required, paymentConfig, MILO_VERSION, deliveryEnabled, checkoutEnabled } from "./milo-config.server";
import { stripeClient } from "./stripe.server";
import { auditPool, getAudit, submitAudit, ownedAssignments, checkoutCreditEligible } from "./sales-audit-store.server";
import { auditBasket, validateAuditAnswers, type AuditAnswers } from "./sales-audit";
import { miloAssignments } from "./milo-assignments";
import { miloAttachments } from "./milo-assets.server";
import { fulfillOrder } from "./milo-fulfillment.server";
import { deliveryStore } from "./milo-store.server";
import { auditMiloEmail } from "./sales-audit-email.server";
import { approvedAuditBookingUrl } from "./sales-audit-booking";
import { checkoutMiloBasket } from "./milo-basket-checkout.server";

export function auditEnabled() {
  // Superseded by the free questionnaire. Historical paid records remain private.
  return false;
}
export function auditToken(id: string, verified = false) {
  const secret = required("AUDIT_ACCESS_SECRET");
  if (secret.length < 32) throw new Error("Audit access secret must have at least 32 characters");
  return `${id}.${createHmac("sha256", secret).update(`sales-audit-v1/${id}/${verified ? "email-verified" : "checkout"}`).digest("hex")}${verified ? ".verified" : ""}`;
}
export function tokenAuditId(token: string) {
  if (!/^[0-9a-f-]{36}\.[0-9a-f]{64}(\.verified)?$/.test(token)) return undefined;
  const id = token.split(".")[0];
  const expected = auditToken(id, token.endsWith(".verified"));
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected)) ? id : undefined;
}
export function auditCookie(request: Request) { return request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith("sdh_audit="))?.slice(10) ?? ""; }
const cookie = auditCookie;
function cookieHeader(token: string) { return `sdh_audit=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${appOrigin().startsWith("https:") ? "; Secure" : ""}`; }
function json(body: object, status = 200, headers: Record<string, string> = {}) { return Response.json(body, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", ...headers } }); }
async function authorized(request: Request) {
  const id = tokenAuditId(cookie(request));
  const audit = id ? await getAudit(id) : undefined;
  if (!audit || audit.status !== "paid" || audit.livemode !== paymentConfig().livemode) throw new Error("Paid Audit access required");
  return audit;
}
async function body(request: Request) {
  const text = await request.text();
  if (text.length > 16000) throw new Error("Request too large");
  return JSON.parse(text);
}
export function bookingUrl() {
  return approvedAuditBookingUrl;
}
const defaults = { stripe: stripeClient, attachments: miloAttachments, fulfill: fulfillOrder, delivery: deliveryStore };
async function withPaymentLock<T>(intentId: string, action: (client: PoolClient) => Promise<T>) {
  const client = await auditPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`audit-payment/${intentId}`]);
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}
export async function handleAudit(request: Request, overrides: Partial<typeof defaults> = {}) {
  const deps = { ...defaults, ...overrides };
  try {
    if (request.method === "GET") {
      const audit = await authorized(request);
      const pending = await auditPool().query("SELECT id,status,products,quote FROM sales_audit_orders WHERE audit_id=$1 AND source='audit' ORDER BY created_at DESC LIMIT 1", [audit.id]);
      const order = pending.rows[0];
      const delivery = order?.status === "paid" ? await deps.delivery().find(`audit-order/${order.id}`) : null;
      return json({ report: audit.report, answers: audit.answers, deliveredAt: audit.delivered_at, creditExpiresAt: audit.credit_expires_at, creditEligible: checkoutCreditEligible(audit), refundStatus: audit.refund_status,
        owned: cookie(request).endsWith(".verified") ? await ownedAssignments(audit.email, audit.livemode) : [], tiersEnabled: tiersEnabled(), identityVerified: cookie(request).endsWith(".verified"), bookingUrl: cookie(request).endsWith(".verified") && audit.report ? bookingUrl() : null, bookingStatus: audit.booking_status,
        pendingProducts: order?.status === "pending" ? order.products : [], pendingQuote: order?.status === "pending" ? order.quote : null,
        orderStatus: order ? order.status === "paid" ? delivery?.status === "sent" ? "delivered" : "delivery_pending" : order.status : null });
    }
    if (request.headers.get("origin") !== appOrigin()) return json({ error: "Invalid origin." }, 403);
    const input = await body(request);
    if (input.action === "restore") {
      const id = typeof input.token === "string" ? tokenAuditId(input.token) : undefined;
      const audit = id ? await getAudit(id) : undefined;
      if (!audit || audit.status !== "paid" || audit.livemode !== paymentConfig().livemode) return json({ error: "Paid Audit access required." }, 403);
      return json({ restored: true }, 200, { "Set-Cookie": cookieHeader(input.token) });
    }
    if (input.action === "purchase") {
      if (!auditEnabled()) return json({ error: "Audit purchase is awaiting activation." }, 503);
      required("AUDIT_STRIPE_WEBHOOK_SECRET"); required("RESEND_API_KEY");
      await deps.delivery().ready();
      // Never start a paid Audit when the complete report/checkout schema is missing.
      await auditPool().query("SELECT source,audit_id FROM sales_audit_orders LIMIT 0");
      await auditPool().query("SELECT stripe_customer_id FROM milo_customer_profiles LIMIT 0");
      const existingId = tokenAuditId(cookie(request));
      let existing = existingId ? await getAudit(existingId) : undefined;
      const config = paymentConfig();
      if (existing?.livemode !== config.livemode) existing = undefined;
      if (existing?.status === "paid") return json({ url: `${appOrigin()}/agent-fit-audit/report` });
      const stripe = deps.stripe();
      if (existing?.checkout_id && (await stripe.checkout.sessions.retrieve(existing.checkout_id)).status === "expired") existing = undefined;
      const id = existing?.status === "pending" ? existing.id : randomUUID();
      const token = auditToken(id);
      const price = await stripe.prices.retrieve(required("STRIPE_AUDIT_PRICE_ID"), { expand: ["product"] });
      const product = price.product;
      if (!price.active || price.type !== "one_time" || price.unit_amount !== 19900 || price.currency !== "usd" || price.livemode !== config.livemode ||
        typeof product === "string" || product.deleted || !product.active || product.id !== required("STRIPE_AUDIT_PRODUCT_ID")) throw new Error("Invalid Audit price");
      await auditPool().query("INSERT INTO sales_audits(id,livemode) VALUES($1,$2) ON CONFLICT(id) DO NOTHING", [id, config.livemode]);
      const session = existing?.checkout_id ? await stripe.checkout.sessions.retrieve(existing.checkout_id) : await stripe.checkout.sessions.create({
        mode: "payment", line_items: [{ price: price.id, quantity: 1 }], payment_method_types: ["card"], allow_promotion_codes: false,
        automatic_tax: { enabled: false }, adaptive_pricing: { enabled: false }, metadata: { product: "agent-fit-audit", audit_id: id },
        success_url: `${appOrigin()}/agent-fit-audit/report`, cancel_url: `${appOrigin()}/agent-fit-audit`,
      }, { idempotencyKey: `audit-purchase/${id}` });
      if (!session.url || new URL(session.url).origin !== "https://checkout.stripe.com") throw new Error("Checkout unavailable");
      await auditPool().query("UPDATE sales_audits SET checkout_id=$2 WHERE id=$1", [id, session.id]);
      return json({ url: session.url }, 200, { "Set-Cookie": cookieHeader(token) });
    }
    const audit = await authorized(request);
    if (input.action === "book") {
      if (!cookie(request).endsWith(".verified") || !audit.report) return json({ error: "Verified paid Audit access is required." }, 403);
      const result = await auditPool().query("UPDATE sales_audits SET booking_status='booking_started',booking_url=$2 WHERE id=$1 AND status='paid' AND booking_status IN ('not_booked','booking_started') RETURNING id", [audit.id, bookingUrl()]);
      if (!result.rows.length) return json({ error: "Your included consultation is already booked. Use its confirmation to reschedule." }, 409);
      return json({ url: bookingUrl(), bookingStatus: "booking_started" });
    }
    if (input.action === "save") {
      validateAuditAnswers(input.answers, false);
      await auditPool().query("UPDATE sales_audits SET answers=$2 WHERE id=$1 AND status='paid' AND delivered_at IS NULL", [audit.id, input.answers]);
      return json({ saved: true });
    }
    if (input.action === "submit") { const updated = await submitAudit(audit.id, input.answers as AuditAnswers); return json({ report: updated?.report }); }
    if (input.action === "quote" || input.action === "checkout") {
      if (!cookie(request).endsWith(".verified")) return json({ error: "Open your private purchase email link to verify your identity before buying Milos." }, 403);
      if (!audit.report) throw new Error("Complete questionnaire first");
      const quote = auditBasket(input.slugs, audit.report.recommendations, await ownedAssignments(audit.email, audit.livemode), checkoutCreditEligible(audit), tiersEnabled());
      if (input.action === "quote") return json({ quote });
      // Historical paid Audits can buy Milos while new paid Audit sales remain retired.
      if (!checkoutEnabled()) return json({ error: "Milo checkout is temporarily unavailable." }, 503);
      const client = await auditPool().connect();
      let order;
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`audit/${audit.livemode}/${audit.email}`]);
        const pending = await client.query("SELECT * FROM sales_audit_orders WHERE email=$1 AND livemode=$2 AND status='pending'", [audit.email, audit.livemode]);
        if (pending.rows.length) {
          order = pending.rows[0];
          if (order.source !== "audit" || order.audit_id !== audit.id || JSON.stringify(order.products) !== JSON.stringify(input.slugs)) throw new Error("Resume or cancel your existing checkout first");
        } else {
          const current = (await client.query("SELECT * FROM sales_audits WHERE id=$1 FOR UPDATE", [audit.id])).rows[0];
          if (!current || current.status !== "paid" || current.email !== audit.email || current.livemode !== audit.livemode) throw new Error("Paid Audit access required");
          const owned = await ownedAssignments(audit.email, audit.livemode, client);
          const enforced = { ...auditBasket(input.slugs, current.report.recommendations, owned, checkoutCreditEligible(current), tiersEnabled()), expiresAt: Math.floor(Math.min(Date.now() + 23 * 3600000, checkoutCreditEligible(current) ? new Date(current.credit_expires_at).getTime() : Infinity) / 1000) };
          order = { id: randomUUID(), audit_id: audit.id, email: audit.email, livemode: audit.livemode, quote: enforced, products: input.slugs };
          await client.query("INSERT INTO sales_audit_orders(id,audit_id,email,livemode,quote,products) VALUES($1,$2,$3,$4,$5,$6)", [order.id, audit.id, audit.email, audit.livemode, enforced, JSON.stringify(input.slugs)]);
        }
        await client.query("COMMIT");
      } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
      return json({ url: await checkoutMiloBasket(order, deps.stripe(), deps.attachments) });
    }
    if (input.action === "cancel") {
      const orders = await auditPool().query("SELECT * FROM sales_audit_orders WHERE audit_id=$1 AND source='audit' AND status='pending'", [audit.id]);
      for (const order of orders.rows) {
        if (!order.checkout_id) throw new Error("Resume checkout before cancelling");
        const stripe = deps.stripe();
        let session = await stripe.checkout.sessions.retrieve(order.checkout_id);
        if (session.status === "open") session = await stripe.checkout.sessions.expire(session.id);
        if (session.status !== "expired") throw new Error("Payment is being reconciled; please refresh shortly");
        await auditPool().query("UPDATE sales_audit_orders SET status='expired' WHERE id=$1 AND status='pending'", [order.id]);
      }
      return json({ cancelled: true });
    }
    return json({ error: "Unknown action." }, 400);
  } catch {
    return json({ error: "Unable to complete this request. Check your selections and paid access, or resume/cancel your pending checkout. Please try again." }, 400);
  }
}
// Commercial policy approved by the owner. Production activation is a separate gate.
export function tiersEnabled() { return false; }

export async function recordMiloRefund(charge: Stripe.Charge) {
  if (accountsEnabled()) await new CustomerAccounts().refund(charge);
  const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!intent) return;
  await withPaymentLock(intent, async client => {
    await client.query(`INSERT INTO sales_audit_ownership_exclusions(payment_intent_id,reason,full_refund) VALUES($1,'Stripe refund',$2)
      ON CONFLICT(payment_intent_id) DO UPDATE SET full_refund=sales_audit_ownership_exclusions.full_refund OR EXCLUDED.full_refund`, [intent, charge.refunded]);
    await client.query("UPDATE sales_audit_orders SET status='refunded' WHERE payment_intent_id=$1", [intent]);
    await client.query("UPDATE sales_audits SET status='refunded',refund_status='completed' WHERE payment_intent_id=$1 AND $2=true", [intent, charge.refunded]);
  });
}

export async function processAuditSession(session: Stripe.Checkout.Session, overrides: Partial<typeof defaults> = {}) {
  const deps = { ...defaults, ...overrides };
  const kind = session.metadata?.product;
  const config = paymentConfig();
  if (session.status !== "complete" || session.mode !== "payment" || session.livemode !== config.livemode || session.currency !== "usd") throw new Error("Invalid payment");
  const intent = session.payment_intent;
  if (session.amount_total === 0) {
    if (session.payment_status !== "no_payment_required" && session.payment_status !== "paid") throw new Error("Unpaid zero order");
  } else if (session.payment_status !== "paid" || !intent || typeof intent === "string" || intent.status !== "succeeded" || intent.amount_received !== session.amount_total || intent.currency !== "usd" || intent.livemode !== config.livemode) throw new Error("Unpaid order");
  const storedCart = ["sales-audit-cart","milo-volume-cart"].includes(kind ?? "") ? (await auditPool().query("SELECT * FROM sales_audit_orders WHERE id=$1", [session.metadata!.order_id])).rows[0] : undefined;
  let email = session.customer_details?.email?.trim().toLowerCase();
  // A zero-dollar Checkout can omit collected details. Its immutable, verified
  // Customer binding supplies the recipient without trusting a browser value.
  if (!email && storedCart && session.customer) {
    const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
    const profile = (await auditPool().query("SELECT stripe_customer_id FROM milo_customer_profiles WHERE email=$1 AND livemode=$2", [storedCart.email, storedCart.livemode])).rows[0];
    if (profile?.stripe_customer_id === customerId) email = storedCart.email;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Missing payment identity");
  const lines = session.line_items;
  if (!lines || lines.has_more) throw new Error("Missing payment lines");
  const intentId = typeof intent === "object" && intent ? intent.id : `zero/${session.id}`;
  if (kind === "agent-fit-audit") {
    const audit = await getAudit(session.metadata!.audit_id);
    const line = lines.data[0];
    const product = line?.price?.product;
    if (!audit || audit.checkout_id !== session.id || audit.livemode !== session.livemode || session.amount_total !== 19900 || session.amount_subtotal !== 19900 || lines.data.length !== 1 || line.quantity !== 1 || line.amount_total !== 19900 || line.price?.id !== required("STRIPE_AUDIT_PRICE_ID") || (typeof product === "string" ? product : product?.id) !== required("STRIPE_AUDIT_PRODUCT_ID")) throw new Error("Invalid Audit order");
    if (audit.status === "refunded") return;
    const terminal = await withPaymentLock(intentId, async client => {
      const current = (await client.query("SELECT status FROM sales_audits WHERE id=$1 FOR UPDATE", [audit.id])).rows[0];
      const refund = (await client.query("SELECT full_refund FROM sales_audit_ownership_exclusions WHERE payment_intent_id=$1", [intentId])).rows[0];
      if (current.status === "refunded" || refund?.full_refund) {
        await client.query("UPDATE sales_audits SET status='refunded',refund_status='completed',email=$2,payment_intent_id=$3 WHERE id=$1", [audit.id, email, intentId]);
        return true;
      }
      await client.query("UPDATE sales_audits SET status='paid',email=$2,payment_intent_id=$3 WHERE id=$1 AND status IN ('pending','paid')", [audit.id, email, intentId]);
      return false;
    });
    if (terminal) return;
    await deps.fulfill({ sessionId: `audit-paid/${audit.id}`, paymentIntentId: intentId, email, livemode: session.livemode, productCode: "AUDIT-SALES", releaseVersion: MILO_VERSION }, deps.delivery(), async () => ({
      to: email, subject: "Your Agent Fit Audit is ready to begin", text: `Your $199 Sales Agent Fit Audit is paid. Complete the short questionnaire to see automated matches immediately. Open your private access link to verify your email and purchase recommended Milos: ${appOrigin()}/agent-fit-audit/report#${auditToken(audit.id, true)}\nKeep this link private. Your Audit includes one optional 15-minute consultation.`, idempotencyKey: `audit-paid/${audit.id}`,
    }));
    return;
  }
  if (kind !== "sales-audit-cart" && kind !== "milo-volume-cart") return;
  const order = storedCart;
  if (!order || order.checkout_id !== session.id || order.audit_id !== (session.metadata?.audit_id ?? null) || (order.source === 'storefront') !== (kind === 'milo-volume-cart') || order.email !== email || order.livemode !== session.livemode || session.amount_total !== order.quote.totalCents || session.amount_subtotal !== order.quote.totalCents || lines.data.length !== order.products.length) throw new Error("Invalid Milo cart");
  if (["refunded", "cancelled"].includes(order.status)) return;
  if (!["pending", "paid"].includes(order.status)) throw new Error("Invalid cart state");
  const expected = (order.products as string[]).map((slug, i) => ({ config: paymentConfig(slug), amount: order.quote.lines[i].amountCents }));
  const seen = new Set<string>();
  for (const line of lines.data) {
    const price = line.price; const product = price?.product; const id = typeof product === "string" ? product : product?.id;
    const match = expected.find(e => e.config.productId === id);
    if (!price || !id || seen.has(id) || !match || line.quantity !== 1 || line.amount_total !== match.amount || line.amount_subtotal !== match.amount || price.unit_amount !== match.amount || price.currency !== "usd" || price.type !== "one_time" || price.livemode !== session.livemode) throw new Error("Invalid cart line");
    seen.add(id);
  }
  const client = await auditPool().connect();
  let refunded = false;
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`audit-payment/${intentId}`]);
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`audit/${order.livemode}/${order.email}`]);
    const currentOrder = (await client.query("SELECT status FROM sales_audit_orders WHERE id=$1 FOR UPDATE", [order.id])).rows[0];
    if (!currentOrder || !["pending", "paid"].includes(currentOrder.status)) throw new Error("Order no longer qualifies");
    if (order.audit_id) {
      const audit = (await client.query("SELECT * FROM sales_audits WHERE id=$1 FOR UPDATE", [order.audit_id])).rows[0];
      // A confirmed Milo purchase retains its fulfillment entitlement when an
      // owner later refunds the Audit itself. Pending credits still need paid access.
      if (!audit || audit.email !== email || (currentOrder.status !== "paid" && audit.status !== "paid") || (order.quote.creditCents > 0 && audit.credit_used_order && audit.credit_used_order !== order.id)) throw new Error("Credit unavailable");
      if (order.quote.creditCents > 0) await client.query("UPDATE sales_audits SET credit_used_order=$2 WHERE id=$1", [audit.id, order.id]);
    } else if (order.quote.creditCents) throw new Error("No Audit for claimed credit");
    refunded = !!(await client.query("SELECT payment_intent_id FROM sales_audit_ownership_exclusions WHERE payment_intent_id=$1", [intentId])).rows.length;
    await client.query("UPDATE sales_audit_orders SET status=$3,payment_intent_id=$2 WHERE id=$1 AND status IN ('pending','paid')", [order.id, intentId, refunded ? "refunded" : "paid"]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  if (refunded) return;
  const codes = (order.products as string[]).map(slug => miloAssignments.find(a => a.slug === slug)!.productCode);
  let purchaseFailed = false;
  if (accountsEnabled()) await new CustomerAccounts().recordPurchase(session, {sessionId:session.id,paymentIntentId:intentId,email,livemode:session.livemode,productCode:codes[0],productCodes:codes,releaseVersion:MILO_VERSION}, `audit-order/${order.id}`, {subtotal:order.quote.subtotalCents+order.quote.savingsCents,discount:order.quote.savingsCents+order.quote.creditCents,discounts:[{source:"existing-approved-quote",creditCents:order.quote.creditCents,savingsCents:order.quote.savingsCents}]}).catch(() => {purchaseFailed=true;});
  await deps.fulfill({ sessionId: `audit-order/${order.id}`, paymentIntentId: intentId, email, livemode: session.livemode, productCode: codes[0], productCodes: codes, releaseVersion: MILO_VERSION }, deps.delivery(),
    (to, sessionId, code, version) => auditMiloEmail(to, sessionId, code as string, version ?? MILO_VERSION, order.quote, codes.length));
  if (purchaseFailed) throw new Error("Purchase ledger requires retry");
}

export async function handleAuditWebhook(request: Request, overrides: Partial<typeof defaults> = {}) {
  const deps = { ...defaults, ...overrides };
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) return json({ error: "Missing signature." }, 400);
    const raw = await request.text();
    if (raw.length > 256000) return json({ error: "Body too large." }, 400);
    const stripe = deps.stripe();
    let event: Stripe.Event;
    try { event = stripe.webhooks.constructEvent(raw, signature, required("AUDIT_STRIPE_WEBHOOK_SECRET")); } catch { return json({ error: "Invalid signature." }, 400); }
    if (event.livemode !== paymentConfig().livemode) return json({ error: "Mode mismatch." }, 400);
    if (event.type === "charge.refunded") {
      const charge = event.data.object;
      // Any partial refund conservatively removes the whole order from qualifying ownership.
      await recordMiloRefund(charge);
      return json({ received: true });
    }
    if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.expired"].includes(event.type)) return json({ received: true });
    const incoming = event.data.object as Stripe.Checkout.Session;
    if (!["agent-fit-audit", "sales-audit-cart", "milo-volume-cart"].includes(incoming.metadata?.product ?? "")) return json({ received: true });
    const session = await stripe.checkout.sessions.retrieve(incoming.id, { expand: ["line_items.data.price.product", "payment_intent"] });
    if (session.id !== incoming.id) throw new Error("Checkout session mismatch");
    if (session.line_items?.has_more) session.line_items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ["data.price.product"] });
    if (event.type === "checkout.session.expired" && session.status === "expired") {
      await auditPool().query("UPDATE sales_audit_orders SET status='expired' WHERE checkout_id=$1 AND status='pending'", [session.id]);
      return json({ received: true });
    }
    if (session.payment_status === "unpaid") return json({ received: true });
    if (!deliveryEnabled()) throw new Error("Delivery disabled");
    await processAuditSession(session, deps);
    return json({ received: true });
  } catch { console.error("Sales Audit payment requires retry or reconciliation."); return json({ error: "Processing incomplete; retry required." }, 503); }
}
