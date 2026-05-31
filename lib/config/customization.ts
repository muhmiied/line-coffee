export type BeanFamily = 'arabica' | 'robusta' | 'other'
export type PackageSize = '250g' | '500g' | '1kg'
export type FlavorAdditionType = 'standard' | 'chunks'
export type FlavorGroupKey = 'original' | 'sweets' | 'nuts' | 'fruits' | 'special'

export type CoffeeBeanOption = {
  id: string
  nameAr: string
  nameEn: string
  descAr: string
  descEn: string
  family: BeanFamily
  origin?: string
  price: number
  salePrice?: number
  costPrice?: number
  roastEn?: string
  roastAr?: string
  storyEn?: string
  storyAr?: string
  tastingNotesEn?: string[]
  tastingNotesAr?: string[]
  bitterness?: number
  body?: number
  acidity?: number
  crema?: number
  strength?: number
  isVisible: boolean
  stockQuantity?: number
  lowStockThreshold?: number
  isManuallyOutOfStock?: boolean
}

export type FlavorBaseOption = {
  id: string
  nameAr: string
  nameEn: string
  price: number
  descriptionAr?: string
  descriptionEn?: string
  moodAr?: string
  moodEn?: string
  image?: string
}

export type FlavorAdditionOption = {
  id: string
  nameAr: string
  nameEn: string
  type: FlavorAdditionType
  price: number
  group?: FlavorGroupKey
  descriptionAr?: string
  descriptionEn?: string
  moodAr?: string
  moodEn?: string
  icon?: string
  sortOrder?: number
  /** Which base IDs this flavor applies to. Undefined = all bases. */
  bases?: string[]
  stockQuantity?: number
  lowStockThreshold?: number
  isManuallyOutOfStock?: boolean
  availabilityByBase?: Record<string, {
    stockQuantity?: number
    lowStockThreshold?: number
    isManuallyOutOfStock?: boolean
  }>
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
  { id: 'turkish-coffee', nameAr: 'القهوة التركية', nameEn: 'Turkish Coffee', price: 400 },
  { id: 'coffee-mix',     nameAr: 'كوفي ميكس',    nameEn: 'Coffee Mix',     price: 220 },
  { id: 'cappuccino',     nameAr: 'كابتشينو',      nameEn: 'Cappuccino',     price: 270 },
]

export const FLAVOR_ADDITION_PRICES: Record<FlavorAdditionType, number> = {
  standard: 50,
  chunks: 70,
}

// Flavors available for all three bases
const ALL_BASES = ['turkish-coffee', 'coffee-mix', 'cappuccino']
// Flavors available for Turkish + Coffee Mix (not Cappuccino)
const TK_CM = ['turkish-coffee', 'coffee-mix']
// Flavors exclusive to Turkish
const TK_ONLY = ['turkish-coffee']

