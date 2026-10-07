# Southwest Milo v2.3 release

Product code: `PD-ROOF-SOUTHWEST`. Territory: AZ, NM, NV, OK only.
Roofing Contractors; $99 USD one-time; 52 weeks; Monday-Friday, in the morning, customer local time; up to five qualified prospects per scheduled workday. No email or phone collection, outreach, or video.

Stripe Product: `prod_VNzfASu4XdQh2m`.
Stripe Price: `price_1UNDg6CzRwKdX10N34du8Dr2`.
Production variables: `STRIPE_MILO_SOUTHWEST_PRODUCT_ID` and `STRIPE_MILO_SOUTHWEST_PRICE_ID`.

## Files created

- `docs/Products/MILO/Milo_Southwest_Roofing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Southwest_Roofing_Installation_Guide_v2.3.pdf`
- `src/app/products/milo-southwest-roofing-contractors/page.tsx`
- `src/app/checkout/success/southwest/page.tsx`
- `tests/milo-southwest.test.mjs`
- `docs/MILO_SOUTHWEST_CHECKOUT.md`

## Files modified for Southwest

- `.env.example`, `.env.local` (new Southwest IDs only), `.vercelignore`, `next.config.ts`
- `src/lib/milo-assignments.ts`, `src/lib/milo-assets.server.ts`, `src/lib/milo-config.server.ts`, `src/lib/milo-http.server.ts`, `src/lib/milo-presentations.ts`, `src/lib/sales-catalog.ts`
- `src/components/sales-growth-page.tsx`
- `scripts/verify-milo-package.mjs`, `scripts/verify-sales-checkout.mjs`
- `tests/milo-midwest.test.mjs` (retain its six-region fixture), `tests/milo-multi-region.test.mjs`, `tests/sales-checkout.test.mjs` (future/unavailable fixture moved to Mountain West)
- `docs/SALES_WORKERS_CHECKOUT.md`
- Local verification artifacts/scripts in `.qa/southwest/` and `.qa/prepare-southwest.cjs`, excluded from deployment.

## Validation

All 102 tests pass, including Southwest-only $99, seven-region $693 checkout, configured Stripe line items, signed-webhook regional identity, exactly two Southwest attachments, per-region subjects, durable retry without resending successful regions, historical pending snapshot preservation, and existing six-region tests.
The PDF has 15 pages, retains the Midwest illustrations, and passes extracted-text, image, territory, scheduling and rendering checks. All prior v2.3 package hashes remain unchanged.

The shared fulfillment implementation, canonical region boundaries, master/template, and existing Stripe products/prices are preserved. No installed customer automation, historical pending delivery, live payment, or real customer email is submitted by release verification.

Production deployment `dpl_GNyKxpidtoaMmJBx8zF9tsRLdv5z` is READY at `https://simple-digital-help-store-oeoh7cxcn.vercel.app`, aliased to `https://www.simpledigitalhelp.com`.
Type checking, local and remote production builds, private server tracing/public-bundle checks, existing production smoke tests, Southwest browser checks, and the full Sales selector regression all passed.
Two live unpaid Checkout Sessions confirmed Southwest alone at 9900 cents and all seven regions at 69300 cents, with exactly the configured product/price, quantity one, and correct version metadata for each selected line. No payment was submitted.
Live Stripe snapshots for all six prior products/prices and package hashes were unchanged. Browser console/runtime errors: zero. The production error-log query returned no errors during verification; evidence is recorded in `.qa/southwest/production-errors.log`.
