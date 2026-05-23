-- Line Coffee refinement: synced custom carts, dynamic customization pricing, reviews, blog, media, cancellations.

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NULL REFERENCES products(id) ON DELETE CASCADE,
  size text,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS product_id uuid NULL;
ALTER TABLE IF EXISTS cart_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS client_item_id text;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS unit_price numeric(10,2);
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS customizations jsonb DEFAULT '{}'::jsonb;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'cart_items'
      AND i.indisunique
      AND pg_get_indexdef(i.indexrelid) ILIKE '%(user_id, client_item_id)%'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM cart_items
      WHERE client_item_id IS NOT NULL
      GROUP BY user_id, client_item_id
      HAVING count(*) > 1
    ) THEN
      RAISE NOTICE 'Skipping unique index on cart_items(user_id, client_item_id): duplicate rows exist.';
    ELSE
      CREATE UNIQUE INDEX cart_items_user_client_item_unique
        ON cart_items(user_id, client_item_id)
        WHERE client_item_id IS NOT NULL;
    END IF;
  END IF;
END $$;

ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS cancellation_initiated_by text;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS stock_restored_at timestamptz;

ALTER TABLE IF EXISTS coffee_beans ADD COLUMN IF NOT EXISTS family text DEFAULT 'other';
ALTER TABLE IF EXISTS coffee_beans ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0;

ALTER TABLE IF EXISTS flavor_bases ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0;
ALTER TABLE IF EXISTS flavor_bases ADD COLUMN IF NOT EXISTS type text DEFAULT 'base';

ALTER TABLE IF EXISTS flavor_options ADD COLUMN IF NOT EXISTS price_delta numeric(10,2) DEFAULT 50;
ALTER TABLE IF EXISTS flavor_options ADD COLUMN IF NOT EXISTS option_type text DEFAULT 'standard';

ALTER TABLE IF EXISTS testimonials ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;
ALTER TABLE IF EXISTS testimonials ADD COLUMN IF NOT EXISTS source_order_id uuid NULL REFERENCES orders(id) ON DELETE SET NULL;
DROP POLICY IF EXISTS "Public read testimonials" ON testimonials;
CREATE POLICY "Public read testimonials" ON testimonials
  FOR SELECT USING (is_visible = true AND COALESCE(is_approved, true) = true);

ALTER TABLE IF EXISTS banners ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'banner';
ALTER TABLE IF EXISTS banners ADD COLUMN IF NOT EXISTS usage_area text DEFAULT 'promo';
ALTER TABLE IF EXISTS banners ADD COLUMN IF NOT EXISTS alt_en text;
ALTER TABLE IF EXISTS banners ADD COLUMN IF NOT EXISTS alt_ar text;
ALTER TABLE IF EXISTS banners ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE IF EXISTS banners ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  content_ar text,
  content_en text,
  cover_image text,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Service role manage blog_posts" ON blog_posts;
CREATE POLICY "Public read published blog_posts" ON blog_posts
  FOR SELECT USING (is_published = true);
CREATE POLICY "Service role manage blog_posts" ON blog_posts
  FOR ALL USING (auth.role() = 'service_role');

UPDATE coffee_beans SET family = 'arabica', price = 600, origin = 'India', name_ar = 'هندي'
WHERE lower(name_en) IN ('indian', 'indian arabica');
INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Indian', 'هندي', 'India', 'arabica', 600, true, 1
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) IN ('indian', 'indian arabica'));

UPDATE coffee_beans SET family = 'arabica', price = 482 WHERE lower(name_en) = 'brazilian';
INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Brazilian', 'برازيلي', 'Brazil', 'arabica', 482, true, 2
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'brazilian');

UPDATE coffee_beans SET family = 'arabica', price = 705 WHERE lower(name_en) = 'colombian';
INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Colombian', 'كولومبي', 'Colombia', 'arabica', 705, true, 3
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'colombian');

UPDATE coffee_beans SET family = 'arabica', price = 487 WHERE lower(name_en) = 'ethiopian';
INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Ethiopian', 'حبشي', 'Ethiopia', 'arabica', 487, true, 4
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'ethiopian');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Indian Plantation', 'هندي بلانتيشن', 'India', 'arabica', 682, true, 5
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'indian plantation');

UPDATE coffee_beans SET name_en = 'Guatemala', family = 'arabica', price = 835 WHERE lower(name_en) IN ('guatemalan', 'guatemala');
INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Guatemala', 'جواتيمالا', 'Guatemala', 'arabica', 835, true, 6
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'guatemala');

UPDATE coffee_beans SET family = 'arabica', price = 1187 WHERE lower(name_en) = 'yemeni';
INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Yemeni', 'يمني', 'Yemen', 'arabica', 1187, true, 7
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'yemeni');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Peruvian', 'بيرو', 'Peru', 'arabica', 835, true, 8
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'peruvian');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Costa Rican', 'كوستاريكا', 'Costa Rica', 'arabica', 835, true, 9
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'costa rican');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Indonesian', 'إندونيسي', 'Indonesia', 'robusta', 340, true, 10
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'indonesian');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Indonesian XL', 'إندونيسي XL', 'Indonesia', 'robusta', 346, true, 11
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'indonesian xl');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Indian Robusta', 'هندي', 'India', 'robusta', 376, true, 12
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'indian robusta');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Vietnamese', 'فيتنامي', 'Vietnam', 'robusta', 346, true, 13
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'vietnamese');

INSERT INTO coffee_beans (name_en, name_ar, origin, family, price, is_active, sort_order)
SELECT 'Vietnamese Washed', 'فيتنامي مغسول', 'Vietnam', 'robusta', 376, true, 14
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE lower(name_en) = 'vietnamese washed');

UPDATE flavor_bases SET price = 400, name_ar = 'تركي' WHERE lower(name_en) = 'turkish';
INSERT INTO flavor_bases (name_en, name_ar, price, type, is_active, sort_order)
SELECT 'Turkish', 'تركي', 400, 'base', true, 1
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE lower(name_en) = 'turkish');

UPDATE flavor_bases SET price = 220 WHERE lower(name_en) = 'coffee mix';
UPDATE flavor_bases SET price = 270 WHERE lower(name_en) = 'cappuccino';

UPDATE flavor_options SET price_delta = 70, option_type = 'chunks'
WHERE lower(name_en) LIKE '%chunk%' OR name_ar LIKE '%قطع%';
UPDATE flavor_options SET price_delta = 50, option_type = 'standard'
WHERE option_type IS NULL OR option_type <> 'chunks';
