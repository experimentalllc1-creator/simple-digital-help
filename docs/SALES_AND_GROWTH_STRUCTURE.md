# Sales & Growth structure — V2

## Approved navigation

Homepage `/` → Sales & Growth `/categories/sales` → Find New Customers
`/categories/sales/find-new-customers` → Milo
`/products/milo-florida-roofing-contractors`.

The approved homepage, iceberg asset, copy, layout, global stylesheet and all other
category/product concepts remain unchanged. Only the sales branch of the existing
category route uses the new dedicated page. Simple Digital Help offers practical
digital solutions; the category is not restricted to automation.

## Category content

Reuse `public/images/categories/sales-growth-iceberg.webp` for the fuller explanation:
A is the market already served; B is actively pursued; C is the much larger market
barely reached or not reached at all. Products help reach more opportunities and
develop them consistently.

Under “What do you need help with?”, Find New Customers is active. Contact & Follow Up
and Quotes & Proposals are non-clickable future placeholders. A Featured Product
section follows these choices and links directly to the published Milo destination;
it does not replace the subcategory navigation.

## Data and expansion

`src/lib/sales-catalog.ts` holds routes, industry/region options, video configuration
and discovery variations. Only entries with `status: "published"` are exposed by the
selector. Published here means a viewable product destination, not purchasability.
Only Roofing Contractors + Florida is currently published. Keep drafts unpublished,
create their destination pages before publishing, and add future variations here.
The original `src/lib/catalog.ts` remains unchanged to preserve approved placeholders.

## Superseded guidance

Any earlier instruction placing the introductory video on Milo's product page is
superseded. The shared introduction belongs only on Find New Customers. See
`FIND_NEW_CUSTOMERS.md` and `MILO_PRODUCT_PAGE.md`.

No pricing, checkout, payment integration, delivery emails or deployment is included.

## Verification

Production build and standalone TypeScript validation passed. Browser verification
covered homepage → category → subcategory → product, native video completion,
returning-visitor completion, all 20 industry/region combinations, direct product
entry, and responsive layouts at 390px, 768px and desktop. The approved homepage,
global CSS, iceberg asset and original catalog were unchanged. The sandbox blocks
the existing external Google Fonts request; fallback fonts remain usable.