export const DEFAULT_FLAVOR_ADDITIONS: FlavorAdditionOption[] = [
  // ── Nuts & classics (all bases) ──────────────────────────────
  { id: 'hazelnut',         nameEn: 'Hazelnut',          nameAr: 'بندق',          type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'hazelnut-chunks',  nameEn: 'Hazelnut Chunks',   nameAr: 'بندق قطع',      type: 'chunks',   price: 70, bases: ALL_BASES },
  { id: 'almond',           nameEn: 'Almond',            nameAr: 'لوز',           type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'pistachio',        nameEn: 'Pistachio',         nameAr: 'فستق',          type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'chocolate',        nameEn: 'Chocolate',         nameAr: 'شوكولاتة',      type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'chocolate-chunks', nameEn: 'Chocolate Chunks',  nameAr: 'شوكولاتة قطع', type: 'chunks',   price: 70, bases: ALL_BASES },
  { id: 'nutella',          nameEn: 'Nutella',           nameAr: 'نوتيلا',        type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'oreo',             nameEn: 'Oreo',              nameAr: 'أوريو',         type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'lotus',            nameEn: 'Lotus',             nameAr: 'لوتس',          type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'cinnabon',         nameEn: 'Cinnabon',          nameAr: 'سينابون',       type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'coconut',          nameEn: 'Coconut',           nameAr: 'جوز الهند',     type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'vanilla',          nameEn: 'Vanilla',           nameAr: 'فانيليا',       type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'caramel',          nameEn: 'Caramel',           nameAr: 'كراميل',        type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'mocha',            nameEn: 'Mocha',             nameAr: 'موكا',          type: 'standard', price: 50, bases: ALL_BASES },
  // ── Common fruits (all bases) ────────────────────────────────
  { id: 'strawberry',       nameEn: 'Strawberry',        nameAr: 'فراولة',        type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'banana',           nameEn: 'Banana',            nameAr: 'موز',           type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'mango',            nameEn: 'Mango',             nameAr: 'مانجو',         type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'peach',            nameEn: 'Peach',             nameAr: 'خوخ',           type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'blueberry',        nameEn: 'Blueberry',         nameAr: 'توت',           type: 'standard', price: 50, bases: ALL_BASES },
  { id: 'cherry',           nameEn: 'Cherry',            nameAr: 'كرز',           type: 'standard', price: 50, bases: ALL_BASES },
  // ── Tropical & seasonal fruits (Turkish + Coffee Mix) ────────
  { id: 'apple',            nameEn: 'Apple',             nameAr: 'تفاح',          type: 'standard', price: 50, bases: TK_CM },
  { id: 'grape',            nameEn: 'Grape',             nameAr: 'عنب',           type: 'standard', price: 50, bases: TK_CM },
  { id: 'orange',           nameEn: 'Orange',            nameAr: 'برتقال',        type: 'standard', price: 50, bases: TK_CM },
  { id: 'watermelon',       nameEn: 'Watermelon',        nameAr: 'بطيخ',          type: 'standard', price: 50, bases: TK_CM },
  { id: 'guava',            nameEn: 'Guava',             nameAr: 'جوافة',         type: 'standard', price: 50, bases: TK_CM },
  { id: 'pineapple',        nameEn: 'Pineapple',         nameAr: 'أناناس',        type: 'standard', price: 50, bases: TK_CM },
  // ── Turkish-exclusive specialty flavors ──────────────────────
  { id: 'apple-hookah',     nameEn: 'Apple Hookah',      nameAr: 'شيشة تفاح',    type: 'standard', price: 50, bases: TK_ONLY },
  { id: 'grape-hookah',     nameEn: 'Grape Hookah',      nameAr: 'شيشة عنب',     type: 'standard', price: 50, bases: TK_ONLY },
  { id: 'hot-cider',        nameEn: 'Hot Cider',         nameAr: 'هوت سيدر',     type: 'standard', price: 50, bases: TK_ONLY },
]

const ALL_CUSTOMIZE_FLAVOR_BASES = ['turkish-coffee', 'coffee-mix', 'cappuccino', 'hot-chocolate']

export const OFFICIAL_CUSTOM_BLEND_SALE_PRICES: Record<string, number> = {
  indian: 720,
  india: 720,
  'indian-arabica': 720,
  brazilian: 580,
  brazil: 580,
  colombian: 850,
  colombia: 850,
  ethiopian: 585,
  ethiopia: 585,
  'indian-plantation': 820,
  'india-plantation': 820,
  guatemala: 1000,
  yemeni: 1425,
  yemen: 1425,
  peru: 1000,
  peruvian: 1000,
  'costa-rica': 1000,
  'costa-rican': 1000,
  'tanzanian-arabica': 435,
  'kenyan-arabica': 420,
  'nicaragua-arabica': 760,
  nicaragua: 760,
  'indian-washed-arabica': 615,
  'india-washed-arabica': 615,
  'brazil-17-18': 460,
  'ethiopian-lekempti': 470,
  'ethiopia-lekempti': 470,
  'santos-fine-cup': 600,
  'colombian-18': 670,
  'colombia-18': 670,
  indonesian: 410,
  indonesia: 410,
  'indonesian-xl': 415,
  'indonesia-xl': 415,
  'indian-robusta': 450,
  'india-robusta': 450,
  vietnamese: 415,
  vietnam: 415,
  'vietnamese-washed': 450,
  'vietnam-washed': 450,
  'indonesian-large': 325,
  'indonesia-large': 325,
  'indonesian-medium': 315,
  'indonesia-medium': 315,
  'ugandan-18': 340,
  'uganda-18': 340,
  'indian-robusta-aa': 350,
  'india-robusta-aa': 350,
  'vietnamese-clean': 320,
  'vietnam-clean': 320,
}

