export type BeanFamily = 'arabica' | 'robusta' | 'other'
export type PackageSize = '250g' | '500g' | '1kg'
export type FlavorAdditionType = 'standard' | 'chunks'

export type CoffeeBeanOption = {
  id: string
  nameAr: string
  nameEn: string
  descAr: string
  descEn: string
  family: BeanFamily
  origin?: string
  price: number
  isVisible: boolean
}

export type FlavorBaseOption = {
  id: string
  nameAr: string
  nameEn: string
  price: number
}

export type FlavorAdditionOption = {
  id: string
  nameAr: string
  nameEn: string
  type: FlavorAdditionType
  price: number
}

export const CUSTOM_BLEND_BEANS_KEY = 'custom_blend_beans'

export const PACKAGE_COSTS: Record<PackageSize, number> = {
  '250g': 8,
  '500g': 12,
  '1kg': 18,
}

export const VALVE_BAG_COST = 5
export const PROFIT_MARGIN = 1.6

export const FLAVOR_BASES: FlavorBaseOption[] = [
  { id: 'turkish', nameAr: 'تركي', nameEn: 'Turkish', price: 400 },
  { id: 'coffee-mix', nameAr: 'كوفي ميكس', nameEn: 'Coffee Mix', price: 220 },
  { id: 'cappuccino', nameAr: 'كابتشينو', nameEn: 'Cappuccino', price: 270 },
]

export const FLAVOR_ADDITION_PRICES: Record<FlavorAdditionType, number> = {
  standard: 50,
  chunks: 70,
}

export const DEFAULT_FLAVOR_ADDITIONS: FlavorAdditionOption[] = [
  { id: 'hazelnut', nameEn: 'Hazelnut', nameAr: 'بندق', type: 'standard', price: 50 },
  { id: 'hazelnut-chunks', nameEn: 'Hazelnut Chunks', nameAr: 'بندق قطع', type: 'chunks', price: 70 },
  { id: 'almond', nameEn: 'Almond', nameAr: 'لوز', type: 'standard', price: 50 },
  { id: 'pistachio', nameEn: 'Pistachio', nameAr: 'فستق', type: 'standard', price: 50 },
  { id: 'chocolate', nameEn: 'Chocolate', nameAr: 'شوكولاتة', type: 'standard', price: 50 },
  { id: 'chocolate-chunks', nameEn: 'Chocolate Chunks', nameAr: 'شوكولاتة قطع', type: 'chunks', price: 70 },
  { id: 'nutella', nameEn: 'Nutella', nameAr: 'نوتيلا', type: 'standard', price: 50 },
  { id: 'oreo', nameEn: 'Oreo', nameAr: 'أوريو', type: 'standard', price: 50 },
  { id: 'lotus', nameEn: 'Lotus', nameAr: 'لوتس', type: 'standard', price: 50 },
  { id: 'cinnabon', nameEn: 'Cinnabon', nameAr: 'سينابون', type: 'standard', price: 50 },
  { id: 'coconut', nameEn: 'Coconut', nameAr: 'جوز الهند', type: 'standard', price: 50 },
  { id: 'vanilla', nameEn: 'Vanilla', nameAr: 'فانيليا', type: 'standard', price: 50 },
  { id: 'caramel', nameEn: 'Caramel', nameAr: 'كراميل', type: 'standard', price: 50 },
  { id: 'strawberry', nameEn: 'Strawberry', nameAr: 'فراولة', type: 'standard', price: 50 },
  { id: 'banana', nameEn: 'Banana', nameAr: 'موز', type: 'standard', price: 50 },
  { id: 'mango', nameEn: 'Mango', nameAr: 'مانجو', type: 'standard', price: 50 },
  { id: 'peach', nameEn: 'Peach', nameAr: 'خوخ', type: 'standard', price: 50 },
  { id: 'blueberry', nameEn: 'Blueberry', nameAr: 'توت أزرق', type: 'standard', price: 50 },
  { id: 'cherry', nameEn: 'Cherry', nameAr: 'كرز', type: 'standard', price: 50 },
  { id: 'apple', nameEn: 'Apple', nameAr: 'تفاح', type: 'standard', price: 50 },
  { id: 'grape', nameEn: 'Grape', nameAr: 'عنب', type: 'standard', price: 50 },
  { id: 'mocha', nameEn: 'Mocha', nameAr: 'موكا', type: 'standard', price: 50 },
]

