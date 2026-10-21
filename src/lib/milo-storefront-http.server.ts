import "server-only";
import { hasLegalAcceptance } from "./legal-acceptance.server";
import { randomUUID } from "node:crypto";
import { appOrigin, checkoutEnabled, paymentConfig, required } from "./milo-config.server";
import { auditPool, ownedAssignments, checkoutCreditEligible } from "./sales-audit-store.server";
import { priceMiloBasket } from "./milo-pricing";
import { verifiedMiloCustomer, requestCustomerVerification, restoreCustomer } from "./milo-customer.server";
import { checkoutMiloBasket, type MiloBasketOrder } from "./milo-basket-checkout.server";
import { stripeClient } from "./stripe.server";
import { miloAttachments } from "./milo-assets.server";
import { deliveryStore } from "./milo-store.server";
import { sendEmail } from "./email.server";

export function storefrontPricingEnabled() {
  return false;
}
const defaults = { stripe: stripeClient, attachments: miloAttachments, store: deliveryStore, send: sendEmail };
function json(body: object, status = 200, headers: Record<string, string> = {}) { return Response.json(body, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", ...headers } }); }
export async function handleStorefront(request: Request, overrides: Partial<typeof defaults> = {}) {
  if (!storefrontPricingEnabled() || !checkoutEnabled()) return json({ error: "The new Milo checkout is awaiting release activation." }, 503);
  const deps = { ...defaults, ...overrides };
  try {
    const customer = await verifiedMiloCustomer(request);
    if (request.method === "GET") {
      if (!customer) return json({ verified: false });
      const pending = (await auditPool().query("SELECT * FROM sales_audit_orders WHERE email=$1 AND livemode=$2 AND source='storefront' ORDER BY created_at DESC LIMIT 1", [customer.email, customer.livemode])).rows[0];
      const delivery = pending?.status === "paid" ? await deps.store().find(`audit-order/${pending.id}`) : null;
      return json({ verified: true, owned: await ownedAssignments(customer.email, customer.livemode), creditEligible: !!customer.audit && checkoutCreditEligible(customer.audit), creditSlugs: customer.audit?.report?.recommendations.map(r => r.slug) ?? [],
        pendingProducts: pending?.status === "pending" ? pending.products : [], pendingQuote: pending?.status === "pending" ? pending.quote : null,
        orderCreatedAt: pending?.created_at, orderStatus: pending?.status === "paid" ? delivery?.status === "sent" ? "delivered" : "delivery_pending" : pending?.status ?? null });
    }
    if (request.headers.get("origin") !== appOrigin()) return json({ error: "Invalid origin." }, 403);
    const raw = await request.text(); if (raw.length > 16000) return json({ error: "Request too large." }, 413);
    const input = JSON.parse(raw);
    if (input.action === "checkout" && !hasLegalAcceptance(input)) return json({ error: "Please accept the current Terms of Service and acknowledge the Privacy Policy and Product & AI Disclaimers." }, 400);
    if (input.action === "verify-email") { await requestCustomerVerification(input.email, deps.send, deps.store()); return json({ sent: true }); }
    if (input.action === "restore") return json({ verified: true }, 200, { "Set-Cookie": await restoreCustomer(input.token) });
    if (!customer) return json({ error: "Verify your purchase email first." }, 403);
    if (input.action === "cancel") {
      const pending = (await auditPool().query("SELECT * FROM sales_audit_orders WHERE email=$1 AND livemode=$2 AND source='storefront' AND status='pending'", [customer.email, customer.livemode])).rows[0];
      if (pending) {
        if (!pending.checkout_id) throw new Error("Resume before cancelling an uncertain checkout");
        const stripe = deps.stripe(); let session = await stripe.checkout.sessions.retrieve(pending.checkout_id);
        if (session.status === "open") session = await stripe.checkout.sessions.expire(session.id);
        if (session.status !== "expired") throw new Error("Payment still requires reconciliation");
        await auditPool().query("UPDATE sales_audit_orders SET status='expired' WHERE id=$1 AND status='pending'", [pending.id]);
      }
      return json({ cancelled: true });
    }
    if (!["quote", "checkout"].includes(input.action)) return json({ error: "Unknown action." }, 400);
    const audit = customer.audit;
    const quote = priceMiloBasket(input.slugs, await ownedAssignments(customer.email, customer.livemode), audit?.report?.recommendations.map(r => r.slug), !!audit && checkoutCreditEligible(audit));
    if (input.action === "quote") return json({ quote });
    required("STRIPE_WEBHOOK_SECRET"); required("RESEND_API_KEY"); await deps.store().ready();
    const client = await auditPool().connect(); let order: MiloBasketOrder;
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`audit/${customer.livemode}/${customer.email}`]);
      const pending = (await client.query("SELECT * FROM sales_audit_orders WHERE email=$1 AND livemode=$2 AND status='pending'", [customer.email, customer.livemode])).rows[0];
      if (pending) {
        if (pending.source !== "storefront" || JSON.stringify(pending.products) !== JSON.stringify(input.slugs)) throw new Error("Resume or cancel your pending checkout before changing the basket");
        order = pending;
      } else {
        const current = audit ? (await client.query("SELECT * FROM sales_audits WHERE id=$1 FOR UPDATE", [audit.id])).rows[0] : undefined;
        const available = !!current && current.email === customer.email && checkoutCreditEligible(current);
        const enforced = priceMiloBasket(input.slugs, await ownedAssignments(customer.email, customer.livemode, client), current?.report?.recommendations.map((r: { slug: string }) => r.slug), available);
        const expiresAt = Math.floor(Math.min(Date.now() + 23 * 3600000, enforced.creditCents ? new Date(current.credit_expires_at).getTime() : Infinity) / 1000);
        order = { id: randomUUID(), audit_id: enforced.creditCents ? audit!.id : null, email: customer.email, livemode: customer.livemode, source: "storefront", products: input.slugs, quote: { ...enforced, expiresAt } };
        await client.query("INSERT INTO sales_audit_orders(id,audit_id,email,livemode,quote,products,source) VALUES($1,$2,$3,$4,$5,$6,'storefront')", [order.id, order.audit_id, order.email, order.livemode, order.quote, JSON.stringify(order.products)]);
      }
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
    return json({ url: await checkoutMiloBasket(order, deps.stripe(), deps.attachments, input) });
  } catch { return json({ error: "Unable to complete checkout. Verify your email, check the basket, or resume/cancel the pending checkout." }, 400); }
}