export function applyOfficialBeanSalePrice(bean: CoffeeBeanOption): CoffeeBeanOption {
  const salePrice = [bean.id, bean.nameEn].reduce<number | undefined>((match, value) => {
    if (match) return match
    return OFFICIAL_CUSTOM_BLEND_SALE_PRICES[slugifyOptionId(value)]
  }, undefined)

  if (!salePrice) return bean

  return {
    ...bean,
    costPrice: bean.costPrice ?? bean.price,
    salePrice,
    price: salePrice,
  }
}

export const CUSTOMIZE_FLAVOR_BASES: FlavorBaseOption[] = [
  {
    id: 'turkish-coffee',
    nameAr: 'قهوة تركية',
    nameEn: 'Turkish Coffee',
    price: 400,
    descriptionEn: 'A sealed Turkish coffee base for elegant flavored cups.',
    descriptionAr: 'قاعدة قهوة تركية محكمة التعبئة لكوب منكه راق.',
    moodEn: 'Velvety and aromatic',
    moodAr: 'مخملية وعطرية',
  },
  {
    id: 'coffee-mix',
    nameAr: 'كوفي ميكس',
    nameEn: 'Coffee Mix',
    price: 430,
    descriptionEn: 'Fine instant coffee with Polish creamer for a smooth daily ritual.',
    descriptionAr: 'قهوة فورية ناعمة مع مبيض بولندي لطقس يومي سلس.',
    moodEn: 'Creamy daily luxury',
    moodAr: 'رفاهية يومية كريمية',
  },
  {
    id: 'cappuccino',
    nameAr: 'كابتشينو',
    nameEn: 'Cappuccino',
    price: 530,
    descriptionEn: 'Cafe-style instant coffee, creamer, and foam with a soft finish.',
    descriptionAr: 'قهوة فورية ومبيض ورغوة بطابع كافيه ونهاية ناعمة.',
    moodEn: 'Foamy cafe comfort',
    moodAr: 'راحة كافيه برغوة ناعمة',
  },
  {
    id: 'hot-chocolate',
    nameAr: 'هوت شوكليت',
    nameEn: 'Hot Chocolate',
    price: 430,
    descriptionEn: 'A warm cocoa base for dessert-inspired custom flavors.',
    descriptionAr: 'قاعدة كاكاو دافئة لنكهات مستوحاة من الحلويات.',
    moodEn: 'Dessert warmth',
    moodAr: 'دفء حلويات',
  },
]

