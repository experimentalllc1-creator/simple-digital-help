# Universal First Contact Agent v1 — isolated implementation

Commercial contract: $399 USD one-time, assisted setup included, 52 weeks (364
days) from verified activation, US B2B only. One customer-owned/customer-paid
Mailforge mailbox, one existing shared Sales Prospects sheet, one approved
subject/body/signature/opt-out message. Default combined cap is five submissions
per weekday across every Milo region. An increased cap requires recorded assisted
approval. Rejections and uncertain submissions also consume capacity conservatively.
No follow-ups, autonomous rewriting, dashboard, CRM, campaign builder, or checkout.

## Isolation and execution

Everything is additive. No Milo module, regional package, migration runner,
checkout, environment configuration, cron configuration, or production route was
changed. The worker is a server-only library inside the existing Next.js app.
There is no public HTTP route or enabled Vercel Cron job in this phase.

The only composition root is `scripts/first-contact-fixture.mjs`. It loads no
dotenv/configuration, accepts no command arguments, ignores DATABASE_URL, uses a
temporary PGlite database and fixture adapters, forbids fetch, and removes its own
temporary database after completion. The schema and worker require fixture mode;
there is no environment variable that enables live sending. Do not add the new
SQL file to the Milo migration runner or apply it to production.

Run from repository root:

```
node --conditions=react-server --import tsx --test tests/first-contact.test.mjs
node --conditions=react-server --import tsx scripts/first-contact-fixture.mjs
npm run typecheck
```

Windows sandbox execution may need permission for Node's account-information
lookup used by tsx. This is unrelated to the worker or network access.

## Components and database

`store.server.ts` is the durable PostgreSQL DAL. It accepts an existing pg-compatible
query client. The fixture runners use PGlite, including a file-backed close/reopen
test. `db/first-contact/001_v1.sql` creates only the following tables:

- fc_customers: immutable activation, expiry, approval hash, cap, execution mode,
  mailbox/sheet references, pause state; no payment processing or credentials.
- fc_sends: immutable business/recipient uniqueness, message snapshot, public source,
  Message-ID, reservation, send status, acceptance evidence, sheet outbox status.
- fc_daily_usage: durable local-calendar-day quota, shared across regions/runs.
- fc_suppressions: persistent customer-scoped business and recipient blocking.
- fc_exceptions: deduplicated Needs Attention outbox, resolution and sync status.
- fc_mail_events: durable, idempotently ingested IMAP events and processing status.

The `fc_reserve` PostgreSQL function locks the customer row, checks activation,
expiry, weekday, pause state, approval, suppression and quota, and atomically
reserves both identities. Unique constraints prevent same-domain and same-recipient
recontact. A normalized business-name/city index conservatively blocks changed
domains for the same business. Domain normalization strips www; uncertain branches
and aliases should remain blocked rather than weakening duplicate prevention.
RLS is enabled with no browser policies. A private production role and least-
privilege grants still require a separate reviewed integration step.

## Worker and recovery

Each tick first polls the mailbox, ingests events and processes opt-outs/bounces.
Mailbox-monitoring failure pauses sending durably and writes an administrative
Needs Attention exception. Database failure fails closed and alerts without logging
raw errors/credentials; if the database is down, pause/exception persistence waits
for operator recovery. Pauses do not automatically clear when a connection returns.

Pending confirmed-send Sheet writes and exception writes are retried before new
sends. Only accepted messages may set Contacted? to Yes, and read-back must verify
the change. A failed update never resubmits the message. Repaired update exceptions
are marked resolved. Needs Attention writes are upserts using durable references;
production needs an adapter-side reference mapping without extra sheet columns.

Outbound runs are eligible 09:00–17:00 Monday–Friday in the configured customer
timezone. Weekends and inactive terms do not send. A tick is bounded to at most
twice the cap (minimum ten) research candidates. No research occurs after the daily
quota is consumed. Existing Yes rows are imported into durable business suppression
so a later manual reset does not re-enable contact. Needs Attention/ledger data stay
outside Milo's seven Prospects columns and eight Needs Attention columns.

