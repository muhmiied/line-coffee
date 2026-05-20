-- ============================================================
-- 007: Fix categories, flavor bases, and flavor options per base
-- ============================================================
-- All statements are idempotent (UPDATE + INSERT WHERE NOT EXISTS).
-- flavor_options always receive an explicit base_id (NOT NULL).
-- ============================================================

-- ── 1. Category Arabic names ─────────────────────────────────
UPDATE categories SET name_ar = 'القهوة التركي'   WHERE slug = 'turkish-coffee';
UPDATE categories SET name_ar = 'الإسبريسو'        WHERE slug = 'espresso';
UPDATE categories SET name_ar = 'القهوة بالنكهات' WHERE slug = 'flavored-coffee';
UPDATE categories SET name_ar = 'كوفي ميكس'        WHERE slug = 'coffee-mix';
UPDATE categories SET name_ar = 'كابتشينو'          WHERE slug = 'cappuccino';
UPDATE categories SET name_ar = 'هوت شوكليت'        WHERE slug = 'hot-chocolate';
UPDATE categories SET name_ar = 'نسكافيه'           WHERE slug = 'nescafe';

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

-- ── 2. Coffee beans: fix Indian Robusta Arabic name ──────────
UPDATE coffee_beans SET name_ar = 'هندي روبوستا'
WHERE lower(name_en) = 'indian robusta';

-- ── 3. Flavor bases: upsert three correct bases ──────────────
-- Deactivate old bases that should not appear in Customize Flavor
UPDATE flavor_bases SET is_active = false
WHERE lower(name_en) IN ('latte', 'hot chocolate');

-- Turkish Coffee (slug → "turkish-coffee")
UPDATE flavor_bases
SET name_en = 'Turkish Coffee', name_ar = 'القهوة التركي',
    price = 400, type = 'base', is_active = true, sort_order = 1
WHERE lower(name_en) IN ('turkish', 'turkish coffee');

INSERT INTO flavor_bases (name_en, name_ar, price, type, is_active, sort_order)
SELECT 'Turkish Coffee', 'القهوة التركي', 400, 'base', true, 1
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE lower(name_en) IN ('turkish', 'turkish coffee'));

-- Coffee Mix (slug → "coffee-mix")
UPDATE flavor_bases
SET name_en = 'Coffee Mix', name_ar = 'كوفي ميكس',
    price = 220, type = 'base', is_active = true, sort_order = 2
WHERE lower(name_en) = 'coffee mix';

INSERT INTO flavor_bases (name_en, name_ar, price, type, is_active, sort_order)
SELECT 'Coffee Mix', 'كوفي ميكس', 220, 'base', true, 2
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE lower(name_en) = 'coffee mix');

-- Cappuccino (slug → "cappuccino")
UPDATE flavor_bases
SET name_en = 'Cappuccino', name_ar = 'كابتشينو',
    price = 270, type = 'base', is_active = true, sort_order = 3
WHERE lower(name_en) = 'cappuccino';

INSERT INTO flavor_bases (name_en, name_ar, price, type, is_active, sort_order)
SELECT 'Cappuccino', 'كابتشينو', 270, 'base', true, 3
WHERE NOT EXISTS (SELECT 1 FROM flavor_bases WHERE lower(name_en) = 'cappuccino');

-- ── 4. Flavor options per base ───────────────────────────────
-- Pattern: INSERT ... SELECT base.id, flavor VALUES ... WHERE NOT EXISTS
-- All three bases share the same columns: price_delta (50 standard / 70 chunks), option_type.

-- ── 4a. Turkish Coffee — 29 flavors (full list incl. hookah) ─
WITH tk AS (SELECT id FROM flavor_bases WHERE lower(name_en) = 'turkish coffee' LIMIT 1),
     f (en, ar, delta, otype, srt) AS (VALUES
       ('Hazelnut',          'بندق',          50::numeric, 'standard'::text,  1::int),
       ('Hazelnut Chunks',   'بندق قطع',      70,          'chunks',           2),
       ('Almond',            'لوز',            50,          'standard',         3),
       ('Pistachio',         'فستق',           50,          'standard',         4),
       ('Chocolate',         'شوكولاتة',       50,          'standard',         5),
       ('Chocolate Chunks',  'شوكولاتة قطع',  70,          'chunks',           6),
       ('Nutella',           'نوتيلا',         50,          'standard',         7),
       ('Oreo',              'أوريو',          50,          'standard',         8),
       ('Lotus',             'لوتس',           50,          'standard',         9),
       ('Cinnabon',          'سينابون',        50,          'standard',        10),
       ('Coconut',           'جوز الهند',      50,          'standard',        11),
       ('Vanilla',           'فانيليا',        50,          'standard',        12),
       ('Caramel',           'كراميل',         50,          'standard',        13),
       ('Mocha',             'موكا',           50,          'standard',        14),
       ('Strawberry',        'فراولة',         50,          'standard',        15),
       ('Banana',            'موز',            50,          'standard',        16),
       ('Mango',             'مانجو',          50,          'standard',        17),
       ('Peach',             'خوخ',            50,          'standard',        18),
       ('Blueberry',         'توت',            50,          'standard',        19),
       ('Cherry',            'كرز',            50,          'standard',        20),
       ('Apple',             'تفاح',           50,          'standard',        21),
       ('Grape',             'عنب',            50,          'standard',        22),
       ('Orange',            'برتقال',         50,          'standard',        23),
       ('Watermelon',        'بطيخ',           50,          'standard',        24),
       ('Guava',             'جوافة',          50,          'standard',        25),
       ('Pineapple',         'أناناس',         50,          'standard',        26),
       ('Apple Hookah',      'شيشة تفاح',      50,          'standard',        27),
       ('Grape Hookah',      'شيشة عنب',       50,          'standard',        28),
       ('Hot Cider',         'هوت سيدر',       50,          'standard',        29)
     )
