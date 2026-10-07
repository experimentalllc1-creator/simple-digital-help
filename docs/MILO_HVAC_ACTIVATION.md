# Milo HVAC v2.3 — all nine regions

Production: https://www.simpledigitalhelp.com/categories/sales

Activation extends the production Roofing v2.3 product registry, catalog, checkout, private package manifests, and separate delivery path. No parallel checkout, database migration, Roofing package rewrite, or Universal First Contact/Follow-Up product change was required.

## Product codes activated

| Region | Product code | Exact states |
| --- | --- | --- |
| Florida | PD-HVAC-FL | FL |
| Texas | PD-HVAC-TX | TX |
| California | PD-HVAC-CA | CA |
| Northeast | PD-HVAC-NORTHEAST | ME, NH, VT, MA, RI, CT, NY, NJ, PA |
| Southeast | PD-HVAC-SOUTHEAST | DE, MD, VA, WV, KY, TN, NC, SC, GA, AL, MS, AR, LA |
| Midwest | PD-HVAC-MIDWEST | OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS |
| Southwest | PD-HVAC-SOUTHWEST | AZ, NM, NV, OK |
| Mountain West | PD-HVAC-MOUNTAIN-WEST | CO, UT, WY, MT |
| Pacific Northwest | PD-HVAC-PACIFIC-NORTHWEST | WA, OR, ID |

## Files changed in this activation

- `.env.example`: documents 18 HVAC Stripe ID variables.
- `.env.local`: adds the 18 HVAC ID mappings; existing local checkout/delivery flags remain unchanged.
- `.vercelignore`: allows only the 18 approved HVAC delivery assets into the server deployment.
- `next.config.ts`: includes the HVAC packages in checkout/webhook server traces.
- `src/lib/milo-assignments.ts`: adds nine HVAC assignments and durable product codes.
- `src/lib/sales-order.ts`: activates HVAC's regional selector and makes single-product checkout copy family-aware.
- `src/lib/sales-catalog.ts`: publishes nine Milo HVAC product entries.
- `src/lib/milo-presentations.ts`: adds family-specific HVAC qualification and deduplication copy.
- `src/lib/milo-assets.server.ts`: adds hashed HVAC manifests and exact family/region delivery subjects.
- `src/lib/milo-http.server.ts`: sends HVAC purchases to the existing general success route while preserving Roofing return routes.
- `scripts/verify-milo-package.mjs`: verifies all HVAC hashes, private server traces, and absence from public files/browser bundles.
- `scripts/verify-sales-checkout.mjs`: retains all Roofing selector checks and expects 18 active regional selections across both families.
- `tests/sales-checkout.test.mjs`: uses still-unavailable Plumbing assignments for the existing Coming Soon rejection checks.
- `tests/milo-pacific-northwest.test.mjs`: scopes the existing nine-region Roofing test to Roofing.

Pre-existing uncommitted files and changes were preserved.

## Files created

- `scripts/build-milo-hvac.py`
- `tests/milo-hvac.test.mjs`
- `tests/fixtures/milo-roofing-hvac-baseline.json`
- `docs/MILO_HVAC_ACTIVATION.md`
- `src/app/products/milo-florida-hvac-contractors/page.tsx`
- `src/app/products/milo-texas-hvac-contractors/page.tsx`
- `src/app/products/milo-california-hvac-contractors/page.tsx`
- `src/app/products/milo-northeast-hvac-contractors/page.tsx`
- `src/app/products/milo-southeast-hvac-contractors/page.tsx`
- `src/app/products/milo-midwest-hvac-contractors/page.tsx`
- `src/app/products/milo-southwest-hvac-contractors/page.tsx`
- `src/app/products/milo-mountain-west-hvac-contractors/page.tsx`
- `src/app/products/milo-pacific-northwest-hvac-contractors/page.tsx`

Private delivery files under `docs/Products/MILO/`:

- `Milo_FL_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_FL_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_TX_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_TX_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_CA_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_CA_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Northeast_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_Northeast_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Southeast_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_Southeast_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Midwest_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_Midwest_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Southwest_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_Southwest_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Mountain_West_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_Mountain_West_HVAC_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Pacific_Northwest_HVAC_Installation_Prompt_v2.3.txt`
- `Milo_Pacific_Northwest_HVAC_Illustrated_Installation_Guide_v2.3.pdf`

Private QA scripts, manifests, rendered PDF pages/contact sheets, browser screenshots, deployment logs, and checkout results are in `.qa/hvac/`, excluded from deployment. Production Vercel configuration adds only the 18 HVAC Stripe product/price ID variables.

## Verification results

- Full suite: **164 passed, 0 failed**, using `node --conditions=react-server --import tsx --test --test-concurrency=2 tests/*.test.mjs`.
- `npm run typecheck`: passed.
- `npm run build:vercel`: passed locally and in Vercel production, including asset/package checks.
- All nine 15-page illustrated guides rendered and visually inspected. Existing illustrations preserved.
- Existing Roofing assets verified byte-for-byte unchanged. All nine existing live Roofing Stripe Product/Price objects verified unchanged.
- Exact regional boundaries, HVAC qualification, Customer Type-specific cross-region duplicate rule, native flexible morning schedule, 52-week term, shared workspace/columns, no contact research/outreach, unchanged Roofing tasks, and no auto-resize verified.
- Live browser: nine active HVAC regions, correct hidden form selections, enabled purchase controls, no console/runtime errors.
- Existing Roofing browser selector regression and production smoke suite: passed.
- Post-deployment runtime error scan: no error entries returned for the new deployment.
- All 18 HVAC assets return 404 at root, `/MILO/`, and `/docs/Products/MILO/`; attachment bytes are absent from public output and browser bundles.

## Checkout totals verified in live hosted Stripe sessions

| Cart | Total | Expected delivery emails |
| --- | --- | --- |
| HVAC Florida | $99 | 1 Florida HVAC email |
| HVAC Florida + HVAC Texas | $198 | 2 separate HVAC emails |
| Roofing Florida + HVAC Florida | $198 | 1 Roofing + 1 HVAC email |
| Roofing Florida + Roofing Texas + HVAC Florida | $297 | 3 separate emails |
| All nine HVAC regions | $891 | 9 separate HVAC emails |

Each live verification session had correct product codes and line-item prices, remained unpaid, and was expired after inspection. No real purchase, customer email, historical fulfillment processing, or installed automation modification occurred.

## Fulfillment behavior verified

Mocked signed Stripe webhooks and an embedded PostgreSQL ledger prove one email per purchased configuration, containing exactly that configuration's TXT/PDF pair. Exact HVAC family/region subjects, product-code persistence, distinct multi-product idempotency keys, webhook replay suppression, and the existing partial-delivery retry protections pass. Live paid fulfillment was not invoked.

## Deployment

Production deployment: `https://simple-digital-help-store-i0ikp3csd.vercel.app` (READY).

Deployment ID: `dpl_FcFMVF3D1aNoG7qedFPwhEXn6kbV`.

Production URL: https://www.simpledigitalhelp.com

Used the same linked-project Vercel CLI production deployment path as Roofing. No blocker requiring Henry remains.
