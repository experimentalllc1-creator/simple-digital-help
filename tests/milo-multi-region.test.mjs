import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Stripe from "stripe";
import { PGlite } from "@electric-sql/pglite";
import { handleCheckout, handleWebhook } from "../src/lib/milo-http.server.ts";
import { miloEmail, MILO_FILES, MILO_TX_FILES } from "../src/lib/milo-assets.server.ts";
import { miloAssignments } from "../src/lib/milo-assignments.ts";
import { paymentConfig } from "../src/lib/milo-config.server.ts";
import { verifiedOrder } from "../src/lib/milo-fulfillment.server.ts";
import { DeliveryStore } from "../src/lib/milo-store.server.ts";

globalThis.fetch = async () => { throw new Error("Unmocked network call forbidden"); };
Object.assign(process.env, {
  STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_test_local_only", STRIPE_WEBHOOK_SECRET: "whsec_local_only",
  STRIPE_MILO_PRODUCT_ID: "prod_florida", STRIPE_MILO_PRICE_ID: "price_florida",
  STRIPE_MILO_TX_PRODUCT_ID: "prod_texas", STRIPE_MILO_TX_PRICE_ID: "price_texas",
  RESEND_API_KEY: "test-only", APP_URL: "http://127.0.0.1:3000",
  MILO_CHECKOUT_ENABLED: "true", MILO_DELIVERY_ENABLED: "true",
});
const originalAssignments = miloAssignments.filter(item => ["PD-ROOF-FL", "PD-ROOF-TX"].includes(item.productCode));
const slugs = originalAssignments.map(item => item.slug);
const codes = originalAssignments.map(item => item.productCode);
const metadata = { product: "milo-discovery-regions", version: "2.4", products: JSON.stringify(slugs), product_codes: JSON.stringify(codes), release_version: "2.4" };
const prices = Object.fromEntries(["florida", "texas"].map(region => [`price_${region}`, {
  id: `price_${region}`, active: true, type: "one_time", unit_amount: 9900, currency: "usd", livemode: false,
  product: { id: `prod_${region}`, active: true, livemode: false },
}]));
const paid = {
  id: "cs_multi", mode: "payment", status: "complete", payment_status: "paid", livemode: false,
  amount_subtotal: 19800, amount_total: 19800, currency: "usd", metadata,
  customer_details: { email: "buyer@example.test" },
  payment_intent: { id: "pi_multi", status: "succeeded", amount_received: 19800, currency: "usd", livemode: false },
  line_items: { has_more: false, data: Object.values(prices).map(price => ({ quantity: 1, amount_subtotal: 9900, amount_total: 9900, price })) },
};
const sdk = new Stripe("sk_test_local_only");
function checkout(selected = slugs) {
  const form = new URLSearchParams(); selected.forEach(slug => form.append("product", slug));
  return new Request(`${process.env.APP_URL}/api/checkout/milo`, { method: "POST", headers: { origin: process.env.APP_URL }, body: form });
}
function webhook(type = "checkout.session.completed") {
  const payload = JSON.stringify({ id: "evt_multi", type, livemode: false, data: { object: paid } });
  return new Request(`${process.env.APP_URL}/api/webhooks/stripe`, { method: "POST", body: payload,
    headers: { "stripe-signature": sdk.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET }) } });
}

