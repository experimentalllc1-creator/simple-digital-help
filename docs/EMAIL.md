# Resend email integration

`src/lib/email.server.ts` exports the server-side `sendEmail` function. It uses
the Resend HTTPS API with Node's built-in fetch, without an additional dependency.
The sender is `support@simpledigitalhelp.com`. Resend must authorize this domain
and the API key must allow sending from it.

Keep `RESEND_API_KEY` in `.env.local` locally. Never use a `NEXT_PUBLIC_` variable,
commit the environment file, or import the sender into client components. Next.js
loads `.env.local` on the server; a standalone Node 24 script can use
`node --experimental-transform-types --env-file=.env.local script.mjs`. Never print credentials or raw errors.

Call `sendEmail({ to, subject, text, idempotencyKey })` only from trusted server code.
Each logical email needs a unique key; reuse it for an uncertain retry. Resend retains
idempotency keys for 24 hours. There are no automatic retries. Success returns a
Resend message ID, confirming API acceptance, not final inbox delivery.

Run isolated tests with `node --experimental-transform-types --test tests/email.test.mjs`.
These tests stub fetch and never send real email or load `.env.local`.

There is no public sending route, purchase trigger, Stripe connection, delivery email
automation or checkout activation. Those remain separate future work.

Reference: https://resend.com/docs/api-reference/emails/send-email
