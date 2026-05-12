-- ============================================================
-- LINE COFFEE — FULL DATABASE SETUP + ECOMMERCE UPGRADE
-- Run this in your Supabase SQL Editor (safe to run multiple times)
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. PROFILES (linked to Supabase auth.users)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                 uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name         text,
  last_name          text,
  phone              text,
  avatar_url         text,
  preferred_language text        DEFAULT 'ar',
  address            text,
  city               text,
  notes              text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- Add new columns if table already existed without them
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address            text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city               text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes              text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'ar';

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role manage profiles" ON profiles;

CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role manage profiles" ON profiles FOR ALL  USING (auth.role() = 'service_role');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ar')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────────
-- 2. CATEGORIES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug           text        UNIQUE NOT NULL,
  name_en        text        NOT NULL,
  name_ar        text        NOT NULL,
  description_en text,
  description_ar text,
  image_url      text,
  sort_order     integer     DEFAULT 0,
  is_visible     boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories"       ON categories;
DROP POLICY IF EXISTS "Service role manage categories" ON categories;
CREATE POLICY "Public read categories"         ON categories FOR SELECT USING (true);
CREATE POLICY "Service role manage categories" ON categories FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 3. PRODUCTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                 text        UNIQUE NOT NULL,
  name_en              text        NOT NULL,
  name_ar              text        NOT NULL,
  description_en       text,
  description_ar       text,
  short_description_en text,
  short_description_ar text,
  category_id          uuid        REFERENCES categories(id) ON DELETE SET NULL,
  images               text[]      DEFAULT '{}',
  origin               text,
  roast_level          text        CHECK (roast_level IN ('light','medium','dark','espresso')),
  flavor_notes         text[]      DEFAULT '{}',
  is_featured          boolean     DEFAULT false,
  is_best_seller       boolean     DEFAULT false,
  is_new               boolean     DEFAULT false,
  is_visible           boolean     DEFAULT true,
  stock_quantity       integer     DEFAULT 0,
  low_stock_threshold  integer     DEFAULT 10,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description_en text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description_ar text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold   integer DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity        integer DEFAULT 0;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read visible products"  ON products;
DROP POLICY IF EXISTS "Service role manage products"  ON products;
CREATE POLICY "Public read visible products" ON products FOR SELECT USING (is_visible = true);
CREATE POLICY "Service role manage products" ON products FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 4. PRODUCT SIZES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_sizes (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id       uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size             text        NOT NULL CHECK (size IN ('250g','500g','1kg')),
  price            numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  sku              text,
  is_available     boolean     DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read product_sizes"      ON product_sizes;
DROP POLICY IF EXISTS "Service role manage product_sizes" ON product_sizes;
CREATE POLICY "Public read product_sizes"       ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Service role manage product_sizes" ON product_sizes FOR ALL  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 5. ORDERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number    text,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Customer snapshot
  customer_name   text,
  customer_email  text,
  customer_phone  text,
  address         text,
  -- Financials
  subtotal        numeric(10,2) DEFAULT 0,
  shipping_cost   numeric(10,2) DEFAULT 0,
  tax             numeric(10,2) DEFAULT 0,
  discount_code   text,
  discount_amount numeric(10,2) DEFAULT 0,
  discount        numeric(10,2) DEFAULT 0,
  total           numeric(10,2) DEFAULT 0,
  currency        text          DEFAULT 'EGP',
  -- Addresses (JSON snapshot)
  shipping_address jsonb,
  billing_address  jsonb,
  -- Items JSON snapshot
  items           jsonb         DEFAULT '[]',
  -- Payment
  payment_method  text          DEFAULT 'cod',
  payment_status  text          DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  -- Status
  status          text          DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  notes           text,
  created_at      timestamptz   DEFAULT now(),
  updated_at      timestamptz   DEFAULT now()
);

-- Add new columns to existing orders table (safe)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number    text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address         text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items           jsonb DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes           text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  text DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency        text DEFAULT 'EGP';

