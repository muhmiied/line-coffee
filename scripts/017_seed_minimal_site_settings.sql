-- ============================================================
-- Line Coffee: Seed minimal site_settings
-- ============================================================
-- Run manually in Supabase SQL Editor.
--
-- Touches only: site_settings.
-- Does not touch products, categories, users, or any other table.
-- Insert/update safe — idempotent via ON CONFLICT(key).
--
-- Schema (from supabase/migrations/008_schema_reconciliation.sql):
--   id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   key        text UNIQUE NOT NULL
--   value      jsonb NOT NULL DEFAULT '{}'
--   created_at timestamptz DEFAULT now()
--   updated_at timestamptz DEFAULT now()
--
-- Keys actually read by code (confirmed from source):
--   wa_phone           → /api/contact, /api/admin/settings/whatsapp
--   wa_apikey          → /api/admin/settings/whatsapp, /api/admin/whatsapp/send
--   announcement_text  → /api/settings/announcement
--   announcement_active→ /api/settings/announcement  (stored as string 'true'/'false')
--   custom_blend_beans → /api/customization-options, /api/admin/customization-options
--                        (code falls back to hardcoded defaults if key is missing)
--
-- Keys NOT read from DB (hardcoded in lib/config/customization.ts):
--   packaging_cost, valve_bag_cost, profit_margin, max_flavors
--   contact_email, currency, free_shipping_threshold
-- ============================================================

BEGIN;

INSERT INTO public.site_settings (key, value, created_at, updated_at)
VALUES

  -- WhatsApp phone used by /api/contact and /api/admin/settings/whatsapp.
  -- Stored as jsonb string so Supabase JS returns a plain string.
  -- normalizePhone() strips non-digits → 201004761171 → wa.me/201004761171
  (
    'wa_phone',
    to_jsonb('+201004761171'::text),
    now(),
    now()
  ),

  -- WhatsApp CallMeBot API key for direct WA message API.
  -- Leave empty until a CallMeBot key is obtained.
  -- The app gracefully skips WA sending when this is empty.
  (
    'wa_apikey',
    to_jsonb(''::text),
    now(),
    now()
  ),

  -- Announcement bar text shown at the top of the site.
  -- /api/settings/announcement returns this as { text, active }.
  (
    'announcement_text',
    to_jsonb('🚀 توصيل مجاني على الطلبات فوق 200 ج'::text),
    now(),
    now()
  ),

  -- Announcement bar active flag.
  -- IMPORTANT: stored as the STRING 'true', NOT boolean true.
  -- Code checks: get('announcement_active') === 'true'
  (
    'announcement_active',
    to_jsonb('true'::text),
    now(),
    now()
  )

ON CONFLICT (key) DO UPDATE SET
  value      = EXCLUDED.value,
  updated_at = now();

NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================
-- Verification queries
-- ============================================================

-- Show all seeded site_settings rows.
SELECT key, value, updated_at
FROM public.site_settings
ORDER BY key;

-- Confirm announcement settings (should show text + 'true' string).
SELECT key, value
FROM public.site_settings
WHERE key IN ('announcement_text', 'announcement_active');

-- Confirm WhatsApp/contact settings (wa_phone should show number string).
SELECT key, value
FROM public.site_settings
WHERE key IN ('wa_phone', 'wa_apikey');

SELECT 'site_settings seed complete' AS status;
