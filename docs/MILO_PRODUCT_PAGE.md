# Milo product page — V1 presentation

Route: `/products/milo-florida-roofing-contractors`

## Navigation and scope

Breadcrumb: Sales & Growth / Find New Customers / Milo.
The category Featured Product and the matching Find New Customers selection continue
to link here. Direct visits work without completing the introductory video. That
shared introduction remains exclusively on Find New Customers; it is not repeated
on this product page. The homepage, category pages and other placeholders are unchanged.

## Approved presentation and layout

Title: Milo
Subtitle: Automated Prospect Discovery - Florida Roofing Contractors

Main message: **Five new prospects. Every working day.**

Milo searches for roofing contractors in Florida and adds their business information
to your Google spreadsheet, automatically, Monday through Friday.

No manual searching. No duplicate entries. No CRM required.

The responsive spreadsheet demonstration follows the main message. Asset:
`public/milo-spreadsheet-loop.mp4` (the supplied underscore-named file was renamed,
without changing its contents). It autoplays muted, loops, plays inline and has no
visible player controls. `public/milo-spreadsheet-poster.jpg` is a still extracted
from the same supplied video and serves as the poster and static error fallback.
Reduced-motion visitors see the static poster instead of the looping video.

Caption: Example of Milo populating a Google spreadsheet.

### Deliverables

Heading: Your prospect list, automatically updated.

Milo creates and maintains a Google spreadsheet containing the businesses he discovers.

Included fields: Business name, City, Website, Public business email, Phone number,
Date added, Contacted? (Yes/No).

Milo checks existing records before adding new businesses. His daily target is five
qualifying prospects with publicly available business email addresses.

### Purchase placeholder

Immediately after the demonstration and deliverables: one-time payment model,
“Price to be confirmed”, and a prominent disabled “Buy Now” button with the status
“Unavailable until checkout is ready.” No numeric price, purchase link, fake checkout,
payment handling or delivery behavior is implemented.

### Installation

Heading: What happens after purchase?

1. Receive Milo and his installation instructions.
2. Install Milo and connect your Google account.
3. Complete the first run and activate recurring prospect discovery.

These are the approved presentation steps, not verification of an implemented purchase
or installation service.

## Reuse

Identity and discovery matching remain in `src/lib/sales-catalog.ts`. Presentation
copy, demo paths, deliverables and installation steps are keyed by product slug in
`src/lib/milo-presentations.ts`. The shared `MiloProductPage` renders a catalog product
and its presentation; future Milo routes can reuse it with their own configuration.
Scoped CSS preserves the existing cream/dark-green store design without changing
homepage or category styling.

## Remaining commercial work — next phase

- Confirm the one-time price.
- Wire Stripe/checkout and activate Buy Now only when ready.
- Implement purchase fulfillment and delivery emails.
- Finalize installation materials and verify the real installation flow.
- Complete an end-to-end purchase test.

No production deployment is part of this milestone.
