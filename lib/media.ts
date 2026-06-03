export const MEDIA_BUCKET = 'line-coffee-media'
export const MEDIA_MAX_UPLOAD_SIZE = 8 * 1024 * 1024

export const MEDIA_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

export type MediaUsageOption = {
  value: string
  labelEn: string
  labelAr: string
  mediaType: string
  minWidth: number
  minHeight: number
  recommendationEn: string
  recommendationAr: string
}

export type SectionType =
  | 'full_hero'
  | 'split_content'
  | 'full_image_banner'
  | 'centered_cta'
  | 'multi_card_slider'
  | 'testimonial_highlight'

export type SectionEditorTemplate =
  | 'hero'
  | 'story'
  | 'banner'
  | 'cards'
  | 'text_cards'
  | 'contact'
  | 'generic'

export type SectionTextBlock = {
  id: string
  icon?: string
  title_en: string
  title_ar: string
  description_en?: string
  description_ar?: string
  is_active?: boolean
}

export type SectionStatBlock = {
  id: string
  value: string
  label_en: string
  label_ar: string
  is_active?: boolean
}

export type SectionCustomTextBlock = {
  id: string
  text_en: string
  text_ar: string
  x?: number
  y?: number
  width?: number
  scale?: number
  is_active?: boolean
}

// Visual effects stored inside content.visual_effects (no DB migration needed)
export type VisualEffects = {
  overlay_color?: string
  gradient_type?: 'solid' | 'radial' | 'top_bottom' | 'vignette_only'
  blur?: number
  brightness?: number
  contrast?: number
  saturation?: number
  warmth?: number
  vignette?: number
  glow?: number
  grain?: number
  parallax?: number
}

export type SectionBuilderContent = {
  eyebrow_en?: string
  eyebrow_ar?: string
  title_en?: string
  title_ar?: string
  subtitle_en?: string
  subtitle_ar?: string
  body_en?: string
  body_ar?: string
  button_text_en?: string
  button_text_ar?: string
  secondary_button_text_en?: string
  secondary_button_text_ar?: string
  button_link?: string
  features?: SectionTextBlock[]
  stats?: SectionStatBlock[]
  custom_texts?: SectionCustomTextBlock[]
  hidden_elements?: string[]
  visual_effects?: VisualEffects
  title_scale?: number
  subtitle_scale?: number
  body_scale?: number
  eyebrow_scale?: number
  button_scale?: number
  secondary_button_scale?: number
  stats_scale?: number
  text_width?: number
  eyebrow_width?: number
  title_width?: number
  subtitle_width?: number
  body_width?: number
  button_width?: number
  secondary_button_width?: number
  text_animation?: 'none' | 'fade_up' | 'slide_in' | 'soft_zoom'
  text_animation_duration?: number
}

export type SectionElementPosition = {
  x?: number
  y?: number
  align?: 'left' | 'center' | 'right'
  visible?: boolean
}

export type SectionBuilderLayout = {
  elements?: Record<string, SectionElementPosition>
  imagePosition?: SectionElementPosition
  textPosition?: SectionElementPosition
  overlayOpacity?: number
  objectPosition?: string
}

export type WebsiteSectionConfig = {
  key: string
  pageKey: string
  pageLabelEn: string
  pageLabelAr: string
  usageArea: string
  mediaType: string
  sectionType: SectionType
  editorTemplate: SectionEditorTemplate
  labelEn: string
  labelAr: string
  descriptionEn: string
  descriptionAr: string
  fallbackImage: string
  defaultTitleEn: string
  defaultTitleAr: string
  defaultSubtitleEn: string
  defaultSubtitleAr: string
  defaultButtonTextEn?: string
  defaultButtonTextAr?: string
  defaultButtonLink?: string
  supportsSlides: boolean
  supportsCta: boolean
  minWidth: number
  minHeight: number
  defaultContent?: SectionBuilderContent
  defaultLayout?: SectionBuilderLayout
}

