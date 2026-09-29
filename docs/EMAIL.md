# Resend email integration

`src/lib/email.server.ts` exports the server-side `sendEmail` function. It uses
the Resend HTTPS API with Node's built-in fetch, without an additional dependency.
The sender is `support@simpledigitalhelp.com`. Resend must authorize this domain
and the API key must allow sending from it.

Keep `RESEND_API_KEY` in `.env.local` locally. Never use a `NEXT_PUBLIC_` variable,
commit the environment file, or import the sender into client components. Next.js
loads `.env.local` on the server. Standalone test tooling uses the `react-server`
condition for the server-only module (see `npm test`). Never print credentials or raw errors.

Call `sendEmail({ to, subject, text, idempotencyKey })` only from trusted server code.
Each logical email needs a unique key; reuse it for an uncertain retry. Resend retains
idempotency keys for 24 hours. The sender itself does not retry. Success returns a
Resend message ID, confirming API acceptance, not final inbox delivery.

Run isolated tests with `npm test`.
These tests stub fetch and never send real email or load `.env.local`.

The sender now accepts Base64 attachment content from trusted server code and is
protected by `server-only`. There is no public sending route. The Milo Stripe webhook
can trigger delivery only after verified payment and explicit activation of
`MILO_DELIVERY_ENABLED`; it is off by default. See [MILO_CHECKOUT.md](MILO_CHECKOUT.md)
for the durable ledger, retry policy, private attachments, and required configuration.

Reference: https://resend.com/docs/api-reference/emails/send-email
