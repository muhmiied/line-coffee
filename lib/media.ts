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
    labelAr: 'فئة: القهوة التركي',
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
    labelAr: 'فئة: القهوة بالنكهات',
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
  media_type?: string | null
  usage_area?: string | null
  alt_en?: string | null
  alt_ar?: string | null
  is_featured?: boolean | null
  images?: unknown
  created_at?: string
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

export function getMediaObjectPosition(item: Pick<SiteMediaItem, 'images'>, fallback = 'center center') {
  return getMediaImageMeta(item)?.object_position || fallback
}

export function isUploadedImageSmall(usageArea: string, width: number, height: number) {
  const usage = getMediaUsageOption(usageArea)
  return width < usage.minWidth || height < usage.minHeight
}

export function mediaByUsage(items: SiteMediaItem[]) {
  return new Map(items.map((item) => [item.usage_area || 'banner', item]))
}
