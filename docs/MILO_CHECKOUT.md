# Milo v2.4 checkout and fulfillment

Product: Milo — Florida Roofing Prospect Discovery. Product code: PD-ROOF-FL.
The existing Stripe Product and one-time $99 USD Price are retained. No new Stripe objects are created.

## Flow

Buy Now on /products/milo-florida-roofing-contractors posts to /api/checkout/milo.
Both MILO_CHECKOUT_ENABLED and MILO_DELIVERY_ENABLED must be true. Same-origin checking, database readiness, private attachment integrity and active Product/Price validation precede session creation.
New sessions include product slug, version 2.4, product_code PD-ROOF-FL and release_version 2.4. PaymentIntent metadata also contains slug, code and release.
Success redirects to /checkout/success; cancellation returns to the Milo product page.

The signed /api/webhooks/stripe endpoint handles checkout.session.completed and checkout.session.async_payment_succeeded. It retrieves and verifies the paid session, line items and succeeded PaymentIntent, including exactly one unit at USD 9900 and the configured Product/Price and mode.
PostgreSQL milo_deliveries records paid order identity, recipient, exact email snapshot, status, leases and Resend acceptance ID.
Existing migrations already support product_code and release_version. Historical rows default to PD-ROOF-FL / 1.2. No database migration or historical delivery processing is required for v2.4.

## Customer delivery

Resend sends from support@simpledigitalhelp.com to customer_details.email.
Exactly two private attachments:
- Milo_FL_Roofing_Installation_Prompt_v2.4.txt
- Milo_Illustrated_Installation_Guide_v2.4.pdf

The active customer package contains only the installation prompt and illustrated installation guide attached by email. No video is mentioned or linked in the purchase email or success page. The hidden /support/milo-installation-v2-2 page remains on the site but is not currently part of the active Milo delivery package. This unlisted noindex/nofollow page plays Milo_Installation_Video_v2.2.mp4. The video is copied at build time to public/videos/milo-installation-v2-2.mp4; it is web-accessible for playback, not access-controlled. There is no download CTA or authentication portal. No MP4 attachment, product spec or Archive file is delivered.
Prompts and guides remain private server assets with pinned hashes. Video hash is pinned by package verification. CLI upload rules and server traces retain all approved v2.2/v2.3 packages and add the 45 v2.4 TXT/PDF pairs; masters and templates are excluded. Paid source materials remain Git-ignored. Automatic Git deployment remains disabled. Repository verification does not deploy.

## Historical compatibility

Legacy sessions with slug and version 1.2 are verified against the existing Price/Product. Sent ledger records never resend. Pending legacy records reuse their stored message and idempotency key, without automatic upgrade. A legacy paid session without a message snapshot is recorded as manual_review and requires operator reconciliation; no archived files are packaged or new legacy email composed.
Atomic two-minute leases suppress concurrent sends. Uncertain sends after 23 hours require manual review. Stripe receives 503 for unresolved delivery and can retry. Resend acceptance is not proof of inbox receipt; inspect bounces in Resend. Do not reset completed ledger records.

## Configuration and acceptance

Existing variable names: STRIPE_MILO_PRODUCT_ID, STRIPE_MILO_PRICE_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MODE, APP_URL, DATABASE_URL, RESEND_API_KEY, MILO_CHECKOUT_ENABLED, MILO_DELIVERY_ENABLED. Do not expose credentials.
Run npm run test:milo, npm run typecheck and npm run build:vercel. The Milo-only suite excludes discontinued-agent tests. Package verification checks server traces and private asset exclusion from public/browser output. Run npm run test:smoke against the local production server during repository QA. No production deployment or live purchase is part of v2.4 repository verification.
Henry's real $99 purchase must confirm Stripe webhook processing, ledger sent status, email receipt and exactly the two correct attachments. A clean installation must confirm Google permissions, shared workspace and ten columns with preserved customer-owned G:J, schedule, first run and 52-week expiry. Payment does not start the service clock; successful activation does. The storefront does not automate activation tracking.

## v2.4 spreadsheet release
Prospects uses ten columns: Date Added, Business Name, City, Region, Customer Type, Website, Contacted?, Email, Phone, Notes. A:F are Milo-managed. G is initialized to No only when a new prospect is created, and is customer-owned thereafter. H:J are entirely customer-owned; Milo never populates, clears, overwrites, or otherwise modifies their data cells. Safe upgrades add only missing H1:J1 headers without rewriting existing rows. Conflicting layouts stop for a preservation plan.
Current packages use: "Monday-Friday, in the morning, customer local time." Prefer native flexible/daypart morning scheduling and native 52-week end dates; no exact execution time is promised. Installation verifies enabled status, a next run, correct customer timezone, correct service end date, and exactly one active task per Milo. Existing customer automations are not modified.

Outstanding v2.2 and v2.3 checkout sessions retain their approved historical packages, and stored delivery snapshots and idempotency keys are reused unchanged. No historical pending email is processed by this release operation. The hidden v2.2 video remains historical and is not delivered. The live installation requires a separate authorized in-place upgrade; see MILO_V2_4_EXISTING_INSTALLATION_UPGRADE.md.
