BEGIN;
ALTER TABLE milo_customer_profiles ALTER COLUMN stripe_customer_id DROP NOT NULL;
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS id text NOT NULL DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX IF NOT EXISTS milo_profile_id ON milo_customer_profiles(id);
-- One production identity per mailbox. Test transactions use a separate database.
CREATE UNIQUE INDEX IF NOT EXISTS milo_profile_email ON milo_customer_profiles(email);
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS registered_at timestamptz;
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS permission_invited_at timestamptz;
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;
ALTER TABLE milo_customer_profiles ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz;
CREATE TABLE IF NOT EXISTS milo_auth_sessions (
 id text PRIMARY KEY, "expiresAt" timestamptz NOT NULL, token text NOT NULL UNIQUE,
 "createdAt" timestamptz NOT NULL, "updatedAt" timestamptz NOT NULL,
 "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES milo_customer_profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS milo_auth_session_user ON milo_auth_sessions("userId");
CREATE TABLE IF NOT EXISTS milo_auth_accounts (
 id text PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL,
 "userId" text NOT NULL REFERENCES milo_customer_profiles(id) ON DELETE CASCADE,
 "accessToken" text, "refreshToken" text, "idToken" text,
 "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz,
 scope text, password text, "createdAt" timestamptz NOT NULL, "updatedAt" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS milo_auth_account_user ON milo_auth_accounts("userId");
CREATE TABLE IF NOT EXISTS milo_auth_verifications (
 id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL,
 "expiresAt" timestamptz NOT NULL, "createdAt" timestamptz NOT NULL, "updatedAt" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS milo_auth_verification_identifier ON milo_auth_verifications(identifier);
CREATE TABLE IF NOT EXISTS milo_auth_rate_limits (id text PRIMARY KEY, key text UNIQUE NOT NULL, count integer NOT NULL, "lastRequest" bigint NOT NULL);
CREATE TABLE IF NOT EXISTS milo_purchases (
 session_id text PRIMARY KEY, payment_intent_id text UNIQUE NOT NULL,
 customer_id text NOT NULL REFERENCES milo_customer_profiles(id), livemode boolean NOT NULL,
 delivery_id text NOT NULL, purchased_at timestamptz NOT NULL,
 amount_paid integer NOT NULL CHECK(amount_paid>=0), subtotal integer NOT NULL CHECK(subtotal>=0),
 currency text NOT NULL, discount_amount integer NOT NULL DEFAULT 0,
 discounts jsonb NOT NULL DEFAULT '[]', items jsonb NOT NULL,
 status text NOT NULL DEFAULT 'paid' CHECK(status IN ('paid','partially_refunded','refunded','cancelled')),
 refunded_amount integer NOT NULL DEFAULT 0 CHECK(refunded_amount>=0),
 recorded_at timestamptz NOT NULL DEFAULT now(), recommendation_click_id uuid
);
CREATE INDEX IF NOT EXISTS milo_purchase_customer ON milo_purchases(customer_id,livemode,purchased_at DESC);
CREATE TABLE IF NOT EXISTS milo_purchase_refunds (
 payment_intent_id text PRIMARY KEY, amount integer NOT NULL CHECK(amount>=0), full_refund boolean NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS milo_consent_events (
 id text PRIMARY KEY, customer_id text NOT NULL REFERENCES milo_customer_profiles(id),
 granted boolean NOT NULL, source text NOT NULL, wording_version text NOT NULL, wording text NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS milo_recommendation_clicks (
 id uuid PRIMARY KEY, customer_id text NOT NULL REFERENCES milo_customer_profiles(id),
 slug text NOT NULL, rule_version text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS milo_support_requests (
 id text PRIMARY KEY, customer_id text NOT NULL REFERENCES milo_customer_profiles(id),
 session_id text NOT NULL REFERENCES milo_purchases(session_id), product_code text NOT NULL,
 release_version text NOT NULL, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 emailed_at timestamptz
);
COMMIT;
