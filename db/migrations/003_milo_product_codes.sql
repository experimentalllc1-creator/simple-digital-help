BEGIN;
-- Nullable for compatibility with the previous handler during deployment.
-- Historical single-region orders retain their original product_code/message/status.
ALTER TABLE milo_deliveries ADD COLUMN IF NOT EXISTS product_codes text[];
UPDATE milo_deliveries SET product_codes = ARRAY[product_code] WHERE product_codes IS NULL;
COMMIT;
