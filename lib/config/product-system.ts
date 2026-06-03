import type { Product } from '@/lib/types'
import { roundCleanPrice, sizeToKg, type PackageSize } from '@/lib/config/customization'

export type ProductCategoryConfig = {
  id: string
  slug: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  image_url: string | null
  aliases?: string[]
}

export const OFFICIAL_PRODUCT_CATEGORIES: ProductCategoryConfig[] = [
  {
    id: 'turkish-blends',
    slug: 'turkish-blends',
    name_en: 'Turkish Blends',
    name_ar: 'توليفات تركي',
    description_en: 'Fixed sealed Turkish blends, packed for freshness.',
    description_ar: 'توليفات تركية ثابتة ومحكمة التعبئة للحفاظ على الطزاجة.',
    image_url: null,
  },
  {
    id: 'espresso-blends',
    slug: 'espresso-blends',
    name_en: 'Espresso Blends',
    name_ar: 'توليفات إسبريسو',
    description_en: 'Whole-bean specialty espresso blends.',
    description_ar: 'توليفات إسبريسو مختصة من حبوب كاملة.',
    image_url: null,
    aliases: ['espresso'],
  },
  {
    id: 'make-your-espresso',
    slug: 'make-your-espresso',
    name_en: 'Make Your Espresso',
    name_ar: 'اصنع إسبريسو خاصتك',
    description_en: 'Create a custom whole-bean espresso blend.',
    description_ar: 'اختر منشأ واحدًا أو اصنع توليفة حبوب كاملة خاصة بك.',
    image_url: null,
    aliases: ['customize-blend', 'build-your-espresso'],
  },
  {
    id: 'easy-coffee',
    slug: 'easy-coffee',
    name_en: 'Easy Coffee',
    name_ar: 'إيزي كوفي',
    description_en: 'Premium instant coffee, ready for future instant lines.',
    description_ar: 'قهوة فورية فاخرة بهيكل جاهز لتوسعات مستقبلية.',
    image_url: null,
  },
  {
    id: 'coffee-mix',
    slug: 'coffee-mix',
    name_en: 'Coffee Mix',
    name_ar: 'كوفي ميكس',
    description_en: 'Fine instant coffee with Polish creamer.',
    description_ar: 'قهوة فورية ناعمة مع مبيض بولندي.',
    image_url: null,
  },
  {
    id: 'cappuccino',
    slug: 'cappuccino',
    name_en: 'Cappuccino',
    name_ar: 'كابتشينو',
    description_en: 'Cafe-style instant coffee with Polish creamer and foam.',
    description_ar: 'قهوة فورية بطابع كافيه مع مبيض بولندي ورغوة.',
    image_url: null,
  },
  {
    id: 'flavor-coffee',
    slug: 'flavor-coffee',
    name_en: 'Flavor Coffee',
    name_ar: 'قهوة بالنكهات',
    description_en: 'Flavor coffee products with approved classic and dessert profiles.',
    description_ar: 'قهوة بالنكهات بملفات كلاسيكية وحلوة معتمدة.',
    image_url: null,
  },
  {
    id: 'hot-chocolate',
    slug: 'hot-chocolate',
    name_en: 'Hot Chocolate',
    name_ar: 'هوت شوكليت',
    description_en: 'Warm cocoa products ready for current and future hot chocolate lines.',
    description_ar: 'منتجات كاكاو دافئة جاهزة لخطوط الهوت شوكليت الحالية والمستقبلية.',
    image_url: null,
  },
  {
    id: 'make-your-flavor',
    slug: 'make-your-flavor',
    name_en: 'Make Your Flavor',
    name_ar: 'اصنع نكهتك',
    description_en: 'Build a custom flavor from approved bases and flavor options.',
    description_ar: 'اصنع نكهة خاصة من القواعد والنكهات المعتمدة.',
    image_url: null,
    aliases: ['customize-flavor'],
  },
]

export const CATEGORY_SLUG_ALIASES = OFFICIAL_PRODUCT_CATEGORIES.reduce<Record<string, string>>((map, category) => {
  map[category.slug] = category.slug
  category.aliases?.forEach((alias) => {
    map[alias] = category.slug
  })
  return map
}, {})