Public research v1 parses only explicitly listed mailto role addresses on supplied
public business pages attributable to the prospect website. Private pages, guessed
addresses, named personal accounts, directories and enrichment are excluded. No
network research driver is included. Failures/no address become exceptions.

Message content is the exact approved subject, body and signature; only the approved
unsubscribe URL placeholder is substituted. Approval hash mismatches pause sending.
Every submission receives a durable unique Message-ID. This identifier is for
correlation, not SMTP idempotency.

Send states: reserved → sending → accepted, rejected, or unknown. An expired
reserved/sending record becomes unknown and never becomes eligible to resend.
The adapter never retries a transport timeout. Accepted SMTP evidence is persisted
before the Sheet write. A crash after SMTP acceptance but before persistence remains
blocked; absence of a Sent copy is not proof of rejection. Positive reconciliation
and manual operator controls need a separately reviewed production procedure.

## Mailforge protocol boundary and unsubscribe handling

`mailforge.server.ts` formats MIME and unsubscribe headers, validates headers,
requires a final DATA 250 response for acceptance, treats explicit SMTP rejection
as rejected and uncertainty as blocked. IMAP input maps UIDVALIDITY/UID event IDs,
In-Reply-To references and delivery-status records to replies/bounces; automatic
replies are ignored. `MockMailforgeMailbox` provides deterministic domain-level
fixtures. `MailforgeFixtureAdapter` separately tests the SMTP/IMAP protocol boundary
through an injected fixture driver. Neither opens sockets or accepts live mode.

Signed unsubscribe tokens scope a send to its customer. GET does not suppress
(avoids scanner-triggered opt-outs); POST verifies the token and durably suppresses
business and recipient before reporting success. The in-process HTTP handler is
tested but not exposed on the deployed website. A production GET confirmation page
and POST route must be added in staging before activation. Tokens intentionally
do not expire during the required post-service opt-out window.

Reply opt-outs suppress; no reply is generated. Quoted outbound text is excluded
from matching to prevent the approved unsubscribe invitation from suppressing every
normal reply. Hard bounces/failures suppress and flag while retaining Yes after a
confirmed original send. Soft bounces flag without a new submission. Uncorrelated
actionable mailbox events pause for review rather than guessing a prospect.

## Production prerequisites — not implemented or activated

1. Customer-owned Mailforge account, external payment, domain/identity verification,
   SPF/DKIM/DMARC, sending-policy review and recorded customer authorization.
2. Real TLS SMTP/IMAP driver (no SMTP auto retries), secure credential entry,
   encryption, rotation, hostname configuration, DSN/MIME parsing and mailbox cursor
   handling. Provider Sent/log behavior must be measured, not assumed.
3. Google Sheets authorization and read/write adapter: exact schema checks, business
   identity revalidation, historical-contact import, upserts/read-back, no row-number
   identity, no added columns or changes to Milo. Production Google policy review
   remains part of enabling this data integration.
4. Bounded public-web fetch/search driver with SSRF protection, redirect checks,
   resource limits and attributable contact evidence. Treat page content as data.
5. Staging-only reviewed database migration, private runtime role, backups, tenancy,
   credential storage, outbound lock/reconciliation procedure and operator alerts.
6. Actual unsubscribe confirmation/POST route, suppression monitoring after expiry
   (at least 30 days after final send), customer-approved privacy/retention policy,
   sender postal address and advertising identification review.
7. Authenticated Vercel Cron composition: 15-minute ticks, bounded/fair customer
   batches, no reliance on exact scheduler delivery, global pause and health alarms.
   Operational tests must prove timeout and interruption recovery with real driver.
8. Separate approval for a controlled staging integration test. Restrict any SMTP
   test to one customer-owned allowlisted recipient. Never load prospect recipients
   or production Sheets during that test. No account creation, Stripe work, store
   checkout, production deployment, or prospect outreach is authorized here.

The $399 service price remains separate from customer Mailforge/domain charges.
Nothing in this implementation provisions or charges either service.
