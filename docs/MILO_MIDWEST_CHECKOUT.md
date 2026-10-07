# Midwest Milo v2.3

Product code: PD-ROOF-MIDWEST. Customer Type: Roofing Contractors. One-time price: $99 USD. Service term: 52 weeks from successful activation. Schedule: Monday-Friday, in the morning, customer local time. Up to five qualified prospects per scheduled workday when available. No email or phone collection, outreach, or video.

Midwest clones the completed v2.3 gold master using Southeast's implementation pattern. The existing state boundaries are preserved exactly: OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS. No geography definitions, existing regional packages, customer automations, or historical pending emails are modified.

## Private package

- Milo_Midwest_Roofing_Installation_Prompt_v2.3.txt
- Milo_Midwest_Roofing_Installation_Guide_v2.3.pdf

The prompt changes only product code, region, and the boundary paragraph. The 15-page illustrated guide changes only region, filename, and territory summary. All existing illustrations and v2.3 scheduling/installation checks are preserved: native morning scheduling when available, no exact execution-time promise, enforced 52-week end date, enabled task, next run, verified customer timezone, correct service end date, and exactly one active task per Milo. Already-installed tasks are not altered.

## Stripe configuration

- Product ID: prod_VNzDzhodwfOpmv
- Price ID: price_1UNDFNCzRwKdX10N8RWQ6KNq
- STRIPE_MILO_MIDWEST_PRODUCT_ID
- STRIPE_MILO_MIDWEST_PRICE_ID

The IDs are configured in local private environment and production, following Southeast's scope. The new Product and Price follow the existing active one-time USD 9900 pattern and tax classification. Existing Stripe objects are unchanged.

## Checkout and fulfillment

The existing selector submits `milo-midwest-roofing-contractors` to the current checkout endpoint. Single-region success returns to `/checkout/success/midwest`. Multi-region checkout preserves one Stripe session with one price line per selected Milo and success at `/checkout/success/regions`.

Midwest alone totals $99; all six active regions total $594. Each purchased Milo has its own clearly identified email and only its own TXT/PDF attachments. Midwest's subject is `Your Milo - Midwest Roofing Prospect Discovery`. Existing durable snapshots, per-region completion tracking, idempotency keys, and retry suppression are preserved. No historical pending delivery is processed during this release operation.

## Files created

- docs/Products/MILO/Milo_Midwest_Roofing_Installation_Prompt_v2.3.txt
- docs/Products/MILO/Milo_Midwest_Roofing_Installation_Guide_v2.3.pdf
- src/app/products/milo-midwest-roofing-contractors/page.tsx
- src/app/checkout/success/midwest/page.tsx
- tests/milo-midwest.test.mjs
- docs/MILO_MIDWEST_CHECKOUT.md

## Files modified

- .env.example
- .env.local (Midwest Product/Price IDs only; private)
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
- tests/milo-southeast.test.mjs (retain five-region coverage)
- tests/milo-multi-region.test.mjs (unavailable/future fixture moves to Southwest)
- tests/sales-checkout.test.mjs (unavailable fixture moves to Southwest)
- docs/SALES_WORKERS_CHECKOUT.md

Local QA helpers, baseline snapshots, rendered pages, screenshots, and logs are under `.qa/midwest/` and are excluded from deployment. Paid assets remain private and Git-ignored under the existing pattern. Earlier uncommitted work is preserved.

## Verification

- `npm test`: 91 passed, 0 failed, including all existing tests and Midwest single/six-region checkout and signed-webhook delivery cases.
- `npm run typecheck`: passed.
- `npm run build:vercel`: passed, including approved hashes, all regional server trace assets, and private-file exclusion from public output/browser bundles.
- All 15 PDF pages rendered and visually reviewed; extracted content matches Southeast except approved region/territory substitutions, with illustrations unchanged.
- Mocked fulfillment verifies exactly two Midwest-only attachments, one email per selected region, retrying only the unsent sixth region, and unchanged historical combined snapshots. No real customer email is submitted by tests.
- Production smoke and both browser verifiers passed: Midwest's purchase form is enabled, exact twelve-state territory and morning schedule are displayed, no Midwest video is present, all six selector choices use their correct product slugs, and $99/$594 totals are correct. No browser console/runtime errors were observed.
- Production checkout verification created only two open, unpaid sessions: Midwest alone at USD 9900 and all six regions at USD 59400. Stripe received every selected Product/Price line with quantity one, v2.3 metadata, and correct success routes. No live payment was submitted.
- Read-only comparison confirmed all five existing Stripe Product/Price objects and all prior v2.3 packages/master/template unchanged. Private Midwest asset URLs return 404.

## Deployment

Production deployment `dpl_6uKCHTNhSv4Y7uUaTqDBw7qjtfB8` is READY at `https://simple-digital-help-store-nw6izprwa.vercel.app`, aliased to `https://www.simpledigitalhelp.com`. Remote build and package verification passed.

## Exact next command

Add Southwest Roofing Prospect Discovery using the completed Milo v2.3 gold master and Midwest implementation pattern. Use product code PD-ROOF-SOUTHWEST and preserve the existing Southwest state boundaries exactly: AZ, NM, NV, OK. Keep $99 one-time, 52 weeks, Monday-Friday morning customer-local scheduling, up to five qualified prospects per scheduled workday, and no email/phone collection, outreach, or video. Create Southwest v2.3 TXT/PDF files and configure Stripe, environment IDs, selector, and separate two-file fulfillment using the existing pattern. Preserve all six active regions and multi-region checkout. Do not modify installed automations, process historical pending emails, or submit a live payment. Run all tests and deploy if they pass. Do not redesign or refactor.
