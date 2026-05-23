-- ============================================================
-- Line Coffee - Make Your Flavor pricing correction
-- ============================================================
-- Run this manually in Supabase SQL Editor if Make Your Flavor
-- base prices or flavor deltas are still using older values.
--
-- Scope:
-- - Updates flavor_bases prices only for the four Make Your Flavor bases.
-- - Updates flavor_options price_delta / option_type only for active final flavors.
-- - Does not touch products, categories, product_sizes, orders, carts, checkout,
--   coffee_beans, users, profiles, discounts, media, blog, or reviews.
-- ============================================================

BEGIN;

-- Correct base prices per kg.
WITH target_bases (name_en, price) AS (
  VALUES
    ('Turkish Coffee', 400::numeric),
    ('Coffee Mix', 430::numeric),
    ('Cappuccino', 530::numeric),
    ('Hot Chocolate', 430::numeric)
)
UPDATE public.flavor_bases AS fb
SET
  price = target_bases.price,
  updated_at = now()
FROM target_bases
WHERE lower(fb.name_en) = lower(target_bases.name_en)
  AND fb.price IS DISTINCT FROM target_bases.price;

-- Correct flavor deltas per kg.
-- Chunk flavors are +70/kg, all other final flavors are +50/kg.
-- The clean seed stores the two chunk flavors by these English names.
UPDATE public.flavor_options AS fo
SET
  price_delta = CASE
    WHEN lower(fo.name_en) IN ('chocolate chunks', 'hazelnut chunks')
    THEN 70::numeric
    ELSE 50::numeric
  END,
  option_type = CASE
    WHEN lower(fo.name_en) IN ('chocolate chunks', 'hazelnut chunks')
    THEN 'chunks'
    ELSE 'standard'
  END,
  updated_at = now()
FROM public.flavor_bases AS fb
WHERE fo.base_id = fb.id
  AND lower(fb.name_en) IN ('turkish coffee', 'coffee mix', 'cappuccino', 'hot chocolate')
  AND (
    fo.price_delta IS DISTINCT FROM CASE
      WHEN lower(fo.name_en) IN ('chocolate chunks', 'hazelnut chunks')
      THEN 70::numeric
      ELSE 50::numeric
    END
    OR fo.option_type IS DISTINCT FROM CASE
      WHEN lower(fo.name_en) IN ('chocolate chunks', 'hazelnut chunks')
      THEN 'chunks'
      ELSE 'standard'
    END
  );

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verification: base prices.
SELECT
  name_en,
  price
FROM public.flavor_bases
WHERE lower(name_en) IN ('turkish coffee', 'coffee mix', 'cappuccino', 'hot chocolate')
ORDER BY sort_order, name_en;

-- Verification: flavor delta counts by type.
SELECT
  fb.name_en AS base_name,
  fo.option_type,
  fo.price_delta,
  count(*) AS flavor_count
FROM public.flavor_bases AS fb
JOIN public.flavor_options AS fo ON fo.base_id = fb.id
WHERE lower(fb.name_en) IN ('turkish coffee', 'coffee mix', 'cappuccino', 'hot chocolate')
  AND fo.is_active = true
GROUP BY fb.name_en, fb.sort_order, fo.option_type, fo.price_delta
ORDER BY fb.sort_order, fo.option_type, fo.price_delta;
