# California Milo v2.3

California uses the completed Florida/Texas v2.3 implementation, with product code PD-ROOF-CA and Roofing Contractors as the customer type. Price is $99 USD one-time. Service runs for 52 weeks from successful activation, Monday-Friday, in the morning, customer local time, with up to five qualified prospects per scheduled workday when available. No email or phone collection, outreach, or video is included.

Private delivery files:
- Milo_CA_Roofing_Installation_Prompt_v2.3.txt
- Milo_CA_Roofing_Installation_Guide_v2.3.pdf

The TXT is the Florida master with only Florida/California and PD-ROOF-FL/PD-ROOF-CA substitutions. The 15-page illustrated PDF preserves the master layout and images with California territory and TXT-filename substitutions. Florida and Texas packages and behavior are unchanged.

The existing assignment registry enables California in the store selector. California alone uses one $99 line item and /checkout/success/california. Florida + Texas + California uses the existing basket checkout with three $99 line items and one $297 payment. The existing fulfillment handler sends one email per Milo, containing only its own TXT and PDF, with subject Your Milo - California Roofing Prospect Discovery for California. Retries preserve snapshots and skip completed regional sends.

Live Stripe Product: prod_VNxNgzPALipvt2
Live Stripe Price: price_1UNBTACzRwKdX10NXbFYaNxB
Environment mappings: STRIPE_MILO_CA_PRODUCT_ID and STRIPE_MILO_CA_PRICE_ID, configured locally and in the existing Vercel production project. Product description and tax/billing settings follow Texas; Florida and Texas Stripe objects are unchanged.

Historical pending combined emails are not processed or altered by this launch. No live payment is submitted. Verification uses mocked paid webhooks and provider sends; production checkout checks may create unpaid sessions only.

Validation commands: npm test, npm run typecheck, npm run build:vercel. Production checks include the existing smoke and store-selector scripts, California's product/success pages, private-file 404s, and runtime error logs.

## Files created for this launch

- docs/Products/MILO/Milo_CA_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_CA_Roofing_Installation_Guide_v2.3.pdf
- src/app/products/milo-california-roofing-contractors/page.tsx
- src/app/checkout/success/california/page.tsx
- tests/milo-california.test.mjs
- docs/MILO_CALIFORNIA_CHECKOUT.md

## Files modified for this launch

- .env.local (only California Product/Price IDs added; no secrets copied or changed)
- .env.example
- .vercelignore
- next.config.ts
- src/lib/milo-assignments.ts
- src/lib/milo-assets.server.ts
- src/lib/milo-config.server.ts
- src/lib/milo-http.server.ts
- src/lib/milo-presentations.ts
- src/lib/sales-catalog.ts
- scripts/verify-milo-package.mjs
- scripts/verify-sales-checkout.mjs
- tests/milo-multi-region.test.mjs (retain the Florida/Texas fixture; hypothetical future region now Northeast)
- tests/sales-checkout.test.mjs (California is now available; use Northeast for the unavailable-region case)
- docs/SALES_WORKERS_CHECKOUT.md

Fulfillment/ledger source, database schema, existing Florida/Texas product and success pages, their TXT/PDF files, and existing Stripe objects are unchanged by this launch. Local QA tools and screenshots are in the ignored .qa/california directory and are excluded from deployment.

## Verification completed October 5, 2026

- All 56 tests pass, including California alone, the original Florida/Texas checks, and three-region checkout plus separate deliveries/retry protection.
- TypeScript and local/remote production build and private-package verification pass.
- All 15 California PDF pages were rendered and visually reviewed. Extracted text matches Florida after the permitted substitutions; every embedded illustration is unchanged.
- Production deployment dpl_FU2TPbTVuL1DgU21kQ9r2xZaDBW3 is READY, aliased to https://www.simpledigitalhelp.com.
- Real production checkout created unpaid sessions at USD 9900 for California and USD 29700 for Florida + Texas + California. The server-generated sessions contain exactly the intended Product/Price IDs and quantity 1 per purchased Milo. No live payment or live fulfillment was submitted.
- Live browser selector verifies three available regions, $99 California, $198 two-region combinations, and $297 all three. California product/success pages return 200 and include no video; California private files return 404.
- Florida/Texas live Stripe Product and Price records match the pre-launch snapshots; their attachment hashes match the original approved manifests.
- Historical pending combined emails were not processed or altered; no production migration or ledger repair was run.
- Fulfillment verification used signed mocked paid sessions and mocked provider sends with the real package bytes. California's separate subject and exactly its own TXT/PDF were verified; real customer inbox receipt requires a customer purchase.
- Final browser captures confirm California's $99 product form is enabled, has no video, and the three-region selector totals $297. Browser console and runtime errors: zero.
- Post-deploy error-level runtime log scan: no logs/errors found for the deployment.
- Automatic approval review rejected exporting the full production environment to a local file. Configuration was verified instead through environment-variable names and unpaid server-generated Stripe sessions; no production secrets were exported.

## v2.3 scheduling release
Current packages use: "Monday-Friday, in the morning, customer local time." Prefer native flexible/daypart morning scheduling and native 52-week end dates; no exact execution time is promised. Installation verifies enabled status, a next run, correct customer timezone, correct service end date, and exactly one active task per Milo. Existing customer automations are not modified.

Outstanding v2.2 checkout sessions retain their approved v2.2 package, and stored delivery snapshots and idempotency keys are reused unchanged. No historical pending email is processed by this release operation. The hidden v2.2 video remains historical and is not delivered.
