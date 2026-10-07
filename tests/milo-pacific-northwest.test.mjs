import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Stripe from "stripe";
import { PGlite } from "@electric-sql/pglite";
import { handleCheckout, handleWebhook } from "../src/lib/milo-http.server.ts";
import { miloAttachments, miloEmail, MILO_FILES, MILO_PACIFIC_NORTHWEST_FILES } from "../src/lib/milo-assets.server.ts";
import { DeliveryStore } from "../src/lib/milo-store.server.ts";
import { paymentConfig } from "../src/lib/milo-config.server.ts";

globalThis.fetch = async () => { throw new Error("Unmocked network call forbidden"); };
Object.assign(process.env, {
  STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_test_local_only", STRIPE_WEBHOOK_SECRET: "whsec_local_only",
  STRIPE_MILO_PRODUCT_ID: "prod_florida", STRIPE_MILO_PRICE_ID: "price_florida",
  STRIPE_MILO_PACIFIC_NORTHWEST_PRODUCT_ID: "prod_pacificnorthwest", STRIPE_MILO_PACIFIC_NORTHWEST_PRICE_ID: "price_pacificnorthwest",
  RESEND_API_KEY: "test-only", APP_URL: "http://127.0.0.1:3000",
  MILO_CHECKOUT_ENABLED: "true", MILO_DELIVERY_ENABLED: "true",
});
const slug = "milo-pacific-northwest-roofing-contractors";
const sdk = new Stripe("sk_test_local_only");
const price = { id: "price_pacificnorthwest", active: true, type: "one_time", unit_amount: 9900, currency: "usd", livemode: false,
  product: { id: "prod_pacificnorthwest", active: true, livemode: false } };
const session = {
  id: "cs_pacificnorthwest", mode: "payment", status: "complete", payment_status: "paid", livemode: false,
  amount_subtotal: 9900, amount_total: 9900, currency: "usd",
  metadata: { product: slug, version: "2.4", product_code: "PD-ROOF-PACIFIC-NORTHWEST", release_version: "2.4" },
  customer_details: { email: "buyer@example.test" },
  payment_intent: { id: "pi_pacificnorthwest", status: "succeeded", amount_received: 9900, currency: "usd", livemode: false },
  line_items: { has_more: false, data: [{ quantity: 1, amount_total: 9900, amount_subtotal: 9900, price }] },
};
function checkout(products = [slug]) {
  const form = new URLSearchParams();
  for (const product of products) form.append("product", product);
  return new Request(`${process.env.APP_URL}/api/checkout/milo`, { method: "POST", headers: { origin: process.env.APP_URL }, body: form });
}
function webhook() {
  const payload = JSON.stringify({ id: "evt_pacificnorthwest", type: "checkout.session.completed", livemode: false, data: { object: session } });
  return new Request(`${process.env.APP_URL}/api/webhooks/stripe`, { method: "POST", body: payload,
    headers: { "stripe-signature": sdk.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET }) } });
}

