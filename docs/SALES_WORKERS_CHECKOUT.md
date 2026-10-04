# Sales hiring checkout

The category supports customer type/region assignments and once-per-customer
universal workers through src/lib/sales-order.ts. Only roofing/Florida is selectable.
First Contact and Follow-Up are coming soon; neither has sale-ready checkout here.

The hiring CTA posts to the existing /api/checkout/milo only for Roofing Contractors + Florida with no additional selections, and only when both existing Milo feature flags are enabled. Empty, Coming Soon, mixed or unsupported selections remain blocked with explanatory status text. Coming Soon selectors remain disabled.

Existing /api/checkout/milo sells one fixed $99 Milo
v2.2 installation package (PD-ROOF-FL), delivers only the prompt and illustrated guide as email attachments. The hidden installation-video page remains in the site but is not part of active fulfillment. It does not record
regions, universal workers, a shared workspace, or activation-based hiring terms.
The category uses the existing fixed-package checkout, without introducing multi-agent charges, changing PD-ROOF-FL / 2.2 metadata or changing fulfillment.

Remaining work before enabling broader multi-agent hiring payments:
- Configure verified Stripe products/prices for hiring assignments and ready
  universal workers, using the existing Stripe client and same-origin protection.
- Validate availability and calculate totals server-side. Persist customer and
  shared workspace identity, craft/region assignments, universal flags and term.
- Resolve returning customers to their existing workspace and active universal
  workers so adding a region does not charge for those workers again.
- Create validated Checkout line items with a durable order reference; extend the
  signed webhook and idempotent fulfillment to recognize hiring orders separately
  from legacy installation-package delivery.
- Persist successful activation and 52-week expiry for each assignment/worker;
  verify real payment and activation before enabling the hiring CTA.

No new Stripe objects, charges, workspace schema or runtime are created here.
The order builder rejects unavailable configurations, deduplicates assignments
and universal workers, and exposes the full future order payload. Client totals
are not payment authority.
