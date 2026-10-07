import "server-only";
import type Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { appOrigin, checkoutEnabled, deliveryEnabled, MILO_AMOUNT, MILO_CURRENCY,
  MILO_SLUG, MILO_TX_SLUG, MILO_CA_SLUG, MILO_NORTHEAST_SLUG, MILO_SOUTHEAST_SLUG, MILO_MIDWEST_SLUG, MILO_SOUTHWEST_SLUG, MILO_MOUNTAIN_WEST_SLUG, MILO_PACIFIC_NORTHWEST_SLUG, MILO_BASKET, MILO_VERSION, miloAssignment, paymentConfig, required } from "./milo-config.server";
import { miloAssignments } from "./milo-assignments";
import { stripeClient } from "./stripe.server";
import { deliveryStore } from "./milo-store.server";
import { miloAttachments, miloEmail } from "./milo-assets.server";
import { sendEmail } from "./email.server";
import { fulfillOrder, verifiedOrder, sessionAssignments } from "./milo-fulfillment.server";

const defaults = { stripe: stripeClient, store: deliveryStore, attachments: miloAttachments, makeEmail: miloEmail, send: sendEmail };
type Dependencies = typeof defaults;
function response(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function handleCheckout(request: Request, overrides: Partial<Dependencies> = {}) {
  if (!checkoutEnabled()) return response({ error: "Checkout is not available yet." }, 503);
  const deps = { ...defaults, ...overrides };
  try {
    const origin = appOrigin();
    // Ignore supplied amounts, prices, recipients and redirect URLs. Only accept same-origin POSTs.
    if (request.headers.get("origin") !== origin) return response({ error: "Invalid origin." }, 403);
    // Existing empty/bodyless Florida requests remain valid; forms select a known assignment only.
    let slugs = [MILO_SLUG];
    if (/^(application\/x-www-form-urlencoded|multipart\/form-data)/i.test(request.headers.get("content-type") ?? "")) {
      const form = await request.formData();
      const selections = form.getAll("product");
      if (selections.some(value => typeof value !== "string")) {
        return response({ error: "Select available Discovery assignments." }, 400);
      }
      if (selections.length) slugs = selections as string[];
    }
    if (slugs.length > 100 || new Set(slugs).size !== slugs.length || slugs.some(slug =>
      !miloAssignments.some(item => item.slug === slug && item.available))) {
      return response({ error: "Unavailable or duplicate Discovery assignment." }, 400);
    }
    const assignments = slugs.map(slug => miloAssignment(slug));
    const configs = slugs.map(slug => paymentConfig(slug));
    if (new Set(configs.map(item => item.priceId)).size !== configs.length) throw new Error("Duplicate Stripe price mapping");
    required("STRIPE_WEBHOOK_SECRET");
    required("RESEND_API_KEY");
    await deps.store().ready();
    await Promise.all(assignments.map(assignment => deps.attachments(assignment.productCode)));
    const stripe = deps.stripe();
    await Promise.all(configs.map(async config => {
      const price = await stripe.prices.retrieve(config.priceId, { expand: ["product"] });
      const product = price.product;
      if (price.id !== config.priceId || !price.active || price.type !== "one_time" ||
          price.unit_amount !== MILO_AMOUNT || price.currency !== MILO_CURRENCY ||
          price.livemode !== config.livemode || typeof product === "string" || product.deleted ||
          product.id !== config.productId || !product.active || product.livemode !== config.livemode) {
        throw new Error("Existing Stripe price is not the approved $99 Milo product");
      }
    }));
    const single = assignments.length === 1;
    const metadata: Stripe.Metadata = single ?
      { product: slugs[0], version: MILO_VERSION, product_code: assignments[0].productCode, release_version: MILO_VERSION } :
      { product: MILO_BASKET, version: MILO_VERSION, products: JSON.stringify(slugs),
        product_codes: JSON.stringify(assignments.map(item => item.productCode)), release_version: MILO_VERSION };
    if (Object.values(metadata).some(value => value && value.length > 500)) throw new Error("Discovery selection exceeds Stripe metadata limits");
    const { version: _version, ...intentMetadata } = metadata;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: MILO_CURRENCY,
      adaptive_pricing: { enabled: false },
      payment_method_types: ["card"],
      line_items: configs.map(config => ({ price: config.priceId, quantity: 1 })),
      allow_promotion_codes: false,
      automatic_tax: { enabled: false },
      metadata,
      payment_intent_data: { metadata: intentMetadata },
      success_url: `${origin}/checkout/success${single && assignments[0].agentId === "building-materials-manufacturers" ? "/manufacturers" : single && assignments[0].agentId === "roofing" ? (slugs[0] === MILO_TX_SLUG ? "/texas" : slugs[0] === MILO_CA_SLUG ? "/california" : slugs[0] === MILO_NORTHEAST_SLUG ? "/northeast" : slugs[0] === MILO_SOUTHEAST_SLUG ? "/southeast" : slugs[0] === MILO_MIDWEST_SLUG ? "/midwest" : slugs[0] === MILO_SOUTHWEST_SLUG ? "/southwest" : slugs[0] === MILO_MOUNTAIN_WEST_SLUG ? "/mountain-west" : slugs[0] === MILO_PACIFIC_NORTHWEST_SLUG ? "/pacific-northwest" : "") : "/regions"}`,
      cancel_url: `${origin}${single ? assignments[0].path : "/categories/sales"}`,
    }, { idempotencyKey: `milo-checkout/${randomUUID()}` });
    if (!session.url || new URL(session.url).origin !== "https://checkout.stripe.com") {
      throw new Error("Invalid Stripe checkout redirect");
    }
    return new Response(null, { status: 303, headers: { Location: session.url, "Cache-Control": "no-store" } });
  } catch {
    return response({ error: "Checkout is temporarily unavailable. Please try again later." }, 503);
  }
}

