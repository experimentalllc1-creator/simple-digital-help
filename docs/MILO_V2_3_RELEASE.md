# Milo v2.3 scheduling release

Schedule: **Monday-Friday, in the morning, customer local time.**

This is the only worker behavior change. Prefer native flexible/daypart morning scheduling and native end-date controls. Do not promise an exact execution time or manually construct a fragile RRULE when native controls represent weekday mornings and the end date. Preserve 52 weeks from successful activation. Installation verifies enabled status, a next scheduled run, customer timezone, service end date, and exactly one active task per Milo. Already-installed customer automations are not modified.

The Florida v2.3 prompt, illustrated guide, and product spec are the regional gold master. The v2.3 prompt template is the future-region starting point. Preserve the established regional state boundaries.

## Files created

- docs/Products/MILO/Milo_FL_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_Illustrated_Installation_Guide_v2.3.pdf
- docs/Products/MILO/Milo_TX_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_TX_Roofing_Installation_Guide_v2.3.pdf
- docs/Products/MILO/Milo_CA_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_CA_Roofing_Installation_Guide_v2.3.pdf
- docs/Products/MILO/Milo_Northeast_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_Northeast_Roofing_Installation_Guide_v2.3.pdf
- docs/Products/MILO/Milo_FL_Roofing_Product_Spec_v2.3.md
- docs/Products/MILO/Milo_Roofing_Installation_Prompt_Template_v2.3.txt
- scripts/build-milo-v2-3.py
- tests/milo-v2-3.test.mjs
- docs/MILO_V2_3_RELEASE.md

## Files modified for this release

- .vercelignore
- next.config.ts
- src/lib/milo-assets.server.ts
- src/lib/milo-config.server.ts
- src/lib/milo-fulfillment.server.ts
- src/lib/milo-presentations.ts
- src/components/milo-product-page.tsx
- src/app/checkout/success/page.tsx
- src/app/checkout/success/texas/page.tsx
- src/app/checkout/success/california/page.tsx
- src/app/checkout/success/northeast/page.tsx
- src/app/checkout/success/regions/page.tsx
- scripts/verify-milo-package.mjs
- scripts/smoke-milo.mjs
- tests/milo.test.mjs
- tests/milo-texas.test.mjs
- tests/milo-california.test.mjs
- tests/milo-northeast.test.mjs
- tests/milo-multi-region.test.mjs
- docs/MILO_CHECKOUT.md
- docs/MILO_PRODUCT_PAGE.md
- docs/MILO_TEXAS_CHECKOUT.md
- docs/MILO_CALIFORNIA_CHECKOUT.md
- docs/MILO_NORTHEAST_CHECKOUT.md

Local QA scripts, snapshots, rendered pages, browser screenshots, and logs are under `.qa/v2.3/`. These are excluded from deployment. Paid assets and master/template remain private and Git-ignored under the existing pattern. Prior uncommitted regional changes were preserved.

## Verification

- `npm test`: 69 passed, 0 failed. Includes all existing tests, schedule checks, unchanged discovery instructions, all single regions and four-region fulfillment, v2.2 purchase compatibility, saved-message reuse, and duplicate delivery suppression. Email sending is mocked; no customer email was submitted.
- `npm run typecheck`: passed.
- `npm run build:vercel`: passed locally and in the production build.
- Package checks: approved attachment hashes, all current and legacy files included only in server traces, no paid file contents in public output or browser bundles.
- Four 15-page PDFs rendered and visually reviewed; all illustrations and non-scheduling page text preserved except version references.
- Production smoke: passed.
- Production browser: all four product forms enabled, new schedule/version visible, Northeast state boundaries unchanged, no browser console/runtime errors.
- Existing production selector verification: $99 per region, $198/$297/$396 combined totals, correct selected form line items, unavailable options disabled. No checkout or payment submitted during this release verification.
- Read-only Stripe comparison: all four Product and Price objects unchanged.

## Deployment

Production deployment `dpl_9GwSR8qLy9yycWahD5kig62yWeNr` is READY and aliased to `https://www.simpledigitalhelp.com`.
Deployment URL: `https://simple-digital-help-store-fh8id34oy.vercel.app`.

## Remaining old references

No active v2.3 package, product spec, future template, or product page has a 9:00 AM promise or v2.2 version reference. Intentionally retained references are approved legacy v2.2 packages/specs, their compatibility manifests and tests, the historical hidden v2.2 video, and the builder's v2.2 source transformation. Outstanding v2.2 checkout sessions retain approved v2.2 packages; persisted messages, attachments, and idempotency keys are reused unchanged. No production pending email or installed automation was processed or modified by this release operation.

## Exact next command

Add Southeast Roofing Prospect Discovery using the completed Milo v2.3 gold master and Northeast regional pattern. Product code: PD-ROOF-SOUTHEAST. Preserve the existing Southeast state boundaries exactly. Customer Type: Roofing Contractors. Price: $99 one-time. Service term: 52 weeks. Schedule: Monday-Friday, in the morning, customer local time. Up to 5 qualified prospects per scheduled workday; no email or phone collection, outreach, or video. Create Milo_Southeast_Roofing_Installation_Prompt_v2.3.txt and Milo_Southeast_Roofing_Installation_Guide_v2.3.pdf; configure Stripe, environment IDs, store selection, and separate two-file fulfillment using the existing pattern. Preserve existing regions, multi-region checkout, and one delivery email per purchased Milo. Do not process historical pending emails, alter installed customer automations, or submit a live payment. Run all tests and deploy if they pass. Do not redesign or refactor.
