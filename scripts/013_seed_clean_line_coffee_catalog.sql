-- ============================================================
-- Line Coffee clean catalog foundation seed
-- ============================================================
-- Run manually in Supabase SQL Editor after manual table cleanup.
--
-- This script is insert/update only for the target business tables.
-- It does not delete or truncate data.
-- It does not touch auth.users, profiles, discounts, media/blog/reviews,
-- contact messages, or site_settings.
--
-- Inspected schema columns used by this script:
-- categories: slug, name_en, name_ar, image_url, sort_order, is_visible
-- products: slug, name_en, name_ar, description_en, description_ar,
--   short_description_en, short_description_ar, category_id, images,
--   origin, roast_level, flavor_notes, is_featured, is_best_seller,
--   is_new, is_visible, stock_quantity, low_stock_threshold, created_at
-- product_sizes: product_id, size, price, is_available
-- coffee_beans: name_en, name_ar, origin, description_en,
--   description_ar, family, price, is_active, sort_order, updated_at
-- flavor_bases: name_en, name_ar, price, type, is_active, sort_order,
--   updated_at
-- flavor_options: base_id, name_en, name_ar, price_delta, option_type,
--   is_active, sort_order, updated_at
-- site_settings: id, key, value, created_at, updated_at
--
-- Missing product metadata columns:
-- products has no sort_order, flavor_group, flavor_sort_order,
-- product_type, base_type, is_flavored, flavor_name_ar, or flavor_name_en.
-- The seed uses created_at ordering to match the current /api/products
-- order-by behavior without adding schema.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Categories
INSERT INTO public.categories (
  slug,
  name_en,
  name_ar,
  image_url,
  sort_order,
  is_visible
)
VALUES
  ('turkish-coffee', 'Turkish Coffee', 'القهوة التركي', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=1000&fit=crop', 1, true),
  ('espresso', 'Espresso', 'الإسبريسو', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=1000&fit=crop', 2, true),
  ('flavored-coffee', 'Flavored Coffee', 'القهوة بالنكهات', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=1000&fit=crop', 3, true),
  ('coffee-mix', 'Coffee Mix', 'كوفي ميكس', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=1000&fit=crop', 4, true),
  ('cappuccino', 'Cappuccino', 'كابتشينو', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=1000&fit=crop', 5, true),
  ('hot-chocolate', 'Hot Chocolate', 'هوت شوكلت', 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&h=1000&fit=crop', 6, true),
  ('nescafe', 'Nescafe', 'نسكافيه', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&h=1000&fit=crop', 7, true)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_visible = true;

-- 2. Products and product sizes
WITH flavor_catalog (
  flavor_order,
  group_order,
  group_name_en,
  group_name_ar,
  flavor_slug,
  flavor_name_en,
  flavor_name_ar,
  is_chunk
) AS (
  VALUES
    (1, 1, 'Original LINE', 'الأساسي', 'french-original', 'French / Original', 'فرنساوي / أوريجينال', false),
    (2, 2, 'sweets LINE', 'حلويات', 'chocolate-chunks', 'Chocolate Chunks', 'شوكولاتة قطع', true),
    (3, 2, 'sweets LINE', 'حلويات', 'chocolate', 'Chocolate', 'شوكولاتة', false),
    (4, 2, 'sweets LINE', 'حلويات', 'caramel', 'Caramel', 'كراميل', false),
    (5, 2, 'sweets LINE', 'حلويات', 'vanilla', 'Vanilla', 'فانيلا', false),
    (6, 2, 'sweets LINE', 'حلويات', 'lotus', 'Lotus', 'لوتس', false),
    (7, 2, 'sweets LINE', 'حلويات', 'oreo', 'Oreo', 'أوريو', false),
    (8, 2, 'sweets LINE', 'حلويات', 'cherry', 'Cherry', 'كرز', false),
    (9, 3, 'Nuts', 'مكسرات', 'almond', 'Almond', 'لوز', false),
    (10, 3, 'Nuts', 'مكسرات', 'pistachio', 'Pistachio', 'فستق', false),
    (11, 3, 'Nuts', 'مكسرات', 'hazelnut-chunks', 'Hazelnut Chunks', 'بندق قطع', true),
    (12, 3, 'Nuts', 'مكسرات', 'hazelnut', 'Hazelnut', 'بندق', false),
    (13, 4, 'Fruits', 'فواكه', 'strawberry', 'Strawberry', 'فراولة', false),
    (14, 4, 'Fruits', 'فواكه', 'banana', 'Banana', 'موز', false),
    (15, 4, 'Fruits', 'فواكه', 'mango', 'Mango', 'مانجو', false),
    (16, 4, 'Fruits', 'فواكه', 'peach', 'Peach', 'خوخ', false),
    (17, 4, 'Fruits', 'فواكه', 'berry', 'Berry', 'توت', false),
    (18, 4, 'Fruits', 'فواكه', 'blueberry', 'Blueberry', 'توت أزرق', false),
    (19, 4, 'Fruits', 'فواكه', 'apple', 'Apple', 'تفاح', false),
    (20, 4, 'Fruits', 'فواكه', 'grape', 'Grape', 'عنب', false),
    (21, 4, 'Fruits', 'فواكه', 'watermelon', 'Watermelon', 'بطيخ', false),
    (22, 4, 'Fruits', 'فواكه', 'guava', 'Guava', 'جوافة', false),
    (23, 4, 'Fruits', 'فواكه', 'pineapple', 'Pineapple', 'أناناس', false),
    (24, 4, 'Fruits', 'فواكه', 'orange', 'Orange', 'برتقال', false),
    (25, 5, 'Special Order', 'سيبشيل أوردر', 'coconut', 'Coconut', 'جوز الهند', false),
    (26, 5, 'Special Order', 'سيبشيل أوردر', 'mocha', 'Mocha', 'موكا', false),
    (27, 5, 'Special Order', 'سيبشيل أوردر', 'pina-colada', 'Pina Colada', 'بينا كولادا', false),
    (28, 5, 'Special Order', 'سيبشيل أوردر', 'apple-hookah', 'Apple Hookah', 'شيشة تفاح', false),
    (29, 5, 'Special Order', 'سيبشيل أوردر', 'grape-hookah', 'Grape Hookah', 'شيشة عنب', false),
    (30, 5, 'Special Order', 'سيبشيل أوردر', 'hot-cider', 'Hot Cider', 'هوت سيدر', false)
),
seed_products (
  sort_index,
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  short_description_en,
  short_description_ar,
  category_slug,
  images,
  roast_level,
  flavor_notes,
  is_featured,
  is_best_seller,
  is_new,
  stock_quantity,
  low_stock_threshold,
  price_250,
  price_500,
  price_1000
) AS (
  VALUES
    (1001, 'velvet-turkish', 'Velvet Turkish', 'فيلفت تركش', 'Smooth Turkish coffee with balanced roast depth.', 'قهوة تركي ناعمة بعمق تحميص متوازن.', 'Smooth Turkish coffee.', 'قهوة تركي ناعمة.', 'turkish-coffee', ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[], 'medium', ARRAY['Balanced','Velvety']::text[], true, true, false, 100, 10, 200::numeric, 400::numeric, 800::numeric),
    (1002, 'cairo-nights', 'Cairo Nights', 'كايرو نايتس', 'Dark Turkish coffee with warm caramel notes.', 'قهوة تركي داكنة بنغمات كراميل دافئة.', 'Dark Turkish coffee.', 'قهوة تركي داكنة.', 'turkish-coffee', ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[], 'dark', ARRAY['Caramel','Dark Roast']::text[], true, false, false, 100, 10, 220::numeric, 440::numeric, 880::numeric),
    (1003, 'midnight-turkish', 'Midnight Turkish', 'ميدنايت تركش', 'Rich Turkish coffee with a smoky chocolate finish.', 'قهوة تركي غنية بنهاية شوكولاتة مدخنة.', 'Rich smoky Turkish coffee.', 'قهوة تركي غنية ومدخنة.', 'turkish-coffee', ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[], 'dark', ARRAY['Chocolate','Smoky']::text[], false, false, false, 100, 10, 235::numeric, 470::numeric, 940::numeric),
    (1004, 'royal-line', 'Royal Line', 'رويال لاين', 'Premium Turkish coffee with a refined floral profile.', 'قهوة تركي فاخرة بطابع فلورال راقي.', 'Premium floral Turkish coffee.', 'قهوة تركي فاخرة وفلورال.', 'turkish-coffee', ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800']::text[], 'light', ARRAY['Specialty','Floral','Fruity']::text[], false, false, true, 100, 10, 410::numeric, 825::numeric, 1650::numeric),
    (2001, 'line-crema', 'Line Crema', 'لاين كريما', 'Strong espresso blend with excellent crema.', 'خلطة إسبريسو قوية بكريمة ممتازة.', 'Strong crema espresso.', 'إسبريسو قوي بكريمة ممتازة.', 'espresso', ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[], 'espresso', ARRAY['Crema','Strong']::text[], false, true, false, 100, 10, 165::numeric, 330::numeric, 660::numeric),
    (2002, 'first-line', 'First Line', 'فيرست لاين', 'Balanced espresso with chocolate and caramel notes.', 'إسبريسو متوازن بنغمات شوكولاتة وكراميل.', 'Balanced espresso blend.', 'خلطة إسبريسو متوازنة.', 'espresso', ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[], 'espresso', ARRAY['Chocolate','Caramel']::text[], true, false, false, 100, 10, 190::numeric, 380::numeric, 760::numeric),
    (2003, 'headshot', 'HEADSHOT', 'هيد شوت', 'Clean espresso blend with bright acidity.', 'خلطة إسبريسو نظيفة بحموضة مشرقة.', 'Clean bright espresso.', 'إسبريسو نظيف ومشرق.', 'espresso', ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[], 'espresso', ARRAY['Bright','Clean']::text[], false, false, true, 100, 10, 190::numeric, 380::numeric, 760::numeric),
    (2004, 'gold-shot', 'Gold Shot', 'جولد شوت', 'Specialty espresso with golden crema and floral notes.', 'إسبريسو فاخرة بكريمة ذهبية ونغمات فلورال.', 'Specialty floral espresso.', 'إسبريسو فاخرة وفلورال.', 'espresso', ARRAY['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800']::text[], 'espresso', ARRAY['Specialty','Floral']::text[], false, false, false, 100, 10, 260::numeric, 520::numeric, 1040::numeric)

  UNION ALL

  SELECT
    3000 + flavor_order,
    CASE WHEN flavor_order = 1 THEN 'french-coffee' ELSE flavor_slug || '-coffee' END,
    CASE WHEN flavor_order = 1 THEN 'French Coffee' ELSE flavor_name_en || ' Coffee' END,
    CASE WHEN flavor_order = 1 THEN 'قهوة فرنساوي' ELSE 'قهوة ' || flavor_name_ar END,
    CASE WHEN flavor_order = 1 THEN 'Original French coffee from Line Coffee.' ELSE flavor_name_en || ' flavored coffee from Line Coffee.' END,
    CASE WHEN flavor_order = 1 THEN 'قهوة فرنساوي أصلية من لاين كوفي.' ELSE 'قهوة ' || flavor_name_ar || ' من لاين كوفي.' END,
    CASE WHEN flavor_order = 1 THEN 'Original French coffee.' ELSE flavor_name_en || ' coffee.' END,
    CASE WHEN flavor_order = 1 THEN 'قهوة فرنساوي أصلية.' ELSE 'قهوة ' || flavor_name_ar || '.' END,
    'flavored-coffee',
    ARRAY['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800']::text[],
    'medium',
    ARRAY[group_name_en, flavor_name_en]::text[],
    flavor_order = 1,
    flavor_order IN (1, 2, 11),
    false,
    100,
    10,
    CASE WHEN is_chunk THEN 125::numeric ELSE 100::numeric END,
    CASE WHEN is_chunk THEN 250::numeric ELSE 200::numeric END,
    CASE WHEN is_chunk THEN 500::numeric ELSE 400::numeric END
  FROM flavor_catalog

  UNION ALL

  SELECT *
  FROM (VALUES
    (4000, 'original-coffee-mix', 'Original Coffee Mix', 'كوفي ميكس Original', 'Original coffee mix from Line Coffee.', 'كوفي ميكس Original من لاين كوفي.', 'Original coffee mix.', 'كوفي ميكس Original.', 'coffee-mix', ARRAY['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800']::text[], 'medium', ARRAY['Original']::text[], true, true, false, 100, 10, 100::numeric, 200::numeric, 400::numeric),
    (5000, 'original-cappuccino', 'Original Cappuccino', 'كابتشينو Original', 'Original cappuccino from Line Coffee.', 'كابتشينو Original من لاين كوفي.', 'Original cappuccino.', 'كابتشينو Original.', 'cappuccino', ARRAY['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800']::text[], 'medium', ARRAY['Original']::text[], true, true, false, 100, 10, 120::numeric, 240::numeric, 480::numeric),
    (6000, 'original-hot-chocolate', 'Original Hot Chocolate', 'هوت شوكلت Original', 'Original hot chocolate from Line Coffee.', 'هوت شوكلت Original من لاين كوفي.', 'Original hot chocolate.', 'هوت شوكلت Original.', 'hot-chocolate', ARRAY['https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800']::text[], 'medium', ARRAY['Original']::text[], true, true, false, 100, 10, 100::numeric, 200::numeric, 400::numeric)
  ) AS base_products (
    sort_index,
    slug,
    name_en,
    name_ar,
    description_en,
    description_ar,
    short_description_en,
    short_description_ar,
    category_slug,
    images,
    roast_level,
    flavor_notes,
    is_featured,
    is_best_seller,
    is_new,
    stock_quantity,
    low_stock_threshold,
    price_250,
    price_500,
    price_1000
  )

  UNION ALL

  SELECT
    4000 + flavor_order,
    flavor_slug || '-coffee-mix',
    flavor_name_en || ' Coffee Mix',
    'كوفي ميكس ' || flavor_name_ar,
    flavor_name_en || ' coffee mix from Line Coffee.',
    'كوفي ميكس ' || flavor_name_ar || ' من لاين كوفي.',
    flavor_name_en || ' coffee mix.',
    'كوفي ميكس ' || flavor_name_ar || '.',
    'coffee-mix',
    ARRAY['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800']::text[],
    'medium',
    ARRAY[group_name_en, flavor_name_en]::text[],
    false,
    flavor_order IN (2, 11),
    false,
    100,
    10,
    120::numeric,
    240::numeric,
    480::numeric
  FROM flavor_catalog
  WHERE flavor_order > 1

  UNION ALL

  SELECT
    5000 + flavor_order,
    flavor_slug || '-cappuccino',
    flavor_name_en || ' Cappuccino',
    'كابتشينو ' || flavor_name_ar,
    flavor_name_en || ' cappuccino from Line Coffee.',
    'كابتشينو ' || flavor_name_ar || ' من لاين كوفي.',
    flavor_name_en || ' cappuccino.',
    'كابتشينو ' || flavor_name_ar || '.',
    'cappuccino',
    ARRAY['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800']::text[],
    'medium',
    ARRAY[group_name_en, flavor_name_en]::text[],
    false,
    flavor_order IN (2, 11),
    false,
    100,
    10,
    150::numeric,
    300::numeric,
    600::numeric
  FROM flavor_catalog
  WHERE flavor_order > 1

  UNION ALL

  SELECT
    6000 + flavor_order,
    flavor_slug || '-hot-chocolate',
    flavor_name_en || ' Hot Chocolate',
    'هوت شوكلت ' || flavor_name_ar,
    flavor_name_en || ' hot chocolate from Line Coffee.',
    'هوت شوكلت ' || flavor_name_ar || ' من لاين كوفي.',
    flavor_name_en || ' hot chocolate.',
    'هوت شوكلت ' || flavor_name_ar || '.',
    'hot-chocolate',
    ARRAY['https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800']::text[],
    'medium',
    ARRAY[group_name_en, flavor_name_en]::text[],
    false,
    flavor_order IN (2, 11),
    false,
    100,
    10,
    120::numeric,
    240::numeric,
    480::numeric
  FROM flavor_catalog
  WHERE flavor_order > 1
),
upserted_products AS (
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
    seed_products.slug,
    seed_products.name_en,
    seed_products.name_ar,
    seed_products.description_en,
    seed_products.description_ar,
    seed_products.short_description_en,
    seed_products.short_description_ar,
    categories.id,
    seed_products.images,
    NULL::text,
    seed_products.roast_level,
    seed_products.flavor_notes,
    seed_products.is_featured,
    seed_products.is_best_seller,
    seed_products.is_new,
    true,
    seed_products.stock_quantity,
    seed_products.low_stock_threshold,
    timestamptz '2026-01-01 00:00:00+00' - (seed_products.sort_index::double precision * interval '1 second')
  FROM seed_products
  JOIN public.categories
    ON categories.slug = seed_products.category_slug
  ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    description_en = EXCLUDED.description_en,
    description_ar = EXCLUDED.description_ar,
    short_description_en = EXCLUDED.short_description_en,
    short_description_ar = EXCLUDED.short_description_ar,
    category_id = EXCLUDED.category_id,
    images = EXCLUDED.images,
    origin = EXCLUDED.origin,
    roast_level = EXCLUDED.roast_level,
    flavor_notes = EXCLUDED.flavor_notes,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new = EXCLUDED.is_new,
    is_visible = true,
    stock_quantity = EXCLUDED.stock_quantity,
    low_stock_threshold = EXCLUDED.low_stock_threshold,
    created_at = EXCLUDED.created_at
  RETURNING id, slug
),
product_refs AS (
  SELECT id, slug FROM upserted_products
  UNION
  SELECT products.id, products.slug
  FROM public.products
  JOIN seed_products
    ON seed_products.slug = products.slug
),
size_rows AS (
  SELECT slug, '250g'::text AS size, price_250 AS price FROM seed_products
  UNION ALL
  SELECT slug, '500g'::text AS size, price_500 AS price FROM seed_products
  UNION ALL
  SELECT slug, '1kg'::text AS size, price_1000 AS price FROM seed_products
),
expected_sizes AS (
  SELECT product_refs.id AS product_id, size_rows.size, size_rows.price
  FROM size_rows
  JOIN product_refs
    ON product_refs.slug = size_rows.slug
),
updated_sizes AS (
  UPDATE public.product_sizes
  SET
    price = expected_sizes.price,
    is_available = true
  FROM expected_sizes
  WHERE product_sizes.product_id = expected_sizes.product_id
    AND product_sizes.size = expected_sizes.size
  RETURNING product_sizes.product_id, product_sizes.size
)
INSERT INTO public.product_sizes (product_id, size, price, is_available)
SELECT expected_sizes.product_id, expected_sizes.size, expected_sizes.price, true
FROM expected_sizes
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_sizes
  WHERE product_sizes.product_id = expected_sizes.product_id
    AND product_sizes.size = expected_sizes.size
);

-- Safety: if any old catalog rows survived manual cleanup, hide/deactivate them
-- without deleting data. A clean database should update zero rows here.
UPDATE public.products
SET is_visible = false, is_featured = false, is_best_seller = false, is_new = false
WHERE lower(name_en) IN (
    'morning strength',
    'perfect balance',
    'professional clean cup',
    'turkish premium',
    'economy crema',
    'classic italian',
    'specialty floral',
    'premium vip',
    'sahlab',
    'salep'
  )
  OR name_ar ILIKE '%سحلب%';

-- 3. Coffee beans for Make Your Espresso Blend
WITH bean_rows (sort_order, name_en, name_ar, origin, family, price, description_en, description_ar) AS (
  VALUES
    (1, 'Indian', 'هندي', 'India', 'arabica', 600::numeric, 'Balanced Indian arabica for espresso blends.', 'أرابيكا هندي متوازن لتوليفات الإسبريسو.'),
    (2, 'Brazilian', 'برازيلي', 'Brazil', 'arabica', 482::numeric, 'Soft Brazilian arabica with chocolate sweetness.', 'أرابيكا برازيلي ناعم بحلاوة شوكولاتة.'),
    (3, 'Colombian', 'كولومبي', 'Colombia', 'arabica', 705::numeric, 'Balanced Colombian arabica with gentle fruit notes.', 'أرابيكا كولومبي متوازن بنغمات فاكهية هادئة.'),
    (4, 'Ethiopian', 'حبشي', 'Ethiopia', 'arabica', 487::numeric, 'Bright Ethiopian arabica with floral character.', 'أرابيكا حبشي مشرق بطابع فلورال.'),
    (5, 'Indian Plantation', 'هندي بلانتيشن', 'India', 'arabica', 682::numeric, 'Indian Plantation arabica with refined body.', 'أرابيكا هندي بلانتيشن بقوام راق.'),
    (6, 'Guatemala', 'جواتيمالا', 'Guatemala', 'arabica', 835::numeric, 'Guatemala arabica with rich depth.', 'أرابيكا جواتيمالا بعمق غني.'),
    (7, 'Yemeni', 'يمني', 'Yemen', 'arabica', 1187::numeric, 'Yemeni arabica with a distinctive aromatic profile.', 'أرابيكا يمني بطابع عطري مميز.'),
    (8, 'Peru', 'بيرو', 'Peru', 'arabica', 835::numeric, 'Peruvian arabica with a clean smooth cup.', 'أرابيكا بيرو بكوب ناعم ونظيف.'),
    (9, 'Costa Rica', 'كوستاريكا', 'Costa Rica', 'arabica', 835::numeric, 'Costa Rican arabica with balanced clarity.', 'أرابيكا كوستاريكا بتوازن واضح.'),
    (10, 'Indonesian', 'إندونيسي', 'Indonesia', 'robusta', 340::numeric, 'Bold Indonesian robusta for strength and body.', 'روبوستا إندونيسي قوي للقوام والقوة.'),
    (11, 'Indonesian XL', 'إندونيسي XL', 'Indonesia', 'robusta', 346::numeric, 'Extra bold Indonesian robusta.', 'روبوستا إندونيسي XL بقوة أعلى.'),
    (12, 'Indian Robusta', 'هندي', 'India', 'robusta', 376::numeric, 'Indian robusta for crema and strength.', 'روبوستا هندي للكريمة والقوة.'),
    (13, 'Vietnamese', 'فيتنامي', 'Vietnam', 'robusta', 346::numeric, 'Vietnamese robusta with high strength.', 'روبوستا فيتنامي بقوة عالية.'),
    (14, 'Vietnamese Washed', 'فيتنامي مغسول', 'Vietnam', 'robusta', 376::numeric, 'Washed Vietnamese robusta with a cleaner profile.', 'روبوستا فيتنامي مغسول بطابع أنظف.')
),
updated_beans AS (
  UPDATE public.coffee_beans
  SET
    name_ar = bean_rows.name_ar,
    origin = bean_rows.origin,
    family = bean_rows.family,
    price = bean_rows.price,
    description_en = bean_rows.description_en,
    description_ar = bean_rows.description_ar,
    is_active = true,
    sort_order = bean_rows.sort_order,
    updated_at = now()
  FROM bean_rows
  WHERE lower(coffee_beans.name_en) = lower(bean_rows.name_en)
  RETURNING coffee_beans.name_en
)
INSERT INTO public.coffee_beans (
  name_en,
  name_ar,
  origin,
  family,
  price,
  description_en,
  description_ar,
  is_active,
  sort_order,
  updated_at
)
SELECT
  bean_rows.name_en,
  bean_rows.name_ar,
  bean_rows.origin,
  bean_rows.family,
  bean_rows.price,
  bean_rows.description_en,
  bean_rows.description_ar,
  true,
  bean_rows.sort_order,
  now()
FROM bean_rows
WHERE NOT EXISTS (
  SELECT 1
  FROM public.coffee_beans
  WHERE lower(coffee_beans.name_en) = lower(bean_rows.name_en)
);

-- 4. Flavor bases for Customize Flavor
WITH base_rows (sort_order, name_en, name_ar, price, type) AS (
  VALUES
    (1, 'Turkish Coffee', 'القهوة التركي', 400::numeric, 'base'),
    (2, 'Coffee Mix', 'كوفي ميكس', 400::numeric, 'base'),
    (3, 'Cappuccino', 'كابتشينو', 480::numeric, 'base'),
    (4, 'Hot Chocolate', 'هوت شوكلت', 400::numeric, 'base')
),
updated_bases AS (
  UPDATE public.flavor_bases
  SET
    name_en = base_rows.name_en,
    name_ar = base_rows.name_ar,
    price = base_rows.price,
    type = base_rows.type,
    is_active = true,
    sort_order = base_rows.sort_order,
    updated_at = now()
  FROM base_rows
  WHERE lower(flavor_bases.name_en) = lower(base_rows.name_en)
    OR (lower(flavor_bases.name_en) = 'turkish' AND base_rows.name_en = 'Turkish Coffee')
  RETURNING flavor_bases.name_en
)
INSERT INTO public.flavor_bases (name_en, name_ar, price, type, is_active, sort_order, updated_at)
SELECT base_rows.name_en, base_rows.name_ar, base_rows.price, base_rows.type, true, base_rows.sort_order, now()
FROM base_rows
WHERE NOT EXISTS (
  SELECT 1
  FROM public.flavor_bases
  WHERE lower(flavor_bases.name_en) = lower(base_rows.name_en)
    OR (lower(flavor_bases.name_en) = 'turkish' AND base_rows.name_en = 'Turkish Coffee')
);

-- 5. Flavor options for all four Customize Flavor bases
WITH flavor_catalog (
  flavor_order,
  group_order,
  group_name_en,
  group_name_ar,
  flavor_slug,
  flavor_name_en,
  flavor_name_ar,
  is_chunk
) AS (
  VALUES
    (1, 1, 'Original LINE', 'الأساسي', 'french-original', 'French / Original', 'فرنساوي / أوريجينال', false),
    (2, 2, 'sweets LINE', 'حلويات', 'chocolate-chunks', 'Chocolate Chunks', 'شوكولاتة قطع', true),
    (3, 2, 'sweets LINE', 'حلويات', 'chocolate', 'Chocolate', 'شوكولاتة', false),
    (4, 2, 'sweets LINE', 'حلويات', 'caramel', 'Caramel', 'كراميل', false),
    (5, 2, 'sweets LINE', 'حلويات', 'vanilla', 'Vanilla', 'فانيلا', false),
    (6, 2, 'sweets LINE', 'حلويات', 'lotus', 'Lotus', 'لوتس', false),
    (7, 2, 'sweets LINE', 'حلويات', 'oreo', 'Oreo', 'أوريو', false),
    (8, 2, 'sweets LINE', 'حلويات', 'cherry', 'Cherry', 'كرز', false),
    (9, 3, 'Nuts', 'مكسرات', 'almond', 'Almond', 'لوز', false),
    (10, 3, 'Nuts', 'مكسرات', 'pistachio', 'Pistachio', 'فستق', false),
    (11, 3, 'Nuts', 'مكسرات', 'hazelnut-chunks', 'Hazelnut Chunks', 'بندق قطع', true),
    (12, 3, 'Nuts', 'مكسرات', 'hazelnut', 'Hazelnut', 'بندق', false),
    (13, 4, 'Fruits', 'فواكه', 'strawberry', 'Strawberry', 'فراولة', false),
    (14, 4, 'Fruits', 'فواكه', 'banana', 'Banana', 'موز', false),
    (15, 4, 'Fruits', 'فواكه', 'mango', 'Mango', 'مانجو', false),
    (16, 4, 'Fruits', 'فواكه', 'peach', 'Peach', 'خوخ', false),
    (17, 4, 'Fruits', 'فواكه', 'berry', 'Berry', 'توت', false),
    (18, 4, 'Fruits', 'فواكه', 'blueberry', 'Blueberry', 'توت أزرق', false),
    (19, 4, 'Fruits', 'فواكه', 'apple', 'Apple', 'تفاح', false),
    (20, 4, 'Fruits', 'فواكه', 'grape', 'Grape', 'عنب', false),
    (21, 4, 'Fruits', 'فواكه', 'watermelon', 'Watermelon', 'بطيخ', false),
    (22, 4, 'Fruits', 'فواكه', 'guava', 'Guava', 'جوافة', false),
    (23, 4, 'Fruits', 'فواكه', 'pineapple', 'Pineapple', 'أناناس', false),
    (24, 4, 'Fruits', 'فواكه', 'orange', 'Orange', 'برتقال', false),
    (25, 5, 'Special Order', 'سيبشيل أوردر', 'coconut', 'Coconut', 'جوز الهند', false),
    (26, 5, 'Special Order', 'سيبشيل أوردر', 'mocha', 'Mocha', 'موكا', false),
    (27, 5, 'Special Order', 'سيبشيل أوردر', 'pina-colada', 'Pina Colada', 'بينا كولادا', false),
    (28, 5, 'Special Order', 'سيبشيل أوردر', 'apple-hookah', 'Apple Hookah', 'شيشة تفاح', false),
    (29, 5, 'Special Order', 'سيبشيل أوردر', 'grape-hookah', 'Grape Hookah', 'شيشة عنب', false),
    (30, 5, 'Special Order', 'سيبشيل أوردر', 'hot-cider', 'Hot Cider', 'هوت سيدر', false)
),
target_options AS (
  SELECT
    flavor_bases.id AS base_id,
    flavor_catalog.flavor_name_en,
    flavor_catalog.flavor_name_ar,
    CASE WHEN flavor_catalog.is_chunk THEN 70::numeric ELSE 50::numeric END AS price_delta,
    CASE WHEN flavor_catalog.is_chunk THEN 'chunks' ELSE 'standard' END AS option_type,
    flavor_catalog.flavor_order AS sort_order
  FROM public.flavor_bases
  CROSS JOIN flavor_catalog
  WHERE lower(flavor_bases.name_en) IN ('turkish coffee', 'coffee mix', 'cappuccino', 'hot chocolate')
),
updated_options AS (
  UPDATE public.flavor_options
  SET
    name_ar = target_options.flavor_name_ar,
    price_delta = target_options.price_delta,
    option_type = target_options.option_type,
    is_active = true,
    sort_order = target_options.sort_order,
    updated_at = now()
  FROM target_options
  WHERE flavor_options.base_id = target_options.base_id
    AND lower(flavor_options.name_en) = lower(target_options.flavor_name_en)
  RETURNING flavor_options.base_id, flavor_options.name_en
)
INSERT INTO public.flavor_options (
  base_id,
  name_en,
  name_ar,
  price_delta,
  option_type,
  is_active,
  sort_order,
  updated_at
)
SELECT
  target_options.base_id,
  target_options.flavor_name_en,
  target_options.flavor_name_ar,
  target_options.price_delta,
  target_options.option_type,
  true,
  target_options.sort_order,
  now()
FROM target_options
WHERE NOT EXISTS (
  SELECT 1
  FROM public.flavor_options
  WHERE flavor_options.base_id = target_options.base_id
    AND lower(flavor_options.name_en) = lower(target_options.flavor_name_en)
);

UPDATE public.flavor_options
SET is_active = false, updated_at = now()
WHERE lower(name_en) IN ('sahlab', 'salep')
   OR name_ar ILIKE '%سحلب%';

NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================
-- Verification queries
-- ============================================================

-- Categories count should be 7.
SELECT count(*) AS categories_count
FROM public.categories;

-- Expected visible product counts:
-- Turkish Coffee 4, Espresso 4, Flavored Coffee 30,
-- Coffee Mix 30, Cappuccino 30, Hot Chocolate 30, Nescafe 0.
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

-- Product size rows should be 384 for 128 products x 3 sizes.
SELECT count(*) AS product_sizes_count
FROM public.product_sizes;

-- Turkish products and prices.
SELECT
  products.name_en,
  product_sizes.size,
  product_sizes.price
FROM public.products
JOIN public.categories
  ON categories.id = products.category_id
JOIN public.product_sizes
  ON product_sizes.product_id = products.id
WHERE categories.slug = 'turkish-coffee'
  AND products.is_visible = true
ORDER BY products.created_at DESC, product_sizes.size;

-- Espresso products and prices.
SELECT
  products.name_en,
  product_sizes.size,
  product_sizes.price
FROM public.products
JOIN public.categories
  ON categories.id = products.category_id
JOIN public.product_sizes
  ON product_sizes.product_id = products.id
WHERE categories.slug = 'espresso'
  AND products.is_visible = true
ORDER BY products.created_at DESC, product_sizes.size;

-- Flavor product category counts.
SELECT
  categories.slug,
  count(products.id) AS visible_products
FROM public.categories
LEFT JOIN public.products
  ON products.category_id = categories.id
 AND products.is_visible = true
WHERE categories.slug IN ('flavored-coffee', 'coffee-mix', 'cappuccino', 'hot-chocolate')
GROUP BY categories.slug, categories.sort_order
ORDER BY categories.sort_order;

-- Coffee beans count by family should be arabica=9 and robusta=5.
SELECT family, count(*) AS beans_count
FROM public.coffee_beans
WHERE is_active = true
GROUP BY family
ORDER BY family;

-- Flavor options count should be 30 per base.
SELECT
  flavor_bases.name_en AS base_name,
  count(flavor_options.id) AS active_options
FROM public.flavor_bases
LEFT JOIN public.flavor_options
  ON flavor_options.base_id = flavor_bases.id
 AND flavor_options.is_active = true
WHERE flavor_bases.name_en IN ('Turkish Coffee', 'Coffee Mix', 'Cappuccino', 'Hot Chocolate')
GROUP BY flavor_bases.name_en, flavor_bases.sort_order
ORDER BY flavor_bases.sort_order;

-- These should return zero visible rows.
SELECT count(*) AS visible_old_wrong_products
FROM public.products
WHERE is_visible = true
  AND lower(name_en) IN (
    'morning strength',
    'perfect balance',
    'professional clean cup',
    'turkish premium',
    'economy crema',
    'classic italian',
    'specialty floral',
    'premium vip',
    'sahlab',
    'salep'
  );

SELECT count(*) AS active_sahlab_flavor_options
FROM public.flavor_options
WHERE is_active = true
  AND (lower(name_en) IN ('sahlab', 'salep') OR name_ar ILIKE '%سحلب%');

SELECT 'seed complete' AS status;
