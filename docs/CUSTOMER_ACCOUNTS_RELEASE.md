# Customer accounts release — implementation and verification

Status: implemented on `codex/customer-accounts-2026-10-20`; **not deployed to production**. The owner instructed us to skip renewing the expired Stripe test credential and not deploy unverified payment or account-security changes. No production database migration, purchase backfill, payment, pricing change, webhook configuration change, or production email campaign was performed.

## Infrastructure and schema

Reuses the existing Next.js store, Neon/PostgreSQL, official Stripe SDK and product mappings, Resend sender, and original `milo_deliveries` fulfillment snapshots. Public product content, assets, prices, disabled volume-pricing policy, and Git deployment settings are preserved.

Migration `006_customer_accounts.sql` extends `milo_customer_profiles` with a permanent ID, verification/profile timestamps, registration, and marketing state. Better Auth uses this existing profile table and its own session/account/verification/database-rate-limit tables. `milo_purchases` supplies monetary history absent from the delivery ledger; refund, consent-evidence, recommendation-click, and support tables supply the minimal required records. Production and test databases must remain separate because one account identity is unique per normalized email.

The migration was applied only to the empty staging database `sdh_accounts_staging_20261020` within the existing Neon account. Its separate restricted login owns its staging objects; no production records were copied. Credentials and owner identity evidence are under ignored `.qa/` and must never be committed or deployed. The existing `.vercelignore` allowlist excludes them and the staging harnesses.

## Implemented experience

- Optional post-purchase invitation on all existing success pages, including a clear decline action. Direct checkout keeps its approved Stripe price/product flow; the enabled release appends the Checkout Session placeholder to the existing success URL for verified email prefill.
- Better Auth 1.7.12 passwordless email authentication with existing Resend. Ten-minute hashed, single-use links, verified email, database rate limits, server-side sessions, HttpOnly/SameSite cookies, Secure cookies under HTTPS, expiration, logout, and recovery by requesting a fresh link. Email changes and account linking are disabled; support must verify both identities before any manual reassociation. Google sign-in was not added because no existing OAuth configuration was verified.
- Responsive My Milos, recommendations, purchase history, support, and catalog links in the requested order. No installed/active/scheduled claims. Profile name and email preferences are editable.
- Download authorization checks customer ID, environment, paid entitlement, order, and exact product code on every request. Downloads use the original delivery's TXT/PDF attachment bytes, including old versions, instead of generating new packages or substituting current files. The existing shared installation video remains linked with version-specific-guide guidance.
- Confirmed payments are recorded before fulfillment. Registration and login are independent of delivery. A purchase-recording error still allows the existing fulfillment attempt and returns a retryable webhook response. Unique Stripe references prevent duplicate records; out-of-order full/partial refunds are retained and cannot be undone by payment retries. Partial-refund downloads are conservatively suspended for support reconciliation.
- Existing approved Audit-credit/cart purchases use their existing validated quote and capture the discount in purchase history. The existing checkout path now tolerates an account profile without a Stripe customer ID. No new price, credit, bundle, renewal, or discount policy was introduced.
- Receipts resolve through the purchaser-authorized PaymentIntent's Stripe receipt URL. Zero-charge orders show that no charge applied. Production receipt redirects still need the isolated real-Stripe check.
- Deterministic complementary-customer-type and additional-region recommendations exclude all previously purchased identical assignments. Only available catalog assignments with active matching Stripe products and the current approved price/mode/currency are displayed. Pricing failures suppress the offer. Clicks are bound to account and variant, and confirmed matching purchases capture attribution.
- Support requests persist account, confirmed purchase, product code, region, and package version, then notify the existing support mailbox. They include a send cap and duplicate-submission protection. No customer's ChatGPT environment is inspected or controlled.
- Marketing defaults to disabled. Verified registration claims a single permission invitation before sending; ignored invitations are not repeated, including after ambiguous mail acceptance. Preferences require explicit affirmative consent and retain identity, time, source, wording and version. Withdrawal works in preferences and through signed unsubscribe links, including RFC 8058-style one-click POST. No promotional campaign sender was introduced or run. Future promotional mail must check current consent at send time and include both the unsubscribe URL and List-Unsubscribe headers; existing transactional mail must not be reused for promotions.
- `CUSTOMER_REPORTING.sql` supplies basic owner-only reporting examples. No administrative dashboard or external recommendation service was added.