async function boundedBody(request: Request) {
  if (!request.body) throw new Error("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 256 * 1024) { await reader.cancel(); throw new Error("Body too large"); }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally { reader.releaseLock(); }
}

export async function handleWebhook(request: Request, overrides: Partial<Dependencies> = {}) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return response({ error: "Missing signature." }, 400);
  const deps = { ...defaults, ...overrides };
  let stripe: Stripe;
  let config: ReturnType<typeof paymentConfig>;
  let secret: string;
  try {
    config = paymentConfig();
    secret = required("STRIPE_WEBHOOK_SECRET");
    stripe = deps.stripe();
  } catch { return response({ error: "Webhook configuration unavailable." }, 503); }
  let event: Stripe.Event;
  try {
    // Verify the untouched bytes and timestamp with the official Stripe SDK.
    event = stripe.webhooks.constructEvent(await boundedBody(request), signature, secret);
  } catch { return response({ error: "Invalid webhook signature or body." }, 400); }
  if (event.livemode !== config.livemode) return response({ error: "Stripe mode mismatch." }, 400);
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return response({ received: true });
  }
  const incoming = event.data.object as Stripe.Checkout.Session;
  if (incoming.metadata?.product !== MILO_BASKET &&
      !miloAssignments.some(item => item.slug === incoming.metadata?.product)) return response({ received: true });
  // Disabled fulfillment must not acknowledge a paid order and lose its retry.
  if (!deliveryEnabled()) return response({ error: "Delivery is not enabled." }, 503);
  try {
    required("RESEND_API_KEY");
    const session = await stripe.checkout.sessions.retrieve(incoming.id, {
      expand: ["line_items.data.price.product", "payment_intent"],
    });
    if (session.id !== incoming.id) throw new Error("Checkout session mismatch");
    if (session.metadata?.product !== incoming.metadata?.product) throw new Error("Checkout assignment mismatch");
    if (session.metadata?.products !== incoming.metadata?.products ||
        session.metadata?.product_codes !== incoming.metadata?.product_codes) throw new Error("Checkout assignments mismatch");
    if (session.line_items?.has_more) {
      session.line_items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ["data.price.product"] });
    }
    const configs = sessionAssignments(session.metadata).map(item => paymentConfig(item.slug));
    const order = verifiedOrder(session, configs);
    if (order) await fulfillOrder(order, deps.store(), deps.makeEmail, deps.send);
    return response({ received: true });
  } catch {
    // No exception/customer data in HTTP responses. Non-2xx keeps Stripe retries active.
    console.error("Milo webhook requires retry or ledger reconciliation.");
    return response({ error: "Fulfillment incomplete. Retry required." }, 503);
  }
}
