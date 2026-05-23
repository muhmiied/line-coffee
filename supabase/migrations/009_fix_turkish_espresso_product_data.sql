-- Fix Turkish Coffee and Espresso product records.
-- Idempotent data correction: no deletes, no unrelated categories touched.

DO $$
BEGIN
  IF to_regclass('public.categories') IS NULL
    OR to_regclass('public.products') IS NULL
    OR to_regclass('public.product_sizes') IS NULL THEN
    RAISE EXCEPTION 'Required product catalog tables are missing.';
  END IF;
END $$;

-- Ensure customer-facing categories exist and remain visible.
INSERT INTO public.categories (slug, name_en, name_ar, sort_order, is_visible, updated_at)
VALUES
  ('turkish-coffee', 'Turkish Coffee', 'القهوة التركي', 1, true, now()),
  ('espresso', 'Espresso', 'الإسبريسو', 2, true, now())
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  sort_order = EXCLUDED.sort_order,
  is_visible = true,
  updated_at = now();

-- Hide the outdated Turkish/Espresso seed products without deleting data.
UPDATE public.products
SET
  is_visible = false,
  is_featured = false,
  is_best_seller = false,
  is_new = false,
  updated_at = now()
WHERE slug IN (
    'turkish-morning-strength',
    'turkish-perfect-balance',
    'turkish-professional-clean',
    'turkish-premium',
    'espresso-economy-crema',
    'espresso-classic-italian',
    'espresso-specialty-floral',
    'espresso-premium-vip'
  )
  OR lower(name_en) IN (
    'morning strength',
    'perfect balance',
    'professional clean cup',
    'turkish premium',
    'economy crema',
    'classic italian',
    'specialty floral',
    'premium vip'
  );

-- Upsert the expected Turkish Coffee and Espresso products.
WITH expected_products (
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
      'فيلفيت تركي',
      'Velvety smooth body with balanced bitterness and warm roast depth.',
      'قوام مخملي ناعم مع مرارة متوازنة وعمق تحميص دافئ.',
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
      'ليالي القاهرة',
      'Dark roast with deep caramel undertones, a cup that captures the night.',
      'تحميص داكن مع نغمات كراميل عميقة، كوب يجسد ليالي القاهرة.',
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
      'ميدنايت تركي',
      'Rich and full-bodied with a smoky chocolate finish.',
      'غني وثقيل القوام مع نهاية شوكولاتة مدخنة.',
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
      'A premium specialty blend of finest arabica, floral, fruity, and refined.',
      'توليفة specialty من أجود الأرابيكا، فلورال وفاكهي وراقي.',
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
      'Excellent crema and high strength, ideal for espresso machines and large volumes.',
      'كريمة ممتازة وقوة عالية، مثالي لماكينات الإسبريسو والكميات الكبيرة.',
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
      'Chocolate and caramel balance with rich crema, perfect for cappuccino and latte.',
      'توازن شوكولاتة وكراميل مع كريمة غنية، مثالي للكابتشينو واللاتيه.',
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
      'Precision-roasted espresso with bright acidity and clean body.',
      'إسبريسو محمص بدقة مع حموضة نابضة وقوام نظيف.',
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
      'Single-origin specialty espresso with golden crema and complex florals.',
      'إسبريسو specialty أحادي المصدر مع كريمة ذهبية وفلورال معقد.',
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
  expected_products.slug,
  expected_products.name_en,
  expected_products.name_ar,
  expected_products.description_en,
  expected_products.description_ar,
  categories.id,
  expected_products.images,
  expected_products.roast_level,
  expected_products.flavor_notes,
  expected_products.is_featured,
  expected_products.is_best_seller,
  expected_products.is_new,
  true,
  expected_products.stock_quantity,
  now()
FROM expected_products
JOIN public.categories
  ON categories.slug = expected_products.category_slug
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images,
  roast_level = EXCLUDED.roast_level,
  flavor_notes = EXCLUDED.flavor_notes,
  is_featured = EXCLUDED.is_featured,
  is_best_seller = EXCLUDED.is_best_seller,
  is_new = EXCLUDED.is_new,
  is_visible = true,
  stock_quantity = COALESCE(products.stock_quantity, EXCLUDED.stock_quantity),
  updated_at = now();

-- Keep Turkish Coffee and Espresso category pages to the approved public catalog.
UPDATE public.products
SET
  is_visible = false,
  is_featured = false,
  is_best_seller = false,
  is_new = false,
  updated_at = now()
FROM public.categories
WHERE products.category_id = categories.id
  AND categories.slug IN ('turkish-coffee', 'espresso')
  AND products.slug NOT IN (
    'velvet-turkish',
    'cairo-nights',
    'midnight-turkish',
    'royal-line',
    'line-crema',
    'first-line',
    'headshot',
    'gold-shot'
  );

-- Update existing matching size rows, then insert only missing rows.
WITH expected_sizes (product_slug, size, price) AS (
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
),
expected_product_sizes AS (
  SELECT products.id AS product_id, expected_sizes.size, expected_sizes.price
  FROM expected_sizes
  JOIN public.products
    ON products.slug = expected_sizes.product_slug
),
updated_sizes AS (
  UPDATE public.product_sizes
  SET
    price = expected_product_sizes.price,
    is_available = true
  FROM expected_product_sizes
  WHERE product_sizes.product_id = expected_product_sizes.product_id
    AND product_sizes.size = expected_product_sizes.size
  RETURNING product_sizes.product_id, product_sizes.size
)
INSERT INTO public.product_sizes (product_id, size, price, is_available)
SELECT
  expected_product_sizes.product_id,
  expected_product_sizes.size,
  expected_product_sizes.price,
  true
FROM expected_product_sizes
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_sizes
  WHERE product_sizes.product_id = expected_product_sizes.product_id
    AND product_sizes.size = expected_product_sizes.size
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.product_sizes
    JOIN public.products
      ON products.id = product_sizes.product_id
    WHERE products.slug IN (
        'velvet-turkish',
        'cairo-nights',
        'midnight-turkish',
        'royal-line',
        'line-crema',
        'first-line',
        'headshot',
        'gold-shot'
      )
      AND product_sizes.size IN ('250g', '500g', '1kg')
    GROUP BY product_sizes.product_id, product_sizes.size
    HAVING count(*) > 1
  ) THEN
    RAISE NOTICE 'Duplicate product_sizes rows exist for expected Turkish/Espresso products. Prices were updated, but duplicate rows were not deleted.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.product_sizes
    JOIN public.products
      ON products.id = product_sizes.product_id
    WHERE products.slug IN (
        'velvet-turkish',
        'cairo-nights',
        'midnight-turkish',
        'royal-line',
        'line-crema',
        'first-line',
        'headshot',
        'gold-shot'
      )
      AND product_sizes.size NOT IN ('250g', '500g', '1kg')
  ) THEN
    RAISE NOTICE 'Unexpected product_sizes rows exist for expected Turkish/Espresso products. They were not changed or deleted.';
  END IF;
END $$;
