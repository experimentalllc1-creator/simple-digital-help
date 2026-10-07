# Southeast Milo v2.3

Product code: PD-ROOF-SOUTHEAST. Customer Type: Roofing Contractors. One-time price: $99 USD. Service term: 52 weeks from successful activation. Schedule: Monday-Friday, in the morning, customer local time. Up to five qualified prospects per scheduled workday when available. No email or phone collection, outreach, or video.

The v2.3 Florida gold master and Northeast regional pattern are preserved. Southeast territory uses the existing boundary exactly: DE, MD, VA, WV, KY, TN, NC, SC, GA, AL, MS, AR, LA. No geography definitions were changed.

## Private package

- Milo_Southeast_Roofing_Installation_Prompt_v2.3.txt
- Milo_Southeast_Roofing_Installation_Guide_v2.3.pdf

The prompt is the Northeast v2.3 clone with only product code, region, and territory substitutions. The 15-page guide preserves all illustrations, layout, and instructions except region, filename, and the territory summary. Native morning scheduling preference, 52-week enforcement, enabled status, next run, customer timezone, end date, and single active task verification are inherited unchanged.

## Stripe configuration

- Product: prod_VNys7UREtQajlV
- Price: price_1UNCuOCzRwKdX10NbC5FBV6s
- STRIPE_MILO_SOUTHEAST_PRODUCT_ID
- STRIPE_MILO_SOUTHEAST_PRICE_ID

IDs are configured in local private environment and production, matching Northeast's environment scope. Existing Product and Price objects are not changed. No live payment is submitted.

## Checkout and fulfillment

Southeast posts `milo-southeast-roofing-contractors` to the existing checkout endpoint, using the same one-time Stripe Price validation. Single-region success returns to `/checkout/success/southeast`. Multiple selections retain one Stripe Checkout Session with one line per selected Milo and success at `/checkout/success/regions`.

Southeast alone totals $99; all five regions total $495. The existing signed webhook verifies each selected paid line item. Southeast receives one email with subject `Your Milo - Southeast Roofing Prospect Discovery`, containing only its own TXT and PDF. Snapshot persistence, per-region delivery progress, retry suppression, and historical v2.2 compatibility remain unchanged. No installed customer automation or historical pending email is altered or processed by this release operation.

## Files created

- docs/Products/MILO/Milo_Southeast_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_Southeast_Roofing_Installation_Guide_v2.3.pdf
- src/app/products/milo-southeast-roofing-contractors/page.tsx
- src/app/checkout/success/southeast/page.tsx
- tests/milo-southeast.test.mjs
- docs/MILO_SOUTHEAST_CHECKOUT.md

## Files modified

- .env.example
- .env.local (new Southeast IDs only; private)
- .vercelignore
- next.config.ts
- src/lib/milo-assignments.ts
- src/lib/milo-assets.server.ts
- src/lib/milo-config.server.ts
- src/lib/milo-http.server.ts
- src/lib/milo-presentations.ts
- src/lib/sales-catalog.ts
- src/components/sales-growth-page.tsx
- scripts/verify-milo-package.mjs
- scripts/verify-sales-checkout.mjs
- tests/milo-northeast.test.mjs (retain four-region coverage)
- tests/milo-multi-region.test.mjs (future/unavailable fixture moves to Midwest)
- tests/milo-v2-3.test.mjs (historical comparisons cover only existing v2.2 regions)
- tests/sales-checkout.test.mjs (unavailable fixture moves to Midwest)
- docs/SALES_WORKERS_CHECKOUT.md

Local QA helpers, baseline snapshots, logs, rendered pages, and browser screenshots are under `.qa/southeast/`; these are excluded from deployment. Existing regional packages, master, and template are byte-for-byte unchanged.

## Verification

`npm test`: 80 passed, 0 failed. `npm run typecheck`: passed. `npm run build:vercel`: passed. All 15 PDF pages rendered and visually reviewed. Tests cover exact thirteen-state scope, $99/$495 totals, all selected line items, separate region-specific TXT/PDF emails, fifth-region retry reuse, and unchanged historical combined snapshots. Fulfillment sends are mocked; no real customer email is submitted during verification.

Production deployment `dpl_3unSogFbEs9yLN7hZvUK9viNDPJL` is READY at `https://simple-digital-help-store-d0lo4kc61.vercel.app`, aliased to `https://www.simpledigitalhelp.com`. The remote production build and package checks passed.

Live production checkout verification created only two unpaid, open test sessions: Southeast alone at USD 9900 and all five selected regions at USD 49500. Stripe received every selected regional Product/Price line with quantity one, correct v2.3 metadata, and correct success routes. No live payment was submitted.

Production smoke and both browser verifiers passed, including all five store selections, original single-region forms, $99/$495 totals, exact Southeast territory, no Southeast video, private Southeast asset 404s, and zero browser console/runtime errors. Read-only comparisons confirmed all four prior Stripe Product/Price objects and all prior v2.3 packages/master/template unchanged.

Production error-log check for the new deployment (`--level error --since 15m --no-follow`) returned no error logs. No production errors were observed during verification.

## Exact next command

Add Midwest Roofing Prospect Discovery using the completed Milo v2.3 gold master and Southeast implementation pattern. Use product code PD-ROOF-MIDWEST and preserve the existing Midwest state boundaries exactly. Keep $99 one-time, 52 weeks, Monday-Friday morning customer-local scheduling, up to five qualified prospects per scheduled workday, and no email/phone collection, outreach, or video. Create Midwest v2.3 TXT/PDF files and configure Stripe, environment IDs, selector, and separate two-file fulfillment using the existing pattern. Preserve all five active regions and multi-region checkout. Do not alter installed customer automations, process historical pending emails, or submit a live payment. Run all tests and deploy if they pass. Do not redesign or refactor.
