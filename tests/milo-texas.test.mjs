import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Stripe from "stripe";
import { PGlite } from "@electric-sql/pglite";
import { handleCheckout, handleWebhook } from "../src/lib/milo-http.server.ts";
import { miloAttachments, miloEmail, MILO_FILES, MILO_TX_FILES } from "../src/lib/milo-assets.server.ts";
import { DeliveryStore } from "../src/lib/milo-store.server.ts";
import { paymentConfig } from "../src/lib/milo-config.server.ts";

globalThis.fetch = async () => { throw new Error("Unmocked network call forbidden"); };
Object.assign(process.env, {
  STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_test_local_only", STRIPE_WEBHOOK_SECRET: "whsec_local_only",
  STRIPE_MILO_PRODUCT_ID: "prod_florida", STRIPE_MILO_PRICE_ID: "price_florida",
  STRIPE_MILO_TX_PRODUCT_ID: "prod_texas", STRIPE_MILO_TX_PRICE_ID: "price_texas",
  RESEND_API_KEY: "test-only", APP_URL: "http://127.0.0.1:3000",
  MILO_CHECKOUT_ENABLED: "true", MILO_DELIVERY_ENABLED: "true",
});
const slug = "milo-texas-roofing-contractors";
const sdk = new Stripe("sk_test_local_only");
const price = { id: "price_texas", active: true, type: "one_time", unit_amount: 9900, currency: "usd", livemode: false,
  product: { id: "prod_texas", active: true, livemode: false } };
const session = {
  id: "cs_texas", mode: "payment", status: "complete", payment_status: "paid", livemode: false,
  amount_subtotal: 9900, amount_total: 9900, currency: "usd",
  metadata: { product: slug, version: "2.4", product_code: "PD-ROOF-TX", release_version: "2.4" },
  customer_details: { email: "buyer@example.test" },
  payment_intent: { id: "pi_texas", status: "succeeded", amount_received: 9900, currency: "usd", livemode: false },
  line_items: { has_more: false, data: [{ quantity: 1, amount_total: 9900, amount_subtotal: 9900, price }] },
};
function checkout(products = [slug]) {
  const form = new URLSearchParams();
  for (const product of products) form.append("product", product);
  return new Request(`${process.env.APP_URL}/api/checkout/milo`, { method: "POST", headers: { origin: process.env.APP_URL }, body: form });
}
function webhook() {
  const payload = JSON.stringify({ id: "evt_texas", type: "checkout.session.completed", livemode: false, data: { object: session } });
  return new Request(`${process.env.APP_URL}/api/webhooks/stripe`, { method: "POST", body: payload,
    headers: { "stripe-signature": sdk.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET }) } });
}

test("Texas uses the existing checkout and durable delivery pattern", async t => {
  const db = new PGlite();
  await db.exec(await readFile("db/migrations/001_milo_deliveries.sql", "utf8"));
  await db.exec(await readFile("db/migrations/002_milo_identity.sql", "utf8"));
  await db.exec(await readFile("db/migrations/003_milo_product_codes.sql", "utf8"));
  const store = new DeliveryStore(db);
  let retrieved = structuredClone(session), params, sent = [];
  const stripe = { webhooks: sdk.webhooks, prices: { retrieve: async id => { assert.equal(id, "price_texas"); return structuredClone(price); } },
    checkout: { sessions: { create: async value => { params = value; return { url: "https://checkout.stripe.com/c/pay/test" }; },
      retrieve: async () => retrieved } } };
  const deps = { stripe: () => stripe, store: () => store, send: async message => { sent.push(message); return { id: "12345678-1234-1234-1234-123456789abc" }; } };
  try {
    await t.test("Texas checkout pins its $99 price, metadata, files and return paths", async () => {
      assert.equal((await handleCheckout(checkout(), deps)).status, 303);
      assert.deepEqual(params.line_items, [{ price: "price_texas", quantity: 1 }]);
      assert.deepEqual(params.metadata, session.metadata);
      assert.equal(params.payment_intent_data.metadata.product_code, "PD-ROOF-TX");
      assert.equal(params.success_url, `${process.env.APP_URL}/checkout/success/texas`);
      assert.equal(params.cancel_url, `${process.env.APP_URL}/products/${slug}`);
      assert.equal(params.allow_promotion_codes, false);
      assert.equal(params.automatic_tax.enabled, false);
      assert.equal(params.mode, "payment");
    });
    await t.test("unknown and duplicate packages cannot silently buy Florida", async () => {
      assert.equal((await handleCheckout(checkout(["unknown"]), deps)).status, 400);
      assert.equal((await handleCheckout(checkout([slug, slug]), deps)).status, 400);
    });
    await t.test("Texas missing configuration fails closed without breaking Florida configuration", async () => {
      delete process.env.STRIPE_MILO_TX_PRICE_ID;
      assert.equal((await handleCheckout(checkout(), deps)).status, 503);
      assert.equal(paymentConfig().priceId, "price_florida");
      process.env.STRIPE_MILO_TX_PRICE_ID = "price_texas";
    });
    await t.test("Texas cannot fulfill with Florida price, code, or legacy metadata", async () => {
      for (const change of [
        value => value.line_items.data[0].price.id = "price_florida",
        value => value.line_items.data[0].price.product.id = "prod_florida",
        value => value.metadata.product_code = "PD-ROOF-FL",
        value => value.metadata = { product: slug, version: "1.2" },
        value => value.metadata.product = "milo-florida-roofing-contractors",
      ]) {
        retrieved = structuredClone(session); change(retrieved);
        assert.equal((await handleWebhook(webhook(), deps)).status, 503);
      }
      assert.equal(sent.length, 0);
    });
    await t.test("verified purchase emails Texas TXT/PDF once and records Texas identity", async () => {
      retrieved = structuredClone(session);
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      assert.equal(sent.length, 1);
      assert.deepEqual(sent[0].attachments.map(file => file.filename), MILO_TX_FILES.map(file => file.filename));
      assert.match(sent[0].text, /Texas Roofing/);
      assert.doesNotMatch(sent[0].text, /Florida|video/i);
      const record = await store.find(session.id);
      assert.equal(record.status, "sent");
      const identity = await db.query("SELECT product_code, release_version FROM milo_deliveries WHERE session_id = $1", [session.id]);
      assert.equal(identity.rows[0].product_code, "PD-ROOF-TX");
      assert.equal(identity.rows[0].release_version, "2.4");
    });
  } finally { await db.close(); }
});

test("Texas installation prompt is exactly Florida with territory/code substitutions", async () => {
  const florida = await readFile("docs/Products/MILO/Milo_FL_Roofing_Installation_Prompt_v2.4.txt", "utf8");
  const texas = await readFile("docs/Products/MILO/Milo_TX_Roofing_Installation_Prompt_v2.4.txt", "utf8");
  assert.equal(texas, florida.replaceAll("Florida", "Texas").replaceAll("PD-ROOF-FL", "PD-ROOF-TX"));
  assert.deepEqual((await miloAttachments()).map(file => file.filename), MILO_FILES.map(file => file.filename));
  assert.match((await miloEmail("buyer@example.test", "cs_florida")).text, /Florida Roofing/);
});
