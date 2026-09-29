import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, rm, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import Stripe from "stripe";
import { PGlite } from "@electric-sql/pglite";
import { DeliveryStore } from "../src/lib/milo-store.server.ts";
import { fulfillOrder } from "../src/lib/milo-fulfillment.server.ts";
import { handleCheckout, handleWebhook } from "../src/lib/milo-http.server.ts";
import { paymentConfig, appOrigin } from "../src/lib/milo-config.server.ts";
import { miloAttachments, miloEmail, MILO_FILES } from "../src/lib/milo-assets.server.ts";
import { sendEmail } from "../src/lib/email.server.ts";

// Never load .env.local or allow a real email HTTP request in this process.
globalThis.fetch = async () => { throw new Error("Unmocked network call forbidden in tests"); };
Object.assign(process.env, {
  STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_test_local_only",
  STRIPE_WEBHOOK_SECRET: "whsec_local_only", STRIPE_MILO_PRODUCT_ID: "prod_milo",
  STRIPE_MILO_PRICE_ID: "price_milo", RESEND_API_KEY: "test-only-not-a-real-key",
  APP_URL: "http://127.0.0.1:3000", MILO_CHECKOUT_ENABLED: "true", MILO_DELIVERY_ENABLED: "true",
});
const sdk = new Stripe("sk_test_local_only");
const product = { id: "prod_milo", active: true, livemode: false };
const price = { id: "price_milo", active: true, type: "one_time", unit_amount: 9900, currency: "usd", livemode: false, product };
const paidSession = {
  id: "cs_test_milo", object: "checkout.session", mode: "payment", status: "complete", payment_status: "paid", livemode: false,
  amount_subtotal: 9900, amount_total: 9900, currency: "usd",
  metadata: { product: "milo-florida-roofing-contractors", version: "1.2" },
  customer_details: { email: "buyer@example.test" },
  payment_intent: { id: "pi_milo", status: "succeeded", amount_received: 9900, currency: "usd", livemode: false },
  line_items: { has_more: false, data: [{ quantity: 1, amount_subtotal: 9900, amount_total: 9900, price }] },
};
const message = { to: "buyer@example.test", subject: "Milo", text: "Install Milo", idempotencyKey: "milo-v1.2/cs_test_milo", attachments: [{ filename: "fixture.txt", content: "dGVzdA==" }] };
const order = { sessionId: paidSession.id, paymentIntentId: "pi_milo", email: message.to, livemode: false };
const resendId = "12345678-1234-1234-1234-123456789abc";
function webhook({ eventId = "evt_local", type = "checkout.session.completed", session = paidSession, livemode = false, timestamp, mutate = false } = {}) {
  const payload = JSON.stringify({ id: eventId, object: "event", type, livemode, data: { object: session } });
  const signature = sdk.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET, ...(timestamp ? { timestamp } : {}) });
  return new Request("http://127.0.0.1:3000/api/webhooks/stripe", {
    method: "POST", headers: { "stripe-signature": signature }, body: mutate ? `${payload} ` : payload,
  });
}
function checkout(origin = process.env.APP_URL, body = "") {
  return new Request(`${process.env.APP_URL}/api/checkout/milo`, { method: "POST", headers: { origin }, body });
}

