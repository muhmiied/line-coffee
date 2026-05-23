-- ============================================================
-- Line Coffee: Remove duplicate French/Original flavor products
-- from Coffee Mix, Cappuccino, and Hot Chocolate categories.
-- ============================================================
-- Run manually in Supabase SQL Editor on the live database.
--
-- Root cause:
-- The previous seed (013) generated flavor products for ALL 30
-- flavor_catalog rows including flavor_order=1 (French/Original)
-- for Coffee Mix, Cappuccino, and Hot Chocolate. This duplicated
-- the "Original" concept already covered by:
--   original-coffee-mix, original-cappuccino, original-hot-chocolate
--
-- This script removes the 3 wrong products:
--   french-original-coffee-mix
--   french-original-cappuccino
--   french-original-hot-chocolate
--
-- Safe to run on a clean test database.
-- product_sizes are deleted first (FK constraint), then products.
-- ============================================================

BEGIN;

-- Step 1: Remove product_sizes for the 3 duplicate products
DELETE FROM public.product_sizes
WHERE product_id IN (
  SELECT id FROM public.products
  WHERE slug IN (
    'french-original-coffee-mix',
    'french-original-cappuccino',
    'french-original-hot-chocolate'
  )
);

-- Step 2: Remove the 3 duplicate products
DELETE FROM public.products
WHERE slug IN (
  'french-original-coffee-mix',
  'french-original-cappuccino',
  'french-original-hot-chocolate'
);

COMMIT;

-- ============================================================
-- Verification queries
-- ============================================================

-- These 3 should return 0 rows each.
SELECT slug FROM public.products
WHERE slug IN (
  'french-original-coffee-mix',
  'french-original-cappuccino',
  'french-original-hot-chocolate'
);

-- Expected visible product counts after correction:
-- Turkish Coffee=4, Espresso=4, Flavored Coffee=30,
-- Coffee Mix=30, Cappuccino=30, Hot Chocolate=30, Nescafe=0
-- Total=128
SELECT
  categories.slug,
  categories.name_en,
  count(products.id) AS visible_products
FROM public.categories
LEFT JOIN public.products
  ON products.category_id = categories.id
 AND products.is_visible = true
GROUP BY categories.slug, categories.name_en, categories.sort_order
ORDER BY categories.sort_order;

-- Product size rows should be 384 (128 products x 3 sizes).
SELECT count(*) AS product_sizes_count
FROM public.product_sizes;

-- Confirm no سحلب and no old wrong products are visible.
SELECT count(*) AS visible_old_wrong_products
FROM public.products
WHERE is_visible = true
  AND lower(name_en) IN (
    'morning strength', 'perfect balance', 'professional clean cup',
    'turkish premium', 'economy crema', 'classic italian',
    'specialty floral', 'premium vip', 'sahlab', 'salep',
    'french / original coffee mix',
    'french / original cappuccino',
    'french / original hot chocolate'
  );

SELECT 'correction complete' AS status;
