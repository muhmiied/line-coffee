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
    value: 'category:turkish-coffee',
    labelEn: 'Category: Turkish Coffee',
    labelAr: 'فئة: القهوة التركية',
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
    value: 'category:nescafe',
    labelEn: 'Category: Nescafe',
    labelAr: 'فئة: نسكافيه',
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
    defaultTitleAr: 'Our Story',
    defaultSubtitleEn: 'Crafting the perfect cup since 2019',
    defaultSubtitleAr: 'Crafting the perfect cup since 2019',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Since 2019',
      eyebrow_ar: 'Since 2019',
      title_en: 'Our Story',
      title_ar: 'Our Story',
      subtitle_en: 'Crafting the perfect cup since 2019',
      subtitle_ar: 'Crafting the perfect cup since 2019',
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
    defaultTitleEn: 'From Distant Farms to Your Cup',
    defaultTitleAr: 'From Distant Farms to Your Cup',
    defaultSubtitleEn: 'A premium visual for the story block.',
    defaultSubtitleAr: 'A premium visual for the story block.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1000,
    minHeight: 1000,
    defaultContent: {
      eyebrow_en: 'Our Story',
      eyebrow_ar: 'قصتنا',
      title_en: 'From Distant Farms to Your Cup',
      title_ar: 'من المزارع البعيدة إلى كوبك',
      body_en: "Line Coffee began with a simple mission: to bring the world's finest coffee to every home. We build lasting relationships with farmers who share our passion for exceptional quality.",
      body_ar: 'بدأت لاين كوفي بمهمة بسيطة: تقديم قهوة فاخرة بجودة ثابتة لكل بيت. نبني علاقات طويلة مع مزارعين يشاركوننا الشغف بالجودة الاستثنائية.',
      button_text_en: 'Learn More About Us',
      button_text_ar: 'تعرف علينا أكثر',
      button_link: '/about',
      features: [
        {
          id: 'sourcing',
          icon: 'leaf',
          title_en: 'Sustainably Sourced',
          title_ar: 'مصادر مستدامة',
          description_en: 'Direct relationships with farmers ensuring fair trade and environmental responsibility.',
          description_ar: 'علاقات مباشرة مع المزارعين تضمن التجارة العادلة والمسؤولية البيئية.',
          is_active: true,
        },
        {
          id: 'roasting',
          icon: 'award',
          title_en: 'Expert Roasting',
          title_ar: 'تحميص احترافي',
          description_en: "Small-batch roasting by master roasters to bring out each bean's unique character.",
          description_ar: 'تحميص بكميات صغيرة من قبل محمصين محترفين لإبراز الطابع الفريد لكل حبة.',
          is_active: true,
        },
        {
          id: 'quality',
          icon: 'heart',
          title_en: 'Passion for Quality',
          title_ar: 'شغف بالجودة',
          description_en: 'From farm to cup, every step is guided by our commitment to excellence.',
          description_ar: 'من المزرعة إلى الكوب، كل خطوة موجّهة بالتزامنا بالتميز.',
          is_active: true,
        },
      ],
      stats: [
        { id: 'years', value: '10+', label_en: 'Years of Excellence', label_ar: 'سنوات من التميز', is_active: true },
        { id: 'farms', value: '25+', label_en: 'Farm Partners', label_ar: 'شريك مزارع', is_active: true },
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
    defaultTitleAr: 'Our Products',
    defaultSubtitleEn: 'Explore Line Coffee selections.',
    defaultSubtitleAr: 'Explore Line Coffee selections.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Our Products',
      title_ar: 'Our Products',
      subtitle_en: 'Explore Line Coffee selections.',
      subtitle_ar: 'Explore Line Coffee selections.',
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
    defaultTitleAr: 'Shop by Category',
    defaultSubtitleEn: 'Browse Line Coffee categories.',
    defaultSubtitleAr: 'Browse Line Coffee categories.',
    supportsSlides: true,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'Browse by Category',
      eyebrow_ar: 'Browse by Category',
      title_en: 'Shop by Category',
      title_ar: 'Shop by Category',
      subtitle_en: 'Browse Line Coffee categories.',
      subtitle_ar: 'Browse Line Coffee categories.',
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
    key: 'promo_banner',
    pageKey: 'global',
    pageLabelEn: 'Global Banners',
    pageLabelAr: 'بانرات عامة',
    usageArea: 'promo_banner',
    mediaType: 'banner',
    sectionType: 'centered_cta',
    editorTemplate: 'banner',
    labelEn: 'Promo Banner',
    labelAr: 'بانر ترويجي',
    descriptionEn: 'A centered promotional CTA banner.',
    descriptionAr: 'بانر ترويجي مركزي مع زر إجراء.',
    fallbackImage: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80',
    defaultTitleEn: 'Premium Coffee, Delivered Fresh',
    defaultTitleAr: 'Premium Coffee, Delivered Fresh',
    defaultSubtitleEn: 'Create a seasonal promotion or campaign banner.',
    defaultSubtitleAr: 'Create a seasonal promotion or campaign banner.',
    defaultButtonTextEn: 'Shop Now',
    defaultButtonTextAr: 'Shop Now',
    defaultButtonLink: '/products',
    supportsSlides: true,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Premium Coffee, Delivered Fresh',
      title_ar: 'Premium Coffee, Delivered Fresh',
      subtitle_en: 'Create a seasonal promotion or campaign banner.',
      subtitle_ar: 'Create a seasonal promotion or campaign banner.',
      button_text_en: 'Shop Now',
      button_text_ar: 'Shop Now',
      button_link: '/products',
    },
  },
  {
    key: 'contact_banner',
    pageKey: 'contact',
    pageLabelEn: 'Contact Page',
    pageLabelAr: 'صفحة التواصل',
    usageArea: 'contact_banner',
    mediaType: 'banner',
    sectionType: 'centered_cta',
    editorTemplate: 'contact',
    labelEn: 'Contact Banner',
    labelAr: 'بانر التواصل',
    descriptionEn: 'Optional image and CTA for the contact area.',
    descriptionAr: 'صورة وزر اختياريان لقسم التواصل.',
    fallbackImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80',
    defaultTitleEn: 'Need Help Choosing?',
    defaultTitleAr: 'Need Help Choosing?',
    defaultSubtitleEn: 'Reach out and we will help you find the right coffee.',
    defaultSubtitleAr: 'Reach out and we will help you find the right coffee.',
    defaultButtonTextEn: 'Contact Us',
    defaultButtonTextAr: 'Contact Us',
    defaultButtonLink: '/contact',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Need Help Choosing?',
      title_ar: 'Need Help Choosing?',
      subtitle_en: 'Reach out and we will help you find the right coffee.',
      subtitle_ar: 'Reach out and we will help you find the right coffee.',
      button_text_en: 'Contact Us',
      button_text_ar: 'Contact Us',
      button_link: '/contact',
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
    defaultTitleAr: 'Why Line Coffee',
    defaultSubtitleEn: 'Premium quality, fresh roasting, and warm service.',
    defaultSubtitleAr: 'Premium quality, fresh roasting, and warm service.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'Why Line Coffee',
      eyebrow_ar: 'Why Line Coffee',
      title_en: 'Crafted for Your Daily Ritual',
      title_ar: 'Crafted for Your Daily Ritual',
      features: [
        { id: 'quality', icon: 'award', title_en: 'Premium Beans', title_ar: 'Premium Beans', description_en: 'Carefully selected coffee with a rich, balanced profile.', description_ar: 'Carefully selected coffee with a rich, balanced profile.', is_active: true },
        { id: 'fresh', icon: 'coffee', title_en: 'Freshly Packed', title_ar: 'Freshly Packed', description_en: 'Packed with care to preserve aroma and freshness.', description_ar: 'Packed with care to preserve aroma and freshness.', is_active: true },
        { id: 'service', icon: 'heart', title_en: 'Made With Care', title_ar: 'Made With Care', description_en: 'A warm coffee experience from order to cup.', description_ar: 'A warm coffee experience from order to cup.', is_active: true },
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
    defaultTitleAr: 'Best Sellers',
    defaultSubtitleEn: 'Customer favorites from Line Coffee.',
    defaultSubtitleAr: 'Customer favorites from Line Coffee.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Customer Favorites',
      eyebrow_ar: 'Customer Favorites',
      title_en: 'Best Sellers',
      title_ar: 'Best Sellers',
      subtitle_en: 'Customer favorites from Line Coffee.',
      subtitle_ar: 'Customer favorites from Line Coffee.',
      button_text_en: 'View All Best Sellers',
      button_text_ar: 'View All Best Sellers',
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
    defaultTitleAr: 'Coffee Journal',
    defaultSubtitleEn: 'Stories, guides, and brewing notes.',
    defaultSubtitleAr: 'Stories, guides, and brewing notes.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Coffee Journal',
      eyebrow_ar: 'Coffee Journal',
      title_en: 'Latest From the Blog',
      title_ar: 'Latest From the Blog',
      subtitle_en: 'Stories, guides, and brewing notes.',
      subtitle_ar: 'Stories, guides, and brewing notes.',
      button_text_en: 'Read More',
      button_text_ar: 'Read More',
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
    defaultTitleAr: 'Follow the Aroma',
    defaultSubtitleEn: 'A visual feed for Line Coffee moments.',
    defaultSubtitleAr: 'A visual feed for Line Coffee moments.',
    supportsSlides: true,
    supportsCta: true,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'Instagram',
      eyebrow_ar: 'Instagram',
      title_en: 'Follow the Aroma',
      title_ar: 'Follow the Aroma',
      subtitle_en: 'A visual feed for Line Coffee moments.',
      subtitle_ar: 'A visual feed for Line Coffee moments.',
      button_text_en: 'Follow Us',
      button_text_ar: 'Follow Us',
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
    defaultTitleAr: 'Let Us Help You Choose',
    defaultSubtitleEn: 'Contact us and we will guide you to the right coffee.',
    defaultSubtitleAr: 'Contact us and we will guide you to the right coffee.',
    supportsSlides: false,
    supportsCta: true,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      eyebrow_en: 'Contact',
      eyebrow_ar: 'Contact',
      title_en: 'Let Us Help You Choose',
      title_ar: 'Let Us Help You Choose',
      subtitle_en: 'Contact us and we will guide you to the right coffee.',
      subtitle_ar: 'Contact us and we will guide you to the right coffee.',
      button_text_en: 'Contact Us',
      button_text_ar: 'Contact Us',
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
    defaultTitleEn: 'From Passion to Perfection',
    defaultTitleAr: 'From Passion to Perfection',
    defaultSubtitleEn: 'Line Coffee started with a simple mission and a love for quality.',
    defaultSubtitleAr: 'Line Coffee started with a simple mission and a love for quality.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 1000,
    defaultContent: {
      eyebrow_en: 'Our Journey',
      eyebrow_ar: 'Our Journey',
      title_en: 'From Passion to Perfection',
      title_ar: 'From Passion to Perfection',
      body_en: 'Line Coffee started with a simple mission: to bring the authentic taste of premium coffee to every home.',
      body_ar: 'Line Coffee started with a simple mission: to bring the authentic taste of premium coffee to every home.',
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
    defaultTitleAr: 'Our Values',
    defaultSubtitleEn: 'The principles that guide everything we do.',
    defaultSubtitleAr: 'The principles that guide everything we do.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1000,
    minHeight: 700,
    defaultContent: {
      eyebrow_en: 'What We Stand For',
      eyebrow_ar: 'What We Stand For',
      title_en: 'Our Values',
      title_ar: 'Our Values',
      subtitle_en: 'The principles that guide everything we do.',
      subtitle_ar: 'The principles that guide everything we do.',
      features: [
        { id: 'quality', title_en: 'Quality First', title_ar: 'Quality First', description_en: 'We never compromise on quality.', description_ar: 'We never compromise on quality.', is_active: true },
        { id: 'customers', title_en: 'Customer Love', title_ar: 'Customer Love', description_en: 'Our customers are family.', description_ar: 'Our customers are family.', is_active: true },
        { id: 'innovation', title_en: 'Innovation', title_ar: 'Innovation', description_en: 'We constantly explore new flavors and blends.', description_ar: 'We constantly explore new flavors and blends.', is_active: true },
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
    defaultTitleAr: 'Coffee Journal',
    defaultSubtitleEn: 'Guides, stories, and coffee inspiration.',
    defaultSubtitleAr: 'Guides, stories, and coffee inspiration.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Coffee Journal',
      title_ar: 'Coffee Journal',
      subtitle_en: 'Guides, stories, and coffee inspiration.',
      subtitle_ar: 'Guides, stories, and coffee inspiration.',
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
    defaultTitleAr: 'Contact Line Coffee',
    defaultSubtitleEn: 'We are here to help with orders and coffee choices.',
    defaultSubtitleAr: 'We are here to help with orders and coffee choices.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Contact Line Coffee',
      title_ar: 'Contact Line Coffee',
      subtitle_en: 'We are here to help with orders and coffee choices.',
      subtitle_ar: 'We are here to help with orders and coffee choices.',
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
    defaultTitleAr: 'Track Your Order',
    defaultSubtitleEn: 'Follow your Line Coffee order status.',
    defaultSubtitleAr: 'Follow your Line Coffee order status.',
    supportsSlides: false,
    supportsCta: false,
    minWidth: 1600,
    minHeight: 800,
    defaultContent: {
      title_en: 'Track Your Order',
      title_ar: 'Track Your Order',
      subtitle_en: 'Follow your Line Coffee order status.',
      subtitle_ar: 'Follow your Line Coffee order status.',
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
