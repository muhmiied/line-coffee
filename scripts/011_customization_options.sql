-- =============================================
-- Customization options stored in site settings
-- =============================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.site_settings (key, value)
VALUES (
  'custom_blend_beans',
  $$[
    {"id":"brazilian","nameAr":"برازيلي","nameEn":"Brazilian","descAr":"ناعم وحلو، شوكولاتة خفيفة، مرارة منخفضة","descEn":"Soft and sweet with light chocolate notes and low bitterness","family":"arabica","isVisible":true},
    {"id":"colombian","nameAr":"كولومبي","nameEn":"Colombian","descAr":"متوازن، كراميل وفاكهة خفيفة، مناسب لأغلب الأذواق","descEn":"Balanced with caramel and light fruit notes","family":"arabica","isVisible":true},
    {"id":"ethiopian","nameAr":"حبشي","nameEn":"Ethiopian","descAr":"فلورال وفاكهي، حموضة خفيفة، قهوة مختصة","descEn":"Floral and fruity with bright light acidity","family":"arabica","isVisible":true},
    {"id":"guatemalan","nameAr":"جواتيمالا","nameEn":"Guatemalan","descAr":"شوكولاتة داكنة، جسم متوسط، طابع غني","descEn":"Dark chocolate notes with medium body","family":"arabica","isVisible":true},
    {"id":"yemeni","nameAr":"يمني","nameEn":"Yemeni","descAr":"تراثي وعطري، نكهة فريدة ودافئة","descEn":"Traditional, aromatic, and warmly distinctive","family":"arabica","isVisible":true},
    {"id":"peruvian","nameAr":"بيرو","nameEn":"Peruvian","descAr":"ناعم ونظيف، حموضة خفيفة وتوازن هادئ","descEn":"Clean and smooth with gentle acidity","family":"arabica","isVisible":true},
    {"id":"indonesian","nameAr":"إندونيسي","nameEn":"Indonesian","descAr":"قوي وثقيل، كافيين عالي وقوام واضح","descEn":"Bold and heavy with higher caffeine","family":"robusta","isVisible":true},
    {"id":"indonesian-xl","nameAr":"إندونيسي XL","nameEn":"Indonesian XL","descAr":"الأقوى، جسم كامل جداً وحضور واضح","descEn":"Extra bold with a very full body","family":"robusta","isVisible":true},
    {"id":"indian","nameAr":"هندي","nameEn":"Indian","descAr":"متوازن وقوي، مناسب كأساس للتوليفات","descEn":"Strong, balanced, and ideal as a blend base","family":"robusta","isVisible":true},
    {"id":"indian-plantation","nameAr":"هندي بلانتيشن","nameEn":"Indian Plantation","descAr":"ناعم نسبياً مقارنة بباقي الروبوستا","descEn":"Relatively smoother than classic robusta","family":"robusta","isVisible":true},
    {"id":"vietnamese","nameAr":"فيتنامي","nameEn":"Vietnamese","descAr":"قوي جداً، مرارة عالية وكريمة ممتازة","descEn":"Very strong with high bitterness and excellent crema","family":"robusta","isVisible":true}
  ]$$
)
ON CONFLICT (key) DO NOTHING;
