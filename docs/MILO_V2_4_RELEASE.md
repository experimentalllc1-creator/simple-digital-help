# Milo v2.4 repository release

v2.4 introduces the standard ten-column Prospects workspace across all 45 active Milo variants. New packages are separate from immutable historical v2.2/v2.3 packages.

Columns: Date Added, Business Name, City, Region, Customer Type, Website, Contacted?, Email, Phone, Notes.

A:F are Milo-managed. G is initialized to No only when creating a new prospect and is customer-owned thereafter. H:J are entirely customer-owned; Milo never populates, clears, overwrites, or otherwise modifies their data cells, formulas, formatting, or validation. New prospect writes are restricted to A:G. Existing records and customer changes are preserved during setup, repair, retry, and additional-variant installation.

Existing standard seven-column workspaces receive only missing labels in unused H1:J1. Conflicting layouts stop for a preservation plan. Spreadsheet and tab IDs remain unchanged. Needs Attention remains unchanged.

## Assets and compatibility

- 45 new installation prompts and 45 illustrated 15-page guides, generated from each corresponding v2.3 assignment.
- Florida Roofing gold-master specification and future-region prompt template.
- A refusal-to-overwrite builder, historical hash baseline, v2.4 package hash manifest, and new QA renders.
- Explicit v2.2, v2.3, and v2.4 delivery routing. Historical checkout sessions keep their purchased versions. Saved messages and idempotency keys are reused unchanged.
- Ten-field storefront copy and separate v2.4 demo assets. Historical media remain unchanged.

Exact geography, qualification, family-specific duplicate policy, $99 prices, 52-week terms, weekday-morning scheduling, and separate two-attachment fulfillment are preserved. The discontinued contact agent is outside this upgrade. Its source, documentation, fixtures, and tests are not changed or invoked. References to it are removed only from newly authored Milo assets and current Milo presentation.

## Verification commands

Use the bundled Python runtime for `scripts/build-milo-v2-4.py --render`. The builder accepts existing v2.4 outputs only when byte-identical, never overwrites old assets, and renders all 675 guide pages with contact sheets.

- `npm run test:milo`: Milo-only tests, including historical release preservation and mocked payment/delivery coverage.
- `npm run typecheck`
- `npm run build:vercel`: local asset, build, trace, and browser-bundle privacy checks; this command does not deploy.
- Local storefront/API smoke checks, PDF visual QA, and v2.4 poster/video review.

The workspace contract module under scripts/lib is an executable QA reference, not a Google adapter or an installed worker. Prompt assertions and deterministic preservation scenarios verify the shipped contract; they do not demonstrate execution by a live ChatGPT scheduled task.

## Live installation

No live installation changes are part of this repository release. Follow MILO_V2_4_EXISTING_INSTALLATION_UPGRADE.md only after separate authorization. Preserve the existing spreadsheet, task, schedule, prospects, Contacted? values, activation date, and service end date.

## Final verification results - October 7, 2026

| Check | Result |
| --- | --- |
| `npm run test:milo` | 153 passed; 0 failed, skipped, cancelled, or todo. |
| `npm run typecheck` | Passed. Final production build's TypeScript check also passed. |
| `npm run build:vercel` | Passed; local build only, with all current/historical private delivery assets in both API server traces. |
| PDF catalog audit | All 45 approved pairs passed; 675 pages rendered; all 45 contact sheets visually inspected. |
| Historical preservation | All 102 v2.2/v2.3 assets match the pre-upgrade SHA-256 baseline byte-for-byte. |
| PDF format/content | Every page retains the original Letter page size. Unchanged pages and their Google connection illustrations match v2.3 except version references. Exact regional boundaries retained. |
| Local storefront | All 45 product pages show ten fields and customer ownership. All 90 delivery files and both master/spec paths return 404 publicly. |
| Browser QA | Desktop and 390px mobile layouts reviewed without horizontal overflow; no console warnings/errors; new MP4 plays successfully. |
| Package privacy | Private attachment bytes are absent from public files and browser bundles. |
| Smoke and disabled APIs | Local smoke passed, including historical video range playback; local checkout/delivery disabled and API requests fail closed. |
| Builder safety | Historical overwrite rejected; identical v2.4 output accepted without mutation. |
| Whitespace check | Passed for the changed tracked files. |

Mocked tests cover all three release routes, all 45 current variants, per-Milo attachment isolation, replay suppression, partial-delivery retries, saved historical v2.2/v2.3 message reuse, and the customer-ownership QA reference scenarios. Every individual package uses real attachment bytes and hash checks. The 45-item basket uses compact attachment digests as mock payloads to avoid repeatedly storing large PDF blobs in the in-memory test database; existing family/regional tests retain real attachment snapshots.

Final evidence is under `.qa/v2.4/`: `tests-final.log`, `build-final.log`, `pdf-audit.json`, `pdf-verification.log`, `storefront-verification.json`, `storefront.log`, `smoke.log`, rendered guide pages/contact sheets, and browser screenshots. Earlier logs are intermediate attempts, not the final result.

QA corrected the inherited seven-column page-8 illustration, preserved Northeast's explicit state list on the new opening pages, and made new pages use the original Letter format. The Windows sandbox blocked `tsx` OS-user lookup; final mocked tests/build checks passed outside that restriction. No unresolved repository verification failures remain.

The paid assets and QA files retain their existing private/Git-ignored treatment; v2.4 delivery upload rules and server traces have been verified locally. No production deployment, customer email, live payment, historical pending delivery processing, or live installation change was performed. Actual execution by the live ChatGPT task remains untested pending a separately authorized in-place upgrade.