test("multi-region checkout and fulfillment use every configured line item/package", async t => {
  const db = new PGlite();
  for (const file of ["001_milo_deliveries.sql", "002_milo_identity.sql", "003_milo_product_codes.sql"]) {
    await db.exec(await readFile(`db/migrations/${file}`, "utf8"));
  }
  const store = new DeliveryStore(db);
  let session = structuredClone(paid), params, created = 0, sent = [], failSend = false;
  const stripe = { webhooks: sdk.webhooks, prices: { retrieve: async id => structuredClone(prices[id]) },
    checkout: { sessions: {
      create: async value => { created++; params = value; return { url: "https://checkout.stripe.com/c/pay/test" }; },
      retrieve: async () => session,
      listLineItems: async () => structuredClone(paid.line_items),
    } } };
  const deps = { stripe: () => stripe, store: () => store, send: async message => {
    sent.push(structuredClone(message));
    if (failSend) throw new Error("Ambiguous provider error");
    return { id: "12345678-1234-1234-1234-123456789abc" };
  } };
  try {
    await t.test("one hosted checkout has two existing $99 prices and both product codes", async () => {
      assert.equal((await handleCheckout(checkout(), deps)).status, 303);
      assert.equal(created, 1);
      assert.deepEqual(params.line_items, [{ price: "price_florida", quantity: 1 }, { price: "price_texas", quantity: 1 }]);
      assert.deepEqual(params.metadata, metadata);
      assert.equal(params.payment_intent_data.metadata.product_codes, JSON.stringify(codes));
      assert.equal(params.success_url, `${process.env.APP_URL}/checkout/success/regions`);
      assert.equal(params.cancel_url, `${process.env.APP_URL}/categories/sales`);
    });
    await t.test("unavailable, unknown, duplicate and inactive regions fail closed", async () => {
      for (const selected of [[slugs[0], "milo-future-roofing-contractors"], [slugs[0], "unknown"], [slugs[0], slugs[0]]]) {
        assert.equal((await handleCheckout(checkout(selected), deps)).status, 400);
      }
      miloAssignments[1].available = false;
      try { assert.equal((await handleCheckout(checkout(), deps)).status, 400); }
      finally { miloAssignments[1].available = true; }
      assert.equal(created, 1);
    });
    await t.test("missing files, missing mappings and wrong regional Stripe prices prevent session creation", async () => {
      assert.equal((await handleCheckout(checkout(), { ...deps, attachments: async code => {
        if (code === "PD-ROOF-TX") throw new Error("missing Texas files"); return [];
      } })).status, 503);
      delete process.env.STRIPE_MILO_TX_PRICE_ID;
      try { assert.equal((await handleCheckout(checkout(), deps)).status, 503); }
      finally { process.env.STRIPE_MILO_TX_PRICE_ID = "price_texas"; }
      for (const mutation of [{ unit_amount: 1 }, { active: false }, { currency: "eur" }, { type: "recurring" }, { product: { id: "prod_wrong", active: true, livemode: false } }]) {
        const badStripe = { ...stripe, prices: { retrieve: async id => ({ ...prices[id], ...(id === "price_texas" ? mutation : {}) }) } };
        assert.equal((await handleCheckout(checkout(), { ...deps, stripe: () => badStripe })).status, 503);
      }
      assert.equal(created, 1);
    });
    await t.test("underpayments, missing/extra/duplicate/swapped lines and tampered codes cannot fulfill", async () => {
      for (const mutate of [
        value => value.amount_total = 9900,
        value => value.payment_intent.amount_received = 9900,
        value => value.line_items.data.pop(),
        value => value.line_items.data.push(value.line_items.data[0]),
        value => value.line_items.data[1] = value.line_items.data[0],
        value => value.line_items.data[1].quantity = 2,
        value => value.line_items.data[1].price.product.id = "prod_florida",
        value => value.metadata.product_codes = '["PD-ROOF-FL"]',
        value => value.metadata.products = JSON.stringify([slugs[0], slugs[0]]),
        value => value.metadata.products = JSON.stringify([slugs[0], "unknown"]),
        value => value.metadata.release_version = "1.2",
      ]) {
        session = structuredClone(paid); mutate(session);
        assert.equal((await handleWebhook(webhook(), deps)).status, 503);
      }
      assert.equal(sent.length, 0);
      assert.equal(await store.find(paid.id), undefined);
    });
    await t.test("a future third configured region uses the same checkout and verification loops", async () => {
      const third = { slug: "milo-future-roofing-contractors", productCode: "PD-ROOF-FUTURE", agentId: "roofing", regionId: "future-test", region: "Future Test Region", available: true,
        productEnv: "STRIPE_MILO_FUTURE_PRODUCT_ID", priceEnv: "STRIPE_MILO_FUTURE_PRICE_ID" };
      miloAssignments.push(third);
      process.env.STRIPE_MILO_FUTURE_PRODUCT_ID = "prod_future";
      process.env.STRIPE_MILO_FUTURE_PRICE_ID = "price_future";
      prices.price_future = { ...prices.price_texas, id: "price_future", product: { id: "prod_future", active: true, livemode: false } };
      try {
        assert.equal((await handleCheckout(checkout([...slugs, third.slug]), { ...deps, attachments: async () => [] })).status, 303);
        assert.equal(params.line_items.length, 3);
        const future = structuredClone(paid);
        future.metadata = params.metadata;
        future.amount_total = future.amount_subtotal = future.payment_intent.amount_received = 29700;
        future.line_items.data.push({ quantity: 1, amount_total: 9900, amount_subtotal: 9900, price: prices.price_future });
        const order = verifiedOrder(future, [...slugs, third.slug].map(slug => paymentConfig(slug)));
        assert.deepEqual(order.productCodes, [...codes, "PD-ROOF-FUTURE"]);
      } finally { miloAssignments.pop(); delete prices.price_future; delete process.env.STRIPE_MILO_FUTURE_PRODUCT_ID; delete process.env.STRIPE_MILO_FUTURE_PRICE_ID; }
    });
    await t.test("paginated or reordered paid line items validate and deliver two separate regional emails once", async () => {
      session = structuredClone(paid); session.line_items = { has_more: true, data: [session.line_items.data[0]] };
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      session = structuredClone(paid); session.line_items.data.reverse();
      assert.equal((await handleWebhook(webhook("checkout.session.async_payment_succeeded"), deps)).status, 200);
      assert.equal(sent.length, 2);
      assert.deepEqual(sent.map(message => message.attachments.map(file => file.filename)), [MILO_FILES, MILO_TX_FILES].map(files => files.map(file => file.filename)));
      assert.deepEqual(sent.map(message => message.subject), ["Your Milo - Florida Roofing Prospect Discovery", "Your Milo - Texas Roofing Prospect Discovery"]);
      assert.notEqual(sent[0].idempotencyKey, sent[1].idempotencyKey);
      const row = (await db.query("SELECT product_codes, status FROM milo_deliveries WHERE session_id = $1", [paid.id])).rows[0];
      assert.deepEqual(row.product_codes, codes); assert.equal(row.status, "sent");
    });
    await t.test("retry reuses the regional snapshot and original idempotency key", async () => {
      await db.exec("TRUNCATE milo_deliveries"); sent = []; failSend = true; session = structuredClone(paid);
      assert.equal((await handleWebhook(webhook(), deps)).status, 503);
      failSend = false;
      assert.equal((await handleWebhook(webhook(), { ...deps, makeEmail: async () => { throw Error("must reuse snapshot"); } })).status, 200);
      assert.deepEqual(sent[1], sent[0]); assert.equal(sent[1].attachments.length, 2);
      assert.equal((await handleWebhook(webhook(), deps)).status, 200); assert.equal(sent.length, 3);
    });
    await t.test("partial failure retries only the unsent region", async () => {
      await db.exec("TRUNCATE milo_deliveries"); sent = []; let calls = 0;
      const partial = { ...deps, send: async message => { sent.push(structuredClone(message)); if (++calls === 2) throw Error("unknown acceptance"); return { id: "12345678-1234-1234-1234-123456789abc" }; } };
      assert.equal((await handleWebhook(webhook(), partial)).status, 503);
      assert.equal((await handleWebhook(webhook(), { ...partial, makeEmail: async () => { throw Error("reuse snapshots"); } })).status, 200);
      assert.equal(sent.length, 3); assert.deepEqual(sent[2], sent[1]);
      assert.equal((await handleWebhook(webhook(), partial)).status, 200); assert.equal(sent.length, 3);
    });
  } finally { await db.close(); }
});

