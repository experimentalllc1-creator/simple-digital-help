# Simple Digital Help

This recovery branch records the public source of the verified production website.
It does not enable deployments or modify any production service.

## Production baseline

- Deployment: `dpl_ssydftVoGc3o6V3ZJ7EsHayUxt5K`.
- Baseline inventory: 621 uploaded files.
- Public source and assets preserved here: 277 files, checked by SHA-256.
- Excluded: 343 private fulfillment files and the generated legacy installation video.
- See `docs/recovery/production-source-manifest.json` for the public file inventory.

The application source, layouts, product behavior, header navigation, footer links,
Sales video and final-frame poster match that production snapshot. Historical
GitHub documentation, tooling and tests are retained unless explicitly sanitized.
Schema migrations 004 and 005 and the current checkout/Sales regression tests are
included as reviewed development support; no migration has been executed against
any external database.

## Local verification

Install the locked dependencies with `npm ci`. No real credentials are required:

```sh
node scripts/verify-production-recovery.mjs
npm run typecheck
node --conditions=react-server --import tsx --test tests/checkout-journey.test.mjs tests/sales-checkout.test.mjs tests/email.test.mjs
```

The checkout tests use an embedded test database and mocked services. The email
tests mock the provider. Do not load a production environment file for tests.

## Full build and private assets

`npm run build:vercel` intentionally verifies private paid packages. A public
checkout alone cannot complete it: approved private files must first be
provisioned into the Git-ignored `docs/Products/MILO/` directory from an authorized
private backup. Asset verification generates the ignored legacy installation
video in `public/videos/`. Keep these files outside Git.

After authorized private provisioning, run `npm run build:vercel`. Environment
templates contain names and safe placeholders only; production secrets remain in
the existing secret manager/Vercel settings and are not part of this repository.
Customer/order data needs its separately managed database backup. This source
repository is not a database backup.

## Release policy

`vercel.json` retains `git.deploymentEnabled: false`. The recovery branch is not
merged into `main`, the Vercel project is not linked to GitHub, and no automation
is added. Any merge, deployment, infrastructure or visibility change requires
separate authorization.
