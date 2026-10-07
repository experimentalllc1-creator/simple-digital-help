import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { miloAssignments } from "../src/lib/milo-assignments.ts";
import { miloPresentations } from "../src/lib/milo-presentations.ts";
import { MILO_VERSION, paymentConfig } from "../src/lib/milo-config.server.ts";
import { MILO_V23_PACKAGE_FILES as MILO_PACKAGE_FILES, MILO_V22_PACKAGE_FILES, miloAttachments, miloEmail } from "../src/lib/milo-assets.server.ts";
import { verifiedOrder, fulfillOrder } from "../src/lib/milo-fulfillment.server.ts";
import { DeliveryStore } from "../src/lib/milo-store.server.ts";

globalThis.fetch = async () => { throw Error("Unmocked network forbidden"); };
const schedule = "Monday-Friday, in the morning, customer local time.";
Object.assign(process.env, { STRIPE_MODE: "test", STRIPE_SECRET_KEY: "sk_test_local_only", APP_URL: "http://localhost:3000" });
for (const assignment of miloAssignments) {
  const id = assignment.productCode.replaceAll("-", "");
  process.env[assignment.productEnv] = `prod_${id}`;
  process.env[assignment.priceEnv] = `price_${id}`;
}

test("historical packages and master retain v2.3 morning scheduling without changing discovery", async () => {
  assert.equal(MILO_VERSION, "2.4");
  for (const assignment of miloAssignments.filter(item => MILO_V22_PACKAGE_FILES[item.productCode])) {
    const code = assignment.productCode;
    const current = await readFile(`docs/Products/MILO/${MILO_PACKAGE_FILES[code][0].filename}`, "utf8");
    const previous = await readFile(`docs/Products/MILO/${MILO_V22_PACKAGE_FILES[code][0].filename}`, "utf8");
    assert.match(current, /Prompt Version: 2\.3/);
    assert.ok(current.includes(schedule));
    assert.doesNotMatch(current, /9:00|v2\.2|\bat exactly\b/);
    assert.match(current, /native flexible\/daypart "morning"/);
    assert.match(current, /Do not promise an exact execution time/);
    assert.match(current, /Do not manually construct a fragile RRULE/);
    assert.match(current, /Do not alter an already-installed customer automation/);
    assert.match(current, /task is enabled and not paused/);
    assert.match(current, /a next scheduled run exists within the 52-week term/);
    assert.match(current, /customer timezone is correct/);
    assert.match(current, /service end date is exactly 52 weeks after successful activation/);
    assert.match(current, /only one active task exists for this Milo assignment/);
    const clean = text => text.replace(/\r/g, "");
    assert.equal(clean(current.split("SERVICE TERM AND SCHEDULE")[0]), clean(previous.split("SERVICE TERM AND SCHEDULE")[0]).replace("Prompt Version: 2.2", "Prompt Version: 2.3"));
    assert.equal(clean(current.split("FAILURE BEHAVIOR")[1].split("SETUP")[0]), clean(previous.split("FAILURE BEHAVIOR")[1].split("SETUP")[0]));
    assert.equal(clean(current.split("FIRST RUN AND FUTURE RUNS")[1]), clean(previous.split("FIRST RUN AND FUTURE RUNS")[1]));
    assert.ok(miloPresentations[assignment.slug].description.includes(schedule));
    const email = await miloEmail("buyer@example.test", "cs_v23", code, "2.3");
    assert.equal(email.attachments.length, 2);
    assert.ok(email.attachments.every(file => file.filename.includes("v2.3")));
    assert.equal(email.subject, `Your Milo - ${assignment.region} Roofing Prospect Discovery`);
  }
  const master = await readFile("docs/Products/MILO/Milo_Roofing_Installation_Prompt_Template_v2.3.txt", "utf8");
  const florida = await readFile("docs/Products/MILO/Milo_FL_Roofing_Installation_Prompt_v2.3.txt", "utf8");
  assert.equal(master, florida.replaceAll("Florida", "{{REGION}}").replaceAll("PD-ROOF-FL", "{{PRODUCT_CODE}}"));
  const spec = await readFile("docs/Products/MILO/Milo_FL_Roofing_Product_Spec_v2.3.md", "utf8");
  assert.ok(spec.includes(schedule)); assert.doesNotMatch(spec, /9:00|v2\.2|Video_v2\.3/);
});

