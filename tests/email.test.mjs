import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail, SUPPORT_EMAIL } from "../src/lib/email.server.ts";

const message = { to: SUPPORT_EMAIL, subject: "Test", text: "Test body", idempotencyKey: "unit-test/1" };

test("Resend sender contracts (mocked; no real emails)", async (t) => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFetch = globalThis.fetch;
  try {
    process.env.RESEND_API_KEY = "test-only-not-a-real-key";
    await t.test("uses the approved sender and forwards idempotency", async () => {
      let calls = 0;
      globalThis.fetch = async (url, options) => {
        calls++;
        assert.equal(url, "https://api.resend.com/emails");
        assert.equal(options.method, "POST");
        assert.equal(options.headers["Idempotency-Key"], message.idempotencyKey);
        assert.equal(options.headers.Authorization, "Bearer test-only-not-a-real-key");
        assert.deepEqual(JSON.parse(options.body), { from: SUPPORT_EMAIL, to: [SUPPORT_EMAIL], subject: "Test", text: "Test body" });
        return Response.json({ id: "12345678-1234-1234-1234-123456789abc" });
      };
      assert.deepEqual(await sendEmail(message), { id: "12345678-1234-1234-1234-123456789abc" });
      assert.equal(calls, 1);
    });
    await t.test("rejects missing credentials without a request", async () => {
      delete process.env.RESEND_API_KEY;
      globalThis.fetch = async () => { throw new Error("must not send"); };
      await assert.rejects(sendEmail(message), /not configured/);
      process.env.RESEND_API_KEY = "test-only-not-a-real-key";
    });
    await t.test("does not leak provider response bodies or retry rejection", async () => {
      let calls = 0;
      globalThis.fetch = async () => { calls++; return Response.json({ message: "sensitive-response" }, { status: 403 }); };
      await assert.rejects(sendEmail(message), error => error.status === 403 && !error.message.includes("sensitive-response"));
      assert.equal(calls, 1);
    });
    await t.test("redacts network errors and reports uncertain acceptance", async () => {
      globalThis.fetch = async () => { throw new Error("sensitive-header"); };
      await assert.rejects(sendEmail(message), error => error.message.includes("acceptance is unknown") && !error.message.includes("sensitive-header"));
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});
