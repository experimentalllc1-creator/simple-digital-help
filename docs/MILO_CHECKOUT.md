# Milo v2.2 checkout and fulfillment

Product: Milo — Florida Roofing Prospect Discovery. Product code: PD-ROOF-FL.
The existing Stripe Product and one-time $99 USD Price are retained. No new Stripe objects are created.

## Flow

Buy Now on /products/milo-florida-roofing-contractors posts to /api/checkout/milo.
Both MILO_CHECKOUT_ENABLED and MILO_DELIVERY_ENABLED must be true. Same-origin checking, database readiness, private attachment integrity and active Product/Price validation precede session creation.
New sessions include product slug, version 2.2, product_code PD-ROOF-FL and release_version 2.2. PaymentIntent metadata also contains slug, code and release.
Success redirects to /checkout/success; cancellation returns to the Milo product page.

The signed /api/webhooks/stripe endpoint handles checkout.session.completed and checkout.session.async_payment_succeeded. It retrieves and verifies the paid session, line items and succeeded PaymentIntent, including exactly one unit at USD 9900 and the configured Product/Price and mode.
PostgreSQL milo_deliveries records paid order identity, recipient, exact email snapshot, status, leases and Resend acceptance ID.
Migration 002 adds product_code and release_version without removing records. Existing rows default to PD-ROOF-FL / 1.2. Run npm run db:migrate against the intended production database before deploying the new handler.

## Customer delivery

Resend sends from support@simpledigitalhelp.com to customer_details.email.
Exactly two private attachments:
- Milo_FL_Roofing_Installation_Prompt_v2.2.txt
- Milo_Illustrated_Installation_Guide_v2.2.pdf

The active customer package contains only the installation prompt and illustrated installation guide attached by email. No video is mentioned or linked in the purchase email or success page. The hidden /support/milo-installation-v2-2 page remains on the site but is not currently part of the active Milo delivery package. This unlisted noindex/nofollow page plays Milo_Installation_Video_v2.2.mp4. The video is copied at build time to public/videos/milo-installation-v2-2.mp4; it is web-accessible for playback, not access-controlled. There is no download CTA or authentication portal. No MP4 attachment, product spec or Archive file is delivered.
Prompt and guide remain private server assets with pinned hashes. Video hash is pinned by package verification. CLI upload rules include only these three source assets; paid source materials remain Git-ignored. Automatic Git deployment remains disabled. Use the linked production project's existing Vercel CLI workflow.

## Historical compatibility

Legacy sessions with slug and version 1.2 are verified against the existing Price/Product. Sent ledger records never resend. Pending legacy records reuse their stored message and idempotency key, without automatic upgrade. A legacy paid session without a message snapshot is recorded as manual_review and requires operator reconciliation; no archived files are packaged or new legacy email composed.
Atomic two-minute leases suppress concurrent sends. Uncertain sends after 23 hours require manual review. Stripe receives 503 for unresolved delivery and can retry. Resend acceptance is not proof of inbox receipt; inspect bounces in Resend. Do not reset completed ledger records.

## Configuration and acceptance

Existing variable names: STRIPE_MILO_PRODUCT_ID, STRIPE_MILO_PRICE_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MODE, APP_URL, DATABASE_URL, RESEND_API_KEY, MILO_CHECKOUT_ENABLED, MILO_DELIVERY_ENABLED. Do not expose credentials.
Run npm test, npm run typecheck and npm run build:vercel. Package verification checks server traces and private asset exclusion from public/browser output. Run npm run test:smoke -- https://www.simpledigitalhelp.com after deployment for read-only production verification.
Henry's real $99 purchase must confirm Stripe webhook processing, ledger sent status, email receipt and exactly the two correct attachments. A clean installation must confirm Google permissions, shared workspace and seven columns, schedule, first run and 52-week expiry. Payment does not start the service clock; successful activation does. The storefront does not automate activation tracking.
