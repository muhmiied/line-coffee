-- ============================================================
-- Line Coffee: Seed Nescafe products only
-- ============================================================
-- Run manually in Supabase SQL Editor.
--
-- Touches only: products, product_sizes (nescafe category only).
-- Does not touch any other category, table, or user data.
-- Insert/update safe — runs cleanly on both empty and seeded DBs.
--
-- Schema used (confirmed from 013 run):
--   products: slug, name_en, name_ar, description_en, description_ar,
--     short_description_en, short_description_ar, category_id, images,
--     origin, roast_level, flavor_notes, is_featured, is_best_seller,
--     is_new, is_visible, stock_quantity, low_stock_threshold, created_at
--   product_sizes: product_id, size, price, is_available
-- ============================================================

BEGIN;

WITH nescafe_products (
  sort_index,
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  short_description_en,
  short_description_ar,
  roast_level,
  flavor_notes,
  is_featured,
  is_best_seller,
  is_new,
  price_250,
  price_500,
  price_1000
) AS (
  VALUES
    (
      7001,
      'classic-nescafe',
      'Nescafe Classic',
      'نسكافيه كلاسيك',
      'The original instant coffee — rich and satisfying every time.',
      'النسكافيه الكلاسيك الأصلي بطعم غني ومُرضي كل مرة.',
      'Nescafe Classic instant coffee.',
      'نسكافيه كلاسيك أصلي.',
      'medium',
      ARRAY['Classic', 'Rich']::text[],
      true,
      true,
      false,
      250::numeric,
      500::numeric,
      1000::numeric
    ),
    (
      7002,
      'gold-nescafe',
      'Nescafe Gold',
      'نسكافيه جولد',
      'Premium gold-blend instant coffee — smoother, more refined, and aromatic.',
      'نسكافيه جولد فاخر بطعم أنعم وأكثر رقيًا ورائحة مميزة.',
      'Nescafe Gold instant coffee.',
      'نسكافيه جولد فاخر.',
      'medium',
      ARRAY['Premium', 'Smooth', 'Aromatic']::text[],
      false,
      false,
      true,
      300::numeric,
      600::numeric,
      1200::numeric
    )
),
upserted AS (
  INSERT INTO public.products (
    slug,
    name_en,
    name_ar,
    description_en,
    description_ar,
    short_description_en,
    short_description_ar,
    category_id,
    images,
    origin,
    roast_level,
    flavor_notes,
    is_featured,
    is_best_seller,
    is_new,
    is_visible,
    stock_quantity,
    low_stock_threshold,
    created_at
  )
  SELECT
    p.slug,
    p.name_en,
    p.name_ar,
    p.description_en,
    p.description_ar,
    p.short_description_en,
    p.short_description_ar,
    c.id,
    ARRAY['https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800']::text[],
    NULL::text,
    p.roast_level,
    p.flavor_notes,
    p.is_featured,
    p.is_best_seller,
    p.is_new,
    true,
    100,
    10,
    timestamptz '2026-01-01 00:00:00+00' - (p.sort_index::double precision * interval '1 second')
  FROM nescafe_products p
  JOIN public.categories c ON c.slug = 'nescafe'
  ON CONFLICT (slug) DO UPDATE SET
    name_en             = EXCLUDED.name_en,
    name_ar             = EXCLUDED.name_ar,
    description_en      = EXCLUDED.description_en,
    description_ar      = EXCLUDED.description_ar,
    short_description_en = EXCLUDED.short_description_en,
    short_description_ar = EXCLUDED.short_description_ar,
    category_id         = EXCLUDED.category_id,
    images              = EXCLUDED.images,
    roast_level         = EXCLUDED.roast_level,
    flavor_notes        = EXCLUDED.flavor_notes,
    is_featured         = EXCLUDED.is_featured,
    is_best_seller      = EXCLUDED.is_best_seller,
    is_new              = EXCLUDED.is_new,
    is_visible          = true,
    stock_quantity      = EXCLUDED.stock_quantity,
    low_stock_threshold = EXCLUDED.low_stock_threshold,
    created_at          = EXCLUDED.created_at
  RETURNING id, slug
),
product_refs AS (
  SELECT id, slug FROM upserted
  UNION
  SELECT pr.id, pr.slug
  FROM public.products pr
  JOIN nescafe_products np ON np.slug = pr.slug
),
size_rows AS (
  SELECT slug, '250g'::text AS size, price_250 AS price FROM nescafe_products
  UNION ALL
  SELECT slug, '500g'::text AS size, price_500 AS price FROM nescafe_products
  UNION ALL
  SELECT slug, '1kg'::text  AS size, price_1000 AS price FROM nescafe_products
),
expected_sizes AS (
  SELECT r.id AS product_id, s.size, s.price
  FROM size_rows s
  JOIN product_refs r ON r.slug = s.slug
),
updated_sizes AS (
  UPDATE public.product_sizes
  SET price = es.price, is_available = true
  FROM expected_sizes es
  WHERE product_sizes.product_id = es.product_id
    AND product_sizes.size = es.size
  RETURNING product_sizes.product_id, product_sizes.size
)
INSERT INTO public.product_sizes (product_id, size, price, is_available)
SELECT es.product_id, es.size, es.price, true
FROM expected_sizes es
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_sizes ps
  WHERE ps.product_id = es.product_id
    AND ps.size = es.size
);

NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================
-- Verification queries
-- ============================================================

-- Nescafe product count should be 2.
SELECT count(*) AS nescafe_product_count
FROM public.products p
JOIN public.categories c ON c.id = p.category_id
WHERE c.slug = 'nescafe'
  AND p.is_visible = true;

-- Nescafe product sizes should be 6 (2 products x 3 sizes).
SELECT count(*) AS nescafe_sizes_count
FROM public.product_sizes ps
JOIN public.products p ON p.id = ps.product_id
JOIN public.categories c ON c.id = p.category_id
WHERE c.slug = 'nescafe';

-- Nescafe products with prices.
SELECT
  p.name_en,
  ps.size,
  ps.price
FROM public.products p
JOIN public.categories c ON c.id = p.category_id
JOIN public.product_sizes ps ON ps.product_id = p.id
WHERE c.slug = 'nescafe'
  AND p.is_visible = true
ORDER BY p.created_at DESC, ps.size;

SELECT 'nescafe seed complete' AS status;