test("Milo payment and durable fulfillment", async t => {
  const db = new PGlite();
  await db.exec(await readFile("db/migrations/001_milo_deliveries.sql", "utf8"));
  const store = new DeliveryStore(db);
  let sends = 0, created = 0, retrieved = 0, session = structuredClone(paidSession), checkoutParams;
  const stripe = {
    webhooks: sdk.webhooks,
    prices: { retrieve: async () => structuredClone(price) },
    checkout: { sessions: {
      retrieve: async () => { retrieved++; return session; },
      create: async params => { created++; checkoutParams = params; return { url: "https://checkout.stripe.com/c/pay/test" }; },
    } },
  };
  const deps = { stripe: () => stripe, store: () => store, attachments: async () => [], makeEmail: async () => structuredClone(message), send: async () => { sends++; return { id: resendId }; } };
  async function reset() {
    await db.exec("TRUNCATE milo_deliveries");
    sends = 0; created = 0; retrieved = 0; session = structuredClone(paidSession);
    process.env.MILO_CHECKOUT_ENABLED = "true"; process.env.MILO_DELIVERY_ENABLED = "true";
  }
  try {
    await t.test("disabled switches prevent checkout and email side effects", async () => {
      await reset(); process.env.MILO_CHECKOUT_ENABLED = "false"; process.env.MILO_DELIVERY_ENABLED = "false";
      assert.equal((await handleCheckout(checkout(), deps)).status, 503);
      assert.equal((await handleWebhook(webhook(), deps)).status, 503);
      assert.equal(created + retrieved + sends, 0);
      process.env.MILO_CHECKOUT_ENABLED = "true";
      assert.equal((await handleCheckout(checkout(), deps)).status, 503);
    });
    await t.test("checkout pins the existing price, ignores client amount and redirects, and requires origin", async () => {
      await reset();
      assert.equal((await handleCheckout(checkout("https://attacker.test"), deps)).status, 403);
      const result = await handleCheckout(checkout(undefined, JSON.stringify({ price: "price_evil", amount: 1, success_url: "https://attacker.test" })), deps);
      assert.equal(result.status, 303); assert.equal(created, 1);
      assert.deepEqual(checkoutParams.line_items, [{ price: "price_milo", quantity: 1 }]);
      assert.equal(checkoutParams.mode, "payment"); assert.equal(checkoutParams.allow_promotion_codes, false);
      assert.equal(checkoutParams.currency, "usd"); assert.equal(checkoutParams.adaptive_pricing.enabled, false);
      assert.equal(checkoutParams.success_url, "http://127.0.0.1:3000/checkout/success");
    });
    await t.test("checkout fails closed for wrong price/product/mode or unavailable delivery infrastructure", async () => {
      await reset();
      for (const changed of [{ unit_amount: 100 }, { type: "recurring" }, { currency: "eur" }, { active: false }, { livemode: true }, { product: { ...product, id: "prod_other" } }]) {
        const badStripe = { ...stripe, prices: { retrieve: async () => ({ ...price, ...changed }) } };
        assert.equal((await handleCheckout(checkout(), { ...deps, stripe: () => badStripe })).status, 503);
      }
      assert.equal((await handleCheckout(checkout(), { ...deps, attachments: async () => { throw Error("missing files"); } })).status, 503);
      assert.equal((await handleCheckout(checkout(), { ...deps, store: () => ({ ready: async () => { throw Error("db down"); } }) })).status, 503);
      assert.equal(created, 0);
    });
    await t.test("signature rejects missing, changed, stale, oversized bodies and wrong mode", async () => {
      await reset();
      assert.equal((await handleWebhook(new Request("http://localhost", { method: "POST", body: "{}" }), deps)).status, 400);
      assert.equal((await handleWebhook(webhook({ mutate: true }), deps)).status, 400);
      assert.equal((await handleWebhook(webhook({ timestamp: Math.floor(Date.now()/1000) - 600 }), deps)).status, 400);
      assert.equal((await handleWebhook(webhook({ livemode: true }), deps)).status, 400);
      assert.equal((await handleWebhook(webhook({ session: { ...paidSession, big: "x".repeat(300000) } }), deps)).status, 400);
      assert.equal(retrieved + sends, 0);
    });
    await t.test("unrelated, unpaid, expired and failed events do not deliver", async () => {
      await reset();
      for (const type of ["checkout.session.expired", "checkout.session.async_payment_failed", "payment_intent.succeeded"]) {
        assert.equal((await handleWebhook(webhook({ type }), deps)).status, 200);
      }
      assert.equal((await handleWebhook(webhook({ session: { ...paidSession, metadata: { product: "other" } } }), deps)).status, 200);
      session.payment_status = "unpaid";
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      assert.equal(sends, 0);
    });
    await t.test("paid sessions require exact product, price, amount, currency, quantity and successful intent", async () => {
      await reset();
      const mutations = [s => s.amount_total = 1, s => s.currency = "eur", s => s.mode = "subscription",
        s => s.status = "open", s => s.livemode = true, s => s.customer_details.email = null,
        s => s.metadata.version = "other",
        s => s.payment_intent.status = "processing", s => s.payment_intent.amount_received = 1,
        s => s.line_items.data[0].quantity = 2, s => s.line_items.has_more = true,
        s => s.line_items.data[0].price.id = "price_other", s => s.line_items.data[0].price.product.id = "prod_other",
        s => s.line_items.data.push(s.line_items.data[0])];
      for (const mutate of mutations) {
        session = structuredClone(paidSession); mutate(session);
        assert.equal((await handleWebhook(webhook(), deps)).status, 503);
      }
      assert.equal(sends, 0); assert.equal(await store.find(order.sessionId), undefined);
    });
    await t.test("valid payment delivers once across duplicate and different event IDs/types", async () => {
      await reset();
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      assert.equal((await handleWebhook(webhook({ eventId: "evt_other", type: "checkout.session.async_payment_succeeded" }), deps)).status, 200);
      assert.equal((await handleWebhook(webhook(), deps)).status, 200);
      assert.equal(sends, 1); assert.equal((await store.find(order.sessionId)).status, "sent");
    });
    await t.test("concurrent webhook deliveries only acquire one send lease", async () => {
      await reset();
      let releaseSend, started;
      const wait = new Promise(resolve => { releaseSend = resolve; });
      const begun = new Promise(resolve => { started = resolve; });
      const first = handleWebhook(webhook(), { ...deps, send: async () => { sends++; started(); await wait; return { id: resendId }; } });
      await begun;
      assert.equal((await handleWebhook(webhook({ eventId: "evt_concurrent" }), deps)).status, 503);
      releaseSend(); assert.equal((await first).status, 200); assert.equal(sends, 1);
    });
    await t.test("failed sends retry the persisted body/key, not a changed template", async () => {
      await reset(); let original;
      assert.equal((await handleWebhook(webhook(), { ...deps, send: async msg => { original = msg; throw Error("timeout"); } })).status, 503);
      assert.equal((await store.find(order.sessionId)).status, "pending");
      assert.equal((await handleWebhook(webhook(), { ...deps, makeEmail: async () => { throw Error("must use snapshot"); }, send: async msg => {
        assert.deepEqual(msg, original); return { id: resendId };
      } })).status, 200);
    });
    await t.test("database failure after provider acceptance reuses Resend idempotency", async () => {
      await reset(); const accepted = new Map(); let actualEmails = 0;
      const provider = async msg => { if (!accepted.has(msg.idempotencyKey)) { actualEmails++; accepted.set(msg.idempotencyKey, resendId); } return { id: accepted.get(msg.idempotencyKey) }; };
      const failingStore = new DeliveryStore(db); failingStore.complete = async () => { throw Error("lost database connection"); };
      await assert.rejects(fulfillOrder(order, failingStore, deps.makeEmail, provider));
      await fulfillOrder(order, new DeliveryStore(db), deps.makeEmail, provider);
      assert.equal(actualEmails, 1); assert.equal((await store.find(order.sessionId)).status, "sent");
    });
    await t.test("crash leases expire, while uncertain attempts beyond 23h require manual reconciliation", async () => {
      await reset(); await store.prepare(order, message); await store.claim(order.sessionId);
      await assert.rejects(store.claim(order.sessionId));
      await db.query("UPDATE milo_deliveries SET lease_until = now() - interval '1 minute'");
      assert.notEqual(await store.claim(order.sessionId), "sent");
      await db.query("UPDATE milo_deliveries SET lease_until = now() - interval '1 minute', first_attempt_at = now() - interval '25 hours'");
      await assert.rejects(fulfillOrder(order, store, deps.makeEmail, deps.send));
      assert.equal((await store.find(order.sessionId)).status, "manual_review"); assert.equal(sends, 0);
    });
    await t.test("unique payment intent cannot be delivered via a second session", async () => {
      await reset(); await store.prepare(order, message);
      await assert.rejects(store.prepare({ ...order, sessionId: "cs_other" }, message), /unique/);
    });
  } finally { await db.close(); }
});

