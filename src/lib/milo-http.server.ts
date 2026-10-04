import "server-only";
import type Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { appOrigin, checkoutEnabled, deliveryEnabled, MILO_AMOUNT, MILO_CURRENCY, MILO_PATH,
  MILO_SLUG, MILO_VERSION, MILO_PRODUCT_CODE, paymentConfig, required } from "./milo-config.server";
import { stripeClient } from "./stripe.server";
import { deliveryStore } from "./milo-store.server";
import { miloAttachments, miloEmail } from "./milo-assets.server";
import { sendEmail } from "./email.server";
import { fulfillOrder, verifiedOrder } from "./milo-fulfillment.server";

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
    const config = paymentConfig();
    required("STRIPE_WEBHOOK_SECRET");
    required("RESEND_API_KEY");
    await deps.store().ready();
    await deps.attachments();
    const stripe = deps.stripe();
    const price = await stripe.prices.retrieve(config.priceId, { expand: ["product"] });
    const product = price.product;
    if (price.id !== config.priceId || !price.active || price.type !== "one_time" ||
        price.unit_amount !== MILO_AMOUNT || price.currency !== MILO_CURRENCY ||
        price.livemode !== config.livemode || typeof product === "string" || product.deleted ||
        product.id !== config.productId || !product.active || product.livemode !== config.livemode) {
      throw new Error("Existing Stripe price is not the approved $99 Milo product");
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: MILO_CURRENCY,
      adaptive_pricing: { enabled: false },
      payment_method_types: ["card"],
      line_items: [{ price: config.priceId, quantity: 1 }],
      allow_promotion_codes: false,
      automatic_tax: { enabled: false },
      metadata: { product: MILO_SLUG, version: MILO_VERSION, product_code: MILO_PRODUCT_CODE, release_version: MILO_VERSION },
      payment_intent_data: { metadata: { product: MILO_SLUG, product_code: MILO_PRODUCT_CODE, release_version: MILO_VERSION } },
      success_url: `${origin}/checkout/success`,
      cancel_url: `${origin}${MILO_PATH}`,
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
  if (incoming.metadata?.product !== MILO_SLUG) return response({ received: true });
  // Disabled fulfillment must not acknowledge a paid order and lose its retry.
  if (!deliveryEnabled()) return response({ error: "Delivery is not enabled." }, 503);
  try {
    required("RESEND_API_KEY");
    const session = await stripe.checkout.sessions.retrieve(incoming.id, {
      expand: ["line_items.data.price.product", "payment_intent"],
    });
    if (session.id !== incoming.id) throw new Error("Checkout session mismatch");
    const order = verifiedOrder(session, config);
    if (order) await fulfillOrder(order, deps.store(), deps.makeEmail, deps.send);
    return response({ received: true });
  } catch {
    // No exception/customer data in HTTP responses. Non-2xx keeps Stripe retries active.
    console.error("Milo webhook requires retry or ledger reconciliation.");
    return response({ error: "Fulfillment incomplete. Retry required." }, 503);
  }
}
