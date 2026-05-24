-- Line Coffee visual website content builder support.
-- Safe/idempotent: adds flexible content/layout fields for section editing without dropping data.

ALTER TABLE IF EXISTS public.banners
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS layout jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS animation_type text DEFAULT 'fade',
  ADD COLUMN IF NOT EXISTS animation_duration integer DEFAULT 6000,
  ADD COLUMN IF NOT EXISTS device_visibility jsonb DEFAULT '{"desktop": true, "tablet": true, "mobile": true}'::jsonb;

UPDATE public.banners
SET
  content = COALESCE(content, '{}'::jsonb),
  layout = COALESCE(layout, '{}'::jsonb),
  animation_type = COALESCE(animation_type, 'fade'),
  animation_duration = COALESCE(animation_duration, 6000),
  device_visibility = COALESCE(device_visibility, '{"desktop": true, "tablet": true, "mobile": true}'::jsonb)
WHERE content IS NULL
   OR layout IS NULL
   OR animation_type IS NULL
   OR animation_duration IS NULL
   OR device_visibility IS NULL;

CREATE INDEX IF NOT EXISTS banners_content_gin_idx
  ON public.banners USING gin (content);

CREATE INDEX IF NOT EXISTS banners_layout_gin_idx
  ON public.banners USING gin (layout);

CREATE INDEX IF NOT EXISTS banners_section_active_sort_idx
  ON public.banners (section_key, is_active, sort_order);

NOTIFY pgrst, 'reload schema';
