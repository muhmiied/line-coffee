-- ============================================================
-- Line Coffee manual product catalog hard reset
-- ============================================================
-- Run manually in Supabase SQL Editor only.
--
-- WARNING:
-- This script deletes current product catalog data and test commerce data:
-- cart items, wishlist items, order items, orders, product sizes,
-- products, and categories.
--
-- It intentionally preserves:
-- auth users, profiles, site_settings, discounts, banners/media,
-- blog_posts/blogs, testimonials/reviews, contact_messages,
-- coffee_beans, flavor/customization tables, and notifications.
--
-- Notes:
-- - Existing notification/testimonial order references are expected to
--   become NULL via their ON DELETE SET NULL foreign keys.
-- - No TRUNCATE ... CASCADE is used, to avoid deleting preserved tables.
-- - Tables in this schema use UUID primary keys, so there is no identity
--   sequence to reset for the rebuilt catalog.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Keep the reset explicit and fail fast if the core catalog schema is missing.
DO $$
BEGIN
  IF to_regclass('public.categories') IS NULL THEN
    RAISE EXCEPTION 'Missing required table: public.categories';
  END IF;

  IF to_regclass('public.products') IS NULL THEN
    RAISE EXCEPTION 'Missing required table: public.products';
  END IF;

  IF to_regclass('public.product_sizes') IS NULL THEN
    RAISE EXCEPTION 'Missing required table: public.product_sizes';
  END IF;
END $$;

-- 1. Delete product-related and test commerce data in dependency order.
-- Compatibility tables from later migrations.
DO $$
DECLARE
  reset_table text;
BEGIN
  FOREACH reset_table IN ARRAY ARRAY[
    'cart_items',
    'wishlist_items',
    'carts',
    'wishlists',
    'order_items',
    'orders',
    'product_sizes',
    'products',
    'categories'
  ]
  LOOP
    IF to_regclass(format('public.%I', reset_table)) IS NOT NULL THEN
      EXECUTE format('DELETE FROM public.%I', reset_table);
      RAISE NOTICE 'Deleted data from public.%', reset_table;
    ELSE
      RAISE NOTICE 'Skipped missing table public.%', reset_table;
    END IF;
  END LOOP;
END $$;

-- 2. Recreate the clean category shell.
INSERT INTO public.categories (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  image_url,
  sort_order,
  is_visible,
  updated_at
)
VALUES
  (
    'turkish-coffee',
    'Turkish Coffee',
    'القهوة التركي',
    'Traditional Turkish coffee blends.',
    'خلطات القهوة التركي.',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=1000&fit=crop',
    1,
    true,
    now()
  ),
  (
    'espresso',
    'Espresso',
    'الإسبريسو',
    'Espresso blends for rich coffee shots.',
    'خلطات إسبريسو لقهوة غنية.',
    'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=1000&fit=crop',
    2,
    true,
    now()
  ),
  (
    'flavored-coffee',
    'Flavored Coffee',
    'القهوة بالنكهات',
    'Flavored coffee products.',
    'منتجات القهوة بالنكهات.',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=1000&fit=crop',
    3,
    true,
    now()
  ),
  (
    'coffee-mix',
    'Coffee Mix',
    'كوفي ميكس',
    'Coffee mix products.',
    'منتجات كوفي ميكس.',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=1000&fit=crop',
    4,
    true,
    now()
  ),
  (
    'cappuccino',
    'Cappuccino',
    'كابتشينو',
    'Cappuccino products.',
    'منتجات الكابتشينو.',
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=1000&fit=crop',
    5,
    true,
    now()
  ),
  (
    'hot-chocolate',
    'Hot Chocolate',
    'هوت شوكلت',
    'Hot chocolate products.',
    'منتجات الهوت شوكلت.',
    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&h=1000&fit=crop',
    6,
    true,
    now()
  ),
  (
    'nescafe',
    'Nescafe',
    'نسكافيه',
    'Nescafe products.',
    'منتجات النسكافيه.',
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&h=1000&fit=crop',
    7,
    true,
    now()
  );

-- If a deployed database also has an is_active column, keep the rebuilt
-- category shell active without requiring that column in the base schema.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'is_active'
  ) THEN
    EXECUTE 'UPDATE public.categories SET is_active = true';
  END IF;
END $$;

