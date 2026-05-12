-- ============================================================
-- LINE COFFEE — ECOMMERCE UPGRADE MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. ORDERS TABLE — add missing columns
-- ──────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address         text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items           jsonb DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes           text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  text DEFAULT 'cod';

-- Ensure order_number column exists (text)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number text;

-- Auto-generate order_number on insert if missing
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
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- ──────────────────────────────────────────────
-- 2. PROFILES TABLE — add shipping fields
-- ──────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes   text;

-- ──────────────────────────────────────────────
-- 3. PRODUCTS TABLE — inventory management
-- ──────────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10;
-- stock_quantity should already exist; add it defensively
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;

-- ──────────────────────────────────────────────
-- 4. COFFEE BEANS TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coffee_beans (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en      text        NOT NULL,
  name_ar      text        NOT NULL,
  origin       text,
  description_en text,
  description_ar text,
  is_active    boolean     DEFAULT true,
  sort_order   integer     DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE coffee_beans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read coffee_beans" ON coffee_beans;
CREATE POLICY "Public read coffee_beans" ON coffee_beans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manage coffee_beans" ON coffee_beans;
CREATE POLICY "Service role manage coffee_beans" ON coffee_beans
  FOR ALL USING (auth.role() = 'service_role');

-- Seed default beans (safe: ON CONFLICT DO NOTHING via unique check)
INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Ethiopian', 'إثيوبي', 'Ethiopia', true, 1
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Ethiopian');

INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Colombian', 'كولومبي', 'Colombia', true, 2
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Colombian');

INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Brazilian', 'برازيلي', 'Brazil', true, 3
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Brazilian');

INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Yemeni', 'يمني', 'Yemen', true, 4
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Yemeni');

INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Kenyan', 'كيني', 'Kenya', true, 5
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Kenyan');

INSERT INTO coffee_beans (name_en, name_ar, origin, is_active, sort_order)
SELECT 'Guatemalan', 'غواتيمالي', 'Guatemala', true, 6
WHERE NOT EXISTS (SELECT 1 FROM coffee_beans WHERE name_en = 'Guatemalan');

-- ──────────────────────────────────────────────
-- 5. FLAVOR BASES TABLE
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

DROP POLICY IF EXISTS "Public read flavor_bases" ON flavor_bases;
CREATE POLICY "Public read flavor_bases" ON flavor_bases
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manage flavor_bases" ON flavor_bases;
CREATE POLICY "Service role manage flavor_bases" ON flavor_bases
  FOR ALL USING (auth.role() = 'service_role');

-- Seed default bases
INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Cappuccino', 'كابتشينو', true, 1
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Cappuccino');

INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Coffee Mix', 'ميكس القهوة', true, 2
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Coffee Mix');

INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Hot Chocolate', 'شوكولاتة ساخنة', true, 3
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Hot Chocolate');

INSERT INTO flavor_bases (name_en, name_ar, is_active, sort_order)
SELECT 'Latte', 'لاتيه', true, 4
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE name_en = 'Latte');

-- ──────────────────────────────────────────────
-- 6. FLAVOR OPTIONS TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flavor_options (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  base_id    uuid        REFERENCES flavor_bases(id) ON DELETE CASCADE,
  name_en    text        NOT NULL,
  name_ar    text        NOT NULL,
  is_active  boolean     DEFAULT true,
  sort_order integer     DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE flavor_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read flavor_options" ON flavor_options;
CREATE POLICY "Public read flavor_options" ON flavor_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manage flavor_options" ON flavor_options;
CREATE POLICY "Service role manage flavor_options" ON flavor_options
  FOR ALL USING (auth.role() = 'service_role');

-- Seed cappuccino flavors
INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Vanilla', 'فانيلا', true, 1
FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo JOIN flavor_bases fbase ON fo.base_id = fbase.id WHERE fbase.name_en = 'Cappuccino' AND fo.name_en = 'Vanilla');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Caramel', 'كراميل', true, 2
FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo JOIN flavor_bases fbase ON fo.base_id = fbase.id WHERE fbase.name_en = 'Cappuccino' AND fo.name_en = 'Caramel');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Hazelnut', 'بندق', true, 3
FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo JOIN flavor_bases fbase ON fo.base_id = fbase.id WHERE fbase.name_en = 'Cappuccino' AND fo.name_en = 'Hazelnut');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Chocolate', 'شوكولاتة', true, 4
FROM flavor_bases fb WHERE fb.name_en = 'Cappuccino'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo JOIN flavor_bases fbase ON fo.base_id = fbase.id WHERE fbase.name_en = 'Cappuccino' AND fo.name_en = 'Chocolate');

-- Seed latte flavors
INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Vanilla', 'فانيلا', true, 1
FROM flavor_bases fb WHERE fb.name_en = 'Latte'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo JOIN flavor_bases fbase ON fo.base_id = fbase.id WHERE fbase.name_en = 'Latte' AND fo.name_en = 'Vanilla');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Caramel', 'كراميل', true, 2
FROM flavor_bases fb WHERE fb.name_en = 'Latte'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo JOIN flavor_bases fbase ON fo.base_id = fbase.id WHERE fbase.name_en = 'Latte' AND fo.name_en = 'Caramel');

INSERT INTO flavor_options (base_id, name_en, name_ar, is_active, sort_order)
SELECT fb.id, 'Cinnamon', 'قرفة', true, 3
FROM flavor_bases fb WHERE fb.name_en = 'Latte'
AND NOT EXISTS (SELECT 1 FROM flavor_options fo JOIN flavor_bases fbase ON fo.base_id = fbase.id WHERE fbase.name_en = 'Latte' AND fo.name_en = 'Cinnamon');

-- ──────────────────────────────────────────────
-- 7. ORDER ITEMS — ensure product_image column exists
-- ──────────────────────────────────────────────
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS customizations jsonb;

-- ──────────────────────────────────────────────
-- Done ✓
-- ──────────────────────────────────────────────
