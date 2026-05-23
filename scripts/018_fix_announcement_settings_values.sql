-- ============================================================
-- Line Coffee: Fix announcement settings in site_settings
-- ============================================================
-- Run manually in Supabase SQL Editor.
--
-- Problem: announcement_text is double-encoded and
-- announcement_active is stored as a JSON boolean instead
-- of a JSON string, causing the API to return active=false.
--
-- Fix: overwrite both keys with clean jsonb string values.
--   announcement_active = to_jsonb('true'::text)  → JSON string "true"
--   announcement_text   = to_jsonb('...'::text)   → JSON string without extra quotes
--
-- Safe to run on any DB state — only touches these 2 keys.
-- ============================================================

BEGIN;

UPDATE public.site_settings
SET
  value      = to_jsonb('🚀 توصيل مجاني على الطلبات فوق 200 ج'::text),
  updated_at = now()
WHERE key = 'announcement_text';

UPDATE public.site_settings
SET
  value      = to_jsonb('true'::text),
  updated_at = now()
WHERE key = 'announcement_active';

COMMIT;

-- ============================================================
-- Verification — expected output:
--   announcement_text   | "🚀 توصيل مجاني على الطلبات فوق 200 ج"
--   announcement_active | "true"
-- Both values must be JSON strings (shown with surrounding quotes
-- in the raw jsonb column view), NOT JSON booleans.
-- ============================================================

SELECT key, value, pg_typeof(value) AS jsonb_type
FROM public.site_settings
WHERE key IN ('announcement_text', 'announcement_active')
ORDER BY key;

SELECT 'announcement fix complete' AS status;
