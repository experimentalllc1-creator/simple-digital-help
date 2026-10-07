# Texas Milo v2.3

Florida v2.3 is the gold master. Only Texas is added: PD-ROOF-TX, Roofing Contractors, $99 USD one-time payment, 52 weeks from successful activation, Monday-Friday, in the morning, customer local time, up to five qualified prospects per scheduled workday when available. The shared spreadsheet, qualification, seven columns, installation, no contact-data collection and no outreach are unchanged.

## Files

Private server assets in `docs/Products/MILO/`:
- `Milo_TX_Roofing_Installation_Prompt_v2.3.txt`
- `Milo_TX_Roofing_Installation_Guide_v2.3.pdf`

The TXT is the Florida prompt with only Florida/Texas and product-code substitutions. The PDF copies the Florida illustrated guide with territory and TXT-filename substitutions, preserving all 15 pages and illustrations. No Texas video is created or delivered. Paid files remain Git-ignored and are explicitly allowed through the existing Vercel CLI upload rules and private route traces.

## Existing implementation extended

Texas is active in the existing Roofing Contractors region selector and discovery catalog. Florida and Texas can be purchased together in one $198 Checkout Session using their existing $99 Prices as separate line items. See `SALES_WORKERS_CHECKOUT.md` for basket metadata, validation and fulfillment.

Texas product page: `/products/milo-texas-roofing-contractors`. Its form and the Sales selector post `product=milo-texas-roofing-contractors` to the existing `/api/checkout/milo`. Bodyless legacy Florida requests still select Florida. Server validation permits only the two known assignments; prices, amounts and redirect URLs remain server-controlled.

Texas uses `STRIPE_MILO_TX_PRODUCT_ID` and `STRIPE_MILO_TX_PRICE_ID`. Florida continues to use its existing environment variables and objects. The same feature switches, Stripe account/mode, active Product/Price validation, USD 9900 amount per region, signature validation, verified paid session, delivery ledger, stored email snapshot, leases and idempotency apply. Webhooks validate every purchased assignment and deliver its corresponding files. Migration `003_milo_product_codes.sql` records all purchased codes in the existing session ledger.

Texas checkout returns to `/checkout/success/texas`, with a return link to Texas. Florida success/cancellation URLs, legacy handling and package hashes are unchanged.

## Stripe inspection and remaining launch actions

Read-only inspection on October 4, 2026 confirmed live Florida Product `prod_VLOrNcbMrvcBca` and Price `price_1UKi3rCzRwKdX10NQ1RmVZj1`: active, one_time, USD 9900, per_unit, tax_behavior unspecified. No active Texas product was found. No Stripe objects were created or changed and no deployment was performed.

After authorization, create the Texas Product using the Florida name and description with only Florida replaced by Texas, and create its active $99 USD one-time Price with the same billing/tax settings. Wire the resulting IDs into the two Texas variables locally and in the existing Vercel project/environment. Keep secrets in environment configuration. Recheck the live Florida objects before creation and reuse any correct Texas objects that already exist.

Before deployment: `npm test`, `npm run typecheck`, `npm run build:vercel`. Explicit deployment authorization remains required. After deployment, verify both region forms and the existing selector behavior. A real Texas purchase and clean installation must confirm payment/webhook/ledger/email receipt, exactly the Texas TXT and PDF, shared workspace reuse, qualification, weekday local-time schedule, first run and 52-week expiry. Do not submit payment without authorization.

## Local verification completed

All 34 tests passed, including Florida legacy/retry behavior and Texas checkout, cross-region rejection, correct attachments, duplicate-delivery suppression and ledger identity. TypeScript and the production build/package verification passed. Both private packages are included in checkout/webhook traces and absent from public/browser output. Browser checks passed for region selection, $99/$198 totals, product form routing, disabled future regions, Texas success return link, absence of Texas video and private-file 404s. All 15 Texas guide pages were rendered and visually reviewed, and extracted text matches the Florida guide after the specified substitutions. The original Florida TXT/PDF/video hashes remain unchanged.

Saved local checkout/delivery switches remain false. Browser checks used temporary process-only switches and blocked checkout submissions; no live session, payment or email was created. Temporary local servers were stopped.

## v2.3 scheduling release
Current packages use: "Monday-Friday, in the morning, customer local time." Prefer native flexible/daypart morning scheduling and native 52-week end dates; no exact execution time is promised. Installation verifies enabled status, a next run, correct customer timezone, correct service end date, and exactly one active task per Milo. Existing customer automations are not modified.

Outstanding v2.2 checkout sessions retain their approved v2.2 package, and stored delivery snapshots and idempotency keys are reused unchanged. No historical pending email is processed by this release operation. The hidden v2.2 video remains historical and is not delivered.