test("delivery suppression survives a durable database restart", async () => {
  await mkdir(".qa", { recursive: true });
  const directory = await mkdtemp(path.join(process.cwd(), ".qa", "milo-db-"));
  let db = new PGlite(directory);
  try {
    await db.exec(await readFile("db/migrations/001_milo_deliveries.sql", "utf8"));
    await fulfillOrder(order, new DeliveryStore(db), async () => message, async () => ({ id: resendId }));
    await db.close(); db = new PGlite(directory);
    await fulfillOrder(order, new DeliveryStore(db), async () => { throw Error("must not build email"); }, async () => { throw Error("must not resend"); });
    assert.equal((await new DeliveryStore(db).find(order.sessionId)).status, "sent");
  } finally { await db.close(); await rm(directory, { recursive: true, force: true }); }
});

test("configuration rejects accidental live keys and untrusted origins", () => {
  const previousKey = process.env.STRIPE_SECRET_KEY, previousUrl = process.env.APP_URL;
  try {
    process.env.STRIPE_SECRET_KEY = "sk_live_not_real"; assert.throws(paymentConfig);
    for (const url of ["http://example.com", "https://example.com/path", "https://user:password@example.com", "javascript:alert(1)"]) {
      process.env.APP_URL = url; assert.throws(appOrigin);
    }
  } finally { process.env.STRIPE_SECRET_KEY = previousKey; process.env.APP_URL = previousUrl; }
});

let privateAssetsPresent = true;
try { await access("docs/Products/MILO/Milo_Illustrated_Installation_Guide_v1.2.pdf"); } catch { privateAssetsPresent = false; }
test("approved private files are attached byte-for-byte with video and disclaimer", { skip: !privateAssetsPresent && "Provision private Milo assets to run this release check" }, async () => {
  const attachments = await miloAttachments();
  assert.deepEqual(attachments.map(a => a.filename), MILO_FILES.map(a => a.filename));
  for (const [i, attachment] of attachments.entries()) {
    assert.equal(createHash("sha256").update(Buffer.from(attachment.content, "base64")).digest("hex"), MILO_FILES[i].sha256);
  }
  const email = await miloEmail("buyer@example.test", "cs_test_milo");
  assert.match(email.text, /https:\/\/youtu.be\/C52gIS4fVNc/);
  assert.match(email.text, /does not research, collect, or populate email addresses or phone numbers/);
  let payload;
  const oldFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, options) => { payload = JSON.parse(options.body); return Response.json({ id: resendId }); };
    await sendEmail(email);
    assert.deepEqual(payload.attachments, attachments); assert.equal(payload.to[0], "buyer@example.test");
  } finally { globalThis.fetch = oldFetch; }
});
