export type BeanFamily = 'arabica' | 'robusta' | 'other'

export type CoffeeBeanOption = {
  id: string
  nameAr: string
  nameEn: string
  descAr: string
  descEn: string
  family: BeanFamily
  isVisible: boolean
}

export const CUSTOM_BLEND_BEANS_KEY = 'custom_blend_beans'

export const DEFAULT_CUSTOM_BLEND_BEANS: CoffeeBeanOption[] = [
  {
    id: 'brazilian',
    nameAr: 'برازيلي',
    nameEn: 'Brazilian',
    descAr: 'ناعم وحلو، شوكولاتة خفيفة، مرارة منخفضة',
    descEn: 'Soft and sweet with light chocolate notes and low bitterness',
    family: 'arabica',
    isVisible: true,
  },
  {
    id: 'colombian',
    nameAr: 'كولومبي',
    nameEn: 'Colombian',
    descAr: 'متوازن، كراميل وفاكهة خفيفة، مناسب لأغلب الأذواق',
    descEn: 'Balanced with caramel and light fruit notes',
    family: 'arabica',
    isVisible: true,
  },
  {
    id: 'ethiopian',
    nameAr: 'حبشي',
    nameEn: 'Ethiopian',
    descAr: 'فلورال وفاكهي، حموضة خفيفة، قهوة مختصة',
    descEn: 'Floral and fruity with bright light acidity',
    family: 'arabica',
    isVisible: true,
  },
  {
    id: 'guatemalan',
    nameAr: 'جواتيمالا',
    nameEn: 'Guatemalan',
    descAr: 'شوكولاتة داكنة، جسم متوسط، طابع غني',
    descEn: 'Dark chocolate notes with medium body',
    family: 'arabica',
    isVisible: true,
  },
  {
    id: 'yemeni',
    nameAr: 'يمني',
    nameEn: 'Yemeni',
    descAr: 'تراثي وعطري، نكهة فريدة ودافئة',
    descEn: 'Traditional, aromatic, and warmly distinctive',
    family: 'arabica',
    isVisible: true,
  },
  {
    id: 'peruvian',
    nameAr: 'بيرو',
    nameEn: 'Peruvian',
    descAr: 'ناعم ونظيف، حموضة خفيفة وتوازن هادئ',
    descEn: 'Clean and smooth with gentle acidity',
    family: 'arabica',
    isVisible: true,
  },
  {
    id: 'indonesian',
    nameAr: 'إندونيسي',
    nameEn: 'Indonesian',
    descAr: 'قوي وثقيل، كافيين عالي وقوام واضح',
    descEn: 'Bold and heavy with higher caffeine',
    family: 'robusta',
    isVisible: true,
  },
  {
    id: 'indonesian-xl',
    nameAr: 'إندونيسي XL',
    nameEn: 'Indonesian XL',
    descAr: 'الأقوى، جسم كامل جداً وحضور واضح',
    descEn: 'Extra bold with a very full body',
    family: 'robusta',
    isVisible: true,
  },
  {
    id: 'indian',
    nameAr: 'هندي',
    nameEn: 'Indian',
    descAr: 'متوازن وقوي، مناسب كأساس للتوليفات',
    descEn: 'Strong, balanced, and ideal as a blend base',
    family: 'robusta',
    isVisible: true,
  },
  {
    id: 'indian-plantation',
    nameAr: 'هندي بلانتيشن',
    nameEn: 'Indian Plantation',
    descAr: 'ناعم نسبياً مقارنة بباقي الروبوستا',
    descEn: 'Relatively smoother than classic robusta',
    family: 'robusta',
    isVisible: true,
  },
  {
    id: 'vietnamese',
    nameAr: 'فيتنامي',
    nameEn: 'Vietnamese',
    descAr: 'قوي جداً، مرارة عالية وكريمة ممتازة',
    descEn: 'Very strong with high bitterness and excellent crema',
    family: 'robusta',
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
        isVisible: item.isVisible !== false,
      }
    })
    .filter((item) => item.nameAr && item.nameEn)
}

export function parseBeanOptions(value: string | null | undefined) {
  if (!value) return DEFAULT_CUSTOM_BLEND_BEANS

  try {
    return normalizeBeanOptions(JSON.parse(value))
  } catch {
    return DEFAULT_CUSTOM_BLEND_BEANS
  }
}
