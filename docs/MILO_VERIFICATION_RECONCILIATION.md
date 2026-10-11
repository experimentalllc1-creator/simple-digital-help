# Approved Milo morning scheduling verification

On October 11, 2026, the owner confirmed that removing fixed 9:00 AM
scheduling in favor of flexible local morning scheduling was an approved
product decision. The current customer installation packages implement that
decision. Earlier release records and test snapshots describing fixed triggers
are historical, and must not be used to restore fixed-hour behavior.

The affected earlier preservation snapshots cover eleven assignments:
Manufacturers (one nationwide), Production Homebuilders & Developers (one
nationwide), and Property Management Companies (nine existing regions). The
twenty-two approved TXT/PDF files are unchanged by this verification repair.
`tests/fixtures/milo-approved-morning-baseline.json` retains each prior and
approved SHA-256 pin, plus the revised email and source snapshot pins. Other
package pins, assignments, prices, Stripe mappings, and delivery rules are not
rebased. The other 108 captured delivery messages retain their exact hashes.

The Manufacturers production verifier now requires Monday recurrence and the
approved flexible local-morning copy, and rejects a fixed 9:00 AM promise. New
regression checks cover all eleven affected assignments, exact package bytes,
weekdays, flexible scheduling, timezone/daylight-saving handling, original
52-week expiration, and preservation of existing customer automations. Existing
qualification, limits, geography, checkout, replay, and attachment-isolation
assertions remain in place.

The original 87 failures had three shared causes: 76 email encoding assertions
(75 subjects and one complete-message snapshot), nine package preservation
assertions using pre-approval pins, and two PGlite persistence failures in the
restricted execution environment. An unchanged full rerun outside that
environment passed both persistence tests and reported 332 passes and the 85
remaining encoding/preservation failures. No persistence assertion is skipped
or relaxed. The encoding repair replaces malformed dash sequences in email
source with explicit Unicode escapes; it does not change schedules, prices,
attachments, recipient selection, or delivery idempotency.

Reconciliation is limited to the explicitly approved scheduling snapshots.
Historical package files and old pins remain available for audit. Full-suite
and production verification results are captured under
`.qa/verification-diagnostics/`; deployment proceeds only after those gates pass.