-- Auto-generate order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'LC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own orders"     ON orders;
DROP POLICY IF EXISTS "Users insert orders"       ON orders;
DROP POLICY IF EXISTS "Service role manage orders" ON orders;
CREATE POLICY "Users view own orders"      ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert orders"        ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role manage orders" ON orders FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 6. ORDER ITEMS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     uuid        REFERENCES products(id) ON DELETE SET NULL,
  product_name   text        NOT NULL,
  product_image  text,
  size           text,
  quantity       integer     NOT NULL DEFAULT 1,
  unit_price     numeric(10,2) NOT NULL,
  total_price    numeric(10,2) NOT NULL,
  customizations jsonb,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image  text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS customizations jsonb;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manage order_items" ON order_items;
CREATE POLICY "Service role manage order_items" ON order_items FOR ALL USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 7. CARTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       text        NOT NULL,
  quantity   integer     NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id, size)
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own cart" ON carts;
CREATE POLICY "Users manage own cart" ON carts FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 8. WISHLISTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlists;
CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 9. TESTIMONIALS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name   text        NOT NULL,
  customer_avatar text,
  content_en      text        NOT NULL,
  content_ar      text        NOT NULL,
  rating          integer     DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_featured     boolean     DEFAULT false,
  is_visible      boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read testimonials"       ON testimonials;
DROP POLICY IF EXISTS "Service role manage testimonials" ON testimonials;
CREATE POLICY "Public read testimonials"         ON testimonials FOR SELECT USING (is_visible = true);
CREATE POLICY "Service role manage testimonials" ON testimonials FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 10. DISCOUNTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discounts (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code       text        UNIQUE NOT NULL,
  type       text        NOT NULL CHECK (type IN ('percentage','fixed')),
  value      numeric(10,2) NOT NULL,
  min_order  numeric(10,2),
  max_uses   integer,
  uses       integer     DEFAULT 0,
  is_active  boolean     DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active discounts"    ON discounts;
DROP POLICY IF EXISTS "Service role manage discounts"   ON discounts;
CREATE POLICY "Public read active discounts"  ON discounts FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manage discounts" ON discounts FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 11. BANNERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en   text,
  title_ar   text,
  image_url  text        NOT NULL,
  link_url   text,
  is_active  boolean     DEFAULT true,
  sort_order integer     DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read banners"       ON banners;
DROP POLICY IF EXISTS "Service role manage banners" ON banners;
CREATE POLICY "Public read banners"         ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manage banners" ON banners FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 12. BLOGS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug         text        UNIQUE NOT NULL,
  title_en     text        NOT NULL,
  title_ar     text        NOT NULL,
  content_en   text,
  content_ar   text,
  excerpt_en   text,
  excerpt_ar   text,
  cover_image  text,
  is_published boolean     DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published blogs"  ON blogs;
DROP POLICY IF EXISTS "Service role manage blogs"    ON blogs;
CREATE POLICY "Public read published blogs" ON blogs FOR SELECT USING (is_published = true);
CREATE POLICY "Service role manage blogs"   ON blogs FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 13. CUSTOMIZATION OPTIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customization_options (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  type       text        NOT NULL,
  name_en    text        NOT NULL,
  name_ar    text        NOT NULL,
  is_active  boolean     DEFAULT true,
  sort_order integer     DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read customization_options"       ON customization_options;
DROP POLICY IF EXISTS "Service role manage customization_options" ON customization_options;
CREATE POLICY "Public read customization_options"         ON customization_options FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manage customization_options" ON customization_options FOR ALL    USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────
-- 14. COFFEE BEANS TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coffee_beans (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en        text        NOT NULL,
  name_ar        text        NOT NULL,
  origin         text,
  description_en text,
  description_ar text,
  is_active      boolean     DEFAULT true,
  sort_order     integer     DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE coffee_beans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read coffee_beans"        ON coffee_beans;
DROP POLICY IF EXISTS "Service role manage coffee_beans" ON coffee_beans;
CREATE POLICY "Public read coffee_beans"         ON coffee_beans FOR SELECT USING (true);
CREATE POLICY "Service role manage coffee_beans" ON coffee_beans FOR ALL    USING (auth.role() = 'service_role');

INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Ethiopian',  'إثيوبي',    'Ethiopia',  true, 1 WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Ethiopian');
INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Colombian',  'كولومبي',   'Colombia',  true, 2 WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Colombian');
INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Brazilian',  'برازيلي',   'Brazil',    true, 3 WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Brazilian');
INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Yemeni',     'يمني',      'Yemen',     true, 4 WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Yemeni');
INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Kenyan',     'كيني',      'Kenya',     true, 5 WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Kenyan');
INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Guatemalan', 'غواتيمالي', 'Guatemala', true, 6 WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Guatemalan');

