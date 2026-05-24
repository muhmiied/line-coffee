-- Line Coffee section media editor support.
-- Safe/idempotent: extends the existing banners table without dropping data.

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en text,
  title_ar text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'banners'
      AND policyname = 'Public read banners'
  ) THEN
    CREATE POLICY "Public read banners"
      ON public.banners
      FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'banners'
      AND policyname = 'Service role manage banners'
  ) THEN
    CREATE POLICY "Service role manage banners"
      ON public.banners
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE IF EXISTS public.banners
  ADD COLUMN IF NOT EXISTS subtitle_ar text NULL,
  ADD COLUMN IF NOT EXISTS subtitle_en text NULL,
  ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'banner',
  ADD COLUMN IF NOT EXISTS usage_area text DEFAULT 'banner',
  ADD COLUMN IF NOT EXISTS alt_en text NULL,
  ADD COLUMN IF NOT EXISTS alt_ar text NULL,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS section_key text NULL,
  ADD COLUMN IF NOT EXISTS slide_key text NULL,
  ADD COLUMN IF NOT EXISTS section_type text DEFAULT 'full_image_banner',
  ADD COLUMN IF NOT EXISTS button_text_ar text NULL,
  ADD COLUMN IF NOT EXISTS button_text_en text NULL,
  ADD COLUMN IF NOT EXISTS button_link text NULL,
  ADD COLUMN IF NOT EXISTS mobile_image_url text NULL,
  ADD COLUMN IF NOT EXISTS overlay_opacity numeric(4,2) DEFAULT 0.55,
  ADD COLUMN IF NOT EXISTS object_position text DEFAULT 'center center',
  ADD COLUMN IF NOT EXISTS starts_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.banners
SET
  section_key = COALESCE(section_key, usage_area, 'banner'),
  slide_key = COALESCE(slide_key, id::text),
  button_link = COALESCE(button_link, link_url),
  object_position = COALESCE(object_position, 'center center'),
  overlay_opacity = COALESCE(overlay_opacity, 0.55),
  section_type = COALESCE(section_type, media_type, 'full_image_banner'),
  updated_at = COALESCE(updated_at, now())
WHERE section_key IS NULL
   OR slide_key IS NULL
   OR button_link IS NULL
   OR object_position IS NULL
   OR overlay_opacity IS NULL
   OR section_type IS NULL
   OR updated_at IS NULL;

CREATE INDEX IF NOT EXISTS banners_section_key_idx
  ON public.banners (section_key);

CREATE INDEX IF NOT EXISTS banners_usage_area_idx
  ON public.banners (usage_area);

CREATE INDEX IF NOT EXISTS banners_active_sort_idx
  ON public.banners (is_active, sort_order);

CREATE OR REPLACE FUNCTION public.update_banners_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_banners_updated_at ON public.banners;
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_banners_updated_at();

NOTIFY pgrst, 'reload schema';