test("each regional email contains only its hash-valid TXT and PDF", async () => {
  for (const [index, code] of codes.entries()) {
    const email = await miloEmail("buyer@example.test", "cs_single", code);
    assert.deepEqual(email.attachments.map(file => file.filename), [MILO_FILES, MILO_TX_FILES][index].map(file => file.filename));
    assert.equal(email.subject, `Your Milo - ${miloAssignments[index].region} Roofing Prospect Discovery`);
    assert.match(email.text, /52 weeks/); assert.doesNotMatch(email.text, /video|\.mp4/i);
  }
  await assert.rejects(miloEmail("buyer@example.test", "cs_combined", codes), /separate delivery/);
});

test("multi-product migration preserves historical records and supports the old handler", async () => {
  const db = new PGlite();
  try {
    for (const file of ["001_milo_deliveries.sql", "002_milo_identity.sql"]) await db.exec(await readFile(`db/migrations/${file}`, "utf8"));
    await db.query("INSERT INTO milo_deliveries (session_id,payment_intent_id,livemode,recipient,message,product_code) VALUES ('cs_old','pi_old',false,'buyer@example.test','{}','PD-ROOF-TX')");
    const before = (await db.query("SELECT * FROM milo_deliveries")).rows[0];
    const migration = await readFile("db/migrations/003_milo_product_codes.sql", "utf8");
    await db.exec(migration); await db.exec(migration);
    const { product_codes, ...after } = (await db.query("SELECT * FROM milo_deliveries")).rows[0];
    assert.deepEqual(after, before); assert.deepEqual(product_codes, ["PD-ROOF-TX"]);
    await db.query("INSERT INTO milo_deliveries (session_id,payment_intent_id,livemode,recipient,message,product_code) VALUES ('cs_during','pi_during',false,'buyer@example.test','{}','PD-ROOF-FL')");
    assert.equal((await db.query("SELECT product_code FROM milo_deliveries WHERE session_id='cs_during'")).rows[0].product_code, "PD-ROOF-FL");
  } finally { await db.close(); }
});
