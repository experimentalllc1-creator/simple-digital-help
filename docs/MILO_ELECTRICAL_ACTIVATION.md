# Milo Electrical v2.3 activation

## Files changed/created

Changed in this activation:
- `.env.example` and private `.env.local`: Electrical product/price mappings only.
- `.vercelignore` and `next.config.ts`: include the 18 Electrical paid assets in private server deployment inputs.
- `src/lib/milo-assignments.ts`: nine Electrical configurations.
- `src/lib/sales-catalog.ts`: nine published Electrical products.
- `src/lib/sales-order.ts`: active Electrical worker and single-product checkout status.
- `src/lib/milo-presentations.ts`: Electrical qualification and family copy.
- `src/lib/milo-assets.server.ts`: hash-pinned Electrical package manifest and exact family/region email copy.
- `scripts/verify-milo-package.mjs`: Electrical hash, trace, and public-output checks.
- `scripts/verify-sales-checkout.mjs`: 36 available regional choices.
- `tests/sales-checkout.test.mjs`: unavailable-family fixtures now use Landscaping.

Created:
- `scripts/build-milo-electrical.py`
- `scripts/smoke-milo-electrical.mjs`
- `tests/milo-electrical.test.mjs`
- `tests/fixtures/milo-existing-electrical-baseline.json`
- `docs/MILO_ELECTRICAL_ACTIVATION.md`
- `src/app/products/milo-florida-electrical-contractors/page.tsx`
- `src/app/products/milo-texas-electrical-contractors/page.tsx`
- `src/app/products/milo-california-electrical-contractors/page.tsx`
- `src/app/products/milo-northeast-electrical-contractors/page.tsx`
- `src/app/products/milo-southeast-electrical-contractors/page.tsx`
- `src/app/products/milo-midwest-electrical-contractors/page.tsx`
- `src/app/products/milo-southwest-electrical-contractors/page.tsx`
- `src/app/products/milo-mountain-west-electrical-contractors/page.tsx`
- `src/app/products/milo-pacific-northwest-electrical-contractors/page.tsx`

Created under private `docs/Products/MILO/`:
- `Milo_FL_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_FL_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_TX_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_TX_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_CA_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_CA_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Northeast_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_Northeast_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Southeast_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_Southeast_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Midwest_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_Midwest_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Southwest_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_Southwest_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Mountain_West_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_Mountain_West_Electrical_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Pacific_Northwest_Electrical_Installation_Prompt_v2.3.txt`
- `Milo_Pacific_Northwest_Electrical_Illustrated_Installation_Guide_v2.3.pdf`

Deployment-excluded `.qa/electrical/` contains preparation/provisioning/verification scripts, non-secret product snapshots, asset manifests, 135 rendered guide pages, nine contact sheets, and test/build/deployment logs. Pre-existing workspace changes were preserved. Universal First Contact and Follow-Up were not edited.

## Electrical product codes activated

| Region | Product code | Exact states |
| --- | --- | --- |
| Florida | PD-ELEC-FL | FL |
| Texas | PD-ELEC-TX | TX |
| California | PD-ELEC-CA | CA |
| Northeast | PD-ELEC-NORTHEAST | ME, NH, VT, MA, RI, CT, NY, NJ, PA |
| Southeast | PD-ELEC-SOUTHEAST | DE, MD, VA, WV, KY, TN, NC, SC, GA, AL, MS, AR, LA |
| Midwest | PD-ELEC-MIDWEST | OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS |
| Southwest | PD-ELEC-SOUTHWEST | AZ, NM, NV, OK |
| Mountain West | PD-ELEC-MOUNTAIN-WEST | CO, UT, WY, MT |
| Pacific Northwest | PD-ELEC-PACIFIC-NORTHWEST | WA, OR, ID |

## Test results

- Full suite: 180 passed, zero failed, zero skipped. Command: `node --conditions=react-server --import tsx --test --test-concurrency=4 tests/*.test.mjs`.
- Electrical: exact boundaries, qualification, weekday flexible mornings, shared Sheet layout, 52-week activation term, cross-region/customer-type duplicate rules, and all five requested checkout/fulfillment cases passed.
- Existing Roofing, HVAC, and Plumbing installation assets remained byte-for-byte unchanged; all existing routes, product codes, fulfillment and retry regressions passed.
- `npm run typecheck`: passed.
- `npm run build:vercel`: passed locally and in Vercel production, including asset hashes, both server traces, and absence of paid asset names/contents from public output and client bundles.
- All nine 15-page Electrical guides were rendered and visually inspected.
- Local smoke: all 36 product routes, Electrical qualification and schedule, all 54 private asset URL probes, Sales catalog, and disabled local purchase protections passed.
- Existing production smoke: passed.
- Production checks: all 36 product routes, 54 Electrical private asset 404s, checkout origin/signature protection, and unchanged existing Stripe products/prices passed.
- Live browser: nine enabled Electrical regions and 36 enabled regional choices; $198 Electrical, $198 mixed, $396 four-family, and $891 nine-region totals verified.

## Checkout totals verified

| Production cart | Total | Tested fulfillment |
| --- | --- | --- |
| Electrical Florida | $99 | One Florida Electrical email |
| Electrical Florida + Electrical Texas | $198 | Two separate Electrical emails |
| Plumbing Florida + Electrical Florida | $198 | Two separate family emails |
| Roofing + HVAC + Plumbing + Electrical Florida | $396 | Four separate emails |
| All nine Electrical regions | $891 | Nine separate Electrical emails |

All five live Stripe sessions had the correct total, line items, and durable product-code metadata. They remained unpaid and were expired. No real paid purchase was made.

## Fulfillment behavior verified

Signed mocked Stripe webhooks and the PostgreSQL test ledger verified one email per purchased configuration, only the exact purchased TXT/PDF pair, precise family/region subjects, durable product-code snapshots, distinct delivery idempotency keys, and no duplicate delivery on replay or asynchronous success events. Existing partial-delivery retry and historical package tests passed. No real customer email was sent.

## Deployment status / production URL

- Status: READY, production.
- Deployment ID: `dpl_nTp9Eba6i6RkAFvsduKknVvroN9i`.
- Deployment URL: https://simple-digital-help-store-2sp0dd5ey.vercel.app
- Production URL: https://www.simpledigitalhelp.com/categories/sales
- Path: existing linked-project Vercel CLI production rollout, after all tests/build/package/local smoke checks passed.

## Blocker requiring Henry

None.
