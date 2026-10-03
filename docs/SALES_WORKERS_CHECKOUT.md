# Sales hiring checkout

The category supports customer type/region assignments and once-per-customer
universal workers through src/lib/sales-order.ts. Only roofing/Florida is selectable.
First Contact and Follow-Up are coming soon; neither has sale-ready checkout here.

The hiring CTA is disabled. Existing /api/checkout/milo sells one fixed $99 Milo
v1.2 installation package and delivers approved files by email. It does not record
regions, universal workers, a shared workspace, or activation-based hiring terms.
The category does not submit hiring selections to that endpoint.

Remaining work before enabling hiring payments:
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
