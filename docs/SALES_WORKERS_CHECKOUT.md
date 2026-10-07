# Sales hiring checkout

The Sales selector supports currently available Discovery assignments from
`src/lib/milo-assignments.ts`. Florida, Texas, California, Northeast, Southeast, Midwest, Southwest, Mountain West and Pacific Northwest roofing are available at $99 USD
each. First Contact, Follow-Up and unavailable regions remain disabled.

The form posts one `product` value per selected assignment to `/api/checkout/milo`.
Single regions use their existing Stripe Price as one line item; selecting multiple regions
uses their existing Prices in one Checkout Session ($198 for two, $297 for three, $396 for four, $495 for five, $594 for six, $693 for seven, $792 for eight, $891 for all nine). Prices and availability
are validated server-side. No Stripe objects or universal-worker charges are created.

Single-region metadata and redirects retain their existing behavior. Multi-region
sessions use `milo-discovery-regions` metadata containing all selected product
slugs and product codes, and return to `/checkout/success/regions`. The signed
webhook verifies every paid line item against the configured Price and Product,
including amount, quantity, currency and live/test mode.

Migration `003_milo_product_codes.sql` adds `product_codes` to the existing
ledger and backfills historical single-region rows. `product_code` retains the
first code for compatibility. One session keeps one durable record and lease. Each purchased Milo has its own email snapshot and idempotency key, with only its regional TXT and PDF. Successful regional sends are recorded before proceeding; retries skip completed regions and reuse pending snapshots. Single-region idempotency keys and attachments are preserved. Historical unsent combined snapshots require manual reconciliation.

Each installation retains its 52-week term, schedule, qualification and shared
spreadsheet instructions. Future regions need a registry entry, approved private
package and existing-pattern Stripe environment configuration. Checkout and
payment verification iterate over the registry.

Validation: `npm test`, `npm run typecheck`, `npm run build:vercel`, followed by
browser verification of single and combined hosted checkout without payment.
Apply `npm run db:migrate` before deploying the new handler.
