import "server-only";
import { hasLegalAcceptance, acceptanceMetadata } from "./legal-acceptance.server";
import type Stripe from "stripe";
import { createHash } from "node:crypto";
import { paymentConfig, appOrigin, MILO_VERSION } from "./milo-config.server";
import { miloAssignments } from "./milo-assignments";
import { auditPool } from "./sales-audit-store.server";
import type { priceMiloBasket } from "./milo-pricing";
import type { miloAttachments } from "./milo-assets.server";
export type MiloBasketOrder = { id: string; audit_id: string | null; email: string; livemode: boolean; checkout_id?: string; source?: string; products: string[]; quote: ReturnType<typeof priceMiloBasket> & { expiresAt: number } };
async function stripeCustomer(order: MiloBasketOrder, stripe: Stripe) {
  const client = await auditPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`milo-stripe-customer/${order.livemode}/${order.email}`]);
    const profile = (await client.query("SELECT stripe_customer_id FROM milo_customer_profiles WHERE email=$1 AND livemode=$2", [order.email, order.livemode])).rows[0];
    const customer = profile?.stripe_customer_id ? await stripe.customers.retrieve(profile.stripe_customer_id) : await stripe.customers.create({ email: order.email }, {
      idempotencyKey: `milo-customer/${order.livemode}/${createHash('sha256').update(order.email).digest('hex')}`,
    });
    if (customer.deleted || customer.email?.trim().toLowerCase() !== order.email || customer.livemode !== order.livemode) throw new Error("Customer identity mismatch");
    await client.query("INSERT INTO milo_customer_profiles(email,livemode,stripe_customer_id) VALUES($1,$2,$3) ON CONFLICT(email,livemode) DO UPDATE SET stripe_customer_id=EXCLUDED.stripe_customer_id", [order.email, order.livemode, customer.id]);
    await client.query("COMMIT");
    return customer.id;
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}
export async function checkoutMiloBasket(order: MiloBasketOrder, stripe: Stripe, attachments: typeof miloAttachments, acceptance: { legalAccepted?: unknown; termsVersion?: unknown }) {
  if (!hasLegalAcceptance(acceptance)) throw new Error("Current legal acceptance required");
  if (order.checkout_id) {
    const session = await stripe.checkout.sessions.retrieve(order.checkout_id);
    if (session.status !== "open" || (session.expires_at && session.expires_at <= Date.now() / 1000) || !session.url || new URL(session.url).origin !== "https://checkout.stripe.com") throw new Error("Pending checkout is not open; cancel or reconcile it");
    await stripe.checkout.sessions.update(session.id, { metadata: acceptanceMetadata() });
    return session.url;
  }
  const configs = order.products.map(slug => paymentConfig(slug));
  if (new Set(configs.map(c => c.productId)).size !== configs.length || new Set(configs.map(c => c.priceId)).size !== configs.length) throw new Error("Duplicate Stripe mapping");
  await Promise.all(order.products.map(slug => attachments(miloAssignments.find(a => a.slug === slug)!.productCode)));
  await Promise.all(configs.map(async config => {
    const price = await stripe.prices.retrieve(config.priceId, { expand: ["product"] }); const product = price.product;
    if (price.id !== config.priceId || !price.active || price.unit_amount !== 9900 || price.currency !== "usd" || price.type !== "one_time" || price.livemode !== order.livemode || typeof product === "string" || product.deleted || !product.active || product.id !== config.productId || product.livemode !== order.livemode) throw new Error("Invalid existing Milo mapping");
  }));
  if (order.quote.expiresAt < Date.now() / 1000 + 1800) throw new Error("Checkout reservation requires reconciliation");
  const storefront = order.source === "storefront";
  const destination = storefront ? "/checkout/milos" : "/agent-fit-audit/report";
  const metadata = { ...acceptanceMetadata(), product: storefront ? "milo-volume-cart" : "sales-audit-cart", order_id: order.id, ...(order.audit_id ? { audit_id: order.audit_id } : {}), version: MILO_VERSION, release_version: MILO_VERSION };
  const customer = await stripeCustomer(order, stripe);
  // Stripe makes a valid existing Customer email non-editable in Checkout.
  const session = await stripe.checkout.sessions.create({ mode: "payment", customer, payment_method_types: ["card"], expires_at: order.quote.expiresAt,
    line_items: order.quote.lines.map((line, i) => ({ price_data: { currency: "usd", product: configs[i].productId, unit_amount: line.amountCents }, quantity: 1 })),
    allow_promotion_codes: false, automatic_tax: { enabled: false }, adaptive_pricing: { enabled: false }, metadata,
    payment_intent_data: { metadata }, success_url: `${appOrigin()}${destination}`, cancel_url: `${appOrigin()}${destination}`,
  }, { idempotencyKey: `audit-cart/${order.id}` });
  await auditPool().query("UPDATE sales_audit_orders SET checkout_id=$2 WHERE id=$1", [order.id, session.id]);
  if (!session.url || new URL(session.url).origin !== "https://checkout.stripe.com") throw new Error("Invalid Checkout redirect");
  return session.url;
}
