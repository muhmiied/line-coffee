-- DEPRECATED - DO NOT RUN.
-- Replaced by scripts/013_seed_clean_line_coffee_catalog.sql for catalog data.
-- This legacy demo seed can reintroduce non-Line Coffee test products.

DO $$
BEGIN
  RAISE EXCEPTION 'Deprecated seed script. Use scripts/013_seed_clean_line_coffee_catalog.sql instead.';
END $$;

-- =============================================
-- SEED DATA FOR LINE COFFEE
-- =============================================
-- This script adds initial data to the database.
-- Categories, Products, and Testimonials.
-- =============================================

-- =============================================
-- CATEGORIES
-- =============================================
INSERT INTO public.categories (slug, name_en, name_ar, description_en, description_ar, image_url, sort_order) VALUES
('single-origin', 'Single Origin', 'قهوة أحادية المصدر', 'Premium single origin coffees from around the world', 'قهوة فاخرة من مصدر واحد من جميع أنحاء العالم', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80', 1),
('blends', 'Signature Blends', 'خلطات مميزة', 'Our expertly crafted coffee blends', 'خلطات القهوة المصنوعة بخبرة', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', 2),
('espresso', 'Espresso', 'إسبريسو', 'Perfect for espresso lovers', 'مثالية لمحبي الإسبريسو', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&q=80', 3),
('accessories', 'Accessories', 'أدوات', 'Coffee brewing equipment and accessories', 'معدات وأدوات تحضير القهوة', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 4)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PRODUCTS
-- =============================================
INSERT INTO public.products (slug, name_en, name_ar, description_en, description_ar, category_id, images, origin, roast_level, flavor_notes, is_featured, is_best_seller, is_new, stock_quantity) VALUES
(
  'ethiopian-yirgacheffe',
  'Ethiopian Yirgacheffe',
  'إثيوبي يرغاشيف',
  'A bright and floral coffee with notes of citrus and bergamot. This single-origin gem from the birthplace of coffee offers a truly unique tasting experience.',
  'قهوة مشرقة وزهرية مع نكهات الحمضيات والبرغموت. هذه الجوهرة أحادية المصدر من مهد القهوة تقدم تجربة تذوق فريدة حقًا.',
  (SELECT id FROM public.categories WHERE slug = 'single-origin'),
  ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
  'Ethiopia',
  'light',
  ARRAY['Citrus', 'Bergamot', 'Floral', 'Tea-like'],
  true,
  true,
  false,
  100
),
(
  'colombian-supremo',
  'Colombian Supremo',
  'كولومبي سوبريمو',
  'A well-balanced coffee with caramel sweetness and a smooth, nutty finish. Perfect for everyday enjoyment.',
  'قهوة متوازنة مع حلاوة الكراميل ونهاية ناعمة بنكهة الجوز. مثالية للاستمتاع اليومي.',
  (SELECT id FROM public.categories WHERE slug = 'single-origin'),
  ARRAY['https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=800&q=80'],
  'Colombia',
  'medium',
  ARRAY['Caramel', 'Nutty', 'Chocolate'],
  true,
  false,
  false,
  80
),
(
  'sumatra-mandheling',
  'Sumatra Mandheling',
  'سومطرة ماندلينج',
  'A full-bodied, earthy coffee with low acidity and notes of dark chocolate and herbs.',
  'قهوة غنية وترابية مع حموضة منخفضة ونكهات الشوكولاتة الداكنة والأعشاب.',
  (SELECT id FROM public.categories WHERE slug = 'single-origin'),
  ARRAY['https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&q=80'],
  'Indonesia',
  'dark',
  ARRAY['Earthy', 'Dark Chocolate', 'Herbal', 'Smoky'],
  false,
  true,
  false,
  60
),
(
  'house-blend',
  'House Blend',
  'خلطة المنزل',
  'Our signature blend combining the best of Central and South American beans for a perfectly balanced cup.',
  'خلطتنا المميزة التي تجمع بين أفضل حبوب أمريكا الوسطى والجنوبية لفنجان متوازن تمامًا.',
  (SELECT id FROM public.categories WHERE slug = 'blends'),
  ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
  'Blend',
  'medium',
  ARRAY['Balanced', 'Smooth', 'Caramel', 'Nutty'],
  true,
  true,
  false,
  150
),
(
  'espresso-roast',
  'Espresso Roast',
  'تحميص إسبريسو',
  'A bold, rich espresso blend with notes of dark chocolate and a velvety crema.',
  'خلطة إسبريسو جريئة وغنية مع نكهات الشوكولاتة الداكنة وكريما مخملية.',
  (SELECT id FROM public.categories WHERE slug = 'espresso'),
  ARRAY['https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&q=80'],
  'Blend',
  'espresso',
  ARRAY['Bold', 'Dark Chocolate', 'Caramel', 'Rich'],
  false,
  true,
  false,
  90
),
(
  'kenya-aa',
  'Kenya AA',
  'كينيا AA',
  'A bright and complex coffee with wine-like acidity and notes of blackcurrant and citrus.',
  'قهوة مشرقة ومعقدة مع حموضة تشبه النبيذ ونكهات الكشمش الأسود والحمضيات.',
  (SELECT id FROM public.categories WHERE slug = 'single-origin'),
  ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'],
  'Kenya',
  'light',
  ARRAY['Blackcurrant', 'Citrus', 'Wine-like', 'Complex'],
  false,
  false,
  true,
  40
),
(
  'brazilian-santos',
  'Brazilian Santos',
  'برازيلي سانتوس',
  'A smooth, mild coffee with low acidity and pleasant nutty undertones.',
  'قهوة ناعمة ومعتدلة مع حموضة منخفضة ونكهات جوزية لطيفة.',
  (SELECT id FROM public.categories WHERE slug = 'single-origin'),
  ARRAY['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80'],
  'Brazil',
  'medium',
  ARRAY['Nutty', 'Mild', 'Smooth', 'Sweet'],
  false,
  false,
  false,
  70
),
(
  'dark-roast-blend',
  'Dark Roast Blend',
  'خلطة التحميص الداكن',
  'An intense, smoky blend for those who love a bold cup with deep, rich flavors.',
  'خلطة مكثفة ومدخنة لمحبي الفنجان الجريء مع نكهات عميقة وغنية.',
  (SELECT id FROM public.categories WHERE slug = 'blends'),
  ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80'],
  'Blend',
  'dark',
  ARRAY['Smoky', 'Bold', 'Dark Chocolate', 'Intense'],
  false,
  false,
  true,
  55
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PRODUCT SIZES
-- Add sizes and prices for each product
-- =============================================
INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 45.00, NULL, true FROM public.products WHERE slug = 'ethiopian-yirgacheffe'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 85.00, 90.00, true FROM public.products WHERE slug = 'ethiopian-yirgacheffe'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 160.00, 180.00, true FROM public.products WHERE slug = 'ethiopian-yirgacheffe'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 40.00, NULL, true FROM public.products WHERE slug = 'colombian-supremo'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 75.00, NULL, true FROM public.products WHERE slug = 'colombian-supremo'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 140.00, NULL, true FROM public.products WHERE slug = 'colombian-supremo'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 48.00, NULL, true FROM public.products WHERE slug = 'sumatra-mandheling'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 90.00, NULL, true FROM public.products WHERE slug = 'sumatra-mandheling'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 170.00, NULL, true FROM public.products WHERE slug = 'sumatra-mandheling'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 35.00, NULL, true FROM public.products WHERE slug = 'house-blend'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 65.00, NULL, true FROM public.products WHERE slug = 'house-blend'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 120.00, NULL, true FROM public.products WHERE slug = 'house-blend'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 42.00, NULL, true FROM public.products WHERE slug = 'espresso-roast'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 80.00, NULL, true FROM public.products WHERE slug = 'espresso-roast'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 150.00, NULL, true FROM public.products WHERE slug = 'espresso-roast'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 55.00, NULL, true FROM public.products WHERE slug = 'kenya-aa'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 105.00, NULL, true FROM public.products WHERE slug = 'kenya-aa'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 200.00, NULL, true FROM public.products WHERE slug = 'kenya-aa'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 32.00, NULL, true FROM public.products WHERE slug = 'brazilian-santos'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 60.00, NULL, true FROM public.products WHERE slug = 'brazilian-santos'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 110.00, NULL, true FROM public.products WHERE slug = 'brazilian-santos'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '250g', 38.00, NULL, true FROM public.products WHERE slug = 'dark-roast-blend'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '500g', 72.00, NULL, true FROM public.products WHERE slug = 'dark-roast-blend'
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO public.product_sizes (product_id, size, price, compare_at_price, is_available)
SELECT id, '1kg', 135.00, NULL, true FROM public.products WHERE slug = 'dark-roast-blend'
ON CONFLICT (product_id, size) DO NOTHING;

-- =============================================
-- TESTIMONIALS
-- =============================================
INSERT INTO public.testimonials (customer_name, customer_avatar, content_en, content_ar, rating, is_featured, is_visible) VALUES
(
  'Ahmed Al-Rashid',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'The Ethiopian Yirgacheffe is absolutely divine! The floral notes and citrus undertones make every morning special. Best coffee I''ve ever had.',
  'قهوة الإثيوبي يرغاشيف رائعة للغاية! النكهات الزهرية ونغمات الحمضيات تجعل كل صباح مميزًا. أفضل قهوة تذوقتها على الإطلاق.',
  5,
  true,
  true
),
(
  'Sara Mohammed',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  'I''ve been ordering from Line Coffee for over a year now. The quality is consistently excellent, and the House Blend is my daily go-to.',
  'أطلب من لاين كوفي منذ أكثر من عام الآن. الجودة ممتازة باستمرار، وخلطة المنزل هي خياري اليومي.',
  5,
  true,
  true
),
(
  'Khalid Hassan',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  'As an espresso enthusiast, I can say their Espresso Roast produces the most beautiful crema. Rich, bold, and absolutely perfect.',
  'كمحب للإسبريسو، أستطيع القول أن تحميص الإسبريسو لديهم ينتج أجمل كريما. غني وجريء ومثالي تمامًا.',
  5,
  true,
  true
),
(
  'Fatima Al-Zahrani',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  'The freshness of their beans is unmatched. You can taste the difference from the first sip. Highly recommend!',
  'نضارة حبوبهم لا مثيل لها. يمكنك تذوق الفرق من أول رشفة. أوصي بشدة!',
  5,
  false,
  true
),
(
  'Omar Yusuf',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  'Excellent customer service and the Sumatra Mandheling is my new favorite. Deep, earthy flavors that I absolutely love.',
  'خدمة عملاء ممتازة وسومطرة ماندلينج أصبحت مفضلتي الجديدة. نكهات عميقة وترابية أحبها تمامًا.',
  4,
  false,
  true
)
ON CONFLICT DO NOTHING;
