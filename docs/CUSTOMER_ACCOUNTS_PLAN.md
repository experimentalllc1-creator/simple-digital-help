# Customer accounts release — 20 October 2026

Baseline: GitHub recovery commit 31c10ea, matching public production inputs of Vercel deployment dpl_ssydftVoGc3o6V3ZJ7EsHayUxt5K. Existing Next.js 16, PostgreSQL/Neon, Stripe SDK, Resend and private fulfillment snapshots are retained. Live read-only inspection found three sent deliveries (v1.2, v2.2 and v2.4), existing customer profile/session tables, and enabled payment/refund webhooks. Local checkout switches are disabled; production environment access must be established separately.

Implementation plan (recorded before application edits):

1. Extend existing customer profiles with permanent identity and registration/consent fields. Better Auth uses that table; its session, account, verification and database rate-limit tables are security infrastructure, not a second customer database. Guest identity remains unverified until mailbox ownership is proven.
2. Add a confirmed-purchase ledger because delivery records do not contain monetary history or refunds. Preserve Stripe IDs, purchased assignments, versions, totals and discounts. Record verified payments idempotently and keep fulfillment independent of registration. Reconcile historical Stripe sessions against delivery records before release.
3. Use Better Auth magic links through existing Resend, hashed one-use tokens, database rate limits, server sessions, logout and recovery by requesting a new link. Disable self-service email changes until dual-identity recovery can be supported safely. Keep live and test databases separate.
4. Add the optional post-purchase invitation and an authenticated responsive dashboard. Verify ownership and refund state on every data/file request. Download exact original delivery snapshots rather than copying packages or silently upgrading old purchases.
5. Rank complementary available assignments deterministically, exclude owned variants, verify prices against Stripe, and capture minimal recommendation attribution.
6. Default marketing permission to false; issue one permission invitation after verified registration, persist explicit consent history, and provide authenticated preferences plus signed unsubscribe links. Add purchase-aware support requests.
7. Test with isolated PostgreSQL and mocked Stripe/Resend, run storefront regressions/typecheck/build, check responsive rendering, and deploy only after production configuration, historical reconciliation and test-mode transactional checks are verified. No real charges, promotional sends or commercial-setting changes.