export const DEFAULT_CUSTOM_BLEND_BEANS: CoffeeBeanOption[] = [
  {
    id: 'indian-arabica',
    nameAr: 'هندي',
    nameEn: 'Indian',
    descAr: 'قوام متوازن ولمسة مكسرات ناعمة تصلح كأساس فاخر للتوليفات.',
    descEn: 'Balanced body with a soft nutty profile for premium blends.',
    family: 'arabica',
    origin: 'India',
    price: 600,
    isVisible: true,
  },
  {
    id: 'brazilian',
    nameAr: 'برازيلي',
    nameEn: 'Brazilian',
    descAr: 'حلاوة شوكولاتة خفيفة ومرارة منخفضة.',
    descEn: 'Soft chocolate sweetness with low bitterness.',
    family: 'arabica',
    origin: 'Brazil',
    price: 482,
    isVisible: true,
  },
  {
    id: 'colombian',
    nameAr: 'كولومبي',
    nameEn: 'Colombian',
    descAr: 'توازن أنيق بين الكراميل والفاكهة الخفيفة.',
    descEn: 'Elegant caramel balance with light fruit notes.',
    family: 'arabica',
    origin: 'Colombia',
    price: 705,
    isVisible: true,
  },
  {
    id: 'ethiopian',
    nameAr: 'حبشي',
    nameEn: 'Ethiopian',
    descAr: 'طابع زهري وفاكهي مع حموضة لطيفة.',
    descEn: 'Floral and fruity with gentle brightness.',
    family: 'arabica',
    origin: 'Ethiopia',
    price: 487,
    isVisible: true,
  },
  {
    id: 'indian-plantation',
    nameAr: 'هندي بلانتيشن',
    nameEn: 'Indian Plantation',
    descAr: 'ناعم وغني بطابع كلاسيكي فاخر.',
    descEn: 'Smooth and rich with a polished classic cup.',
    family: 'arabica',
    origin: 'India',
    price: 682,
    isVisible: true,
  },
  {
    id: 'guatemala',
    nameAr: 'جواتيمالا',
    nameEn: 'Guatemala',
    descAr: 'شوكولاتة داكنة وجسم متوسط بنهاية دافئة.',
    descEn: 'Dark chocolate notes, medium body, warm finish.',
    family: 'arabica',
    origin: 'Guatemala',
    price: 835,
    isVisible: true,
  },
  {
    id: 'yemeni',
    nameAr: 'يمني',
    nameEn: 'Yemeni',
    descAr: 'عطري وتراثي بطابع دافئ ومميز.',
    descEn: 'Aromatic, traditional, warm, and distinctive.',
    family: 'arabica',
    origin: 'Yemen',
    price: 1187,
    isVisible: true,
  },
  {
    id: 'peruvian',
    nameAr: 'بيرو',
    nameEn: 'Peruvian',
    descAr: 'كوب نظيف وناعم بحموضة هادئة.',
    descEn: 'Clean and smooth with gentle acidity.',
    family: 'arabica',
    origin: 'Peru',
    price: 835,
    isVisible: true,
  },
  {
    id: 'costa-rican',
    nameAr: 'كوستاريكا',
    nameEn: 'Costa Rican',
    descAr: 'متوازن وحيوي بوضوح عطري ناعم.',
    descEn: 'Balanced and lively with refined aromatics.',
    family: 'arabica',
    origin: 'Costa Rica',
    price: 835,
    isVisible: true,
  },
  {
    id: 'indonesian',
    nameAr: 'إندونيسي',
    nameEn: 'Indonesian',
    descAr: 'قوي وممتلئ بطابع أرضي واضح.',
    descEn: 'Strong and full-bodied with earthy depth.',
    family: 'robusta',
    origin: 'Indonesia',
    price: 340,
    isVisible: true,
  },
  {
    id: 'indonesian-xl',
    nameAr: 'إندونيسي XL',
    nameEn: 'Indonesian XL',
    descAr: 'قوة أعلى وحضور واضح في الكوب.',
    descEn: 'Extra bold with a stronger cup presence.',
    family: 'robusta',
    origin: 'Indonesia',
    price: 346,
    isVisible: true,
  },
  {
    id: 'indian-robusta',
    nameAr: 'هندي',
    nameEn: 'Indian Robusta',
    descAr: 'روبوستا غني بكريمة واضحة ومرارة متوازنة.',
    descEn: 'Rich robusta with crema and balanced bitterness.',
    family: 'robusta',
    origin: 'India',
    price: 376,
    isVisible: true,
  },
  {
    id: 'vietnamese',
    nameAr: 'فيتنامي',
    nameEn: 'Vietnamese',
    descAr: 'قوي ومباشر بكافيين عال.',
    descEn: 'Direct and strong with higher caffeine.',
    family: 'robusta',
    origin: 'Vietnam',
    price: 346,
    isVisible: true,
  },
  {
    id: 'vietnamese-washed',
    nameAr: 'فيتنامي مغسول',
    nameEn: 'Vietnamese Washed',
    descAr: 'قوة الروبوستا مع نظافة أعلى في الطعم.',
    descEn: 'Robusta strength with a cleaner washed profile.',
    family: 'robusta',
    origin: 'Vietnam',
    price: 376,
    isVisible: true,
  },
]

