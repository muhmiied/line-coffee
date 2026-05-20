-- Fix category Arabic names to match brand spec
UPDATE categories SET name_ar = 'القهوة التركي'   WHERE slug = 'turkish-coffee';
UPDATE categories SET name_ar = 'الإسبريسو'        WHERE slug = 'espresso';
UPDATE categories SET name_ar = 'القهوة بالنكهات' WHERE slug = 'flavored-coffee';
UPDATE categories SET name_ar = 'كوفي ميكس'        WHERE slug = 'coffee-mix';
UPDATE categories SET name_ar = 'كابتشينو'          WHERE slug = 'cappuccino';
UPDATE categories SET name_ar = 'هوت شوكليت'        WHERE slug = 'hot-chocolate';
UPDATE categories SET name_ar = 'نسكافيه'           WHERE slug = 'nescafe';

-- Insert categories if they don't exist
INSERT INTO categories (slug, name_en, name_ar, sort_order, is_visible)
SELECT 'turkish-coffee', 'Turkish Coffee', 'القهوة التركي', 1, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'turkish-coffee');

INSERT INTO categories (slug, name_en, name_ar, sort_order, is_visible)
SELECT 'espresso', 'Espresso', 'الإسبريسو', 2, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'espresso');

INSERT INTO categories (slug, name_en, name_ar, sort_order, is_visible)
SELECT 'flavored-coffee', 'Flavored Coffee', 'القهوة بالنكهات', 3, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'flavored-coffee');

INSERT INTO categories (slug, name_en, name_ar, sort_order, is_visible)
SELECT 'coffee-mix', 'Coffee Mix', 'كوفي ميكس', 4, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'coffee-mix');

INSERT INTO categories (slug, name_en, name_ar, sort_order, is_visible)
SELECT 'cappuccino', 'Cappuccino', 'كابتشينو', 5, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'cappuccino');

INSERT INTO categories (slug, name_en, name_ar, sort_order, is_visible)
SELECT 'hot-chocolate', 'Hot Chocolate', 'هوت شوكليت', 6, false
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'hot-chocolate');

INSERT INTO categories (slug, name_en, name_ar, sort_order, is_visible)
SELECT 'nescafe', 'Nescafe', 'نسكافيه', 7, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'nescafe');

-- Fix flavor base names
UPDATE flavor_bases SET name_en = 'Turkish Coffee', name_ar = 'القهوة التركي', price = 400
WHERE lower(name_en) IN ('turkish', 'turkish coffee');

UPDATE flavor_bases SET name_en = 'Coffee Mix', name_ar = 'كوفي ميكس', price = 220
WHERE lower(name_en) = 'coffee mix';

UPDATE flavor_bases SET name_en = 'Cappuccino', name_ar = 'كابتشينو', price = 270
WHERE lower(name_en) = 'cappuccino';

-- Fix Indian Robusta Arabic name (was 'هندي', ambiguous with Arabica Indian)
UPDATE coffee_beans SET name_ar = 'هندي روبوستا'
WHERE lower(name_en) = 'indian robusta';

-- Add missing flavor options if not present (watermelon, guava, pineapple, orange, hookah)
INSERT INTO flavor_options (name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT 'Orange', 'برتقال', 50, 'standard', true, 23
WHERE NOT EXISTS (SELECT 1 FROM flavor_options WHERE lower(name_en) = 'orange');

INSERT INTO flavor_options (name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT 'Watermelon', 'بطيخ', 50, 'standard', true, 24
WHERE NOT EXISTS (SELECT 1 FROM flavor_options WHERE lower(name_en) = 'watermelon');

INSERT INTO flavor_options (name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT 'Guava', 'جوافة', 50, 'standard', true, 25
WHERE NOT EXISTS (SELECT 1 FROM flavor_options WHERE lower(name_en) = 'guava');

INSERT INTO flavor_options (name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT 'Pineapple', 'أناناس', 50, 'standard', true, 26
WHERE NOT EXISTS (SELECT 1 FROM flavor_options WHERE lower(name_en) = 'pineapple');

INSERT INTO flavor_options (name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT 'Apple Hookah', 'شيشة تفاح', 50, 'standard', true, 27
WHERE NOT EXISTS (SELECT 1 FROM flavor_options WHERE lower(name_en) = 'apple hookah');

INSERT INTO flavor_options (name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT 'Grape Hookah', 'شيشة عنب', 50, 'standard', true, 28
WHERE NOT EXISTS (SELECT 1 FROM flavor_options WHERE lower(name_en) = 'grape hookah');

INSERT INTO flavor_options (name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT 'Hot Cider', 'هوت سيدر', 50, 'standard', true, 29
WHERE NOT EXISTS (SELECT 1 FROM flavor_options WHERE lower(name_en) = 'hot cider');
