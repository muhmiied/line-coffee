-- ============================================================
-- Line Coffee: Seed free shipping threshold setting
-- ============================================================
-- Run manually in Supabase SQL Editor.
--
-- Touches only: public.site_settings.
-- Stores values as TEXT-compatible strings.
-- Does not touch products, checkout data, users, profiles, or catalog tables.
-- ============================================================

BEGIN;

INSERT INTO public.site_settings (key, value)
VALUES
  ('free_shipping_threshold', '200'),
  ('free_shipping_active', 'true')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT key, value
FROM public.site_settings
WHERE key IN ('free_shipping_threshold', 'free_shipping_active')
ORDER BY key;