export const PRODUCT_IMAGE_LIBRARY = {
  turkish: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&q=80',
  espresso: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=900&q=80',
  beans: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80',
  coffeeMix: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80',
  cappuccino: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=900&q=80',
  flavor: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=80',
  hotChocolate: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=900&q=80',
} as const

const SIZE_ORDER: PackageSize[] = ['250g', '500g', '1kg']
const PROFIT_MULTIPLIER = 1.6

function pricesFromCost(costPerKg: number): [number, number, number] {
  return SIZE_ORDER.map((size) => roundCleanPrice(costPerKg * PROFIT_MULTIPLIER * sizeToKg(size))) as [number, number, number]
}

function createProduct(input: {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descEn: string
  descAr: string
  categorySlug: string
  costPerKg?: number
  prices?: [number, number, number]
  image: string
  origin?: string
  roastLevel?: Product['roast_level']
  notes?: string[]
  featured?: boolean
  bestSeller?: boolean
  isNew?: boolean
}): Product {
  const prices = input.prices ?? pricesFromCost(input.costPerKg ?? 0)

  return {
    id: input.id,
    slug: input.slug,
    name_en: input.nameEn,
    name_ar: input.nameAr,
    description_en: input.descEn,
    description_ar: input.descAr,
    category_id: input.categorySlug,
    images: [input.image],
    origin: input.origin ?? 'Line Coffee',
    roast_level: input.roastLevel === undefined ? 'medium' : input.roastLevel,
    flavor_notes: input.notes ?? [],
    is_featured: input.featured ?? false,
    is_best_seller: input.bestSeller ?? false,
    is_new: input.isNew ?? false,
    is_visible: true,
    stock_quantity: 100,
    low_stock_threshold: 10,
    is_manually_out_of_stock: false,
    created_at: '',
    updated_at: '',
    category: OFFICIAL_PRODUCT_CATEGORIES.find((category) => category.slug === input.categorySlug)
      ? {
          id: input.categorySlug,
          slug: input.categorySlug,
          name_en: OFFICIAL_PRODUCT_CATEGORIES.find((category) => category.slug === input.categorySlug)?.name_en ?? '',
          name_ar: OFFICIAL_PRODUCT_CATEGORIES.find((category) => category.slug === input.categorySlug)?.name_ar ?? '',
          description_en: null,
          description_ar: null,
          image_url: null,
          sort_order: 0,
          is_visible: true,
          created_at: '',
          updated_at: '',
        }
      : undefined,
    sizes: SIZE_ORDER.map((size, index) => ({
      id: `${input.id}-${size}`,
      product_id: input.id,
      size,
      price: prices[index],
      compare_at_price: null,
      sku: null,
      is_available: true,
    })),
  }
}

