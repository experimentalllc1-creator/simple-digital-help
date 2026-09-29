CREATE TABLE IF NOT EXISTS milo_deliveries (
  session_id text PRIMARY KEY,
  payment_intent_id text NOT NULL UNIQUE,
  livemode boolean NOT NULL,
  recipient text NOT NULL,
  -- Snapshot exact email/attachment bytes so retries survive code/file changes.
  message jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'manual_review')),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_attempt_at timestamptz,
  lease_until timestamptz,
  lease_token uuid,
  attempts integer NOT NULL DEFAULT 0,
  resend_id text,
  sent_at timestamptz,
  CHECK (status <> 'sent' OR (resend_id IS NOT NULL AND sent_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS milo_deliveries_status ON milo_deliveries (status, created_at);
