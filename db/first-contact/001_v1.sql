-- Separate, additive schema. Never run via the Milo migration runner.
CREATE TABLE IF NOT EXISTS fc_customers (
  id text PRIMARY KEY,
  execution_mode text NOT NULL DEFAULT 'fixture' CHECK (execution_mode = 'fixture'),
  country text NOT NULL DEFAULT 'US' CHECK (country = 'US'),
  price_cents integer NOT NULL DEFAULT 39900 CHECK (price_cents = 39900),
  timezone text NOT NULL,
  mailbox text NOT NULL,
  sheet_id text NOT NULL,
  message jsonb NOT NULL,
  approval_hash text NOT NULL,
  approved_at timestamptz NOT NULL,
  activated_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  daily_cap integer NOT NULL DEFAULT 5 CHECK (daily_cap > 0),
  cap_approved_at timestamptz,
  paused boolean NOT NULL DEFAULT false,
  pause_reason text,
  CHECK (expires_at = activated_at + interval '8736 hours'),
  CHECK (daily_cap <= 5 OR cap_approved_at IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS fc_sends (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES fc_customers(id),
  business_key text NOT NULL,
  recipient text NOT NULL,
  prospect jsonb NOT NULL,
  source_url text NOT NULL,
  source_checked_at timestamptz NOT NULL,
  message jsonb NOT NULL,
  approval_hash text NOT NULL,
  message_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('reserved','sending','accepted','unknown','rejected')),
  reserved_at timestamptz NOT NULL,
  blocked_until timestamptz NOT NULL,
  accepted_at timestamptz,
  smtp_reference text,
  sheet_synced boolean NOT NULL DEFAULT false,
  UNIQUE(customer_id,business_key),
  UNIQUE(customer_id,recipient),
  CHECK (status <> 'accepted' OR (accepted_at IS NOT NULL AND smtp_reference IS NOT NULL)),
  CHECK (NOT sheet_synced OR status = 'accepted')
);
CREATE UNIQUE INDEX IF NOT EXISTS fc_business_identity ON fc_sends(
  customer_id, lower(regexp_replace(prospect->>'businessName','[^a-zA-Z0-9]','','g')),
  lower(regexp_replace(prospect->>'city','[^a-zA-Z0-9]','','g'))
);
CREATE TABLE IF NOT EXISTS fc_daily_usage (
  customer_id text NOT NULL REFERENCES fc_customers(id),
  local_day date NOT NULL,
  reserved_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY(customer_id,local_day)
);
CREATE TABLE IF NOT EXISTS fc_suppressions (
  customer_id text NOT NULL REFERENCES fc_customers(id),
  kind text NOT NULL CHECK (kind IN ('business','recipient')),
  value text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL,
  PRIMARY KEY(customer_id,kind,value)
);
CREATE TABLE IF NOT EXISTS fc_exceptions (
  customer_id text NOT NULL REFERENCES fc_customers(id),
  business_key text NOT NULL,
  issue text NOT NULL,
  prospect jsonb NOT NULL,
  flagged_at timestamptz NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  sheet_synced boolean NOT NULL DEFAULT false,
  PRIMARY KEY(customer_id,business_key,issue)
);
CREATE TABLE IF NOT EXISTS fc_mail_events (
  customer_id text NOT NULL REFERENCES fc_customers(id),
  event_id text NOT NULL,
  event jsonb NOT NULL,
  processed_at timestamptz,
  PRIMARY KEY(customer_id,event_id)
);

-- One transaction locks the customer's quota, checks suppressions, and reserves
-- BOTH identities. Concurrent runs and other regions cannot overshoot the cap.
CREATE OR REPLACE FUNCTION fc_reserve(
  p_customer text, p_id text, p_business text, p_recipient text,
  p_prospect jsonb, p_source text, p_message jsonb, p_hash text,
  p_message_id text, p_now timestamptz
) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE c fc_customers%ROWTYPE; d date; n integer;
BEGIN
  SELECT * INTO c FROM fc_customers WHERE id=p_customer FOR UPDATE;
  IF NOT FOUND OR c.paused OR p_now < c.activated_at OR p_now >= c.expires_at
     OR c.approval_hash <> p_hash THEN RETURN false; END IF;
  d := (p_now AT TIME ZONE c.timezone)::date;
  IF extract(isodow FROM d) > 5 THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM fc_suppressions WHERE customer_id=p_customer AND
     ((kind='business' AND value=p_business) OR (kind='recipient' AND value=p_recipient)))
     THEN RETURN false; END IF;
  INSERT INTO fc_daily_usage VALUES(p_customer,d,0) ON CONFLICT DO NOTHING;
  SELECT reserved_count INTO n FROM fc_daily_usage WHERE customer_id=p_customer AND local_day=d;
  IF n >= c.daily_cap THEN RETURN false; END IF;
  INSERT INTO fc_sends VALUES(p_id,p_customer,p_business,p_recipient,p_prospect,
    p_source,p_now,p_message,p_hash,p_message_id,'reserved',p_now,
    p_now + interval '5 minutes',NULL,NULL,false) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE fc_daily_usage SET reserved_count=reserved_count+1 WHERE customer_id=p_customer AND local_day=d;
  RETURN true;
END $$;

-- No browser access. Runtime uses a private PostgreSQL role; production grant
-- design is required before this fixture-only schema is promoted.
ALTER TABLE fc_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_mail_events ENABLE ROW LEVEL SECURITY;