export const MEDIA_USAGE_OPTIONS: MediaUsageOption[] = [
  {
    value: 'hero',
    labelEn: 'Hero',
    labelAr: 'الهيرو',
    mediaType: 'hero',
    minWidth: 1920,
    minHeight: 900,
    recommendationEn: 'Hero desktop: recommended minimum 1920x900',
    recommendationAr: 'الهيرو على الديسكتوب: الحد الأدنى الموصى به 1920x900',
  },
  {
    value: 'about_top',
    labelEn: 'About top',
    labelAr: 'أعلى صفحة من نحن',
    mediaType: 'section',
    minWidth: 1600,
    minHeight: 800,
    recommendationEn: 'Section banners: recommended minimum 1600x800',
    recommendationAr: 'بانرات الأقسام: الحد الأدنى الموصى به 1600x800',
  },
  {
    value: 'about_lower',
    labelEn: 'About lower / Our Story',
    labelAr: 'من نحن السفلي / قصتنا',
    mediaType: 'section',
    minWidth: 1000,
    minHeight: 1000,
    recommendationEn: 'Story images: recommended minimum 1000x1000',
    recommendationAr: 'صور القصة: الحد الأدنى الموصى به 1000x1000',
  },
  {
    value: 'banner',
    labelEn: 'Section banner',
    labelAr: 'بانر قسم',
    mediaType: 'banner',
    minWidth: 1600,
    minHeight: 800,
    recommendationEn: 'Section banners: recommended minimum 1600x800',
    recommendationAr: 'بانرات الأقسام: الحد الأدنى الموصى به 1600x800',
  },
  {
    value: 'testimonial',
    labelEn: 'Testimonials / Reviews',
    labelAr: 'آراء العملاء',
    mediaType: 'testimonial',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Review section images: recommended minimum 1000x700',
    recommendationAr: 'صور قسم الآراء: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:turkish-blends',
    labelEn: 'Category: Turkish Blends',
    labelAr: 'فئة: توليفات تركي',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:espresso',
    labelEn: 'Category: Espresso',
    labelAr: 'فئة: الإسبريسو',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:flavored-coffee',
    labelEn: 'Category: Flavored Coffee',
    labelAr: 'فئة: القهوة المنكهة',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:coffee-mix',
    labelEn: 'Category: Coffee Mix',
    labelAr: 'فئة: كوفي ميكس',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:cappuccino',
    labelEn: 'Category: Cappuccino',
    labelAr: 'فئة: كابتشينو',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:hot-chocolate',
    labelEn: 'Category: Hot Chocolate',
    labelAr: 'فئة: هوت شوكلت',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:easy-coffee',
    labelEn: 'Category: Easy Coffee',
    labelAr: 'فئة: إيزي كوفي',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:customize-blend',
    labelEn: 'Category: Make Your Espresso Blend',
    labelAr: 'فئة: اصنع توليفة الإسبريسو الخاصة بك',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
  {
    value: 'category:customize-flavor',
    labelEn: 'Category: Make Your Flavor',
    labelAr: 'فئة: اصنع نكهتك الخاصة',
    mediaType: 'category',
    minWidth: 1000,
    minHeight: 700,
    recommendationEn: 'Product/category cards: recommended minimum 1000x700',
    recommendationAr: 'كروت المنتجات/الفئات: الحد الأدنى الموصى به 1000x700',
  },
]

export const WEBSITE_SECTIONS: WebsiteSectionConfig[] = [
  {
    key: 'hero',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'hero',
    mediaType: 'hero',
    sectionType: 'full_hero',
    editorTemplate: 'hero',
    labelEn: 'Hero Section',
    labelAr: 'قسم الواجهة الرئيسية',
    descriptionEn: 'Homepage full-screen hero slides with headline, subtitle, and CTA.',
    descriptionAr: 'شرائح الواجهة الرئيسية مع عنوان ونص مختصر وزر إجراء.',
    fallbackImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80',
    defaultTitleEn: 'Coffee Crafted for Quiet Luxury',
    defaultTitleAr: 'قهوة مصممة لرفاهية هادئة',
    defaultSubtitleEn: 'Selected beans, slow-roasted for depth, warmth, and a finish that lingers beautifully.',
    defaultSubtitleAr: 'حبوب منتقاة بعناية، نحمصها بهدوء لتمنحك عمقًا ودفئًا ونهاية لا تُنسى.',
    defaultButtonTextEn: 'Shop Coffee',
    defaultButtonTextAr: 'تسوق القهوة',
    defaultButtonLink: '/products',
    supportsSlides: true,
    supportsCta: false,
    minWidth: 1920,
    minHeight: 900,
    defaultContent: {
      eyebrow_en: 'Signature Roasts',
      eyebrow_ar: 'تحميصات مميزة',
      title_en: 'Coffee Crafted for Quiet Luxury',
      title_ar: 'قهوة مصممة لرفاهية هادئة',
      subtitle_en: 'Selected beans, slow-roasted for depth, warmth, and a finish that lingers beautifully.',
      subtitle_ar: 'حبوب منتقاة بعناية، نحمصها بهدوء لتمنحك عمقًا ودفئًا ونهاية لا تُنسى.',
      button_text_en: 'Shop Coffee',
      button_text_ar: 'تسوق القهوة',
      button_link: '/products',
      stats: [
        { id: 'origin', value: '15+', label_en: 'Origins Curated', label_ar: 'مصادر مختارة', is_active: true },
        { id: 'freshness', value: '72h', label_en: 'Fresh Roast Window', label_ar: 'نافذة تحميص طازج', is_active: true },
        { id: 'arabica', value: '100%', label_en: 'Arabica Focus', label_ar: 'تركيز أرابيكا', is_active: true },
      ],
    },
  },
  {
    key: 'about_top',
    pageKey: 'about',
    pageLabelEn: 'About Page',
    pageLabelAr: 'صفحة من نحن',
    usageArea: 'about_top',
    mediaType: 'section',
    sectionType: 'full_image_banner',
    editorTemplate: 'banner',
    labelEn: 'About Section',
    labelAr: 'قسم من نحن',
    descriptionEn: 'Top visual banner for the About page.',
    descriptionAr: 'بانر مرئي لأعلى صفحة من نحن.',
    fallbackImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600',
    defaultTitleEn: 'Our Story',
    defaultTitleAr: 'قصتنا',
    defaultSubtitleEn: 'A family coffee business built on supply expertise since 2015.',
    defaultSubtitleAr: 'مشروع قهوة عائلي مبني على خبرة التوريد منذ 2015.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Since 2015',
      eyebrow_ar: 'منذ 2015',
      title_en: 'Our Story',
      title_ar: 'قصتنا',
      subtitle_en: 'A family coffee business built on supply expertise since 2015.',
      subtitle_ar: 'مشروع قهوة عائلي مبني على خبرة التوريد منذ 2015.',
    },
  },
  {
    key: 'about_lower',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'about_lower',
    mediaType: 'section',
    sectionType: 'split_content',
    editorTemplate: 'story',
    labelEn: 'Our Story',
    labelAr: 'قصتنا',
    descriptionEn: 'Story image used in the homepage and About content block.',
    descriptionAr: 'صورة القصة في الصفحة الرئيسية وصفحة من نحن.',
    fallbackImage: '/images/story.jpg',
    defaultTitleEn: 'A Family Coffee Legacy, Now Online',
    defaultTitleAr: 'إرث عائلي في القهوة يصل إليك الآن',
    defaultSubtitleEn: 'Line Coffee grew from cafe supply roots into a direct online coffee brand.',
    defaultSubtitleAr: 'نشأت لاين كوفي من خبرة توريد المقاهي لتصبح علامة قهوة مباشرة عبر الإنترنت.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1000,
    minHeight: 1000,
    defaultContent: {
      eyebrow_en: 'Our Story',
      eyebrow_ar: 'قصتنا',
      title_en: 'A Family Coffee Legacy, Now Online',
      title_ar: 'إرث عائلي في القهوة يصل إليك الآن',
      body_en: 'Line Coffee began in 2015 as a family supply business led by Sayed Kamal, after 28 years managing coffee operations at Bon Al Orouba. For years, we supplied cafes and coffee shops that served our coffee under their own names. Today, that experience is becoming a public Line Coffee brand for online customers who want trusted coffee at home.',
      body_ar: 'بدأت لاين كوفي عام 2015 كمشروع عائلي لتوريد القهوة بقيادة سيد كمال، بعد خبرة 28 عامًا في إدارة عمليات القهوة لدى بن العروبة. لسنوات، زودنا المقاهي ومحلات القهوة التي قدمت قهوتنا بأسمائها الخاصة. واليوم نبني لاين كوفي كعلامة مباشرة للعملاء عبر الإنترنت.',
      button_text_en: 'Learn More About Us',
      button_text_ar: 'تعرف علينا أكثر',
      button_link: '/about',
      features: [
        {
          id: 'supply',
          icon: 'leaf',
          title_en: 'Supply Roots',
          title_ar: 'جذور في التوريد',
          description_en: 'Built first by serving cafes and coffee shops with dependable coffee supply.',
          description_ar: 'بدأنا بخدمة المقاهي ومحلات القهوة من خلال توريد موثوق ومستمر.',
          is_active: true,
        },
        {
          id: 'founder',
          icon: 'award',
          title_en: 'Founder Experience',
          title_ar: 'خبرة المؤسس',
          description_en: 'Sayed Kamal brings 28 years of coffee management experience from Bon Al Orouba.',
          description_ar: 'يحمل سيد كمال خبرة 28 عامًا في إدارة القهوة من خلال عمله في بن العروبة.',
          is_active: true,
        },
        {
          id: 'direct',
          icon: 'heart',
          title_en: 'Now Direct to You',
          title_ar: 'الآن مباشرة إليك',
          description_en: 'The same careful supply mindset now shapes our online customer experience.',
          description_ar: 'نفس عقلية التوريد الدقيقة أصبحت اليوم تجربة مباشرة لعملائنا عبر الإنترنت.',
          is_active: true,
        },
      ],
      stats: [
        { id: 'since', value: '2015', label_en: 'Family Business', label_ar: 'مشروع عائلي', is_active: true },
        { id: 'experience', value: '28', label_en: 'Years of Experience', label_ar: 'سنة خبرة', is_active: true },
      ],
    },
  },
  {
    key: 'products_banner',
    pageKey: 'products',
    pageLabelEn: 'Products Page',
    pageLabelAr: 'صفحة المنتجات',
    usageArea: 'products_banner',
    mediaType: 'banner',
    sectionType: 'full_image_banner',
    editorTemplate: 'banner',
    labelEn: 'Products Banner',
    labelAr: 'بانر المنتجات',
    descriptionEn: 'Hero image for the products page.',
    descriptionAr: 'صورة رئيسية لصفحة المنتجات.',
    fallbackImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600',
    defaultTitleEn: 'Our Products',
    defaultTitleAr: 'منتجاتنا',
    defaultSubtitleEn: 'Explore Line Coffee selections.',
    defaultSubtitleAr: 'استكشف اختيارات لاين كوفي.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Our Products',
      title_ar: 'منتجاتنا',
      subtitle_en: 'Explore Line Coffee selections.',
      subtitle_ar: 'استكشف اختيارات لاين كوفي.',
    },
  },
  {
    key: 'categories',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'categories',
    mediaType: 'category',
    sectionType: 'multi_card_slider',
    editorTemplate: 'cards',
    labelEn: 'Categories Banner',
    labelAr: 'بانر الفئات',
    descriptionEn: 'Visual controls for category card images.',
    descriptionAr: 'تحكم بصري في صور بطاقات الفئات.',
    fallbackImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop',
    defaultTitleEn: 'Shop by Category',
    defaultTitleAr: 'تسوق حسب الفئة',
    defaultSubtitleEn: 'Browse Line Coffee categories.',
    defaultSubtitleAr: 'تصفح فئات لاين كوفي.',
    supportsSlides: true,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'Browse by Category',
      eyebrow_ar: 'حسب الفئة',
      title_en: 'Shop by Category',
      title_ar: 'تسوق حسب الفئة',
      subtitle_en: 'Browse Line Coffee categories.',
      subtitle_ar: 'تصفح فئات لاين كوفي.',
    },
  },
  {
    key: 'testimonials',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'testimonial',
    mediaType: 'testimonial',
    sectionType: 'testimonial_highlight',
    editorTemplate: 'text_cards',
    labelEn: 'Testimonials Section',
    labelAr: 'قسم آراء العملاء',
    descriptionEn: 'Optional visual highlight for reviews/testimonials.',
    descriptionAr: 'خلفية اختيارية لعرض آراء العملاء بشكل دافئ.',
    fallbackImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200',
    defaultTitleEn: 'Loved in Everyday Rituals',
    defaultTitleAr: 'قهوة أحبها عملاؤنا في طقوسهم اليومية',
    defaultSubtitleEn: 'A warm highlight image for customer stories.',
    defaultSubtitleAr: 'خلفية دافئة لقصص وتجارب العملاء.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'Customer Notes',
      eyebrow_ar: 'آراء العملاء',
      title_en: 'Loved in Everyday Rituals',
      title_ar: 'قهوة أحبها عملاؤنا في طقوسهم اليومية',
      subtitle_en: 'A warm highlight image for customer stories.',
      subtitle_ar: 'خلفية دافئة لقصص وتجارب العملاء.',
    },
  },
  {
    key: 'home_features',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'home_features',
    mediaType: 'section',
    sectionType: 'multi_card_slider',
    editorTemplate: 'text_cards',
    labelEn: 'Feature Pills',
    labelAr: 'بطاقات المميزات',
    descriptionEn: 'Small trust/value cards below category browsing.',
    descriptionAr: 'بطاقات صغيرة أسفل قسم تصفح الفئات.',
    fallbackImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    defaultTitleEn: 'Why Line Coffee',
    defaultTitleAr: 'لماذا لاين كوفي',
    defaultSubtitleEn: 'Premium quality, fresh roasting, and warm service.',
    defaultSubtitleAr: 'جودة فاخرة وتحميص طازج وخدمة دافئة.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'Why Line Coffee',
      eyebrow_ar: 'لماذا لاين كوفي',
      title_en: 'Crafted for Your Daily Ritual',
      title_ar: 'مصنوعة لطقسك اليومي',
      features: [
        { id: 'quality', icon: 'award', title_en: 'Premium Beans', title_ar: 'حبوب فاخرة', description_en: 'Carefully selected coffee with a rich, balanced profile.', description_ar: 'قهوة منتقاة بعناية بطابع غني ومتوازن.', is_active: true },
        { id: 'fresh', icon: 'coffee', title_en: 'Freshly Packed', title_ar: 'تعبئة طازجة', description_en: 'Packed with care to preserve aroma and freshness.', description_ar: 'تعبأ بعناية للحفاظ على الرائحة والطزاجة.', is_active: true },
        { id: 'service', icon: 'heart', title_en: 'Made With Care', title_ar: 'صنعت بعناية', description_en: 'A warm coffee experience from order to cup.', description_ar: 'تجربة قهوة دافئة من الطلب إلى الفنجان.', is_active: true },
      ],
    },
  },
  {
    key: 'best_sellers',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'best_sellers',
    mediaType: 'section',
    sectionType: 'full_image_banner',
    editorTemplate: 'generic',
    labelEn: 'Best Sellers',
    labelAr: 'الأكثر مبيعاً',
    descriptionEn: 'Homepage best-selling products section heading and background.',
    descriptionAr: 'عنوان وخلفية قسم الأكثر مبيعاً في الصفحة الرئيسية.',
    fallbackImage: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&q=80',
    defaultTitleEn: 'Best Sellers',
    defaultTitleAr: 'الأكثر مبيعًا',
    defaultSubtitleEn: 'Customer favorites from Line Coffee.',
    defaultSubtitleAr: 'مفضلات عملاء لاين كوفي.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Customer Favorites',
      eyebrow_ar: 'مفضلات العملاء',
      title_en: 'Best Sellers',
      title_ar: 'الأكثر مبيعًا',
      subtitle_en: 'Customer favorites from Line Coffee.',
      subtitle_ar: 'مفضلات عملاء لاين كوفي.',
      button_text_en: 'View All Best Sellers',
      button_text_ar: 'عرض كل الأكثر مبيعًا',
      button_link: '/products?filter=best-seller',
    },
  },
  {
    key: 'home_blog',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'home_blog',
    mediaType: 'section',
    sectionType: 'multi_card_slider',
    editorTemplate: 'generic',
    labelEn: 'Home Blog Section',
    labelAr: 'قسم المقالات',
    descriptionEn: 'Homepage blog preview heading and visual settings.',
    descriptionAr: 'عنوان وإعدادات مرئية لمعاينة المقالات في الصفحة الرئيسية.',
    fallbackImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&q=80',
    defaultTitleEn: 'Coffee Journal',
    defaultTitleAr: 'مجلة القهوة',
    defaultSubtitleEn: 'Stories, guides, and brewing notes.',
    defaultSubtitleAr: 'قصص وأدلة وملاحظات تحضير.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Coffee Journal',
      eyebrow_ar: 'مجلة القهوة',
      title_en: 'Latest From the Blog',
      title_ar: 'أحدث المقالات',
      subtitle_en: 'Stories, guides, and brewing notes.',
      subtitle_ar: 'قصص وأدلة وملاحظات تحضير.',
      button_text_en: 'Read More',
      button_text_ar: 'اقرأ المزيد',
      button_link: '/blog',
    },
  },
  {
    key: 'home_instagram',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'home_instagram',
    mediaType: 'section',
    sectionType: 'multi_card_slider',
    editorTemplate: 'cards',
    labelEn: 'Instagram Section',
    labelAr: 'قسم إنستغرام',
    descriptionEn: 'Homepage social/gallery image controls.',
    descriptionAr: 'تحكم في صور معرض وسائل التواصل الاجتماعي.',
    fallbackImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=80',
    defaultTitleEn: 'Follow the Aroma',
    defaultTitleAr: 'تابع عبق القهوة',
    defaultSubtitleEn: 'A visual feed for Line Coffee moments.',
    defaultSubtitleAr: 'مساحة بصرية للحظات لاين كوفي.',
    supportsSlides: true,
    supportsCta: true,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'Instagram',
      eyebrow_ar: 'إنستغرام',
      title_en: 'Follow the Aroma',
      title_ar: 'تابع عبق القهوة',
      subtitle_en: 'A visual feed for Line Coffee moments.',
      subtitle_ar: 'مساحة بصرية للحظات لاين كوفي.',
      button_text_en: 'Follow Us',
      button_text_ar: 'تابعنا',
      button_link: '#',
    },
  },
  {
    key: 'home_contact',
    pageKey: 'home',
    pageLabelEn: 'Homepage',
    pageLabelAr: 'الصفحة الرئيسية',
    usageArea: 'home_contact',
    mediaType: 'section',
    sectionType: 'centered_cta',
    editorTemplate: 'contact',
    labelEn: 'Home Contact Section',
    labelAr: 'قسم التواصل',
    descriptionEn: 'Homepage contact section heading, copy, and image.',
    descriptionAr: 'عنوان ونص وصورة قسم التواصل في الصفحة الرئيسية.',
    fallbackImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80',
    defaultTitleEn: 'Let Us Help You Choose',
    defaultTitleAr: 'دعنا نساعدك في الاختيار',
    defaultSubtitleEn: 'Contact us and we will guide you to the right coffee.',
    defaultSubtitleAr: 'تواصل معنا وسنرشدك إلى القهوة المناسبة.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Contact',
      eyebrow_ar: 'تواصل',
      title_en: 'Let Us Help You Choose',
      title_ar: 'دعنا نساعدك في الاختيار',
      subtitle_en: 'Contact us and we will guide you to the right coffee.',
      subtitle_ar: 'تواصل معنا وسنرشدك إلى القهوة المناسبة.',
      button_text_en: 'Contact Us',
      button_text_ar: 'تواصل معنا',
      button_link: '/contact',
    },
  },
  {
    key: 'about_story',
    pageKey: 'about',
    pageLabelEn: 'About Page',
    pageLabelAr: 'صفحة من نحن',
    usageArea: 'about_story',
    mediaType: 'section',
    sectionType: 'split_content',
    editorTemplate: 'story',
    labelEn: 'About Journey',
    labelAr: 'مسيرتنا',
    descriptionEn: 'Main story block on the About page.',
    descriptionAr: 'قسم القصة الرئيسي في صفحة من نحن.',
    fallbackImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80',
    defaultTitleEn: 'From Supply Roots to a Public Brand',
    defaultTitleAr: 'من جذور التوريد إلى علامة عامة',
    defaultSubtitleEn: 'A family coffee story shaped by experience, trust, and direct service.',
    defaultSubtitleAr: 'قصة قهوة عائلية صنعتها الخبرة والثقة والخدمة المباشرة.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 1000,
    defaultContent: {
      eyebrow_en: 'Since 2015',
      eyebrow_ar: 'منذ 2015',
      title_en: 'From Supply Roots to a Public Brand',
      title_ar: 'من جذور التوريد إلى علامة عامة',
      body_en: 'Line Coffee started as a family coffee supply business founded by Sayed Kamal, whose 28 years at Bon Al Orouba shaped a deep understanding of cafes, coffee shops, and dependable quality. After years of supplying coffee served under other names, Line Coffee is now building its own direct relationship with online customers.',
      body_ar: 'بدأت لاين كوفي كمشروع عائلي لتوريد القهوة أسسه سيد كمال، بعد 28 عامًا في بن العروبة صنعت فهمًا عميقًا لاحتياجات المقاهي ومحلات القهوة والجودة الموثوقة. وبعد سنوات من توريد قهوة كانت تقدم بأسماء أخرى، تبني لاين كوفي اليوم علاقتها المباشرة مع العملاء عبر الإنترنت.',
    },
  },
  {
    key: 'about_values',
    pageKey: 'about',
    pageLabelEn: 'About Page',
    pageLabelAr: 'صفحة من نحن',
    usageArea: 'about_values',
    mediaType: 'section',
    sectionType: 'multi_card_slider',
    editorTemplate: 'text_cards',
    labelEn: 'About Values',
    labelAr: 'قيمنا',
    descriptionEn: 'Values cards on the About page.',
    descriptionAr: 'بطاقات القيم في صفحة من نحن.',
    fallbackImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=80',
    defaultTitleEn: 'Our Values',
    defaultTitleAr: 'قيمنا',
    defaultSubtitleEn: 'The principles behind a family coffee business moving from supply to direct service.',
    defaultSubtitleAr: 'المبادئ التي تقود مشروع قهوة عائليًا ينتقل من التوريد إلى الخدمة المباشرة.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'What We Stand For',
      eyebrow_ar: 'ما نؤمن به',
      title_en: 'Our Values',
      title_ar: 'قيمنا',
      subtitle_en: 'The principles behind a family coffee business moving from supply to direct service.',
      subtitle_ar: 'المبادئ التي تقود مشروع قهوة عائليًا ينتقل من التوريد إلى الخدمة المباشرة.',
      features: [
        { id: 'legacy', title_en: 'Founder-Led Experience', title_ar: 'خبرة يقودها المؤسس', description_en: 'Our work is shaped by Sayed Kamal and decades of coffee management experience.', description_ar: 'يقود عملنا سيد كمال وخبرة طويلة في إدارة القهوة.', is_active: true },
        { id: 'supply', title_en: 'Trusted Supply', title_ar: 'توريد موثوق', description_en: 'We understand the consistency cafes and coffee shops depend on every day.', description_ar: 'نفهم الثبات الذي تعتمد عليه المقاهي ومحلات القهوة يوميًا.', is_active: true },
        { id: 'direct', title_en: 'Direct Customer Promise', title_ar: 'وعد مباشر للعميل', description_en: 'We are bringing that supply discipline into a warmer online customer experience.', description_ar: 'ننقل انضباط التوريد إلى تجربة مباشرة وأكثر دفئًا للعملاء عبر الإنترنت.', is_active: true },
      ],
    },
  },
  {
    key: 'blog_page',
    pageKey: 'blog',
    pageLabelEn: 'Blog Page',
    pageLabelAr: 'صفحة المقالات',
    usageArea: 'blog_page',
    mediaType: 'banner',
    sectionType: 'full_image_banner',
    editorTemplate: 'banner',
    labelEn: 'Blog Page Hero',
    labelAr: 'واجهة صفحة المقالات',
    descriptionEn: 'Blog listing page heading and visual.',
    descriptionAr: 'عنوان وصورة صفحة قائمة المقالات.',
    fallbackImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&q=80',
    defaultTitleEn: 'Coffee Journal',
    defaultTitleAr: 'مجلة القهوة',
    defaultSubtitleEn: 'Notes from our coffee journey, brewing guidance, and Line Coffee updates.',
    defaultSubtitleAr: 'ملاحظات من رحلتنا مع القهوة، وإرشادات تحضير، وتحديثات لاين كوفي.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Coffee Journal',
      eyebrow_ar: 'مجلة القهوة',
      title_en: 'Coffee Notes',
      title_ar: 'ملاحظات القهوة',
      subtitle_en: 'Notes from our coffee journey, brewing guidance, and Line Coffee updates.',
      subtitle_ar: 'ملاحظات من رحلتنا مع القهوة، وإرشادات تحضير، وتحديثات لاين كوفي.',
    },
  },
  {
    key: 'contact_page',
    pageKey: 'contact',
    pageLabelEn: 'Contact Page',
    pageLabelAr: 'صفحة التواصل',
    usageArea: 'contact_page',
    mediaType: 'banner',
    sectionType: 'centered_cta',
    editorTemplate: 'contact',
    labelEn: 'Contact Page Hero',
    labelAr: 'واجهة صفحة التواصل',
    descriptionEn: 'Contact page intro and visual.',
    descriptionAr: 'مقدمة وصورة صفحة التواصل.',
    fallbackImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80',
    defaultTitleEn: 'Contact Line Coffee',
    defaultTitleAr: 'تواصل مع لاين كوفي',
    defaultSubtitleEn: 'Reach us for online orders, coffee choices, and supply conversations.',
    defaultSubtitleAr: 'تواصل معنا للطلبات عبر الإنترنت، واختيارات القهوة، ومحادثات التوريد.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Coffee Support',
      eyebrow_ar: 'دعم القهوة',
      title_en: 'Contact Line Coffee',
      title_ar: 'تواصل مع لاين كوفي',
      subtitle_en: 'Reach us for online orders, coffee choices, and supply conversations.',
      subtitle_ar: 'تواصل معنا للطلبات عبر الإنترنت، واختيارات القهوة، ومحادثات التوريد.',
      body_en: 'Whether you are choosing coffee for home, asking about an order, or starting a supply conversation, our team is ready to help.',
      body_ar: 'سواء كنت تختار قهوة للمنزل، أو تسأل عن طلب، أو تبدأ محادثة توريد، فريقنا جاهز لمساعدتك.',
    },
  },
  {
    key: 'track_page',
    pageKey: 'track',
    pageLabelEn: 'Track Order Page',
    pageLabelAr: 'صفحة تتبع الطلب',
    usageArea: 'track_page',
    mediaType: 'banner',
    sectionType: 'centered_cta',
    editorTemplate: 'generic',
    labelEn: 'Track Order Page',
    labelAr: 'صفحة تتبع الطلب',
    descriptionEn: 'Order tracking page intro content.',
    descriptionAr: 'محتوى مقدمة صفحة تتبع الطلب.',
    fallbackImage: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&q=80',
    defaultTitleEn: 'Track Your Order',
    defaultTitleAr: 'تتبع طلبك',
    defaultSubtitleEn: 'Follow your Line Coffee order status.',
    defaultSubtitleAr: 'تابع حالة طلبك من لاين كوفي.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Track Your Order',
      title_ar: 'تتبع طلبك',
      subtitle_en: 'Follow your Line Coffee order status.',
      subtitle_ar: 'تابع حالة طلبك من لاين كوفي.',
    },
  },
]

