-- Non-destructive contact messages inbox for admin dashboard.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS message text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unread',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contact_messages_status_check'
      AND conrelid = 'contact_messages'::regclass
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_status_check
      CHECK (status IN ('unread', 'read', 'replied')) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON contact_messages(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created
  ON contact_messages(created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contact_messages'
      AND policyname = 'Service role manage contact messages'
  ) THEN
    CREATE POLICY "Service role manage contact messages"
      ON contact_messages
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
