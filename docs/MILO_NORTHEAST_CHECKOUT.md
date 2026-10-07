# Northeast Milo v2.3

Northeast is a regional configuration clone of California v2.3. Product code: PD-ROOF-NORTHEAST. Region: Northeast. Customer Type: Roofing Contractors. The existing shared geographic registry remains unchanged: Maine (ME), New Hampshire (NH), Vermont (VT), Massachusetts (MA), Rhode Island (RI), Connecticut (CT), New York (NY), New Jersey (NJ), Pennsylvania (PA). No other states are included.

Price is $99 USD one-time. Service lasts 52 weeks from successful activation, Monday-Friday, in the morning, customer local time, up to five qualified prospects per scheduled workday when available. No email/phone collection, outreach, or video is added. The shared sales workspace, qualification, and installation behavior are preserved apart from the v2.3 scheduling change.

Private delivery files:
- Milo_Northeast_Roofing_Installation_Prompt_v2.3.txt
- Milo_Northeast_Roofing_Installation_Guide_v2.3.pdf

The prompt is California's master with Northeast territory/product-code substitutions and the explicit nine-state boundary. The 15-page PDF preserves all California master illustrations and layout, substitutes the regional text and TXT filename, and lists the nine states in the existing first-page assignment description.

Stripe Product: prod_VNxly1gMxDMmcf
Stripe Price: price_1UNBpwCzRwKdX10NC6h0mMFZ
Environment mappings: STRIPE_MILO_NORTHEAST_PRODUCT_ID and STRIPE_MILO_NORTHEAST_PRICE_ID. California's product description and tax/billing settings are copied, with Northeast territory and state metadata. Existing Florida, Texas, and California Stripe objects are not changed.

Northeast is enabled in the existing assignment registry and store selector. Northeast alone uses one existing-pattern $99 Stripe line item and /checkout/success/northeast. All four regions use the existing multi-region basket with four $99 lines and one $396 payment. The unchanged fulfillment/ledger architecture sends one delivery email per purchased Milo. Northeast's subject is Your Milo - Northeast Roofing Prospect Discovery and its attachments are exactly its own TXT and PDF. No historical pending email processing or production migration is performed. No live payment is submitted.

## Files created

- docs/Products/MILO/Milo_Northeast_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_Northeast_Roofing_Installation_Guide_v2.3.pdf
- src/app/products/milo-northeast-roofing-contractors/page.tsx
- src/app/checkout/success/northeast/page.tsx
- tests/milo-northeast.test.mjs
- docs/MILO_NORTHEAST_CHECKOUT.md

## Files modified

- .env.local (only Northeast Product/Price IDs added)
- .env.example
- .vercelignore
- next.config.ts
- src/lib/milo-assignments.ts
- src/lib/milo-assets.server.ts
- src/lib/milo-config.server.ts
- src/lib/milo-http.server.ts
- src/lib/milo-presentations.ts
- src/lib/sales-catalog.ts
- src/components/sales-growth-page.tsx (existing availability badge text lists all four regions)
- scripts/verify-milo-package.mjs
- scripts/verify-sales-checkout.mjs
- tests/milo-california.test.mjs (scope the existing three-region fixture to Florida/Texas/California)
- tests/milo-multi-region.test.mjs (hypothetical future region is now Southeast)
- tests/sales-checkout.test.mjs (unavailable-region example is now Southeast)
- docs/SALES_WORKERS_CHECKOUT.md

The geography registry, fulfillment/ledger implementation, database schema, existing regional pages, and all six existing private installation files remain unchanged. Ignored QA scripts, snapshots, and screenshots are stored under .qa/northeast and are excluded from production upload.

## Verification completed October 5, 2026

- All 67 tests pass, including the original Florida/Texas/California checks, Northeast-only checkout/fulfillment, the exact state boundary, four-region $396 checkout, file isolation, duplicate suppression, and partial retry behavior.
- TypeScript and production build/private-package verification pass. All eight installation files are present in server traces and absent from browser/public output.
- All 15 Northeast guide pages were rendered and visually reviewed. Text differs from California only by regional/TXT-filename substitutions and the explicit state list; every illustration is preserved.
- Live production Stripe checkout verified Northeast alone at USD 9900 and all four regions at USD 39600, quantity 1 per selected region, exactly the configured Product/Price IDs, and correct single/multi-region metadata. Both sessions are open and unpaid. No live payment or real fulfillment was submitted.
- Read-only Stripe regression checks confirm all three existing Product/Price objects match the pre-launch snapshots. All six existing private TXT/PDF files match their pre-launch hashes exactly.
- The live browser verifies four enabled regions, the $99 Northeast-only and $396 all-four totals, and correct form selections. Northeast's product page displays its exact nine-state scope and includes no video. Product/success routes return 200; its private TXT/PDF routes return 404.
- Signed mocked paid webhooks and provider sends verify Northeast's separate subject and only its own exact TXT/PDF bytes. A failed Northeast send retries its original snapshot/key and skips the three completed emails. Real customer inbox receipt remains unverified without a purchase.
- Historical pending emails were not processed or altered. No production ledger migration or repair was run.
- The visual selector review found an old Florida/Texas availability badge; only its text was corrected to list all four regions. All tests and the production package passed again after that correction.
- Final production deployment: dpl_36L9tQmcXZNwSPjD1B4pgcEce224, READY, aliased to https://www.simpledigitalhelp.com. Remote build and all eight private attachment checks pass.
- Final live browser checks confirm the corrected four-region availability badge, Northeast-only $99, all-four $396, correct form selections, exact Northeast state scope, no video, and zero browser console/runtime errors.
- Final production smoke, product/success page checks, private-file 404 checks, and read-only Stripe regression checks all pass.

## v2.3 scheduling release
Current packages use: "Monday-Friday, in the morning, customer local time." Prefer native flexible/daypart morning scheduling and native 52-week end dates; no exact execution time is promised. Installation verifies enabled status, a next run, correct customer timezone, correct service end date, and exactly one active task per Milo. Existing customer automations are not modified.

Outstanding v2.2 checkout sessions retain their approved v2.2 package, and stored delivery snapshots and idempotency keys are reused unchanged. No historical pending email is processed by this release operation. The hidden v2.2 video remains historical and is not delivered.