INSERT INTO flavor_options (base_id, name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT tk.id, f.en, f.ar, f.delta, f.otype, true, f.srt
FROM f CROSS JOIN tk
WHERE tk.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM flavor_options fo
    WHERE fo.base_id = tk.id AND lower(fo.name_en) = lower(f.en)
  );

-- ── 4b. Coffee Mix — 26 flavors (no hookah/cider) ────────────
WITH cm AS (SELECT id FROM flavor_bases WHERE lower(name_en) = 'coffee mix' LIMIT 1),
     f (en, ar, delta, otype, srt) AS (VALUES
       ('Hazelnut',          'بندق',          50::numeric, 'standard'::text,  1::int),
       ('Hazelnut Chunks',   'بندق قطع',      70,          'chunks',           2),
       ('Almond',            'لوز',            50,          'standard',         3),
       ('Pistachio',         'فستق',           50,          'standard',         4),
       ('Chocolate',         'شوكولاتة',       50,          'standard',         5),
       ('Chocolate Chunks',  'شوكولاتة قطع',  70,          'chunks',           6),
       ('Nutella',           'نوتيلا',         50,          'standard',         7),
       ('Oreo',              'أوريو',          50,          'standard',         8),
       ('Lotus',             'لوتس',           50,          'standard',         9),
       ('Cinnabon',          'سينابون',        50,          'standard',        10),
       ('Coconut',           'جوز الهند',      50,          'standard',        11),
       ('Vanilla',           'فانيليا',        50,          'standard',        12),
       ('Caramel',           'كراميل',         50,          'standard',        13),
       ('Mocha',             'موكا',           50,          'standard',        14),
       ('Strawberry',        'فراولة',         50,          'standard',        15),
       ('Banana',            'موز',            50,          'standard',        16),
       ('Mango',             'مانجو',          50,          'standard',        17),
       ('Peach',             'خوخ',            50,          'standard',        18),
       ('Blueberry',         'توت',            50,          'standard',        19),
       ('Cherry',            'كرز',            50,          'standard',        20),
       ('Apple',             'تفاح',           50,          'standard',        21),
       ('Grape',             'عنب',            50,          'standard',        22),
       ('Orange',            'برتقال',         50,          'standard',        23),
       ('Watermelon',        'بطيخ',           50,          'standard',        24),
       ('Guava',             'جوافة',          50,          'standard',        25),
       ('Pineapple',         'أناناس',         50,          'standard',        26)
     )
INSERT INTO flavor_options (base_id, name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT cm.id, f.en, f.ar, f.delta, f.otype, true, f.srt
FROM f CROSS JOIN cm
WHERE cm.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM flavor_options fo
    WHERE fo.base_id = cm.id AND lower(fo.name_en) = lower(f.en)
  );

-- ── 4c. Cappuccino — 20 flavors (dessert + common fruits) ────
WITH cap AS (SELECT id FROM flavor_bases WHERE lower(name_en) = 'cappuccino' LIMIT 1),
     f (en, ar, delta, otype, srt) AS (VALUES
       ('Hazelnut',          'بندق',          50::numeric, 'standard'::text,  1::int),
       ('Hazelnut Chunks',   'بندق قطع',      70,          'chunks',           2),
       ('Almond',            'لوز',            50,          'standard',         3),
       ('Pistachio',         'فستق',           50,          'standard',         4),
       ('Chocolate',         'شوكولاتة',       50,          'standard',         5),
       ('Chocolate Chunks',  'شوكولاتة قطع',  70,          'chunks',           6),
       ('Nutella',           'نوتيلا',         50,          'standard',         7),
       ('Oreo',              'أوريو',          50,          'standard',         8),
       ('Lotus',             'لوتس',           50,          'standard',         9),
       ('Cinnabon',          'سينابون',        50,          'standard',        10),
       ('Coconut',           'جوز الهند',      50,          'standard',        11),
       ('Vanilla',           'فانيليا',        50,          'standard',        12),
       ('Caramel',           'كراميل',         50,          'standard',        13),
       ('Mocha',             'موكا',           50,          'standard',        14),
       ('Strawberry',        'فراولة',         50,          'standard',        15),
       ('Banana',            'موز',            50,          'standard',        16),
       ('Mango',             'مانجو',          50,          'standard',        17),
       ('Peach',             'خوخ',            50,          'standard',        18),
       ('Blueberry',         'توت',            50,          'standard',        19),
       ('Cherry',            'كرز',            50,          'standard',        20)
     )
INSERT INTO flavor_options (base_id, name_en, name_ar, price_delta, option_type, is_active, sort_order)
SELECT cap.id, f.en, f.ar, f.delta, f.otype, true, f.srt
FROM f CROSS JOIN cap
WHERE cap.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM flavor_options fo
    WHERE fo.base_id = cap.id AND lower(fo.name_en) = lower(f.en)
  );
