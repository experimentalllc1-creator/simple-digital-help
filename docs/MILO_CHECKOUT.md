# Milo checkout and private delivery

Implemented in the existing storefront. Both activation switches default to off.
No Stripe products or Prices are created. No scheduler, public download endpoint,
or public email-sending endpoint is installed.

## Flow

1. The existing Milo page displays $99. Its form remains disabled until both
   `MILO_CHECKOUT_ENABLED=true` and `MILO_DELIVERY_ENABLED=true` are explicitly set.
2. `POST /api/checkout/milo` requires the configured same-origin browser request.
   It checks database readiness, approved private files, required settings, and
   the existing Stripe Price (active, USD 9900, one-time, expected Product and mode).
   It creates a hosted card Checkout Session for exactly one unit. Customer input
   cannot choose the price, quantity, discount, currency, or redirect destination.
3. `POST /api/webhooks/stripe` verifies the raw body and timestamp with Stripe's SDK.
   It handles `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
   Other events and unrelated products are ignored. It retrieves the session,
   line items, and PaymentIntent from Stripe and checks successful payment,
   expected Product/Price, version, quantity, amount, currency, and mode.
4. A PostgreSQL row keyed by Checkout Session (also unique by PaymentIntent) stores
   the recipient and exact email/attachment payload before any email request.
   An atomic two-minute lease prevents concurrent workers sending independently.
5. The existing Resend sender sends all three approved attachments and the video
   link to the email address recorded by Stripe Checkout. A successful Resend API
   response is persisted with its message ID. `sent` means provider acceptance,
   not proof of inbox delivery. The success page never triggers fulfillment and
   does not treat a browser redirect as proof of payment.

## Private approved release

Keep these files, unchanged, under `docs/Products/MILO/` on the server:

- `Milo_FL_Roofing_Installation_Prompt_v1.2.txt`
- `Milo_Illustrated_Installation_Guide_v1.2.pdf`
- `Milo_Video_Disclaimer_v1.2.txt`

They remain in their existing local location and are Git-ignored to avoid publishing
paid content in a potentially public repository. Provision them separately through
a private build/server process before any future deployment. Next.js output tracing
includes them only in the checkout/webhook **server** bundles. Never copy them to
`public/`, static hosting, client modules, or a public download URL. A clean clone
does not contain these files. Missing or modified files stop new checkout creation.
SHA-256 values in `src/lib/milo-assets.server.ts` pin the approved release.

The email includes https://youtu.be/C52gIS4fVNc and the notice that the video shows an
older installation. The v1.2 files remain authoritative. No Milo functionality or
installation scheduling has been modified or executed.

## Configuration still required

See `.env.example`; do not replace existing `.env.local` or commit secrets.

| Setting | Required value |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server key for the existing account and selected mode |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for this endpoint/listener |
| `STRIPE_MILO_PRODUCT_ID` | Existing Milo `prod_...` ID |
| `STRIPE_MILO_PRICE_ID` | Existing $99 USD one-time `price_...` ID belonging to that product |
| `STRIPE_MODE` | `test` by default; `live` requires explicit later authorization |
| `APP_URL` | Exact trusted origin; HTTPS except local HTTP in test mode |
| `DATABASE_URL` | Durable PostgreSQL connection URL, shared by all app instances |
| `RESEND_API_KEY` | Existing server key; sender remains `support@simpledigitalhelp.com` |
| `MILO_CHECKOUT_ENABLED` | Leave `false` until approved |
| `MILO_DELIVERY_ENABLED` | Leave `false` until email sending is approved |

Use a durable PostgreSQL service with backups and the provider's verified TLS
configuration; do not use ephemeral serverless storage as the ledger. Run
`npm run db:migrate` against the intended database before enabling checkout.
The command loads `.env.local` if present and only installs the idempotent schema.
It neither sends email nor creates Stripe objects. No external migration was run
as part of implementation. Preserve the ledger across deployments and restores.

Stripe test and live catalogs are separate: select the existing Price in the
appropriate mode. This code never creates or copies a product to fill a missing
configuration. Hosted Checkout does not require a browser publishable key.

Before activation, configure the Stripe endpoint for the two events above, verify
the Resend sender domain/key, and check the existing product/Price IDs read-only.
For an approved local test, Stripe CLI can forward events to
`http://127.0.0.1:3000/api/webhooks/stripe`; its signing secret differs from a
dashboard endpoint secret. No listener or scheduled task has been started.

## Retry and reconciliation policy

The ledger permanently suppresses completed deliveries, regardless of webhook event
ID, repeat event type, process restart, or elapsed time. Transient failures return
503 so Stripe can retry. Recoverable retries use the same stored payload and
deterministic Resend idempotency key. No separate background scheduler is needed.

Resend retains idempotency keys for 24 hours. If acceptance is uncertain and the
first attempt is over 23 hours old, the row becomes `manual_review` and automatic
resending stops. This avoids a duplicate after the provider forgets its key.
Exactly-once delivery cannot be guaranteed across independent systems without
this reconciliation path. Do not delete/reset these rows to force a resend.

Inspect pending work manually with:

```sql
SELECT session_id, status, attempts, first_attempt_at, lease_until, resend_id
FROM milo_deliveries WHERE status <> 'sent' ORDER BY created_at;
```

For `manual_review`, look up the order in Stripe and the message in Resend. If
accepted, record the verified Resend message ID and mark the row `sent` with its
acceptance timestamp. If confirmed never accepted, an operator can authorize a
fresh delivery attempt after ensuring no original worker remains active. Do not
clear `first_attempt_at` merely because a request timed out. Once Stripe's retry
window expires, manually resend the original Stripe event after resolving the
issue; do not create a new purchase. Review Resend bounces/failures in its dashboard.
No automated reconciliation or notification schedule is configured.

## Verification

- `npm test`: mocked Stripe/Resend, real embedded PostgreSQL (PGlite) SQL, signature
  validation, invalid payments, concurrency, persistence across reopen, and failures
  before/after Resend acceptance. No `.env.local` loading or real messages.
- The private-file test checks all three attachment bytes/hashes and the video link.
  It explicitly skips on a clean clone without the private files; provision them to
  run the release check before activation.
- `npm run typecheck` and `npm run build`.
- `npm run test:smoke` after build: starts an isolated local production server with
  both switches forced off, checks disabled checkout and private-file 404s, and stops
  its own server. It does not invoke a valid payment or email request.

## Remaining launch work

Supply the existing Stripe IDs/keys and durable database, apply the migration,
and verify the external settings. Authorize a controlled test-mode checkout and
delivery to verify actual receipt and installation before live activation/deployment.
The current product copy/demo still advertises email/phone fields and five prospects
every day; approved v1.2 excludes those fields and targets up to five verified
prospects. Resolve that copy mismatch before launch without changing Milo itself.
