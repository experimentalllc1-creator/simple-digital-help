# Pacific Northwest Milo v2.3 release

Product code: `PD-ROOF-PACIFIC-NORTHWEST`. Territory: WA, OR, ID only.
Roofing Contractors; $99 USD one-time; 52 weeks; Monday-Friday, in the morning, customer local time; up to five qualified prospects per scheduled workday. No email or phone collection, outreach, or video.

Stripe Product: `prod_VO0889PLPLRaFT`.
Stripe Price: `price_1UNE8UCzRwKdX10NxaCYxVfR`.
Production variables: `STRIPE_MILO_PACIFIC_NORTHWEST_PRODUCT_ID` and `STRIPE_MILO_PACIFIC_NORTHWEST_PRICE_ID`.

## Files created

- `docs/Products/MILO/Milo_Pacific_Northwest_Roofing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Pacific_Northwest_Roofing_Installation_Guide_v2.3.pdf`
- `src/app/products/milo-pacific-northwest-roofing-contractors/page.tsx`
- `src/app/checkout/success/pacific-northwest/page.tsx`
- `tests/milo-pacific-northwest.test.mjs`
- `docs/MILO_PACIFIC_NORTHWEST_CHECKOUT.md`

## Files modified for Pacific Northwest

- `.env.example`, `.env.local` (new Pacific Northwest IDs only), `.vercelignore`, `next.config.ts`
- `src/lib/milo-assignments.ts`, `src/lib/milo-assets.server.ts`, `src/lib/milo-config.server.ts`, `src/lib/milo-http.server.ts`, `src/lib/milo-presentations.ts`, `src/lib/sales-catalog.ts`
- `src/components/sales-growth-page.tsx`
- `scripts/verify-milo-package.mjs`, `scripts/verify-sales-checkout.mjs`
- `tests/milo-mountain-west.test.mjs` (retain its eight-region fixture), `tests/milo-multi-region.test.mjs` (test-only future product fixture), `tests/sales-checkout.test.mjs` (existing unavailable HVAC assignment fixture)
- `docs/SALES_WORKERS_CHECKOUT.md`
- Local verification scripts and artifacts in `.qa/pacific-northwest/` and `.qa/prepare-pacific-northwest.cjs`, excluded from deployment.

## Validation

Verification covers Pacific Northwest-only $99 and nine-region $891 checkout, configured Stripe line items, signed-webhook regional identity, exactly two Pacific Northwest attachments, clearly identified per-region subjects, durable retry without resending successful regions, historical pending snapshot preservation, and all existing regional tests.
The PDF has 15 pages, retains Mountain West's illustrations, and passes extracted-text, image, territory, scheduling and rendering checks. All prior v2.3 package hashes remain unchanged.

The shared fulfillment implementation, canonical region boundaries, master/template, and existing Stripe products/prices are preserved. No installed customer automation, historical pending delivery, live payment, or real customer email is submitted by release verification.

All 124 tests passed. Type checking, the local production build, private server tracing/public-bundle checks, and the 15-page PDF render review passed. Production environment IDs are configured.
Production deployment `dpl_6yyZJqCU4UT65NUbwkti7A1eJVkg` is READY at `https://simple-digital-help-store-hwiz3vgnk.vercel.app`, aliased to `https://www.simpledigitalhelp.com`.
The remote production build and private-package checks, existing production smoke suite, Pacific Northwest browser check, and complete Sales selector regression passed.
Two live unpaid Checkout Sessions verified Pacific Northwest at 9900 cents and all nine regions at 89100 cents. Each selected region has its configured product and one-time price, quantity one, correct amount, and v2.3 metadata. No payment was submitted.
All eight prior Stripe product/price snapshots and all prior v2.3 package hashes remain unchanged. All regional product pages and private-file 404 checks passed. Browser console/runtime errors: zero.
The production error-log query returned no errors during verification; evidence is saved in `.qa/pacific-northwest/production-errors.log`.
