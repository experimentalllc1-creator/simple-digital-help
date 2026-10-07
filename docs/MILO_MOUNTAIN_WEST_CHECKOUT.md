# Mountain West Milo v2.3 release

Product code: `PD-ROOF-MOUNTAIN-WEST`. Territory: CO, UT, WY, MT only.
Roofing Contractors; $99 USD one-time; 52 weeks; Monday-Friday, in the morning, customer local time; up to five qualified prospects per scheduled workday. No email or phone collection, outreach, or video.

Stripe Product: `prod_VNztZqudpXNz6K`.
Stripe Price: `price_1UNDtSCzRwKdX10N0ZQYwAc0`.
Production variables: `STRIPE_MILO_MOUNTAIN_WEST_PRODUCT_ID` and `STRIPE_MILO_MOUNTAIN_WEST_PRICE_ID`.

## Files created

- `docs/Products/MILO/Milo_Mountain_West_Roofing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Mountain_West_Roofing_Installation_Guide_v2.3.pdf`
- `src/app/products/milo-mountain-west-roofing-contractors/page.tsx`
- `src/app/checkout/success/mountain-west/page.tsx`
- `tests/milo-mountain-west.test.mjs`
- `docs/MILO_MOUNTAIN_WEST_CHECKOUT.md`

## Files modified for Mountain West

- `.env.example`, `.env.local` (new Mountain West IDs only), `.vercelignore`, `next.config.ts`
- `src/lib/milo-assignments.ts`, `src/lib/milo-assets.server.ts`, `src/lib/milo-config.server.ts`, `src/lib/milo-http.server.ts`, `src/lib/milo-presentations.ts`, `src/lib/sales-catalog.ts`
- `src/components/sales-growth-page.tsx`
- `scripts/verify-milo-package.mjs`, `scripts/verify-sales-checkout.mjs`
- `tests/milo-southwest.test.mjs` (retain its seven-region fixture), `tests/milo-multi-region.test.mjs`, `tests/sales-checkout.test.mjs` (future/unavailable fixture moved to Pacific Northwest)
- `docs/SALES_WORKERS_CHECKOUT.md`
- Local verification artifacts/scripts in `.qa/mountain-west/` and `.qa/prepare-mountain-west.cjs`, excluded from deployment.

## Validation

Verification covers Mountain West-only $99 and eight-region $792 checkout, configured Stripe line items, signed-webhook regional identity, exactly two Mountain West attachments, per-region subjects, durable retry without resending successful regions, historical pending snapshot preservation, and all existing region tests.
The PDF has 15 pages, retains Southwest's illustrations, and passes extracted-text, image, territory, scheduling and rendering checks. All prior v2.3 package hashes remain unchanged.

The shared fulfillment implementation, canonical region boundaries, master/template, and existing Stripe products/prices are preserved. No installed customer automation, historical pending delivery, live payment, or real customer email is submitted by release verification.

All 113 tests passed. Type checking, the local production build, private server tracing/public-bundle checks, and the 15-page PDF render review passed.
Production deployment `dpl_44NhE2hcjrWAWKMMykDg4B5iikUi` is READY at `https://simple-digital-help-store-3etz0rxwm.vercel.app`, aliased to `https://www.simpledigitalhelp.com`.
The remote production build and private-package verification, existing production smoke suite, Mountain West browser check, and complete Sales selector regression passed.
Two live unpaid Checkout Sessions verified Mountain West at 9900 cents and all eight regions at 79200 cents. Each selected region has its configured product and one-time price, quantity one, correct amount and v2.3 metadata. No payment was submitted.
All seven prior Stripe product/price snapshots and all prior v2.3 package hashes remain unchanged. All regional product pages and private-file 404 checks passed. Browser console/runtime errors: zero.
The production error-log query returned no errors during verification; evidence is saved in `.qa/mountain-west/production-errors.log`.