## Verification evidence

| Check | Result |
| --- | --- |
| Focused release tests (checkout, email, accounts and HTTP security) | 42 passed, 0 failed before two additional recommendation assertions |
| Final account and HTTP suite, including current-price validation and attribution | 26 passed, 0 failed; the other 18 focused checkout/email tests above remain valid |
| Entire existing suite plus initial account tests | 227 tests: 214 passed, 13 failed |
| Same 13 failing tests on the unmodified recovery checkout | All 13 failures reproduced; historical fixtures/templates absent, outdated catalog/metadata assertions, and two embedded-database restart errors |
| TypeScript | Passed |
| Optimized production build, with accounts enabled and no production credentials | Passed |
| Private package hashes, all five fulfillment-function traces, and public-output scan | Passed; private attachment bytes absent from public files and browser bundles |
| Isolated Neon migration and authentication | Passed |
| Owner-only Resend sign-in email | Delivered, verified using provider delivery status |
| Browser registration/claim | Verified account displayed two synthetic purchases, v2.2 and v2.4 |
| Historical TXT browser download | SHA-256 exactly matched the existing approved v2.2 file |
| Browser consent | Default off; explicit grant and withdrawal saved with wording/version evidence; final state off |
| Browser invitation decline | Preserved delivery messaging and access to the existing shopping path |
| Responsive dashboard | Desktop inspected at 1440px; mobile 390px single column and tablet 768px two columns, no horizontal overflow |

Local evidence is under ignored `.qa/`: `customer-release-tests.log`, `customer-final-tests.log`, `customer-regression-tests.log`, `customer-baseline-failures.log`, `customer-final-build.log`, `customer-package-check.log`, and sanitized `customer-staging-results.json`. Test Stripe and Resend behavior in automated suites uses fixtures and mocks, not actual charges or customer recipients. Real email checks were only to the verified owner address. Synthetic staging history is not evidence of a real Stripe payment.

## Before launch

1. **One isolated Stripe test is necessary before launch.** The webhook ledger and optional success URL are part of this release. A real Stripe test-mode checkout, signed webhook delivery/retry, receipt access, refund, and complete fulfillment must prove that external configuration matches the tested code. The existing CLI key returned `api_key_expired`; renewal was explicitly deferred by the owner. No new Stripe infrastructure is needed—use the existing account's test mode when this final check is authorized.
2. On a protected staging deployment, verify HTTPS cookie/session behavior, email links, prices, receipts, and unauthorized downloads across distinct accounts. No production account-security deployment has been claimed.
3. Apply the migration to production only as part of that coordinated release. Keep the current database and take the existing operational backup first. A unique-email collision across environments must be resolved deliberately, never merged automatically.
4. Run `scripts/reconcile-customer-purchases.mjs` in dry-run mode against the verified existing configuration, then apply only after all historical identities/versions reconcile. It performs no Stripe writes or fulfillment sends. The three live historical deliveries were inspected only as infrastructure; they were not used as test fixtures or migrated. Test-mode fixtures cannot be used for production backfill.
5. Provision a new production-only `BETTER_AUTH_SECRET` through the existing secure environment workflow. Set `CUSTOMER_ACCOUNTS_ENABLED=true` only on the complete, verified release and keep the existing checkout/delivery settings unchanged. Never reuse the staging secret or staging database in production.
6. Stage, verify, and promote one coordinated release. Current production remains `dpl_ssydftVoGc3o6V3ZJ7EsHayUxt5K` (READY). Git auto-deployment remains disabled.

No immediate owner action is required while Stripe testing remains deferred. The code and isolated verification are available for review; this report does not represent production launch acceptance.
