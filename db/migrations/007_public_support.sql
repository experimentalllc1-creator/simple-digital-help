BEGIN;
CREATE TABLE IF NOT EXISTS milo_public_support_requests (
 id uuid PRIMARY KEY,
 fingerprint text NOT NULL,
 client_hash text NOT NULL,
 status text NOT NULL CHECK(status IN ('pending','sent','uncertain')),
 attempts integer NOT NULL DEFAULT 1,
 provider_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS milo_public_support_client_time ON milo_public_support_requests(client_hash,created_at);
CREATE INDEX IF NOT EXISTS milo_public_support_fingerprint_time ON milo_public_support_requests(fingerprint,created_at);
COMMIT;