-- 3. Recreate Turkish Coffee and Espresso products only.
WITH product_rows (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  category_slug,
  images,
  roast_level,
  flavor_notes,
  is_featured,
  is_best_seller,
  is_new,
  stock_quantity
) AS (
  VALUES
    (
      'velvet-turkish',
      'Velvet Turkish',
      'فيلفت تركش',
      'Smooth Turkish coffee with balanced roast depth.',
      'قهوة تركي ناعمة بعمق تحميص متوازن.',
      'turkish-coffee',
      ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[],
      'medium',
      ARRAY['Balanced','Velvety']::text[],
      true,
      true,
      false,
      100
    ),
    (
      'cairo-nights',
      'Cairo Nights',
      'كايرو نايتس',
      'Dark Turkish coffee with warm caramel notes.',
      'قهوة تركي داكنة بنغمات كراميل دافئة.',
      'turkish-coffee',
      ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[],
      'dark',
      ARRAY['Caramel','Dark Roast']::text[],
      true,
      false,
      false,
      100
    ),
    (
      'midnight-turkish',
      'Midnight Turkish',
      'ميدنايت تركش',
      'Rich Turkish coffee with a smoky chocolate finish.',
      'قهوة تركي غنية بنهاية شوكولاتة مدخنة.',
      'turkish-coffee',
      ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[],
      'dark',
      ARRAY['Chocolate','Smoky']::text[],
      false,
      false,
      false,
      100
    ),
    (
      'royal-line',
      'Royal Line',
      'رويال لاين',
      'Premium Turkish coffee with a refined floral profile.',
      'قهوة تركي فاخرة بطابع فلورال راقي.',
      'turkish-coffee',
      ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[],
      'light',
      ARRAY['Specialty','Floral','Fruity']::text[],
      false,
      false,
      true,
      100
    ),
    (
      'line-crema',
      'Line Crema',
      'لاين كريما',
      'Strong espresso blend with excellent crema.',
      'خلطة إسبريسو قوية بكريمة ممتازة.',
      'espresso',
      ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[],
      'espresso',
      ARRAY['Crema','Strong']::text[],
      false,
      true,
      false,
      100
    ),
    (
      'first-line',
      'First Line',
      'فيرست لاين',
      'Balanced espresso with chocolate and caramel notes.',
      'إسبريسو متوازن بنغمات شوكولاتة وكراميل.',
      'espresso',
      ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[],
      'espresso',
      ARRAY['Chocolate','Caramel']::text[],
      true,
      false,
      false,
      100
    ),
    (
      'headshot',
      'HEADSHOT',
      'هيد شوت',
      'Clean espresso blend with bright acidity.',
      'خلطة إسبريسو نظيفة بحموضة مشرقة.',
      'espresso',
      ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[],
      'espresso',
      ARRAY['Bright','Clean']::text[],
      false,
      false,
      true,
      100
    ),
    (
      'gold-shot',
      'Gold Shot',
      'جولد شوت',
      'Specialty espresso with golden crema and floral notes.',
      'إسبريسو فاخرة بكريمة ذهبية ونغمات فلورال.',
      'espresso',
      ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[],
      'espresso',
      ARRAY['Specialty','Floral']::text[],
      false,
      false,
      false,
      100
    )
)
INSERT INTO public.products (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  category_id,
  images,
  roast_level,
  flavor_notes,
  is_featured,
  is_best_seller,
  is_new,
  is_visible,
  stock_quantity,
  updated_at
)
SELECT
  product_rows.slug,
  product_rows.name_en,
  product_rows.name_ar,
  product_rows.description_en,
  product_rows.description_ar,
  categories.id,
  product_rows.images,
  product_rows.roast_level,
  product_rows.flavor_notes,
  product_rows.is_featured,
  product_rows.is_best_seller,
  product_rows.is_new,
  true,
  product_rows.stock_quantity,
  now()
FROM product_rows
JOIN public.categories
  ON categories.slug = product_rows.category_slug;

-- If a deployed database also has an is_active column, keep the rebuilt
-- Turkish/Espresso products active without requiring that column in the base schema.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'is_active'
  ) THEN
    EXECUTE 'UPDATE public.products SET is_active = true';
  END IF;
END $$;

-- 4. Recreate the exact three sizes for each Turkish/Espresso product.
WITH size_rows (product_slug, size, price) AS (
  VALUES
    ('velvet-turkish', '250g', 200::numeric),
    ('velvet-turkish', '500g', 400::numeric),
    ('velvet-turkish', '1kg', 800::numeric),
    ('cairo-nights', '250g', 220::numeric),
    ('cairo-nights', '500g', 440::numeric),
    ('cairo-nights', '1kg', 880::numeric),
    ('midnight-turkish', '250g', 235::numeric),
    ('midnight-turkish', '500g', 470::numeric),
    ('midnight-turkish', '1kg', 940::numeric),
    ('royal-line', '250g', 410::numeric),
    ('royal-line', '500g', 825::numeric),
    ('royal-line', '1kg', 1650::numeric),
    ('line-crema', '250g', 165::numeric),
    ('line-crema', '500g', 330::numeric),
    ('line-crema', '1kg', 660::numeric),
    ('first-line', '250g', 190::numeric),
    ('first-line', '500g', 380::numeric),
    ('first-line', '1kg', 760::numeric),
    ('headshot', '250g', 190::numeric),
    ('headshot', '500g', 380::numeric),
    ('headshot', '1kg', 760::numeric),
    ('gold-shot', '250g', 260::numeric),
    ('gold-shot', '500g', 520::numeric),
    ('gold-shot', '1kg', 1040::numeric)
)
INSERT INTO public.product_sizes (
  product_id,
  size,
  price,
  is_available
)
SELECT
  products.id,
  size_rows.size,
  size_rows.price,
  true
FROM size_rows
JOIN public.products
  ON products.slug = size_rows.product_slug;

-- 5. Sanity checks. Abort the transaction if the rebuilt catalog is not exact.
DO $$
DECLARE
  category_count integer;
  product_count integer;
  size_count integer;
BEGIN
  SELECT count(*) INTO category_count FROM public.categories;
  SELECT count(*) INTO product_count FROM public.products;
  SELECT count(*) INTO size_count FROM public.product_sizes;

  IF category_count <> 7 THEN
    RAISE EXCEPTION 'Expected 7 categories after reset, found %.', category_count;
  END IF;

  IF product_count <> 8 THEN
    RAISE EXCEPTION 'Expected 8 products after reset, found %.', product_count;
  END IF;

  IF size_count <> 24 THEN
    RAISE EXCEPTION 'Expected 24 product size rows after reset, found %.', size_count;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
