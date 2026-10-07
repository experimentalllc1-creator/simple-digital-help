# Milo Plumbing v2.3 — all nine regions

## Files changed

- `.env.example`
- `.env.local`
- `.vercelignore`
- `next.config.ts`
- `src/lib/milo-assignments.ts`
- `src/lib/sales-order.ts`
- `src/lib/sales-catalog.ts`
- `src/lib/milo-presentations.ts`
- `src/lib/milo-assets.server.ts`
- `src/lib/milo-http.server.ts`
- `scripts/verify-milo-package.mjs`
- `scripts/verify-sales-checkout.mjs`
- `tests/sales-checkout.test.mjs`

Only Plumbing ID mappings were added to local/production environments. Existing local checkout flags remain unchanged. Plumbing extends the same catalog, product registry, one-payment checkout, family/region email identity, and private traced asset paths. General success routing now applies to non-Roofing families; existing Roofing routes and HVAC behavior are preserved. Coming Soon rejection tests now use still-unavailable Electrical assignments, and the browser regression expects 27 active regional choices.

## Files created

- `scripts/build-milo-plumbing.py`
- `tests/milo-plumbing.test.mjs`
- `tests/fixtures/milo-existing-plumbing-baseline.json`
- `docs/MILO_PLUMBING_ACTIVATION.md`
- `src/app/products/milo-florida-plumbing-contractors/page.tsx`
- `src/app/products/milo-texas-plumbing-contractors/page.tsx`
- `src/app/products/milo-california-plumbing-contractors/page.tsx`
- `src/app/products/milo-northeast-plumbing-contractors/page.tsx`
- `src/app/products/milo-southeast-plumbing-contractors/page.tsx`
- `src/app/products/milo-midwest-plumbing-contractors/page.tsx`
- `src/app/products/milo-southwest-plumbing-contractors/page.tsx`
- `src/app/products/milo-mountain-west-plumbing-contractors/page.tsx`
- `src/app/products/milo-pacific-northwest-plumbing-contractors/page.tsx`
- `docs/Products/MILO/Milo_FL_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_FL_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_TX_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_TX_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_CA_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_CA_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_Northeast_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Northeast_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_Southeast_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Southeast_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_Midwest_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Midwest_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_Southwest_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Southwest_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_Mountain_West_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Mountain_West_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`
- `docs/Products/MILO/Milo_Pacific_Northwest_Plumbing_Installation_Prompt_v2.3.txt`
- `docs/Products/MILO/Milo_Pacific_Northwest_Plumbing_Illustrated_Installation_Guide_v2.3.pdf`

Internal QA scripts, Stripe/asset snapshots, rendered pages and contact sheets, browser screenshots, checkout-session results, and test/build/deployment logs are in the private, deployment-excluded `.qa/plumbing/` directory. Prior uncommitted work was preserved.

## Product codes activated

| Region | Product code | Exact states |
| --- | --- | --- |
| Florida | PD-PLUMB-FL | FL |
| Texas | PD-PLUMB-TX | TX |
| California | PD-PLUMB-CA | CA |
| Northeast | PD-PLUMB-NORTHEAST | ME, NH, VT, MA, RI, CT, NY, NJ, PA |
| Southeast | PD-PLUMB-SOUTHEAST | DE, MD, VA, WV, KY, TN, NC, SC, GA, AL, MS, AR, LA |
| Midwest | PD-PLUMB-MIDWEST | OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS |
| Southwest | PD-PLUMB-SOUTHWEST | AZ, NM, NV, OK |
| Mountain West | PD-PLUMB-MOUNTAIN-WEST | CO, UT, WY, MT |
| Pacific Northwest | PD-PLUMB-PACIFIC-NORTHWEST | WA, OR, ID |

## Test results

- Complete suite: **172 passed, zero failed**, using `node --conditions=react-server --import tsx --test --test-concurrency=4 tests/*.test.mjs` against finalized assets.
- Finalized Plumbing-specific tests: 8 passed, zero failed.
- TypeScript, local production build, asset hash verification, private package/server trace checks, and production Vercel build passed.
- All nine 15-page guides were rendered and visually inspected after aligning longer Plumbing headers. Existing illustrations remain unchanged.
- All Roofing and HVAC assets remain byte-for-byte unchanged; all 18 existing live Product/Price pairs remain unchanged.
- Exact state boundaries, Plumbing qualification, cross-region Customer Type-specific duplicate prevention, flexible weekday mornings, 52-week term, shared workspace/columns, no contact research/outreach/auto-resize, and preservation of existing Roofing/HVAC tasks verified.
- Local and production Plumbing browser checks passed: nine active regions, correct form products, enabled checkout, and $198/$297/$891 totals, without console/runtime errors.
- Existing Roofing/HVAC browser checks and production smoke suite passed.
- Private Plumbing delivery assets return 404 at root, /MILO/, and /docs/Products/MILO/; their contents are absent from public output and browser bundles.

## Live checkout totals verified

| Cart | Total | Expected fulfillment |
| --- | --- | --- |
| Plumbing Florida | $99 | One Florida Plumbing email |
| Plumbing Florida + Plumbing Texas | $198 | Two separate Plumbing emails |
| HVAC Florida + Plumbing Florida | $198 | One HVAC email and one Plumbing email |
| Roofing Florida + HVAC Florida + Plumbing Florida | $297 | Three separate emails |
| All nine Plumbing regions | $891 | Nine separate Plumbing emails |

Every live verification session had the correct line items/product codes, remained unpaid, and was expired. No real purchase or customer fulfillment email was submitted.

## Fulfillment behavior verified

Signed mocked Stripe webhooks and the PostgreSQL test ledger verify one email per purchased configuration, containing only its exact TXT/PDF pair; exact family/region subjects; durable product codes; distinct multi-product idempotency keys; and no duplicates on webhook retry/replay. Existing partial-delivery retry and historical-order protection tests remain passing. No installed customer automation or historical pending fulfillment was modified.

## Deployment

- Status: READY.
- Deployment ID: `dpl_HZMrytowzY7hDofRUiD43vPyfxsJ`.
- Deployment URL: https://simple-digital-help-store-qb10cegjt.vercel.app
- Production URL: https://www.simpledigitalhelp.com/categories/sales
- Path: the same linked-project Vercel CLI production rollout used for Roofing and HVAC.
- Blockers requiring Henry: none.

Post-deployment runtime error scan: no error entries returned for the new deployment.