export const LAST_RESORT_PRODUCTS: Product[] = [
  createProduct({
    id: 'tc-turkish-silk',
    slug: 'turkish-silk',
    nameEn: 'Turkish Silk',
    nameAr: 'حرير تركي',
    descEn: 'A sealed pre-blended Turkish coffee with velvet body, soft spice, and a polished finish for a quiet premium ritual.',
    descAr: 'توليفة تركية جاهزة ومحكمة التعبئة بقوام مخملي ولمسة توابل ناعمة ونهاية راقية لطقس قهوة هادئ.',
    categorySlug: 'turkish-blends',
    prices: [170, 340, 680],
    image: PRODUCT_IMAGE_LIBRARY.turkish,
    notes: ['Velvety', 'Sealed blend', 'Soft spice'],
    featured: true,
  }),
  createProduct({
    id: 'tc-strike-coffee',
    slug: 'strike-coffee',
    nameEn: 'Strike Coffee',
    nameAr: 'طلقة قهوة',
    descEn: 'A bold sealed Turkish blend with dark cocoa, steady bitterness, and a confident aromatic presence.',
    descAr: 'توليفة تركية محكمة التعبئة بطابع جريء وكاكاو داكن ومرارة متوازنة وحضور عطري واضح.',
    categorySlug: 'turkish-blends',
    prices: [220, 440, 880],
    image: PRODUCT_IMAGE_LIBRARY.turkish,
    notes: ['Bold', 'Dark cocoa', 'Balanced bitterness'],
  }),
  createProduct({
    id: 'tc-cairo-nights',
    slug: 'cairo-nights',
    nameEn: 'Cairo Nights',
    nameAr: 'ليالي القاهرة',
    descEn: 'A deep Turkish blend inspired by late Cairo evenings, with caramel warmth and a long roasted finish.',
    descAr: 'توليفة تركية عميقة مستوحاة من ليالي القاهرة، بدفء الكراميل ونهاية تحميص طويلة.',
    categorySlug: 'turkish-blends',
    prices: [210, 425, 850],
    image: PRODUCT_IMAGE_LIBRARY.turkish,
    notes: ['Caramel', 'Deep roast', 'Warm finish'],
    bestSeller: true,
  }),
  createProduct({
    id: 'tc-high-mood',
    slug: 'high-mood',
    nameEn: 'High Mood',
    nameAr: 'المزاج العالي',
    descEn: 'A bright premium Turkish blend with lifted aromatics, smooth body, and a refined fresh-pack character.',
    descAr: 'توليفة تركية فاخرة بطابع عطري مرتفع وقوام ناعم وشخصية تعبئة طازجة راقية.',
    categorySlug: 'turkish-blends',
    prices: [290, 580, 1150],
    image: PRODUCT_IMAGE_LIBRARY.turkish,
    notes: ['Aromatic', 'Smooth body', 'Fresh packed'],
    isNew: true,
  }),

  createProduct({
    id: 'esp-heavy-crema',
    slug: 'heavy-crema',
    nameEn: 'HEAVY CREMA',
    nameAr: 'هيفي كريما',
    descEn: 'Whole-bean espresso built for thick crema, high caffeine, heavy body, and a classic chocolate finish.',
    descAr: 'إسبريسو حبوب كاملة مصمم لكريما كثيفة وكافيين عال وقوام ثقيل ونهاية شوكولاتة كلاسيكية.',
    categorySlug: 'espresso-blends',
    prices: [175, 350, 700],
    image: PRODUCT_IMAGE_LIBRARY.espresso,
    roastLevel: 'espresso',
    notes: ['Heavy crema', 'High caffeine', 'Full body'],
    bestSeller: true,
  }),
  createProduct({
    id: 'esp-aroma-body',
    slug: 'aroma-body',
    nameEn: 'AROMA BODY',
    nameAr: 'أروما بودي',
    descEn: 'Whole-bean espresso with rounded aroma, medium acidity, creamy body, and caramel-nut tasting notes.',
    descAr: 'إسبريسو حبوب كاملة برائحة مستديرة وحموضة متوسطة وقوام كريمي ولمسات كراميل ومكسرات.',
    categorySlug: 'espresso-blends',
    prices: [225, 445, 890],
    image: PRODUCT_IMAGE_LIBRARY.espresso,
    roastLevel: 'espresso',
    notes: ['Aromatic', 'Creamy body', 'Caramel nuts'],
    featured: true,
  }),
  createProduct({
    id: 'esp-headshot',
    slug: 'headshot',
    nameEn: 'HEADSHOT',
    nameAr: 'هيدشوت',
    descEn: 'A sharp whole-bean espresso blend with focused strength, clean acidity, and a direct specialty profile.',
    descAr: 'توليفة إسبريسو حبوب كاملة بقوة مركزة وحموضة نظيفة وطابع مختص مباشر.',
    categorySlug: 'espresso-blends',
    prices: [230, 455, 910],
    image: PRODUCT_IMAGE_LIBRARY.espresso,
    roastLevel: 'espresso',
    notes: ['Focused strength', 'Clean acidity', 'Specialty'],
    isNew: true,
  }),
  createProduct({
    id: 'esp-black-label',
    slug: 'black-label',
    nameEn: 'BLACK LABEL',
    nameAr: 'بلاك ليبل',
    descEn: 'The darkest premium whole-bean espresso line, with dense body, low acidity, and a long cocoa finish.',
    descAr: 'أغمق خطوط الإسبريسو الفاخرة من الحبوب الكاملة، بقوام كثيف وحموضة منخفضة ونهاية كاكاو ممتدة.',
    categorySlug: 'espresso-blends',
    prices: [270, 540, 1080],
    image: PRODUCT_IMAGE_LIBRARY.espresso,
    roastLevel: 'espresso',
    notes: ['Dark roast', 'Low acidity', 'Long cocoa'],
  }),

  createProduct({
    id: 'easy-classic-line',
    slug: 'classic-line',
    nameEn: 'Classic Line',
    nameAr: 'كلاسيك لاين',
    descEn: 'Premium instant coffee with a clean everyday profile, designed for smooth fast preparation.',
    descAr: 'قهوة فورية فاخرة بطابع يومي نظيف، مصممة لتحضير سريع وناعم.',
    categorySlug: 'easy-coffee',
    prices: [240, 480, 960],
    image: PRODUCT_IMAGE_LIBRARY.coffeeMix,
    roastLevel: null,
    notes: ['Instant', 'Smooth', 'Classic'],
  }),
  createProduct({
    id: 'easy-gold-line',
    slug: 'gold-line',
    nameEn: 'Gold Line',
    nameAr: 'جولد لاين',
    descEn: 'A more refined premium instant coffee with smoother aroma, richer body, and a polished gold profile.',
    descAr: 'قهوة فورية فاخرة أكثر نعومة برائحة أرقى وقوام أغنى وطابع ذهبي مصقول.',
    categorySlug: 'easy-coffee',
    prices: [280, 560, 1120],
    image: PRODUCT_IMAGE_LIBRARY.coffeeMix,
    roastLevel: null,
    notes: ['Instant', 'Gold aroma', 'Refined'],
    featured: true,
  }),

  createProduct({
    id: 'cm-original',
    slug: 'original-coffee-mix',
    nameEn: 'Original Coffee Mix',
    nameAr: 'كوفي ميكس أصلي',
    descEn: 'Fine instant coffee blended with Polish creamer for a balanced creamy daily cup.',
    descAr: 'قهوة فورية ناعمة ممزوجة بمبيض بولندي لكوب يومي كريمي ومتوازن.',
    categorySlug: 'coffee-mix',
    costPerKg: 220,
    image: PRODUCT_IMAGE_LIBRARY.coffeeMix,
    notes: ['Fine instant coffee', 'Polish creamer', 'Creamy'],
    bestSeller: true,
  }),
  createProduct({
    id: 'cm-hazelnut',
    slug: 'hazelnut-coffee-mix',
    nameEn: 'Hazelnut Coffee Mix',
    nameAr: 'كوفي ميكس بندق',
    descEn: 'Fine instant coffee, Polish creamer, and hazelnut flavor for a soft nutty cup.',
    descAr: 'قهوة فورية ناعمة ومبيض بولندي ونكهة بندق لكوب ناعم بطابع مكسرات.',
    categorySlug: 'coffee-mix',
    costPerKg: 270,
    image: PRODUCT_IMAGE_LIBRARY.coffeeMix,
    notes: ['Hazelnut', 'Creamer', 'Daily luxury'],
  }),
  createProduct({
    id: 'cm-caramel',
    slug: 'caramel-coffee-mix',
    nameEn: 'Caramel Coffee Mix',
    nameAr: 'كوفي ميكس كراميل',
    descEn: 'Fine instant coffee and Polish creamer with caramel sweetness for a warm daily ritual.',
    descAr: 'قهوة فورية ناعمة ومبيض بولندي بحلاوة كراميل لطقس يومي دافئ.',
    categorySlug: 'coffee-mix',
    costPerKg: 270,
    image: PRODUCT_IMAGE_LIBRARY.coffeeMix,
    notes: ['Caramel', 'Creamer', 'Warm'],
  }),

  createProduct({
    id: 'cap-original',
    slug: 'original-cappuccino',
    nameEn: 'Original Cappuccino',
    nameAr: 'كابتشينو أصلي',
    descEn: 'Fine instant coffee, Polish creamer, and foam for a smooth cafe-style cappuccino.',
    descAr: 'قهوة فورية ناعمة ومبيض بولندي ورغوة لكابتشينو ناعم بطابع كافيه.',
    categorySlug: 'cappuccino',
    costPerKg: 270,
    image: PRODUCT_IMAGE_LIBRARY.cappuccino,
    notes: ['Foam', 'Creamer', 'Cafe style'],
    bestSeller: true,
  }),
  createProduct({
    id: 'cap-chocolate',
    slug: 'chocolate-cappuccino',
    nameEn: 'Chocolate Cappuccino',
    nameAr: 'كابتشينو شوكولاتة',
    descEn: 'Fine instant coffee, Polish creamer, foam, and chocolate flavor for a smooth dessert cup.',
    descAr: 'قهوة فورية ناعمة ومبيض بولندي ورغوة ونكهة شوكولاتة لكوب حلويات ناعم.',
    categorySlug: 'cappuccino',
    costPerKg: 320,
    image: PRODUCT_IMAGE_LIBRARY.cappuccino,
    notes: ['Chocolate', 'Foam', 'Creamy'],
  }),
  createProduct({
    id: 'cap-vanilla',
    slug: 'vanilla-cappuccino',
    nameEn: 'Vanilla Cappuccino',
    nameAr: 'كابتشينو فانيلا',
    descEn: 'Cafe-style cappuccino with Polish creamer, foam, and soft vanilla aroma.',
    descAr: 'كابتشينو بطابع كافيه مع مبيض بولندي ورغوة ورائحة فانيلا ناعمة.',
    categorySlug: 'cappuccino',
    costPerKg: 320,
    image: PRODUCT_IMAGE_LIBRARY.cappuccino,
    notes: ['Vanilla', 'Foam', 'Soft aroma'],
  }),

  createProduct({
    id: 'flavor-hazelnut',
    slug: 'hazelnut-flavor-coffee',
    nameEn: 'Hazelnut Flavor Coffee',
    nameAr: 'قهوة منكهة بالبندق',
    descEn: 'Flavor coffee with roasted hazelnut mood, smooth aroma, and a refined dessert-inspired finish.',
    descAr: 'قهوة منكهة بطابع بندق محمص ورائحة ناعمة ونهاية راقية مستوحاة من الحلويات.',
    categorySlug: 'flavor-coffee',
    costPerKg: 270,
    image: PRODUCT_IMAGE_LIBRARY.flavor,
    notes: ['Hazelnut', 'Dessert mood', 'Aromatic'],
  }),
  createProduct({
    id: 'flavor-chocolate-chunk',
    slug: 'chocolate-chunk-flavor-coffee',
    nameEn: 'Chocolate Chunk Flavor Coffee',
    nameAr: 'قهوة منكهة بقطع الشوكولاتة',
    descEn: 'Flavor coffee with chocolate chunks for a richer texture and a luxury dessert-cup profile.',
    descAr: 'قهوة منكهة بقطع شوكولاتة لملمس أغنى وطابع كوب حلويات فاخر.',
    categorySlug: 'flavor-coffee',
    costPerKg: 290,
    image: PRODUCT_IMAGE_LIBRARY.flavor,
    notes: ['Chocolate chunks', 'Texture', 'Dessert'],
  }),
  createProduct({
    id: 'hc-original',
    slug: 'original-hot-chocolate',
    nameEn: 'Original Hot Chocolate',
    nameAr: 'هوت شوكليت أصلي',
    descEn: 'A smooth cocoa drink with cozy dessert warmth and a creamy premium finish.',
    descAr: 'مشروب كاكاو ناعم بدفء حلويات مريح ونهاية كريمية فاخرة.',
    categorySlug: 'hot-chocolate',
    costPerKg: 430,
    image: PRODUCT_IMAGE_LIBRARY.hotChocolate,
    notes: ['Cocoa', 'Creamy', 'Warm'],
  }),
]
