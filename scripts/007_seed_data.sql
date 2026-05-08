-- Line Coffee Seed Data
-- Run after all schema scripts

-- Seed Categories
INSERT INTO categories (slug, name_en, name_ar, description_en, description_ar, sort_order) VALUES
  ('specialty-coffee', 'Specialty Coffee', 'قهوة مختصة', 'Premium single-origin and specialty blends', 'خلطات فاخرة من القهوة المختصة', 1),
  ('espresso-blends', 'Espresso Blends', 'خلطات الإسبريسو', 'Rich, bold blends perfect for espresso', 'خلطات غنية ومميزة مثالية للإسبريسو', 2),
  ('single-origin', 'Single Origin', 'أصل واحد', 'Pure coffees from specific regions', 'قهوة نقية من مناطق محددة', 3),
  ('flavored-coffee', 'Flavored Coffee', 'قهوة منكهة', 'Unique flavored coffee varieties', 'أصناف قهوة بنكهات فريدة', 4),
  ('decaf', 'Decaf', 'منزوعة الكافيين', 'All the taste, none of the caffeine', 'كل المذاق بدون كافيين', 5),
  ('accessories', 'Accessories', 'ملحقات', 'Coffee brewing accessories', 'أدوات تحضير القهوة', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO products (slug, name_en, name_ar, description_en, description_ar, category_id, origin, roast_level, flavor_notes, is_featured, is_best_seller, is_new) VALUES
  (
    'ethiopian-yirgacheffe',
    'Ethiopian Yirgacheffe',
    'إثيوبي يرغاتشيف',
    'A bright and fruity coffee with wine-like acidity, floral notes, and a smooth finish. Grown at high altitudes in the birthplace of coffee.',
    'قهوة مشرقة وفاكهية مع حموضة تشبه النبيذ، ونكهات زهرية، ونهاية سلسة. تزرع على ارتفاعات عالية في مهد القهوة.',
    (SELECT id FROM categories WHERE slug = 'single-origin'),
    'Ethiopia',
    'light',
    ARRAY['Blueberry', 'Jasmine', 'Citrus', 'Honey'],
    true,
    true,
    false
  ),
  (
    'colombian-supremo',
    'Colombian Supremo',
    'كولومبي سوبريمو',
    'A well-balanced coffee with caramel sweetness, nutty undertones, and a clean, bright finish. From the highlands of Colombia.',
    'قهوة متوازنة مع حلاوة الكراميل ونغمات الجوز ونهاية نظيفة ومشرقة. من مرتفعات كولومبيا.',
    (SELECT id FROM categories WHERE slug = 'single-origin'),
    'Colombia',
    'medium',
    ARRAY['Caramel', 'Walnut', 'Apple', 'Brown Sugar'],
    true,
    false,
    false
  ),
  (
    'house-espresso-blend',
    'House Espresso Blend',
    'خلطة الإسبريسو المنزلية',
    'Our signature espresso blend combining Brazilian and Ethiopian beans for a rich, smooth shot with chocolate and berry notes.',
    'خلطة الإسبريسو المميزة لدينا تجمع بين حبوب البرازيل وإثيوبيا لشوت غني وسلس مع نكهات الشوكولاتة والتوت.',
    (SELECT id FROM categories WHERE slug = 'espresso-blends'),
    'Blend',
    'dark',
    ARRAY['Dark Chocolate', 'Cherry', 'Caramel'],
    true,
    true,
    false
  ),
  (
    'brazilian-santos',
    'Brazilian Santos',
    'برازيلي سانتوس',
    'A smooth, low-acid coffee with chocolate and nutty flavors. Perfect for those who prefer a milder cup.',
    'قهوة سلسة منخفضة الحموضة مع نكهات الشوكولاتة والمكسرات. مثالية لمن يفضلون فنجاناً أخف.',
    (SELECT id FROM categories WHERE slug = 'single-origin'),
    'Brazil',
    'medium',
    ARRAY['Chocolate', 'Hazelnut', 'Mild Fruit'],
    false,
    true,
    false
  ),
  (
    'kenyan-aa',
    'Kenyan AA',
    'كيني AA',
    'A bold, full-bodied coffee with bright acidity, black currant notes, and a wine-like finish. Premium grade.',
    'قهوة جريئة كاملة القوام مع حموضة مشرقة ونكهات الكشمش الأسود ونهاية تشبه النبيذ. درجة ممتازة.',
    (SELECT id FROM categories WHERE slug = 'specialty-coffee'),
    'Kenya',
    'medium',
    ARRAY['Black Currant', 'Grapefruit', 'Brown Sugar', 'Tomato'],
    true,
    false,
    true
  ),
  (
    'sumatra-mandheling',
    'Sumatra Mandheling',
    'سومطرة ماندلينج',
    'An earthy, full-bodied coffee with low acidity, herbal notes, and a smooth, lingering finish.',
    'قهوة ترابية كاملة القوام مع حموضة منخفضة ونكهات عشبية ونهاية سلسة ومستمرة.',
    (SELECT id FROM categories WHERE slug = 'single-origin'),
    'Indonesia',
    'dark',
    ARRAY['Earth', 'Tobacco', 'Dark Chocolate', 'Herbs'],
    false,
    false,
    false
  ),
  (
    'italian-roast',
    'Italian Roast',
    'تحميص إيطالي',
    'An intensely bold espresso roast with smoky, bittersweet chocolate notes. For the true dark roast lover.',
    'تحميص إسبريسو جريء بشكل مكثف مع نكهات الشوكولاتة المدخنة والمرة. لمحبي التحميص الداكن الحقيقيين.',
    (SELECT id FROM categories WHERE slug = 'espresso-blends'),
    'Blend',
    'espresso',
    ARRAY['Smoke', 'Dark Chocolate', 'Caramel', 'Bittersweet'],
    false,
    true,
    false
  ),
  (
    'vanilla-hazelnut',
    'Vanilla Hazelnut',
    'الفانيليا والبندق',
    'A smooth medium roast infused with natural vanilla and hazelnut flavors. A sweet, aromatic treat.',
    'تحميص متوسط سلس مشبع بنكهات الفانيليا والبندق الطبيعية. علاج عطري وحلو.',
    (SELECT id FROM categories WHERE slug = 'flavored-coffee'),
    'Blend',
    'medium',
    ARRAY['Vanilla', 'Hazelnut', 'Cream'],
    true,
    false,
    false
  ),
  (
    'guatemalan-antigua',
    'Guatemalan Antigua',
    'غواتيمالي أنتيغوا',
    'A complex coffee with spicy, cocoa notes, full body, and a smooth finish. Volcanic soil grown.',
    'قهوة معقدة مع نكهات حارة وكاكاو وقوام كامل ونهاية سلسة. تزرع في تربة بركانية.',
    (SELECT id FROM categories WHERE slug = 'single-origin'),
    'Guatemala',
    'medium',
    ARRAY['Cocoa', 'Spice', 'Smoke', 'Toffee'],
    false,
    false,
    true
  ),
  (
    'costa-rican-tarrazu',
    'Costa Rican Tarrazu',
    'كوستاريكي تارازو',
    'A bright, clean coffee with honey sweetness, citrus notes, and a crisp finish. From premium Tarrazu region.',
    'قهوة مشرقة ونظيفة مع حلاوة العسل ونكهات الحمضيات ونهاية حادة. من منطقة تارازو الممتازة.',
    (SELECT id FROM categories WHERE slug = 'specialty-coffee'),
    'Costa Rica',
    'light',
    ARRAY['Honey', 'Orange', 'Almond', 'Bright'],
    false,
    false,
    false
  ),
  (
    'swiss-water-decaf',
    'Swiss Water Decaf',
    'ديكاف سويس ووتر',
    'All the flavor, none of the caffeine. Chemical-free decaffeination process preserves the rich, smooth taste.',
    'كل النكهة بدون كافيين. عملية إزالة الكافيين الخالية من المواد الكيميائية تحافظ على المذاق الغني والسلس.',
    (SELECT id FROM categories WHERE slug = 'decaf'),
    'Blend',
    'medium',
    ARRAY['Chocolate', 'Caramel', 'Smooth'],
    false,
    false,
    false
  ),
  (
    'breakfast-blend',
    'Morning Breakfast Blend',
    'خلطة الإفطار الصباحية',
    'A bright, lively blend to start your day. Balanced acidity with citrus and light caramel notes.',
    'خلطة مشرقة ومنعشة لبدء يومك. حموضة متوازنة مع نكهات الحمضيات والكراميل الخفيف.',
    (SELECT id FROM categories WHERE slug = 'specialty-coffee'),
    'Blend',
    'light',
    ARRAY['Citrus', 'Caramel', 'Bright', 'Clean'],
    true,
    true,
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed Product Sizes with prices
INSERT INTO product_sizes (product_id, size, price, compare_at_price)
SELECT p.id, '250g', 
  CASE 
    WHEN p.slug IN ('ethiopian-yirgacheffe', 'kenyan-aa', 'costa-rican-tarrazu') THEN 185.00
    WHEN p.slug IN ('house-espresso-blend', 'italian-roast') THEN 165.00
    WHEN p.slug = 'swiss-water-decaf' THEN 195.00
    ELSE 155.00
  END,
  CASE 
    WHEN p.is_best_seller THEN 
      CASE 
        WHEN p.slug IN ('ethiopian-yirgacheffe', 'kenyan-aa', 'costa-rican-tarrazu') THEN 210.00
        ELSE 180.00
      END
    ELSE NULL
  END
FROM products p
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO product_sizes (product_id, size, price, compare_at_price)
SELECT p.id, '500g', 
  CASE 
    WHEN p.slug IN ('ethiopian-yirgacheffe', 'kenyan-aa', 'costa-rican-tarrazu') THEN 340.00
    WHEN p.slug IN ('house-espresso-blend', 'italian-roast') THEN 300.00
    WHEN p.slug = 'swiss-water-decaf' THEN 360.00
    ELSE 280.00
  END,
  NULL
FROM products p
ON CONFLICT (product_id, size) DO NOTHING;

INSERT INTO product_sizes (product_id, size, price, compare_at_price)
SELECT p.id, '1kg', 
  CASE 
    WHEN p.slug IN ('ethiopian-yirgacheffe', 'kenyan-aa', 'costa-rican-tarrazu') THEN 620.00
    WHEN p.slug IN ('house-espresso-blend', 'italian-roast') THEN 550.00
    WHEN p.slug = 'swiss-water-decaf' THEN 680.00
    ELSE 520.00
  END,
  NULL
FROM products p
ON CONFLICT (product_id, size) DO NOTHING;

-- Seed Testimonials
INSERT INTO testimonials (name, city, rating, text_en, text_ar, is_approved) VALUES
  (
    'Ahmed Hassan',
    'Cairo',
    5,
    'The Ethiopian Yirgacheffe is simply the best coffee I have ever tasted. The fruity notes and smooth finish make every morning special.',
    'قهوة إثيوبيا يرغاتشيف هي ببساطة أفضل قهوة تذوقتها على الإطلاق. النكهات الفاكهية والنهاية السلسة تجعل كل صباح مميزاً.',
    true
  ),
  (
    'Sarah Mohamed',
    'Alexandria',
    5,
    'I have been ordering from Line Coffee for over a year now. The quality is consistently excellent and the delivery is always fast.',
    'أطلب من لاين كوفي منذ أكثر من عام. الجودة ممتازة باستمرار والتوصيل دائماً سريع.',
    true
  ),
  (
    'Omar Farid',
    'Giza',
    5,
    'As a coffee shop owner, I trust Line Coffee for all my espresso blends. My customers always compliment the rich, smooth taste.',
    'كصاحب مقهى، أثق في لاين كوفي لجميع خلطات الإسبريسو الخاصة بي. عملائي دائماً يمدحون المذاق الغني والسلس.',
    true
  ),
  (
    'Layla Ibrahim',
    'Mansoura',
    4,
    'The vanilla hazelnut flavor is divine! It is like having dessert in a cup. Perfect for my afternoon coffee break.',
    'نكهة الفانيليا والبندق رائعة! إنها مثل تناول الحلوى في فنجان. مثالية لاستراحة القهوة بعد الظهر.',
    true
  ),
  (
    'Khaled Mansour',
    'Tanta',
    5,
    'Line Coffee introduced me to specialty coffee. Now I cannot go back to regular coffee. The Colombian Supremo is my daily ritual.',
    'لاين كوفي عرفتني على القهوة المختصة. الآن لا أستطيع العودة للقهوة العادية. كولومبي سوبريمو هي طقسي اليومي.',
    true
  )
ON CONFLICT DO NOTHING;