export const OBJECT_POSITION_OPTIONS = [
  { value: 'center center', labelEn: 'Center', labelAr: 'المنتصف' },
  { value: 'center top', labelEn: 'Top', labelAr: 'أعلى' },
  { value: 'center bottom', labelEn: 'Bottom', labelAr: 'أسفل' },
  { value: 'left center', labelEn: 'Left', labelAr: 'يسار' },
  { value: 'right center', labelEn: 'Right', labelAr: 'يمين' },
] as const

export type MediaImageMeta = {
  url?: string
  path?: string
  bucket?: string
  width?: number
  height?: number
  object_position?: string
  uploaded_at?: string
}

export type SiteMediaItem = {
  id: string
  title_ar: string | null
  title_en: string | null
  subtitle_ar: string | null
  subtitle_en: string | null
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
  section_key?: string | null
  slide_key?: string | null
  section_type?: SectionType | string | null
  media_type?: string | null
  usage_area?: string | null
  alt_en?: string | null
  alt_ar?: string | null
  is_featured?: boolean | null
  button_text_ar?: string | null
  button_text_en?: string | null
  button_link?: string | null
  mobile_image_url?: string | null
  overlay_opacity?: number | null
  object_position?: string | null
  content?: unknown
  layout?: unknown
  animation_type?: string | null
  animation_duration?: number | null
  device_visibility?: unknown
  starts_at?: string | null
  ends_at?: string | null
  images?: unknown
  created_at?: string
  updated_at?: string
}