test("Pacific Northwest uses the existing checkout and durable delivery pattern", async t => {
  const db = new PGlite();
  await db.exec(await readFile("db/migrations/001_milo_deliveries.sql", "utf8"));
  await db.exec(await readFile("db/migrations/002_milo_identity.sql", "utf8"));
  await db.exec(await readFile("db/migrations/003_milo_product_codes.sql", "utf8"));
  const store = new DeliveryStore(db);
  let retrieved = structuredClone(session), params, sent = [];
  const stripe = { webhooks: sdk.webhooks, prices: { retrieve: async id => { assert.equal(id, "price_pacificnorthwest"); return structuredClone(price); } },
    checkout: { sessions: { create: async value => { params = value; return { url: "https://checkout.stripe.com/c/pay/test" }; },
      retrieve: async () => retrieved } } };
  const deps = { stripe: () => stripe, store: () => store, send: async message => { sent.push(message); return { id: "12345678-1234-1234-1234-123456789abc" }; } };
  try {
    await t.test("Pacific Northwest checkout pins its $99 price, metadata, files and return paths", async () => {
      assert.equal((await handleCheckout(checkout(), deps)).status, 303);
      assert.deepEqual(params.line_items, [{ price: "price_pacificnorthwest", quantity: 1 }]);
      assert.deepEqual(params.metadata, session.metadata);
      assert.equal(params.payment_intent_data.metadata.product_code, "PD-ROOF-PACIFIC-NORTHWEST");
      assert.equal(params.success_url, `${process.env.APP_URL}/checkout/success/pacific-northwest`);
      assert.equal(params.cancel_url, `${process.env.APP_URL}/products/${slug}`);
      assert.equal(params.allow_promotion_codes, false);
      assert.equal(params.automatic_tax.enabled, false);
      assert.equal(params.mode, "payment");
    });
    await t.test("unknown and duplicate packages cannot silently buy Florida", async () => {
      assert.equal((await handleCheckout(checkout(["unknown"]), deps)).status, 400);
      assert.equal((await handleCheckout(checkout([slug, slug]), deps)).status, 400);
    });
    await t.test("Pacific Northwest missing configuration fails closed without breaking Florida configuration", async () => {
      delete process.env.STRIPE_MILO_PACIFIC_NORTHWEST_PRICE_ID;
      assert.equal((await handleCheckout(checkout(), deps)).status, 503);
      assert.equal(paymentConfig().priceId, "price_florida");
      process.env.STRIPE_MILO_PACIFIC_NORTHWEST_PRICE_ID = "price_pacificnorthwest";
    });
    await t.test("Pacific Northwest cannot fulfill with Florida price, code, or legacy metadata", async () => {
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
    await t.test("verified purchase emails Pacific Northwest TXT/PDF once and records Pacific Northwest identity", async () => {
      retrieved = structuredClone(session);
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      assert.equal(sent.length, 1);
      assert.deepEqual(sent[0].attachments.map(file => file.filename), MILO_PACIFIC_NORTHWEST_FILES.map(file => file.filename));
      assert.match(sent[0].text, /Pacific Northwest Roofing/);
      assert.doesNotMatch(sent[0].text, /Florida|video/i);
      const record = await store.find(session.id);
      assert.equal(record.status, "sent");
      const identity = await db.query("SELECT product_code, release_version FROM milo_deliveries WHERE session_id = $1", [session.id]);
      assert.equal(identity.rows[0].product_code, "PD-ROOF-PACIFIC-NORTHWEST");
      assert.equal(identity.rows[0].release_version, "2.4");
    });
  } finally { await db.close(); }
});


test("Pacific Northwest prompt is the California clone with the exact three-state boundary", async () => {
  const { geographicRegions } = await import("../src/lib/geographic-regions.ts");
  const { salesCheckoutState } = await import("../src/lib/sales-order.ts");
  const states = ["WA", "OR", "ID"];
  assert.deepEqual(geographicRegions.find(item => item.id === "pacific-northwest").states.map(item => item.code), states);
  const california = await readFile("docs/Products/MILO/Milo_CA_Roofing_Installation_Prompt_v2.4.txt", "utf8");
  const pacificNorthwest = await readFile("docs/Products/MILO/Milo_Pacific_Northwest_Roofing_Installation_Prompt_v2.4.txt", "utf8");
  const anchor = "Find roofing contractors operating in Pacific Northwest and maintain the user's shared Simple Digital Help Sales prospect workspace.";
  const boundary = "Pacific Northwest territory is limited to these three states: Washington (WA), Oregon (OR), and Idaho (ID). Do not research or add businesses outside these states.";
  assert.equal(pacificNorthwest, california.replaceAll("California", "Pacific Northwest").replaceAll("PD-ROOF-CA", "PD-ROOF-PACIFIC-NORTHWEST").replace(anchor, anchor + "\n\n" + boundary));
  const state = salesCheckoutState(["roofing:pacific-northwest"], [], true);
  assert.equal(state.canCheckout, true); assert.equal(state.order.totalCents, 9900);
  assert.equal(state.productSlug, slug); assert.deepEqual(state.order.discoveryAssignments[0].states, states);
  assert.match(pacificNorthwest, /52 weeks from successful activation/);
  assert.match(pacificNorthwest, /Monday-Friday, in the morning, customer local time\./);
  assert.match(pacificNorthwest, /up to 5 NEW qualified/);
  assert.match(pacificNorthwest, /Do not research, extract, store, or write email addresses or phone numbers/);
});

test("nine-region checkout is $891 and each Milo retains a separate two-file email", async t => {
  const { salesCheckoutState } = await import("../src/lib/sales-order.ts");
  const { miloAssignments: registry } = await import("../src/lib/milo-assignments.ts");
  const miloAssignments = registry.filter(item => item.agentId === "roofing");
  const { MILO_PACKAGE_FILES } = await import("../src/lib/milo-assets.server.ts");
  Object.assign(process.env, { STRIPE_MILO_TX_PRODUCT_ID: "prod_texas", STRIPE_MILO_TX_PRICE_ID: "price_texas",
    STRIPE_MILO_CA_PRODUCT_ID: "prod_california", STRIPE_MILO_CA_PRICE_ID: "price_california", STRIPE_MILO_NORTHEAST_PRODUCT_ID: "prod_northeast", STRIPE_MILO_NORTHEAST_PRICE_ID: "price_northeast", STRIPE_MILO_SOUTHEAST_PRODUCT_ID: "prod_southeast", STRIPE_MILO_SOUTHEAST_PRICE_ID: "price_southeast", STRIPE_MILO_MIDWEST_PRODUCT_ID: "prod_midwest", STRIPE_MILO_MIDWEST_PRICE_ID: "price_midwest", STRIPE_MILO_SOUTHWEST_PRODUCT_ID: "prod_southwest", STRIPE_MILO_SOUTHWEST_PRICE_ID: "price_southwest", STRIPE_MILO_MOUNTAIN_WEST_PRODUCT_ID: "prod_mountainwest", STRIPE_MILO_MOUNTAIN_WEST_PRICE_ID: "price_mountainwest" });
  const regions = ["florida", "texas", "california", "northeast", "southeast", "midwest", "southwest", "mountain-west", "pacific-northwest"];
  const all = salesCheckoutState(regions.map(region => `roofing:${region}`), [], true);
  assert.equal(all.canCheckout, true); assert.equal(all.order.totalCents, 89100); assert.equal(all.order.termWeeks, 52);
  assert.equal(all.order.workspaceModel, "one-shared-sales-workspace-per-customer");
  assert.deepEqual(all.productSlugs, miloAssignments.map(item => item.slug));
  const prices = Object.fromEntries(regions.map(region => [`price_${region.replaceAll('-', '')}`, { ...price, id: `price_${region.replaceAll('-', '')}`, product: { ...price.product, id: `prod_${region.replaceAll('-', '')}` } }]));
  const paid = structuredClone(session); paid.id = "cs_nine"; paid.payment_intent.id = "pi_nine";
  paid.amount_total = paid.amount_subtotal = paid.payment_intent.amount_received = 89100;
  paid.metadata = { product: "milo-discovery-regions", version: "2.4", release_version: "2.4", products: JSON.stringify(all.productSlugs),
    product_codes: JSON.stringify(miloAssignments.map(item => item.productCode)) };
  paid.line_items.data = Object.values(prices).map(price => ({ quantity: 1, amount_total: 9900, amount_subtotal: 9900, price }));
  const db = new PGlite();
  for (const filename of ["001_milo_deliveries.sql", "002_milo_identity.sql", "003_milo_product_codes.sql"]) await db.exec(await readFile(`db/migrations/${filename}`, "utf8"));
  const store = new DeliveryStore(db); let params, sent = [], calls = 0, retrieved = structuredClone(paid);
  const stripe = { webhooks: sdk.webhooks, prices: { retrieve: async id => structuredClone(prices[id]) }, checkout: { sessions: {
    create: async value => { params = value; return { url: "https://checkout.stripe.com/c/pay/test" }; }, retrieve: async () => retrieved,
  } } };
  const deps = { stripe: () => stripe, store: () => store, send: async message => {
    sent.push(structuredClone(message)); if (++calls === 9) throw Error("Pacific Northwest acceptance unknown");
    return { id: "12345678-1234-1234-1234-123456789abc" };
  } };
  function nineWebhook() {
    const payload = JSON.stringify({ id: "evt_nine", type: "checkout.session.completed", livemode: false, data: { object: paid } });
    return new Request(`${process.env.APP_URL}/api/webhooks/stripe`, { method: "POST", body: payload,
      headers: { "stripe-signature": sdk.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET }) } });
  }
  try {
    await store.prepare({ sessionId: "cs_historical_pending", paymentIntentId: "pi_historical_pending", email: "old@example.test", livemode: false,
      productCode: "PD-ROOF-FL", productCodes: ["PD-ROOF-FL", "PD-ROOF-TX"], releaseVersion: "2.2" },
      { to: "old@example.test", subject: "Historical combined", text: "Historical combined", idempotencyKey: "old-combined", attachments: [] });
    const historical = (await db.query("SELECT * FROM milo_deliveries WHERE session_id='cs_historical_pending'")).rows[0];
    await t.test("all selected line items reach one Stripe checkout", async () => {
      assert.equal((await handleCheckout(checkout(all.productSlugs), deps)).status, 303);
      assert.deepEqual(params.line_items, regions.map(region => ({ price: `price_${region.replaceAll('-', '')}`, quantity: 1 })));
      assert.deepEqual(params.metadata, paid.metadata); assert.equal(params.success_url, `${process.env.APP_URL}/checkout/success/regions`);
    });
    await t.test("missing Pacific Northwest files or an incorrect nineth line fail closed", async () => {
      assert.equal((await handleCheckout(checkout(all.productSlugs), { ...deps, attachments: async code => { if (code === "PD-ROOF-PACIFIC-NORTHWEST") throw Error("missing package"); return []; } })).status, 503);
      for (const mutate of [value => value.amount_total = 29700, value => value.line_items.data[8].price.product.id = "prod_california", value => value.line_items.data[8].quantity = 2]) {
        retrieved = structuredClone(paid); mutate(retrieved); assert.equal((await handleWebhook(nineWebhook(), deps)).status, 503);
      }
      assert.equal(sent.length, 0);
    });
    await t.test("nine regional emails isolate files and retries send only the pending Pacific Northwest email", async () => {
      retrieved = structuredClone(paid); retrieved.line_items.data.reverse();
      assert.equal((await handleWebhook(nineWebhook(), deps)).status, 503); assert.equal(sent.length, 9);
      for (const [index, assignment] of miloAssignments.entries()) {
        assert.equal(sent[index].subject, `Your Milo - ${assignment.region} Roofing Prospect Discovery`);
        assert.deepEqual(sent[index].attachments, await miloAttachments(assignment.productCode));
        assert.deepEqual(sent[index].attachments.map(file => file.filename), MILO_PACKAGE_FILES[assignment.productCode].map(file => file.filename));
        assert.equal(sent[index].attachments.length, 2); assert.doesNotMatch(sent[index].text, /video|\.mp4/i);
      }
      assert.equal(new Set(sent.map(message => message.idempotencyKey)).size, 9);
      assert.equal((await handleWebhook(nineWebhook(), { ...deps, makeEmail: async () => { throw Error("reuse snapshot"); } })).status, 200);
      assert.equal(sent.length, 10); assert.deepEqual(sent[9], sent[8]);
      assert.equal((await handleWebhook(nineWebhook(), deps)).status, 200); assert.equal(sent.length, 10);
      assert.deepEqual((await db.query("SELECT * FROM milo_deliveries WHERE session_id='cs_historical_pending'")).rows[0], historical);
    });
  } finally { await db.close(); }
});
