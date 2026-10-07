# Milo - U.S. Building Materials Manufacturers

Product code: PD-BMM-US. One nationwide United States assignment using the existing Milo v2.4 checkout, fulfillment, durable delivery ledger, private attachment hashes, and shared spreadsheet architecture.

Price: $99 USD one-time. Service term: 52 weeks from successful activation. Schedule: once per week, Monday at 9:00 AM in the verified customer local timezone, including daylight-saving changes, with an enforced expiration. Volume: up to 2 new qualified manufacturers per run when available. The configured trigger is 9:00 AM; platform execution can occur later.

Require an official business website with evidence that the business itself manufactures building products or construction materials incorporated into residential, commercial, institutional, industrial, or infrastructure construction. Pure distributors, wholesalers, dealers, retailers, importers, sales agencies, contractors, installers, consultants, and service businesses are excluded unless their own qualifying manufacturing is clearly evidenced. No material preference or artificial quota filling; seek useful category and geographic diversity over time.

Nationwide duplicate checks cover the entire shared Prospects sheet regardless of Region or Customer Type, including aliases and official website domains. Branches and brands are not automatically separate businesses.

Prospects uses Date Added, Business Name, City, Region, Customer Type, Website, Contacted?, Email, Phone, Notes. Region is the verified U.S. headquarters or principal-location state, or blank if unverifiable. Customer Type is Building Materials Manufacturer. A:F are Milo-managed; G is initialized to No only at creation and customer-owned thereafter; H:J data cells, formulas, formatting, and validation are never modified. New writes target A:G only. Existing records, sheet/tab IDs, and existing Milo automations are preserved.

Private purchase delivery contains exactly:

- Milo_US_Building_Materials_Manufacturers_Installation_Prompt_v2.4.txt
- Milo_US_Building_Materials_Manufacturers_Illustrated_Installation_Guide_v2.4.pdf

The illustrated guide follows the existing 15-page Milo style, preserves relevant Google connection illustrations, and includes the manufacturer qualification, ten-column ownership, and weekly schedule. The pair is explicitly allowlisted for CLI upload and traced into checkout/webhook server functions. It is not served publicly. Historical v2.2/v2.3 packages and all prior v2.4 packages are unchanged. This product has no historical package and rejects historical-version purchase metadata.

The catalog card follows Projects & Developments. It uses one nationwide selection instead of regional variants and can be purchased alone or in a mixed Milo basket. The existing discovery filter also exposes the nationwide product. Individual purchases return to /checkout/success/manufacturers; mixed purchases retain the common success destination and separate two-attachment delivery emails.

Production variables added: STRIPE_MILO_BMM_US_PRODUCT_ID and STRIPE_MILO_BMM_US_PRICE_ID. Existing products, prices, credentials, feature switches, database schema, and pending delivery records remain unchanged. No customer task is created or changed by the store deployment.

Release evidence is saved under .qa/manufacturers. Production acceptance uses an unpaid $99 checkout probe with PD-BMM-US and version/release_version 2.4; that session is expired without submitting payment or triggering delivery email. Actual inbox delivery and scheduled task activation remain customer purchase/installation acceptance steps.

## Production release - October 7, 2026

Final deployment: dpl_6F1Jy5PHf2ktZUHSsU23bpA3HycV, production READY, assigned to https://www.simpledigitalhelp.com. Product page: /products/milo-us-building-materials-manufacturers.

Stripe Product prod_VOjnMbpGNvL1DI and Price price_1UNwJRCzRwKdX10NsfVNj74Y are active live objects for this product, one-time USD 9900. Only this product's two environment mappings were added.

- 159 Milo tests passed, with zero failures, skips, cancellations, or todo. Coverage includes the new manufacturer's single/mixed checkout, exact attachment isolation, retry and replay behavior, historical-version rejection, and existing Milo compatibility.
- Typecheck and the final local/Vercel production builds passed. Both server traces include the new pair; private content is absent from public files and browser bundles.
- All 15 guide pages were rendered and visually inspected; the final ten-column example uses the exact customer type and distinct fictional manufacturer identities/domains.
- All 194 pre-existing package files remain byte-for-byte unchanged, including historical v2.2/v2.3 and the 45 prior v2.4 pairs.
- All 46 production product pages and 92 private-file 404 checks passed. The manufacturer-specific success page, signed no-op webhook verification, and tampered/unsigned webhook rejection passed.
- Live unpaid checkout verified USD 9900, one quantity, PD-BMM-US, version/release_version 2.4, correct Product/Price and redirects. Verification sessions were expired; no payment was submitted or delivery email triggered.
- Desktop/mobile product UI and the live catalog selection were reviewed without overflow or console errors. The catalog audit divider was moved to a complete-row boundary so this card fills the position directly beside Projects & Developments. Nationwide selection shows $99 and enables the existing checkout form.
- Runtime error scan for the final deployment returned no error entries. Existing customer installations, schedules, spreadsheets, expiration dates, database schema, and historical delivery records were not changed.

Final evidence: tests-final.log, build-final.log, deploy-final.log, production-readiness.json, production-verification.log, runtime-errors.log, guide renders, product-desktop.png, product-mobile.png, and catalog-position.png under .qa/manufacturers. Initial logs contain resolved error-message assertions, the old common-success copy assertion, and the initial catalog-divider placement; final checks above reflect the corrected release.
