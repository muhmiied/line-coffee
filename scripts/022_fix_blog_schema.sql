-- Line Coffee Blog schema reconciliation
-- Run this script manually in Supabase SQL Editor.
-- Canonical table: public.blog_posts
-- Safe behavior: no deletes, no truncates, no overwrite of existing blog_posts rows.

BEGIN;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  content_ar text,
  content_en text,
  excerpt_ar text,
  excerpt_en text,
  cover_image text,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS excerpt_ar text,
  ADD COLUMN IF NOT EXISTS excerpt_en text,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title_ar text,
  ADD COLUMN IF NOT EXISTS seo_title_en text,
  ADD COLUMN IF NOT EXISTS seo_description_ar text,
  ADD COLUMN IF NOT EXISTS seo_description_en text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_attribute att
      ON att.attrelid = con.conrelid
     AND att.attnum = ANY (con.conkey)
    WHERE con.conrelid = 'public.blog_posts'::regclass
      AND con.contype = 'u'
      AND att.attname = 'slug'
  )
  AND to_regclass('public.blog_posts_slug_unique') IS NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.blog_posts
      WHERE slug IS NOT NULL
      GROUP BY slug
      HAVING COUNT(*) > 1
    ) THEN
      RAISE NOTICE 'Skipped unique slug index because duplicate blog_posts.slug values exist.';
    ELSE
      CREATE UNIQUE INDEX blog_posts_slug_unique
        ON public.blog_posts (slug);
    END IF;
  END IF;
END $$;

UPDATE public.blog_posts
SET
  sort_order = COALESCE(sort_order, 0),
  published_at = CASE
    WHEN is_published = true AND published_at IS NULL THEN COALESCE(created_at, now())
    ELSE published_at
  END,
  updated_at = COALESCE(updated_at, now())
WHERE sort_order IS NULL
   OR updated_at IS NULL
   OR (is_published = true AND published_at IS NULL);

-- Keep legacy public.blogs data available by copying only missing slugs
-- into the canonical table. Existing blog_posts rows are not overwritten.
DO $$
BEGIN
  IF to_regclass('public.blogs') IS NOT NULL THEN
    INSERT INTO public.blog_posts (
      slug,
      title_ar,
      title_en,
      content_ar,
      content_en,
      excerpt_ar,
      excerpt_en,
      cover_image,
      is_published,
      published_at,
      created_at,
      updated_at
    )
    SELECT
      b.slug,
      b.title_ar,
      b.title_en,
      b.content_ar,
      b.content_en,
      b.excerpt_ar,
      b.excerpt_en,
      b.cover_image,
      COALESCE(b.is_published, false),
      b.published_at,
      COALESCE(b.created_at, now()),
      COALESCE(b.updated_at, now())
    FROM public.blogs b
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role manage blog_posts" ON public.blog_posts;

CREATE POLICY "Public read published blog_posts"
  ON public.blog_posts
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Service role manage blog_posts"
  ON public.blog_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DO $$
BEGIN
  IF to_regprocedure('public.update_updated_at()') IS NULL
    AND to_regprocedure('public.update_updated_at_column()') IS NULL THEN
    CREATE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$;
  END IF;
END $$;

DO $$
DECLARE
  trigger_function text;
BEGIN
  trigger_function := CASE
    WHEN to_regprocedure('public.update_updated_at()') IS NOT NULL
      THEN 'public.update_updated_at()'
    ELSE
      'public.update_updated_at_column()'
  END;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_blog_posts_updated_at'
      AND tgrelid = 'public.blog_posts'::regclass
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION %s',
      trigger_function
    );
  END IF;
END $$;

COMMIT;

-- Verification queries
SELECT 'blog_posts columns ready' AS status;

SELECT
  COUNT(*) AS total_posts,
  COUNT(*) FILTER (WHERE is_published = true) AS published_posts,
  COUNT(*) FILTER (WHERE is_published = false) AS draft_posts
FROM public.blog_posts;

SELECT
  slug,
  title_en,
  title_ar,
  is_published,
  published_at,
  sort_order
FROM public.blog_posts
ORDER BY sort_order ASC, published_at DESC NULLS LAST, created_at DESC;
