BEGIN;
ALTER TABLE sales_audit_orders ALTER COLUMN audit_id DROP NOT NULL;
ALTER TABLE sales_audit_orders ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'audit' CHECK(source IN ('audit','storefront'));
CREATE UNIQUE INDEX IF NOT EXISTS milo_one_pending_customer_order ON sales_audit_orders(email,livemode) WHERE status='pending';
CREATE TABLE IF NOT EXISTS milo_customer_sessions (
 id uuid PRIMARY KEY, email text NOT NULL, livemode boolean NOT NULL,
 verified_at timestamptz, challenge_sent_at timestamptz, expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS milo_customer_session_identity ON milo_customer_sessions(email,livemode,created_at);
CREATE TABLE IF NOT EXISTS milo_customer_profiles (
 email text NOT NULL, livemode boolean NOT NULL, stripe_customer_id text NOT NULL UNIQUE,
 PRIMARY KEY(email,livemode)
);
COMMIT;
