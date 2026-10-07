import "server-only";
import type Stripe from "stripe";
import { MILO_AMOUNT, MILO_CURRENCY, MILO_SLUG, MILO_VERSION, MILO_BASKET, miloAssignment, paymentConfig } from "./milo-config.server";
import { miloEmail } from "./milo-assets.server";
import { sendEmail } from "./email.server";
import type { DeliveryStore, PaidOrder } from "./milo-store.server";

function approvedRelease(metadata: Stripe.Metadata | null) {
  return (metadata?.version === MILO_VERSION || metadata?.version === "2.2" || metadata?.version === "2.3") && metadata.release_version === metadata.version;
}

export function sessionAssignments(metadata: Stripe.Metadata | null) {
  if (!metadata?.product) throw new Error("Missing Milo assignment");
  if (metadata.product !== MILO_BASKET) return [miloAssignment(metadata.product)];
  const slugs: unknown = JSON.parse(metadata.products ?? "null");
  if (!Array.isArray(slugs) || slugs.length < 2 || slugs.length > 100 ||
      slugs.some(slug => typeof slug !== "string") || new Set(slugs).size !== slugs.length) {
    throw new Error("Invalid Discovery selection");
  }
  const assignments = slugs.map(slug => miloAssignment(slug));
  if (assignments.some(item => item.productCode === "PD-BMM-US") && metadata?.version !== MILO_VERSION) throw new Error("Manufacturer package metadata requires v2.4");
  if (!approvedRelease(metadata) ||
      metadata.product_codes !== JSON.stringify(assignments.map(item => item.productCode))) {
    throw new Error("Checkout metadata does not match the Milo release");
  }
  return assignments;
}

export function verifiedOrder(session: Stripe.Checkout.Session, config: ReturnType<typeof paymentConfig> | ReturnType<typeof paymentConfig>[]): PaidOrder | null {
  const metadata = session.metadata;
  const assignments = sessionAssignments(metadata);
  const configs = Array.isArray(config) ? config : [config];
  const assignment = assignments[0];
  if (assignment.productCode === "PD-BMM-US" && metadata?.version !== MILO_VERSION) throw new Error("Manufacturer package metadata requires v2.4");
  const legacy = assignments.length === 1 && assignment.slug === MILO_SLUG && metadata?.version === "1.2" && !metadata.release_version && !metadata.product_code;
  if (configs.length !== assignments.length || new Set(configs.map(item => item.priceId)).size !== configs.length ||
      (!legacy && assignments.length === 1 &&
      (!approvedRelease(metadata) || metadata?.product_code !== assignment.productCode))) {
    throw new Error("Checkout metadata does not match the Milo release");
  }
  if (session.payment_status !== "paid") return null;
  const lines = session.line_items;
  const intent = session.payment_intent;
  const total = MILO_AMOUNT * assignments.length;
  const livemode = configs[0].livemode;
  if (session.mode !== "payment" || session.status !== "complete" || session.livemode !== livemode ||
      configs.some(item => item.livemode !== livemode) ||
      session.amount_total !== total || session.amount_subtotal !== total || session.currency !== MILO_CURRENCY ||
      !lines || lines.has_more || lines.data.length !== assignments.length ||
      !intent || typeof intent === "string" || intent.status !== "succeeded" ||
      intent.amount_received !== total || intent.currency !== MILO_CURRENCY || intent.livemode !== livemode) {
    throw new Error("Payment does not match the approved Milo order");
  }
  const seen = new Set<string>();
  for (const line of lines.data) {
    const price = line.price;
    const matched = configs.find(item => item.priceId === price?.id);
    const productId = typeof price?.product === "string" ? price.product : price?.product.id;
    if (!matched || !price || seen.has(price.id) || line.quantity !== 1 ||
        line.amount_total !== MILO_AMOUNT || line.amount_subtotal !== MILO_AMOUNT ||
        productId !== matched.productId || price.type !== "one_time" || price.unit_amount !== MILO_AMOUNT ||
        price.currency !== MILO_CURRENCY || price.livemode !== livemode) {
      throw new Error("Payment line item does not match the approved Milo assignment");
    }
    seen.add(price.id);
  }
  const email = session.customer_details?.email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Paid order has no valid checkout email");
  return { sessionId: session.id, paymentIntentId: intent.id, email, livemode: session.livemode,
    productCode: assignment.productCode, productCodes: assignments.map(item => item.productCode), releaseVersion: legacy ? "1.2" : metadata!.version };
}

export async function fulfillOrder(order: PaidOrder, store: DeliveryStore, makeEmail = miloEmail, send = sendEmail) {
  const existing = await store.find(order.sessionId);
  if (existing?.status === "sent") return;
  if (!existing && order.releaseVersion === "1.2") {
    await store.reviewLegacy(order);
    throw new Error("Legacy order requires manual reconciliation; no automatic release upgrade");
  }
  const codes = order.productCodes ?? [order.productCode];
  if (!existing) {
    if (codes.length === 1) await store.prepare(order, await makeEmail(order.email, order.sessionId, codes[0], order.releaseVersion));
    else {
      const deliveries = await Promise.all(codes.map(async code => {
        const message = await makeEmail(order.email, order.sessionId, code, order.releaseVersion);
        return { message: { ...message, idempotencyKey: `milo-v${order.releaseVersion}/${order.sessionId}/${code}` } };
      }));
      await store.prepare(order, { deliveries });
    }
  }
  const claim = await store.claim(order.sessionId);
  if (claim === "sent") return;
  try {
    if ("deliveries" in claim.message) {
      let lastId = "";
      for (const [index, delivery] of claim.message.deliveries.entries()) {
        lastId = delivery.resendId ?? "";
        if (delivery.resendId) continue;
        const result = await send(delivery.message);
        await store.recordDelivery(order.sessionId, claim.token, index, result.id);
        lastId = result.id;
      }
      await store.complete(order.sessionId, claim.token, lastId);
    } else {
      // Historical combined snapshots require reconciliation to avoid ambiguous resends.
      if (codes.length !== 1) throw new Error("Historical combined delivery requires reconciliation");
      const result = await send(claim.message);
      await store.complete(order.sessionId, claim.token, result.id);
    }
  } catch {
    // Preserve first_attempt_at and the exact message even after ambiguous acceptance.
    // A failed release is safe: the persisted lease expires and Stripe retries later.
    await store.release(order.sessionId, claim.token).catch(() => {});
    throw new Error("Milo fulfillment incomplete; retry or reconcile the delivery ledger");
  }
}