export const CUSTOMIZE_FLAVOR_ADDITIONS: FlavorAdditionOption[] = [
  { id: 'chocolate-chunks', nameEn: 'Chocolate Chunks', nameAr: 'قطع شوكولاتة', type: 'chunks', price: 70, group: 'sweets', descriptionEn: 'Real dessert texture with a richer chocolate bite.', descriptionAr: 'ملمس حلويات حقيقي ولمسة شوكولاتة أغنى.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 2 },
  { id: 'chocolate', nameEn: 'Chocolate', nameAr: 'شوكولاتة', type: 'standard', price: 50, group: 'sweets', descriptionEn: 'Deep cocoa warmth for a smooth dessert mood.', descriptionAr: 'دفء كاكاو عميق بطابع حلويات ناعم.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 3 },
  { id: 'caramel', nameEn: 'Caramel', nameAr: 'كراميل', type: 'standard', price: 50, group: 'sweets', descriptionEn: 'Buttery sweetness with a polished golden finish.', descriptionAr: 'حلاوة زبدية بنهاية ذهبية راقية.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 4 },
  { id: 'vanilla', nameEn: 'Vanilla', nameAr: 'فانيلا', type: 'standard', price: 50, group: 'sweets', descriptionEn: 'Soft aromatic sweetness that keeps the cup elegant.', descriptionAr: 'حلاوة عطرية ناعمة تحافظ على أناقة الكوب.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 5 },
  { id: 'lotus', nameEn: 'Lotus', nameAr: 'لوتس', type: 'standard', price: 50, group: 'sweets', descriptionEn: 'Biscuit-caramel warmth for a cozy cafe profile.', descriptionAr: 'دفء بسكويت وكراميل بطابع كافيه دافئ.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 6 },
  { id: 'oreo', nameEn: 'Oreo', nameAr: 'أوريو', type: 'standard', price: 50, group: 'sweets', descriptionEn: 'Creamy cookie notes for a playful premium cup.', descriptionAr: 'لمسات بسكويت كريمية لكوب فاخر وممتع.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 7 },
  { id: 'cherry', nameEn: 'Cherry', nameAr: 'كرز', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Bright red-fruit sweetness with a fragrant finish.', descriptionAr: 'حلاوة فاكهة حمراء مشرقة ونهاية عطرية.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 8 },
  { id: 'almond', nameEn: 'Almond', nameAr: 'لوز', type: 'standard', price: 50, group: 'nuts', descriptionEn: 'Elegant nutty smoothness with a refined aroma.', descriptionAr: 'نعومة مكسرات أنيقة ورائحة راقية.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 9 },
  { id: 'pistachio', nameEn: 'Pistachio', nameAr: 'فستق', type: 'standard', price: 50, group: 'nuts', descriptionEn: 'Luxurious nut character with a creamy finish.', descriptionAr: 'طابع مكسرات فاخر بنهاية كريمية.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 10 },
  { id: 'hazelnut-chunks', nameEn: 'Hazelnut Chunks', nameAr: 'قطع بندق', type: 'chunks', price: 70, group: 'nuts', descriptionEn: 'Textured hazelnut richness for a dessert-like cup.', descriptionAr: 'غنى البندق مع ملمس واضح لكوب يشبه الحلويات.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 11 },
  { id: 'hazelnut', nameEn: 'Hazelnut', nameAr: 'بندق', type: 'standard', price: 50, group: 'nuts', descriptionEn: 'Roasted nut warmth and a familiar cafe aroma.', descriptionAr: 'دفء بندق محمص ورائحة كافيه مألوفة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 12 },
  { id: 'strawberry', nameEn: 'Strawberry', nameAr: 'فراولة', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Soft berry sweetness with a creamy-friendly finish.', descriptionAr: 'حلاوة توت ناعمة تناسب القوام الكريمي.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 13 },
  { id: 'banana', nameEn: 'Banana', nameAr: 'موز', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Round tropical sweetness for a mellow cup.', descriptionAr: 'حلاوة استوائية ناعمة لكوب هادئ.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 14 },
  { id: 'mango', nameEn: 'Mango', nameAr: 'مانجو', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Juicy tropical aroma with a bright finish.', descriptionAr: 'رائحة استوائية غنية ونهاية مشرقة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 15 },
  { id: 'peach', nameEn: 'Peach', nameAr: 'خوخ', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Delicate stone-fruit sweetness and a soft aroma.', descriptionAr: 'حلاوة خوخ رقيقة ورائحة ناعمة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 16 },
  { id: 'berry', nameEn: 'Berry', nameAr: 'توت', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Layered berry sweetness with a fragrant lift.', descriptionAr: 'حلاوة توت متعددة ورائحة لطيفة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 17 },
  { id: 'blueberry', nameEn: 'Blueberry', nameAr: 'توت أزرق', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Deep berry notes with a smooth dessert edge.', descriptionAr: 'نغمات توت عميقة بطابع حلويات ناعم.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 18 },
  { id: 'apple', nameEn: 'Apple', nameAr: 'تفاح', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Crisp fruit brightness with a clean finish.', descriptionAr: 'حيوية فاكهية واضحة ونهاية نظيفة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 19 },
  { id: 'grape', nameEn: 'Grape', nameAr: 'عنب', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Sweet grape aroma for a distinctive cup.', descriptionAr: 'رائحة عنب حلوة لكوب مختلف.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 20 },
  { id: 'watermelon', nameEn: 'Watermelon', nameAr: 'بطيخ', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Light summer sweetness for playful blends.', descriptionAr: 'حلاوة صيفية خفيفة لتوليفات مرحة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 21 },
  { id: 'guava', nameEn: 'Guava', nameAr: 'جوافة', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Tropical guava aroma with a rounded finish.', descriptionAr: 'رائحة جوافة استوائية ونهاية مستديرة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 22 },
  { id: 'pineapple', nameEn: 'Pineapple', nameAr: 'أناناس', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Bright tropical sweetness with a lively aroma.', descriptionAr: 'حلاوة استوائية مشرقة ورائحة حيوية.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 23 },
  { id: 'orange', nameEn: 'Orange', nameAr: 'برتقال', type: 'standard', price: 50, group: 'fruits', descriptionEn: 'Citrus lift that keeps the cup fresh.', descriptionAr: 'انتعاش حمضي يحافظ على خفة الكوب.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 24 },
  { id: 'coconut', nameEn: 'Coconut', nameAr: 'جوز الهند', type: 'standard', price: 50, group: 'special', descriptionEn: 'Creamy tropical warmth with a lingering aroma.', descriptionAr: 'دفء استوائي كريمي ورائحة ممتدة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 25 },
  { id: 'mocha', nameEn: 'Mocha', nameAr: 'موكا', type: 'standard', price: 50, group: 'special', descriptionEn: 'Coffee and cocoa depth for a richer profile.', descriptionAr: 'عمق قهوة وكاكاو لطابع أغنى.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 26 },
  { id: 'pina-colada', nameEn: 'Pina Colada', nameAr: 'بينا كولادا', type: 'standard', price: 50, group: 'special', descriptionEn: 'Tropical coconut-pineapple mood for special orders.', descriptionAr: 'طابع استوائي من جوز الهند والأناناس للطلبات الخاصة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 27 },
  { id: 'apple-hookah', nameEn: 'Apple Hookah', nameAr: 'شيشة تفاح', type: 'standard', price: 50, group: 'special', descriptionEn: 'A bold aromatic profile for adventurous cups.', descriptionAr: 'طابع عطري جريء للأكواب المختلفة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 28 },
  { id: 'grape-hookah', nameEn: 'Grape Hookah', nameAr: 'شيشة عنب', type: 'standard', price: 50, group: 'special', descriptionEn: 'Sweet aromatic grape for a custom signature mood.', descriptionAr: 'عنب عطري حلو لطابع خاص ومميز.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 29 },
  { id: 'hot-cider', nameEn: 'Hot Cider', nameAr: 'هوت سيدر', type: 'standard', price: 50, group: 'special', descriptionEn: 'Spiced apple warmth for cozy seasonal cups.', descriptionAr: 'دفء تفاح متبل لأكواب موسمية دافئة.', bases: ALL_CUSTOMIZE_FLAVOR_BASES, sortOrder: 30 },
]

const DEFAULT_CUSTOM_BLEND_BEAN_ROWS: CoffeeBeanOption[] = [
  {
    id: 'indian-arabica',
    nameAr: 'هندي',
    nameEn: 'India',
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
    nameEn: 'Brazil',
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
    nameEn: 'Colombia',
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
    nameEn: 'Ethiopia',
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
    nameEn: 'India Plantation',
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
    nameEn: 'Yemen',
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
    nameEn: 'Peru',
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
    nameEn: 'Costa Rica',
    descAr: 'متوازن وحيوي بوضوح عطري ناعم.',
    descEn: 'Balanced and lively with refined aromatics.',
    family: 'arabica',
    origin: 'Costa Rica',
    price: 835,
    isVisible: true,
  },
  {
    id: 'uganda',
    nameAr: 'أوغندا',
    nameEn: 'Uganda',
    descAr: 'كاكاو داكن وقوام واضح مع لمسة فاكهية هادئة.',
    descEn: 'Dark cocoa, structured body, and a quiet fruit finish.',
    family: 'arabica',
    origin: 'Uganda',
    price: 620,
    isVisible: true,
  },
  {
    id: 'nicaragua',
    nameAr: 'نيكاراجوا',
    nameEn: 'Nicaragua',
    descAr: 'سكر بني ومكسرات ناعمة مع حموضة متوازنة.',
    descEn: 'Brown sugar and soft nuts with balanced acidity.',
    family: 'arabica',
    origin: 'Nicaragua',
    price: 690,
    isVisible: true,
  },
  {
    id: 'tanzanian-arabica',
    nameAr: 'تنزاني أرابيكا',
    nameEn: 'Tanzanian Arabica',
    descAr: 'منشأ أرابيكا خفيف وحيوي بطابع فاكهي ناعم.',
    descEn: 'Lively arabica with soft fruit character and a clean cup.',
    family: 'arabica',
    origin: 'Tanzania',
    price: 435,
    isVisible: true,
  },
  {
    id: 'kenyan-arabica',
    nameAr: 'كيني أرابيكا',
    nameEn: 'Kenyan Arabica',
    descAr: 'أرابيكا واضح وحمضي بلمسة فاكهية مشرقة.',
    descEn: 'Bright arabica with clear acidity and lifted fruit notes.',
    family: 'arabica',
    origin: 'Kenya',
    price: 420,
    isVisible: true,
  },
  {
    id: 'indian-washed-arabica',
    nameAr: 'هندي مغسول أرابيكا',
    nameEn: 'Indian Washed Arabica',
    descAr: 'نظيف وناعم بمرارة منخفضة ولمسة مكسرات.',
    descEn: 'Clean and smooth with low bitterness and soft nut notes.',
    family: 'arabica',
    origin: 'India',
    price: 615,
    isVisible: true,
  },
  {
    id: 'brazil-17-18',
    nameAr: 'برازيل 17-18',
    nameEn: 'Brazil 17-18',
    descAr: 'شوكولاتة خفيفة وقوام متوازن لكوب يومي ناعم.',
    descEn: 'Light chocolate and balanced body for a smooth daily cup.',
    family: 'arabica',
    origin: 'Brazil',
    price: 460,
    isVisible: true,
  },
  {
    id: 'ethiopian-lekempti',
    nameAr: 'إثيوبي ليكمبتي',
    nameEn: 'Ethiopian Lekempti',
    descAr: 'زهري وفاكهي بخفة واضحة ونهاية نظيفة.',
    descEn: 'Floral and fruity with clear brightness and a clean finish.',
    family: 'arabica',
    origin: 'Ethiopia',
    price: 470,
    isVisible: true,
  },
  {
    id: 'santos-fine-cup',
    nameAr: 'سانتوس فاين كب',
    nameEn: 'Santos Fine Cup',
    descAr: 'برازيلي ناعم بطابع شوكولاتة ومكسرات هادئة.',
    descEn: 'Smooth Brazilian profile with chocolate and gentle nuts.',
    family: 'arabica',
    origin: 'Brazil',
    price: 600,
    isVisible: true,
  },
  {
    id: 'colombian-18',
    nameAr: 'كولومبي 18',
    nameEn: 'Colombian 18',
    descAr: 'قوام أنيق وحلاوة كراميل مع وضوح فاكهي.',
    descEn: 'Elegant body, caramel sweetness, and clear fruit character.',
    family: 'arabica',
    origin: 'Colombia',
    price: 670,
    isVisible: true,
  },
  {
    id: 'indonesian',
    nameAr: 'إندونيسي',
    nameEn: 'Indonesia',
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
    nameEn: 'Indonesia XL',
    descAr: 'قوة أعلى وحضور واضح في الكوب.',
    descEn: 'Extra bold with a stronger cup presence.',
    family: 'robusta',
    origin: 'Indonesia',
    price: 346,
    isVisible: true,
  },
  {
    id: 'indian-robusta',
    nameAr: 'هندي روبوستا',
    nameEn: 'India Robusta',
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
    nameEn: 'Vietnam',
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
    nameEn: 'Vietnam Washed',
    descAr: 'قوة الروبوستا مع نظافة أعلى في الطعم.',
    descEn: 'Robusta strength with a cleaner washed profile.',
    family: 'robusta',
    origin: 'Vietnam',
    price: 376,
    isVisible: true,
  },
  {
    id: 'indonesian-large',
    nameAr: 'إندونيسي لارج',
    nameEn: 'Indonesian Large',
    descAr: 'روبوستا قوي بقوام عريض وحضور واضح.',
    descEn: 'Strong robusta with broad body and a clear cup presence.',
    family: 'robusta',
    origin: 'Indonesia',
    price: 325,
    isVisible: true,
  },
  {
    id: 'indonesian-medium',
    nameAr: 'إندونيسي ميديم',
    nameEn: 'Indonesian Medium',
    descAr: 'روبوستا متوازن لقوام ثابت وكريمة جيدة.',
    descEn: 'Balanced robusta for steady body and good crema.',
    family: 'robusta',
    origin: 'Indonesia',
    price: 315,
    isVisible: true,
  },
  {
    id: 'ugandan-18',
    nameAr: 'أوغندي 18',
    nameEn: 'Ugandan 18',
    descAr: 'قوي ونظيف بطابع كاكاو داكن.',
    descEn: 'Strong and clean with a dark cocoa profile.',
    family: 'robusta',
    origin: 'Uganda',
    price: 340,
    isVisible: true,
  },
  {
    id: 'indian-robusta-aa',
    nameAr: 'هندي روبوستا AA',
    nameEn: 'Indian Robusta AA',
    descAr: 'روبوستا هندي قوي بكريمة واضحة ومرارة متوازنة.',
    descEn: 'Bold Indian robusta with clear crema and balanced bitterness.',
    family: 'robusta',
    origin: 'India',
    price: 350,
    isVisible: true,
  },
  {
    id: 'vietnamese-clean',
    nameAr: 'فيتنامي كلين',
    nameEn: 'Vietnamese Clean',
    descAr: 'قوة فيتنامية بنهاية أنظف وأكثر هدوءًا.',
    descEn: 'Vietnamese strength with a cleaner, calmer finish.',
    family: 'robusta',
    origin: 'Vietnam',
    price: 320,
    isVisible: true,
  },
]

export const DEFAULT_CUSTOM_BLEND_BEANS: CoffeeBeanOption[] =
  DEFAULT_CUSTOM_BLEND_BEAN_ROWS.map(applyOfficialBeanSalePrice)

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

function toScaleNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.min(5, number) : undefined
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : undefined
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

      return applyOfficialBeanSalePrice({
        id,
        nameAr,
        nameEn,
        descAr: String(item.descAr || '').trim(),
        descEn: String(item.descEn || '').trim(),
        family: normalizeFamily(item.family),
        origin: item.origin ? String(item.origin).trim() : undefined,
        price: toPositiveNumber(item.price),
        roastEn: item.roastEn ? String(item.roastEn).trim() : undefined,
        roastAr: item.roastAr ? String(item.roastAr).trim() : undefined,
        storyEn: item.storyEn ? String(item.storyEn).trim() : undefined,
        storyAr: item.storyAr ? String(item.storyAr).trim() : undefined,
        tastingNotesEn: toStringArray(item.tastingNotesEn),
        tastingNotesAr: toStringArray(item.tastingNotesAr),
        bitterness: toScaleNumber(item.bitterness),
        body: toScaleNumber(item.body),
        acidity: toScaleNumber(item.acidity),
        crema: toScaleNumber(item.crema),
        strength: toScaleNumber(item.strength),
        isVisible: item.isVisible !== false,
        stockQuantity: toPositiveNumber(item.stockQuantity, 100),
        lowStockThreshold: toPositiveNumber(item.lowStockThreshold, 10),
        isManuallyOutOfStock: item.isManuallyOutOfStock === true,
      })
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
  _valveBag = false,
) {
  return roundCleanPrice(calculateBlendRawCost(beans, mode) * sizeToKg(size))
}

export function calculateFlavorRawCost(basePrice: number, additions: Array<{ price: number }>) {
  return basePrice + additions.reduce((sum, addition) => sum + addition.price, 0)
}

export function calculateFlavorPrice(
  basePrice: number,
  additions: Array<{ price: number }>,
  size: PackageSize,
  _valveBag = false,
) {
  return roundCleanPrice(calculateFlavorRawCost(basePrice, additions) * sizeToKg(size))
}