function paidSession(assignments, version, id) {
  const total = 9900 * assignments.length;
  return { id, mode: "payment", status: "complete", payment_status: "paid", livemode: false,
    amount_total: total, amount_subtotal: total, currency: "usd", customer_details: { email: "buyer@example.test" },
    payment_intent: { id: `pi_${id}`, status: "succeeded", amount_received: total, currency: "usd", livemode: false },
    metadata: assignments.length === 1 ? { product: assignments[0].slug, product_code: assignments[0].productCode, version, release_version: version }
      : { product: "milo-discovery-regions", products: JSON.stringify(assignments.map(item => item.slug)), product_codes: JSON.stringify(assignments.map(item => item.productCode)), version, release_version: version },
    line_items: { has_more: false, data: assignments.map(item => ({ quantity: 1, amount_total: 9900, amount_subtotal: 9900,
      price: { id: `price_${item.productCode.replaceAll("-", "")}`, product: `prod_${item.productCode.replaceAll("-", "")}`, type: "one_time", unit_amount: 9900, currency: "usd", livemode: false } })) } };
}

// Large baskets exercise routing, snapshot persistence and one-send-per-Milo.
// Keep their mock database small; every individual package still uses real bytes,
// and the family/regional retry suites also exercise real attachment snapshots.
async function compactEmail(...args) {
  const message = await miloEmail(...args);
  return { ...message, attachments: message.attachments.map(file => ({ ...file,
    content: createHash('sha256').update(Buffer.from(file.content, 'base64')).digest('base64') })) };
}

test("v2.2/v2.3 purchases retain their packages; v2.4 sends one current package per Milo", async () => {
  const db = new PGlite();
  for (const file of ["001_milo_deliveries.sql", "002_milo_identity.sql", "003_milo_product_codes.sql"]) await db.exec(await readFile(`db/migrations/${file}`, "utf8"));
  const store = new DeliveryStore(db);
  const sends = [];
  const send = async message => { sends.push(structuredClone(message)); return { id: "12345678-1234-1234-1234-123456789abc" }; };
  try {
    for (const version of ["2.2", "2.3", "2.4"]) {
      const supported = version === "2.2" ? miloAssignments.filter(item => MILO_V22_PACKAGE_FILES[item.productCode]) : version === "2.3" ? miloAssignments.filter(item => item.productCode !== "PD-BMM-US") : miloAssignments;
      for (const selected of [...supported.map(item => [item]), supported]) {
        const session = paidSession(selected, version, `cs_${version}_${selected[0].productCode}_${selected.length}`);
        const order = verifiedOrder(session, selected.map(item => paymentConfig(item.slug)));
        assert.equal(order.releaseVersion, version);
        const before = sends.length;
        const makeEmail = selected.length > 9 ? compactEmail : miloEmail;
        await fulfillOrder(order, store, makeEmail, send);
        assert.equal(sends.length - before, selected.length);
        for (const [index, assignment] of selected.entries()) {
          const message = sends[before + index];
          assert.deepEqual(message.attachments, selected.length > 9
            ? (await compactEmail(order.email, session.id, assignment.productCode, version)).attachments
            : await miloAttachments(assignment.productCode, version));
          assert.equal(message.idempotencyKey, `milo-v${version}/${session.id}${selected.length > 1 ? "/" + assignment.productCode : ""}`);
        }
        await fulfillOrder(order, store, () => { throw Error("must reuse completed record"); }, send);
        assert.equal(sends.length - before, selected.length);
      }
    }
    const old = paidSession([miloAssignments[0]], "2.2", "cs_old_pending");
    const order = verifiedOrder(old, paymentConfig(miloAssignments[0].slug));
    const message = await miloEmail(order.email, old.id, order.productCode, "2.2");
    await store.prepare(order, message);
    const before = sends.length;
    await fulfillOrder(order, store, () => { throw Error("must reuse saved v2.2 snapshot"); }, send);
    assert.equal(sends.length, before + 1); assert.deepEqual(sends.at(-1), message);
    const v23 = paidSession([miloAssignments[0]], "2.3", "cs_v23_pending");
    const v23Order = verifiedOrder(v23, paymentConfig(miloAssignments[0].slug));
    const v23Message = await miloEmail(v23Order.email, v23.id, v23Order.productCode, "2.3");
    await store.prepare(v23Order, v23Message);
    await fulfillOrder(v23Order, store, () => { throw Error("must reuse saved v2.3 snapshot"); }, send);
    assert.deepEqual(sends.at(-1), v23Message);
    const mismatched = paidSession(miloAssignments, "2.2", "cs_wrong"); mismatched.metadata.release_version = "2.3";
    assert.throws(() => verifiedOrder(mismatched, miloAssignments.map(item => paymentConfig(item.slug))), /metadata/);
    await assert.rejects(() => miloAttachments("PD-ROOF-FL", "2.5"), /Unavailable/);
  } finally { await db.close(); }
});
