CREATE TABLE IF NOT EXISTS sales_audits (
 id uuid PRIMARY KEY, checkout_id text UNIQUE, payment_intent_id text UNIQUE,
 email text, livemode boolean NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','refunded')),
 answers jsonb, report jsonb, delivered_at timestamptz, credit_expires_at timestamptz, credit_used_order uuid,
 refund_status text NOT NULL DEFAULT 'none' CHECK(refund_status IN ('none','approval_required','completed')),
 booking_status text NOT NULL DEFAULT 'not_booked', booking_url text, booking_reference text,
 consultant_id text NOT NULL DEFAULT 'owner', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sales_audit_orders (
 id uuid PRIMARY KEY, audit_id uuid NOT NULL REFERENCES sales_audits(id), email text NOT NULL,
 livemode boolean NOT NULL, checkout_id text UNIQUE, payment_intent_id text UNIQUE,
 quote jsonb NOT NULL, products jsonb NOT NULL, status text NOT NULL DEFAULT 'pending'
 CHECK(status IN ('pending','paid','expired','refunded','cancelled')), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_audit_orders_identity ON sales_audit_orders(email,livemode,status);
CREATE UNIQUE INDEX IF NOT EXISTS sales_audit_one_pending ON sales_audit_orders(audit_id) WHERE status='pending';
CREATE TABLE IF NOT EXISTS sales_audit_ownership_exclusions (
 payment_intent_id text PRIMARY KEY, reason text NOT NULL, full_refund boolean NOT NULL DEFAULT false, recorded_at timestamptz NOT NULL DEFAULT now()
);
