-- Line Coffee: Seed production categories
-- Run after 001_categories.sql (or 001_create_tables.sql)
-- Safe to re-run: uses ON CONFLICT (slug) DO UPDATE

INSERT INTO public.categories (slug, name_en, name_ar, image_url, sort_order, is_visible)
VALUES
  (
    'turkish-coffee',
    'Turkish Coffee',
    'قهوة تركي',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=1000&fit=crop',
    1, true
  ),
  (
    'espresso',
    'Espresso',
    'إسبريسو',
    'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=1000&fit=crop',
    2, true
  ),
  (
    'flavored-coffee',
    'Flavored Coffee',
    'قهوة نكهات',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=1000&fit=crop',
    3, true
  ),
  (
    'coffee-mix',
    'Coffee Mix',
    'كوفي ميكس',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=1000&fit=crop',
    4, true
  ),
  (
    'cappuccino',
    'Cappuccino',
    'كابتشينو',
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=1000&fit=crop',
    5, true
  ),
  (
    'hot-chocolate',
    'Hot Chocolate',
    'هوت شوكلت',
    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&h=1000&fit=crop',
    6, true
  )
ON CONFLICT (slug) DO UPDATE SET
  name_en    = EXCLUDED.name_en,
  name_ar    = EXCLUDED.name_ar,
  image_url  = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;
