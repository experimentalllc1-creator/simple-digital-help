# Milo General Contractors v2.3 activation

## Files changed/created

Changed in this activation:
- `.env.example` and private `.env.local`: General Contractors product/price mappings only.
- `.vercelignore` and `next.config.ts`: 18 private General Contractors deployment inputs and server traces.
- `src/lib/milo-assignments.ts`: nine General Contractors configurations.
- `src/lib/sales-catalog.ts`: nine published General Contractors products.
- `src/lib/sales-order.ts`: active General Contractors worker and checkout status.
- `src/lib/milo-presentations.ts`: General Contractors qualification and family copy.
- `src/lib/milo-assets.server.ts`: hash-pinned packages and exact family/region fulfillment copy.
- `scripts/verify-milo-package.mjs`: General Contractors hash, server trace and public-output checks.
- `scripts/verify-sales-checkout.mjs`: 45 active regional selections.

Created:
- `scripts/build-milo-general-contractors.py`
- `scripts/smoke-milo-general-contractors.mjs`
- `tests/milo-general-contractors.test.mjs`
- `tests/milo-general-contractors-regression.test.mjs`
- `tests/fixtures/milo-existing-general-contractors-baseline.json`
- `tests/fixtures/milo-general-contractors-source-baseline.json`
- `tests/fixtures/milo-general-contractors-registry-baseline.json`
- `docs/MILO_GENERAL_CONTRACTORS_ACTIVATION.md`
- `src/app/products/milo-florida-general-contractors/page.tsx`
- `src/app/products/milo-texas-general-contractors/page.tsx`
- `src/app/products/milo-california-general-contractors/page.tsx`
- `src/app/products/milo-northeast-general-contractors/page.tsx`
- `src/app/products/milo-southeast-general-contractors/page.tsx`
- `src/app/products/milo-midwest-general-contractors/page.tsx`
- `src/app/products/milo-southwest-general-contractors/page.tsx`
- `src/app/products/milo-mountain-west-general-contractors/page.tsx`
- `src/app/products/milo-pacific-northwest-general-contractors/page.tsx`

Created in private `docs/Products/MILO/`:
- `Milo_FL_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_FL_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_TX_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_TX_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_CA_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_CA_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Northeast_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_Northeast_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Southeast_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_Southeast_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Midwest_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_Midwest_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Southwest_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_Southwest_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Mountain_West_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_Mountain_West_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`
- `Milo_Pacific_Northwest_General_Contractors_Installation_Prompt_v2.3.txt`
- `Milo_Pacific_Northwest_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf`

Deployment-excluded `.qa/general-contractors/` contains preparation/provisioning/verification scripts, non-secret product snapshots, private manifests, 135 rendered guide pages, nine contact sheets, and test/build/deployment logs. Pre-existing workspace changes were preserved. Universal First Contact and Follow-Up were not edited.

## General Contractors product codes activated

| Region | Product code | Exact states |
| --- | --- | --- |
| Florida | PD-GC-FL | FL |
| Texas | PD-GC-TX | TX |
| California | PD-GC-CA | CA |
| Northeast | PD-GC-NORTHEAST | ME, NH, VT, MA, RI, CT, NY, NJ, PA |
| Southeast | PD-GC-SOUTHEAST | DE, MD, VA, WV, KY, TN, NC, SC, GA, AL, MS, AR, LA |
| Midwest | PD-GC-MIDWEST | OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS |
| Southwest | PD-GC-SOUTHWEST | AZ, NM, NV, OK |
| Mountain West | PD-GC-MOUNTAIN-WEST | CO, UT, WY, MT |
| Pacific Northwest | PD-GC-PACIFIC-NORTHWEST | WA, OR, ID |

## Test results

- Complete suite: 190 passed, zero failed, zero skipped, using `node --conditions=react-server --import tsx --test --test-concurrency=4 tests/*.test.mjs`.
- General Contractors tests passed exact boundaries, qualification (including specialty-only and builder exclusions), shared Sheet structure, flexible weekday mornings, 52-week activation term, duplicate rules, and all five requested checkout/fulfillment cases.
- Regression snapshots passed for existing registry, product routes, payment/retry implementation, First Contact source, and private Roofing/HVAC/Plumbing/Electrical assets.
- `npm run typecheck`: passed.
- `npm run build:vercel`: passed locally and on Vercel production, including private hashes, both server traces, and absence of paid assets from public output/browser bundles.
- All nine 15-page guides were rendered and visually checked.
- Local smoke passed all 45 product routes, General Contractors qualification and scheduling, 54 private asset 404 probes, Sales catalog, and local purchase/webhook protections.
- Local browser verified nine General Contractors selections, 45 active regional choices, and $198 General Contractors Florida + Texas.
- Production browser verified all nine General Contractors regions active, 45 enabled regional choices, enabled checkout, and all requested $99/$198/$198/$495/$891 totals.
- Production verification passed all 45 existing/new product routes, 54 General Contractors private-asset URL probes returning 404, invalid-origin and unsigned-webhook protection, and byte-for-byte unchanged existing Stripe products/prices.
- Existing production smoke suite passed.

## Checkout totals verified

| Cart | Tested total | Tested fulfillment |
| --- | --- | --- |
| General Contractors Florida | $99 | One Florida General Contractors email |
| General Contractors Florida + Texas | $198 | Two separate General Contractors emails |
| Electrical Florida + General Contractors Florida | $198 | Two separate family emails |
| Roofing + HVAC + Plumbing + Electrical + General Contractors Florida | $495 | Five separate emails |
| All nine General Contractors regions | $891 | Nine separate General Contractors emails |

All five carts were also verified against live Stripe checkout totals, line items, and durable product-code metadata. Every verification session stayed unpaid and was expired. No real paid purchase was made.

## Fulfillment behavior verified

Signed mocked Stripe webhooks and the PostgreSQL test ledger verified one email per purchased configuration, only the exact purchased TXT/PDF pair, precise family/region subjects, durable product-code snapshots, distinct delivery idempotency keys, and no duplicate delivery on retry/replay or asynchronous success events. Existing partial-delivery and historical v2.2 package regressions passed. No real customer email was sent.

## Deployment status / production URL

- Status: READY, production.
- Deployment ID: `dpl_8xK9TJkvQAigqa75s86czKaTSAQx`.
- Deployment URL: https://simple-digital-help-store-fyfg4cgfh.vercel.app
- Production URL: https://www.simpledigitalhelp.com/categories/sales
- Path: established linked-project Vercel CLI production rollout, after all tests/build/package/local smoke checks passed.

## Blocker requiring Henry

None.