export function slugifyOptionId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeFamily(value: unknown): BeanFamily {
  return value === 'arabica' || value === 'robusta' || value === 'other'
    ? value
    : 'other'
}

function toPositiveNumber(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : fallback
}

export function normalizeBeanOptions(value: unknown): CoffeeBeanOption[] {
  const rows = Array.isArray(value) ? value : DEFAULT_CUSTOM_BLEND_BEANS

  return rows
    .map((row, index) => {
      const item = row as Partial<CoffeeBeanOption>
      const nameEn = String(item.nameEn || '').trim()
      const nameAr = String(item.nameAr || '').trim()
      const fallbackId = nameEn || nameAr || `bean-${index + 1}`
      const id = slugifyOptionId(String(item.id || fallbackId)) || `bean-${index + 1}`

      return {
        id,
        nameAr,
        nameEn,
        descAr: String(item.descAr || '').trim(),
        descEn: String(item.descEn || '').trim(),
        family: normalizeFamily(item.family),
        origin: item.origin ? String(item.origin).trim() : undefined,
        price: toPositiveNumber(item.price),
        isVisible: item.isVisible !== false,
      }
    })
    .filter((item) => item.nameAr && item.nameEn)
}

export function parseBeanOptions(value: string | null | undefined) {
  if (!value) return DEFAULT_CUSTOM_BLEND_BEANS

  try {
    const parsed = normalizeBeanOptions(JSON.parse(value))
    return parsed.length > 0 ? parsed : DEFAULT_CUSTOM_BLEND_BEANS
  } catch {
    return DEFAULT_CUSTOM_BLEND_BEANS
  }
}

export function sizeToKg(size: PackageSize) {
  if (size === '250g') return 0.25
  if (size === '500g') return 0.5
  return 1
}

export function roundCleanPrice(value: number) {
  return Math.max(0, Math.round(value / 5) * 5)
}

export function calculateRetailPrice(rawPerKg: number, size: PackageSize, valveBag = false) {
  const packaging = PACKAGE_COSTS[size] + (valveBag ? VALVE_BAG_COST : 0)
  return roundCleanPrice((rawPerKg * sizeToKg(size) + packaging) * PROFIT_MARGIN)
}

export function calculateBlendRawCost(
  beans: Array<{ price: number; percent?: number | string }>,
  mode: 'types' | 'ratios',
) {
  if (beans.length === 0) return 0

  if (mode === 'ratios') {
    return beans.reduce((sum, bean) => {
      const percent = Math.max(0, Number(bean.percent || 0))
      return sum + bean.price * (percent / 100)
    }, 0)
  }

  return beans.reduce((sum, bean) => sum + bean.price, 0) / beans.length
}

export function calculateBlendPrice(
  beans: Array<{ price: number; percent?: number | string }>,
  mode: 'types' | 'ratios',
  size: PackageSize,
  valveBag = false,
) {
  return calculateRetailPrice(calculateBlendRawCost(beans, mode), size, valveBag)
}

export function calculateFlavorRawCost(basePrice: number, additions: Array<{ price: number }>) {
  return basePrice + additions.reduce((sum, addition) => sum + addition.price, 0)
}

export function calculateFlavorPrice(
  basePrice: number,
  additions: Array<{ price: number }>,
  size: PackageSize,
  valveBag = false,
) {
  return calculateRetailPrice(calculateFlavorRawCost(basePrice, additions), size, valveBag)
}