export function getWebsiteSection(key: string | null | undefined) {
  return WEBSITE_SECTIONS.find((section) => section.key === key || section.usageArea === key) ?? WEBSITE_SECTIONS[0]
}

export function getWebsitePages() {
  const pages = new Map<string, { key: string; labelEn: string; labelAr: string; sections: WebsiteSectionConfig[] }>()

  WEBSITE_SECTIONS.forEach((section) => {
    const existing = pages.get(section.pageKey)
    if (existing) {
      existing.sections.push(section)
      return
    }

    pages.set(section.pageKey, {
      key: section.pageKey,
      labelEn: section.pageLabelEn,
      labelAr: section.pageLabelAr,
      sections: [section],
    })
  })

  return Array.from(pages.values())
}

export function getMediaUsageOption(value: string | null | undefined) {
  return MEDIA_USAGE_OPTIONS.find((option) => option.value === value) ?? MEDIA_USAGE_OPTIONS[3]
}

export function getMediaImageMeta(item: Pick<SiteMediaItem, 'images'>): MediaImageMeta | null {
  if (!Array.isArray(item.images) || item.images.length === 0) return null
  const first = item.images[0]
  if (!first || typeof first !== 'object') return null
  return first as MediaImageMeta
}

function parseRecord(value: unknown): Record<string, unknown> {
  if (!value) return {}
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  if (typeof value !== 'string') return {}

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

function mergeContent(base: SectionBuilderContent, override: Record<string, unknown>): SectionBuilderContent {
  return {
    ...base,
    ...override,
    features: Array.isArray(override.features) ? override.features as SectionTextBlock[] : base.features,
    stats: Array.isArray(override.stats) ? override.stats as SectionStatBlock[] : base.stats,
  }
}

export function getSectionBuilderContent(section: WebsiteSectionConfig, item?: Partial<SiteMediaItem> | null): SectionBuilderContent {
  const base = section.defaultContent ?? {}
  const override = parseRecord(item?.content)
  const merged = mergeContent(base, override)

  return {
    ...merged,
    title_en: String(override.title_en || item?.title_en || merged.title_en || section.defaultTitleEn),
    title_ar: String(override.title_ar || item?.title_ar || merged.title_ar || section.defaultTitleAr),
    subtitle_en: String(override.subtitle_en || item?.subtitle_en || merged.subtitle_en || section.defaultSubtitleEn),
    subtitle_ar: String(override.subtitle_ar || item?.subtitle_ar || merged.subtitle_ar || section.defaultSubtitleAr),
    button_text_en: String(override.button_text_en || item?.button_text_en || merged.button_text_en || section.defaultButtonTextEn || ''),
    button_text_ar: String(override.button_text_ar || item?.button_text_ar || merged.button_text_ar || section.defaultButtonTextAr || ''),
    button_link: String(override.button_link || item?.button_link || item?.link_url || merged.button_link || section.defaultButtonLink || ''),
  }
}

export function getSectionBuilderLayout(section: WebsiteSectionConfig, item?: Partial<SiteMediaItem> | null): SectionBuilderLayout {
  return {
    ...(section.defaultLayout ?? {}),
    ...parseRecord(item?.layout),
  } as SectionBuilderLayout
}

export function getLocalizedBuilderText(
  language: 'en' | 'ar',
  content: SectionBuilderContent,
  key: 'eyebrow' | 'title' | 'subtitle' | 'body' | 'button_text',
  fallback = '',
) {
  const en = content[`${key}_en` as keyof SectionBuilderContent]
  const ar = content[`${key}_ar` as keyof SectionBuilderContent]
  const primary = language === 'ar' ? ar : en
  const secondary = language === 'ar' ? en : ar
  return String(primary || secondary || fallback)
}

export function getMediaObjectPosition(item: Pick<SiteMediaItem, 'images'>, fallback = 'center center') {
  const directPosition = (item as Pick<SiteMediaItem, 'object_position'>).object_position
  return directPosition || getMediaImageMeta(item)?.object_position || fallback
}

export function getMediaOverlayOpacity(item: Pick<SiteMediaItem, 'overlay_opacity' | 'images'>, fallback = 0.55) {
  const direct = Number(item.overlay_opacity)
  if (Number.isFinite(direct)) return Math.min(0.85, Math.max(0, direct))
  return fallback
}

export function getMediaSectionKey(item: Pick<SiteMediaItem, 'section_key' | 'usage_area'>) {
  return item.section_key || item.usage_area || 'banner'
}

export function isUploadedImageSmall(usageArea: string, width: number, height: number) {
  const section = getWebsiteSection(usageArea)
  const usage = MEDIA_USAGE_OPTIONS.find((option) => option.value === usageArea)
  const minWidth = usage?.minWidth ?? section.minWidth
  const minHeight = usage?.minHeight ?? section.minHeight
  return width < minWidth || height < minHeight
}

export function mediaByUsage(items: SiteMediaItem[]) {
  return new Map(items.map((item) => [item.usage_area || item.section_key || 'banner', item]))
}

// =============================================
// VISUAL EFFECTS SYSTEM
// =============================================

export const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

export type VisualPreset = {
  key: string
  nameEn: string
  opacity: number
  effects: Omit<VisualEffects, 'parallax'>
}

export const VISUAL_PRESETS: VisualPreset[] = [
  {
    key: 'luxury_dark',
    nameEn: 'Luxury Dark',
    opacity: 0.68,
    effects: { overlay_color: '#0B0806', gradient_type: 'solid', blur: 0, brightness: 0.72, contrast: 1.18, saturation: 0.72, warmth: 0.18, vignette: 0.72, glow: 0.08, grain: 0.12 },
  },
  {
    key: 'warm_coffee',
    nameEn: 'Warm Coffee',
    opacity: 0.55,
    effects: { overlay_color: '#1a0800', gradient_type: 'solid', blur: 0, brightness: 0.88, contrast: 1.08, saturation: 0.95, warmth: 0.42, vignette: 0.45, glow: 0.18, grain: 0.08 },
  },
  {
    key: 'golden_glow',
    nameEn: 'Golden Glow',
    opacity: 0.50,
    effects: { overlay_color: '#2a1500', gradient_type: 'radial', blur: 0, brightness: 0.90, contrast: 1.05, saturation: 1.05, warmth: 0.28, vignette: 0.35, glow: 0.45, grain: 0.06 },
  },
  {
    key: 'cinematic_brown',
    nameEn: 'Cinematic Brown',
    opacity: 0.62,
    effects: { overlay_color: '#120800', gradient_type: 'top_bottom', blur: 0.5, brightness: 0.78, contrast: 1.22, saturation: 0.78, warmth: 0.22, vignette: 0.65, glow: 0.05, grain: 0.18 },
  },
  {
    key: 'elegant_matte',
    nameEn: 'Elegant Matte',
    opacity: 0.72,
    effects: { overlay_color: '#0a0805', gradient_type: 'solid', blur: 0, brightness: 0.80, contrast: 1.12, saturation: 0.65, warmth: 0.12, vignette: 0.55, glow: 0.04, grain: 0.06 },
  },
  {
    key: 'soft_premium',
    nameEn: 'Soft Premium',
    opacity: 0.48,
    effects: { overlay_color: '#1e0f06', gradient_type: 'radial', blur: 0, brightness: 0.92, contrast: 1.04, saturation: 0.90, warmth: 0.22, vignette: 0.28, glow: 0.22, grain: 0.04 },
  },
  {
    key: 'espresso_mood',
    nameEn: 'Espresso Mood',
    opacity: 0.75,
    effects: { overlay_color: '#0d0600', gradient_type: 'vignette_only', blur: 0, brightness: 0.68, contrast: 1.28, saturation: 0.62, warmth: 0.25, vignette: 0.80, glow: 0.06, grain: 0.22 },
  },
]

export function getVisualEffects(item?: Partial<SiteMediaItem> | null): VisualEffects {
  const raw = item?.content
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const vf = (raw as Record<string, unknown>).visual_effects
  if (!vf || typeof vf !== 'object' || Array.isArray(vf)) return {}
  return vf as VisualEffects
}

export function buildEffectsFilter(fx: VisualEffects): string {
  const parts: string[] = []
  const blur = Number(fx.blur ?? 0)
  const brightness = Number(fx.brightness ?? 1)
  const contrast = Number(fx.contrast ?? 1)
  const saturation = Number(fx.saturation ?? 1)
  const warmth = Number(fx.warmth ?? 0)
  if (blur > 0.05) parts.push(`blur(${blur.toFixed(1)}px)`)
  if (Math.abs(brightness - 1) > 0.01) parts.push(`brightness(${brightness.toFixed(2)})`)
  if (Math.abs(contrast - 1) > 0.01) parts.push(`contrast(${contrast.toFixed(2)})`)
  if (Math.abs(saturation - 1) > 0.01) parts.push(`saturate(${saturation.toFixed(2)})`)
  if (warmth > 0.01) parts.push(`sepia(${(warmth * 0.65).toFixed(2)})`)
  return parts.join(' ')
}

export function buildOverlayGradient(
  type: string | undefined,
  color: string | undefined,
  opacity: number,
): string {
  const c = color && color.length >= 7 ? color : '#000000'
  const r = parseInt(c.slice(1, 3), 16) || 0
  const g = parseInt(c.slice(3, 5), 16) || 0
  const b = parseInt(c.slice(5, 7), 16) || 0
  const o = Math.max(0, Math.min(1, opacity))
  const rgba = `rgba(${r},${g},${b},${o.toFixed(2)})`
  switch (type) {
    case 'radial':
      return `radial-gradient(ellipse at center, rgba(${r},${g},${b},${(o * 0.28).toFixed(2)}) 0%, ${rgba} 100%)`
    case 'top_bottom':
      return `linear-gradient(to bottom, rgba(${r},${g},${b},${(o * 0.15).toFixed(2)}) 0%, ${rgba} 100%)`
    case 'vignette_only':
      return `radial-gradient(ellipse at center, transparent 30%, ${rgba} 100%)`
    default:
      return rgba
  }
}
