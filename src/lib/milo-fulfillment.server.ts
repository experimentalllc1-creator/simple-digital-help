import "server-only";
import type Stripe from "stripe";
import { MILO_AMOUNT, MILO_CURRENCY, MILO_SLUG, MILO_VERSION, paymentConfig } from "./milo-config.server";
import { miloEmail } from "./milo-assets.server";
import { sendEmail } from "./email.server";
import type { DeliveryStore, PaidOrder } from "./milo-store.server";

export function verifiedOrder(session: Stripe.Checkout.Session, config: ReturnType<typeof paymentConfig>): PaidOrder | null {
  if (session.metadata?.product !== MILO_SLUG || session.metadata?.version !== MILO_VERSION) {
    throw new Error("Checkout metadata does not match the Milo release");
  }
  if (session.payment_status !== "paid") return null;
  const lines = session.line_items;
  const line = lines?.data[0];
  const price = line?.price;
  const productId = typeof price?.product === "string" ? price.product : price?.product.id;
  const intent = session.payment_intent;
  if (session.mode !== "payment" || session.status !== "complete" || session.livemode !== config.livemode ||
      session.amount_total !== MILO_AMOUNT || session.amount_subtotal !== MILO_AMOUNT || session.currency !== MILO_CURRENCY ||
      !lines || lines.has_more || lines.data.length !== 1 || line?.quantity !== 1 ||
      line.amount_total !== MILO_AMOUNT || line.amount_subtotal !== MILO_AMOUNT ||
      price?.id !== config.priceId || productId !== config.productId || price.type !== "one_time" ||
      price.unit_amount !== MILO_AMOUNT || price.currency !== MILO_CURRENCY || price.livemode !== config.livemode ||
      !intent || typeof intent === "string" || intent.status !== "succeeded" ||
      intent.amount_received !== MILO_AMOUNT || intent.currency !== MILO_CURRENCY || intent.livemode !== config.livemode) {
    throw new Error("Payment does not match the approved Milo order");
  }
  const email = session.customer_details?.email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Paid order has no valid checkout email");
  return { sessionId: session.id, paymentIntentId: intent.id, email, livemode: session.livemode };
}

export async function fulfillOrder(order: PaidOrder, store: DeliveryStore, makeEmail = miloEmail, send = sendEmail) {
  const existing = await store.find(order.sessionId);
  if (existing?.status === "sent") return;
  if (!existing) await store.prepare(order, await makeEmail(order.email, order.sessionId));
  const claim = await store.claim(order.sessionId);
  if (claim === "sent") return;
  try {
    const result = await send(claim.message);
    await store.complete(order.sessionId, claim.token, result.id);
  } catch {
    // Preserve first_attempt_at and the exact message even after ambiguous acceptance.
    // A failed release is safe: the persisted lease expires and Stripe retries later.
    await store.release(order.sessionId, claim.token).catch(() => {});
    throw new Error("Milo fulfillment incomplete; retry or reconcile the delivery ledger");
  }
}