-- ──────────────────────────────────────────────
-- 15. FLAVOR BASES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flavor_bases (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en    text        NOT NULL,
  name_ar    text        NOT NULL,
  is_active  boolean     DEFAULT true,
  sort_order integer     DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE flavor_bases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read flavor_bases"        ON flavor_bases;
DROP POLICY IF EXISTS "Service role manage flavor_bases" ON flavor_bases;
CREATE POLICY "Public read flavor_bases"         ON flavor_bases FOR SELECT USING (true);
CREATE POLICY "Service role manage flavor_bases" ON flavor_bases FOR ALL    USING (auth.role() = 'service_role');

INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Cappuccino',    'كابتشينو',       true, 1 WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Cappuccino');
INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Coffee Mix',    'ميكس القهوة',    true, 2 WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Coffee Mix');
INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Hot Chocolate', 'شوكولاتة ساخنة', true, 3 WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Hot Chocolate');
INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Latte',         'لاتيه',          true, 4 WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Latte');

-- ──────────────────────────────────────────────
-- 16. FLAVOR OPTIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flavor_options (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  base_id    uuid        NOT NULL REFERENCES flavor_bases(id) ON DELETE CASCADE,
  name_en    text        NOT NULL,
  name_ar    text        NOT NULL,
  is_active  boolean     DEFAULT true,
  sort_order integer     DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE flavor_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read flavor_options"        ON flavor_options;
DROP POLICY IF EXISTS "Service role manage flavor_options" ON flavor_options;
CREATE POLICY "Public read flavor_options"         ON flavor_options FOR SELECT USING (true);
CREATE POLICY "Service role manage flavor_options" ON flavor_options FOR ALL    USING (auth.role() = 'service_role');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Vanilla',   'فانيلا',    true, 1 FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Vanilla');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Caramel',   'كراميل',    true, 2 FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Caramel');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Hazelnut',  'بندق',      true, 3 FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Hazelnut');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Chocolate', 'شوكولاتة',  true, 4 FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Chocolate');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Vanilla',   'فانيلا',    true, 1 FROM flavor_bases fb WHERE fb.name_en = 'Latte'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Vanilla');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Caramel',   'كراميل',    true, 2 FROM flavor_bases fb WHERE fb.name_en = 'Latte'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Caramel');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Cinnamon',  'قرفة',      true, 3 FROM flavor_bases fb WHERE fb.name_en = 'Latte'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Cinnamon');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Vanilla',   'فانيلا',    true, 1 FROM flavor_bases fb WHERE fb.name_en = 'Coffee Mix'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Vanilla');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Caramel',   'كراميل',    true, 2 FROM flavor_bases fb WHERE fb.name_en = 'Coffee Mix'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Caramel');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Vanilla',   'فانيلا',    true, 1 FROM flavor_bases fb WHERE fb.name_en = 'Hot Chocolate'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Vanilla');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Caramel',   'كراميل',    true, 2 FROM flavor_bases fb WHERE fb.name_en = 'Hot Chocolate'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo WHERE fo.base_id = fb.id AND fo.name_en = 'Caramel');

-- ──────────────────────────────────────────────
-- Done ✓
-- ──────────────────────────────────────────────
