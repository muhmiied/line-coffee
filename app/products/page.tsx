'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PackageSearch, Sparkles, ChevronRight, Check, X, ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

// ─── Categories ────────────────────────────────────────────────────────────────
const categories = [
  { slug: 'all',              nameEn: 'All Products',       nameAr: 'جميع المنتجات' },
  { slug: 'turkish-coffee',   nameEn: 'Turkish Coffee',     nameAr: 'قهوة تركي' },
  { slug: 'espresso',         nameEn: 'Espresso',           nameAr: 'إسبريسو' },
  { slug: 'customize-blend',  nameEn: 'Customize Blend',    nameAr: 'كستمايز التوليفة', isCustomizeBlend: true },
  { slug: 'flavored-coffee',  nameEn: 'Flavored Coffee',    nameAr: 'قهوة نكهات' },
  { slug: 'coffee-mix',       nameEn: 'Coffee Mix',         nameAr: 'كوفي ميكس', hasMixTabs: true },
  { slug: 'customize-flavor', nameEn: 'Customize Flavor',   nameAr: 'كستمايز الفلافور', isCustomizeFlavor: true },
]

// ─── Flavors ────────────────────────────────────────────────────────────────────
// 19 flavors for flavored-coffee
const coffeeFlavors = [
  { id: 'hazelnut',   nameEn: 'Hazelnut',     nameAr: 'بندق' },
  { id: 'caramel',    nameEn: 'Caramel',      nameAr: 'كراميل' },
  { id: 'vanilla',    nameEn: 'Vanilla',      nameAr: 'فانيليا' },
  { id: 'chocolate',  nameEn: 'Chocolate',    nameAr: 'شوكولاتة' },
  { id: 'lotus',      nameEn: 'Lotus',        nameAr: 'لوتس' },
  { id: 'oreo',       nameEn: 'Oreo',         nameAr: 'أوريو' },
  { id: 'strawberry', nameEn: 'Strawberry',   nameAr: 'فراولة' },
  { id: 'mocha',      nameEn: 'Mocha',        nameAr: 'موكا' },
  { id: 'nutella',    nameEn: 'Nutella',      nameAr: 'نوتيلا' },
  { id: 'cinnabon',   nameEn: 'Cinnabon',     nameAr: 'سينابون' },
  { id: 'coconut',    nameEn: 'Coconut',      nameAr: 'جوز الهند' },
  { id: 'banana',     nameEn: 'Banana',       nameAr: 'موز' },
  { id: 'mango',      nameEn: 'Mango',        nameAr: 'مانجو' },
  { id: 'peach',      nameEn: 'Peach',        nameAr: 'خوخ' },
  { id: 'blueberry',  nameEn: 'Blueberry',    nameAr: 'توت' },
  { id: 'cherry',     nameEn: 'Cherry',       nameAr: 'كرز' },
  { id: 'apple',      nameEn: 'Apple',        nameAr: 'تفاح' },
  { id: 'grape',      nameEn: 'Grape',        nameAr: 'عنب' },
  { id: 'orange',     nameEn: 'Orange',       nameAr: 'برتقال' },
]

// 11 flavors for coffee-mix / cappuccino / hot-chocolate
const mixFlavors = [
  { id: 'hazelnut',   nameEn: 'Hazelnut',   nameAr: 'بندق' },
  { id: 'caramel',    nameEn: 'Caramel',    nameAr: 'كراميل' },
  { id: 'vanilla',    nameEn: 'Vanilla',    nameAr: 'فانيليا' },
  { id: 'chocolate',  nameEn: 'Chocolate',  nameAr: 'شوكولاتة' },
  { id: 'lotus',      nameEn: 'Lotus',      nameAr: 'لوتس' },
  { id: 'oreo',       nameEn: 'Oreo',       nameAr: 'أوريو' },
  { id: 'strawberry', nameEn: 'Strawberry', nameAr: 'فراولة' },
  { id: 'mocha',      nameEn: 'Mocha',      nameAr: 'موكا' },
  { id: 'nutella',    nameEn: 'Nutella',    nameAr: 'نوتيلا' },
  { id: 'cinnabon',   nameEn: 'Cinnabon',   nameAr: 'سينابون' },
  { id: 'coconut',    nameEn: 'Coconut',    nameAr: 'جوز الهند' },
]

// Customize-flavor flavor list (30 options)
const customFlavorOptions = [
  { id: 'hazelnut',     nameAr: 'بندق' },
  { id: 'hazelnut-p',   nameAr: 'بندق قطع' },
  { id: 'almond',       nameAr: 'لوز' },
  { id: 'pistachio',    nameAr: 'فستق' },
  { id: 'chocolate',    nameAr: 'شوكولاتة' },
  { id: 'choc-chips',   nameAr: 'شوكولاتة قطع' },
  { id: 'nutella',      nameAr: 'نوتيلا' },
  { id: 'oreo',         nameAr: 'أوريو' },
  { id: 'lotus',        nameAr: 'لوتس' },
  { id: 'cinnabon',     nameAr: 'سينابون' },
  { id: 'coconut',      nameAr: 'جوز الهند' },
  { id: 'vanilla',      nameAr: 'فانيليا' },
  { id: 'caramel',      nameAr: 'كراميل' },
  { id: 'strawberry',   nameAr: 'فراولة' },
  { id: 'banana',       nameAr: 'موز' },
  { id: 'mango',        nameAr: 'مانجو' },
  { id: 'peach',        nameAr: 'خوخ' },
  { id: 'blueberry',    nameAr: 'توت' },
  { id: 'blackberry',   nameAr: 'توت أزرق' },
  { id: 'cherry',       nameAr: 'كرز' },
  { id: 'apple',        nameAr: 'تفاح' },
  { id: 'grape',        nameAr: 'عنب' },
  { id: 'watermelon',   nameAr: 'بطيخ' },
  { id: 'guava',        nameAr: 'جوافة' },
  { id: 'pineapple',    nameAr: 'أناناس' },
  { id: 'orange',       nameAr: 'برتقال' },
  { id: 'mocha',        nameAr: 'موكا' },
  { id: 'apple-shisha', nameAr: 'شيشة تفاح' },
  { id: 'grape-shisha', nameAr: 'شيشة عنب' },
  { id: 'hot-cider',    nameAr: 'هوت سيدر' },
]

// ─── Bean Catalog ──────────────────────────────────────────────────────────────
const beanCatalog = {
  arabica: [
    { id: 'brazilian',    nameAr: 'برازيلي',              nameEn: 'Brazilian',        descAr: 'ناعم وحلو، شوكولاتة خفيفة، مرارة منخفضة' },
    { id: 'colombian',    nameAr: 'كولومبي',              nameEn: 'Colombian',        descAr: 'متوازن، كراميل وفاكهة خفيفة، مناسب لأغلب الأذواق' },
    { id: 'ethiopian',    nameAr: 'حبشي (إثيوبي)',        nameEn: 'Ethiopian',        descAr: 'فلورال وفاكهي، حموضة خفيفة، specialty coffee' },
    { id: 'guatemalan',   nameAr: 'جواتيمالا',            nameEn: 'Guatemalan',       descAr: 'شوكولاتة داكنة، جسم متوسط، مميز' },
    { id: 'yemeni',       nameAr: 'يمني',                 nameEn: 'Yemeni',           descAr: 'تراثي وعطري، نكهة فريدة' },
    { id: 'peruvian',     nameAr: 'بيرو',                 nameEn: 'Peruvian',         descAr: 'ناعم ونظيف، حموضة خفيفة' },
    { id: 'costa-rican',  nameAr: 'كوستاريكا',            nameEn: 'Costa Rican',      descAr: 'فاكهي ومشرق، حموضة حيوية' },
    { id: 'mexican',      nameAr: 'ميكسيكي',              nameEn: 'Mexican',          descAr: 'خفيف وناعم، مناسب للشرب اليومي' },
  ],
  robusta: [
    { id: 'indonesian',   nameAr: 'إندونيسي',             nameEn: 'Indonesian',       descAr: 'قوي وثقيل، كافيين عالي' },
    { id: 'indonesian-xl',nameAr: 'إندونيسي XL',          nameEn: 'Indonesian XL',    descAr: 'الأقوى، جسم كامل جداً' },
    { id: 'indian',       nameAr: 'هندي',                 nameEn: 'Indian',           descAr: 'متوازن وقوي، مناسب كـ base' },
    { id: 'indian-p',     nameAr: 'هندي بلانتيشن',        nameEn: 'Indian Plantation', descAr: 'ناعم نسبياً مقارنة بباقي الروبوستا' },
    { id: 'vietnamese',   nameAr: 'فيتنامي',              nameEn: 'Vietnamese',       descAr: 'الأقوى، مرارة عالية، كريمة ممتازة' },
  ],
}

// ─── Preset blends ─────────────────────────────────────────────────────────────
const presetBlends = {
  'turkish-base': [
    { id: 'tc-morning',  nameAr: 'قوة الصباح',         nameEn: 'Morning Strength',    price250: 125, price500: 240, price1000: 460, tierAr: 'اقتصادي', compositionAr: 'إندونيسي 40% + برازيلي 35% + فيتنامي 25%', descAr: 'روبوستا قوي مع حلاوة خفيفة، كافيين عالي، مناسب لبداية يومك' },
    { id: 'tc-balance',  nameAr: 'التوازن المثالي',    nameEn: 'Perfect Balance',     price250: 170, price500: 320, price1000: 600, tierAr: 'وسط',     compositionAr: 'كولومبي 25% + حبشي 25% + إندونيسي 50%',           descAr: 'فلورال خفيف مع ثقل الروبوستا، مناسب للفنادق والكافيهات' },
    { id: 'tc-clean',    nameAr: 'النظافة المحترفة',   nameEn: 'Professional Clean',  price250: 200, price500: 380, price1000: 720, tierAr: 'وسط+',    compositionAr: 'برازيلي 40% + هندي بلانتيشن 25% + إندونيسي 20% + فيتنامي 15%', descAr: 'أرابيكا 65% نظيف ومتسق، شوكولاتة واضحة' },
    { id: 'tc-premium',  nameAr: 'البريميوم',          nameEn: 'Premium',             price250: 230, price500: 440, price1000: 840, tierAr: 'بريميوم',  compositionAr: 'حبشي 45% + كولومبي 30% + هندي بلانتيشن 15% + إندونيسي 10%',   descAr: 'أرابيكا 90%، specialty coffee حقيقية، فلورال وفاكهي' },
  ],
  'espresso-base': [
    { id: 'esp-crema',   nameAr: 'الكريمة الاقتصادية', nameEn: 'Economy Crema',       price250: 135, price500: 260, price1000: 500, tierAr: 'اقتصادي', compositionAr: 'فيتنامي 45% + برازيلي 35% + إندونيسي 20%',                    descAr: 'كريمة ممتازة وقوة عالية، للكميات الكبيرة والماكينات المكتبية' },
    { id: 'esp-italian', nameAr: 'الكلاسيك الإيطالي',  nameEn: 'Classic Italian',     price250: 200, price500: 380, price1000: 720, tierAr: 'وسط',     compositionAr: 'برازيلي 35% + فيتنامي 30% + هندي بلانتيشن 20% + إندونيسي 15%', descAr: 'شوكولاتة وكراميل، كريمة غنية، للكابتشينو واللاتيه' },
    { id: 'esp-floral',  nameAr: 'الفلورال الـ Specialty', nameEn: 'Specialty Floral', price250: 210, price500: 400, price1000: 760, tierAr: 'وسط+',    compositionAr: 'حبشي 50% + جواتيمالا 25% + برازيلي 25%',                       descAr: 'فلورال وفاكهي، للشوت المباشر' },
    { id: 'esp-vip',     nameAr: 'بريميوم VIP',        nameEn: 'Premium VIP',         price250: 255, price500: 490, price1000: 940, tierAr: 'بريميوم',  compositionAr: 'كولومبي 40% + حبشي 30% + هندي بلانتيشن 20% + إندونيسي 10%',   descAr: 'أرابيكا 90%، للفنادق 5 نجوم' },
  ],
}

// ─── Helper to build a Product object ─────────────────────────────────────────
function mkProduct(
  id: string,
  slug: string,
  nameEn: string,
  nameAr: string,
  descEn: string,
  descAr: string,
  catId: string,
  prices: [number, number, number],
  opts: Partial<Product> = {}
): Product {
  return {
    id,
    slug,
    name_en: nameEn,
    name_ar: nameAr,
    description_en: descEn,
    description_ar: descAr,
    category_id: catId,
    images: opts.images ?? ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'],
    origin: opts.origin ?? 'Egypt',
    roast_level: opts.roast_level ?? 'medium',
    flavor_notes: opts.flavor_notes ?? [],
    is_featured: opts.is_featured ?? false,
    is_best_seller: opts.is_best_seller ?? false,
    is_new: opts.is_new ?? false,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: `${id}-250`, product_id: id, size: '250g', price: prices[0], compare_at_price: null, sku: null, is_available: true },
      { id: `${id}-500`, product_id: id, size: '500g', price: prices[1], compare_at_price: null, sku: null, is_available: true },
      { id: `${id}-1kg`, product_id: id, size: '1kg',  price: prices[2], compare_at_price: null, sku: null, is_available: true },
    ],
  }
}

// ─── All Products ──────────────────────────────────────────────────────────────
const IMG_TC   = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'
const IMG_ESP  = 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800'
const IMG_FC   = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800'
const IMG_CAP  = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800'
const IMG_CM   = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800'
const IMG_HC   = 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800'

const allProducts: Product[] = [
  // Turkish Coffee – 4 blends
  mkProduct('tc-1','turkish-morning-strength','Morning Strength','قوة الصباح',
    'Strong robusta with light sweetness, high caffeine',
    'روبوستا قوي مع حلاوة خفيفة — كافيين عالي، مناسب لبداية يومك',
    'turkish-coffee',[125,240,460],{ images:[IMG_TC], is_featured:true, is_best_seller:true, flavor_notes:['Robusta','Strong'] }),
  mkProduct('tc-2','turkish-perfect-balance','Perfect Balance','التوازن المثالي',
    'Light floral notes with robusta body, great for hotels',
    'فلورال خفيف مع ثقل الروبوستا — مناسب للفنادق والكافيهات',
    'turkish-coffee',[170,320,600],{ images:[IMG_TC], is_featured:true, flavor_notes:['Floral','Balanced'] }),
  mkProduct('tc-3','turkish-professional-clean','Professional Clean Cup','النظافة المحترفة',
    '65% arabica clean and consistent, clear chocolate notes',
    'أرابيكا 65% نظيف ومتسق — شوكولاتة واضحة',
    'turkish-coffee',[200,380,720],{ images:[IMG_TC], flavor_notes:['Chocolate','Arabica'] }),
  mkProduct('tc-4','turkish-premium','Turkish Premium','البريميوم',
    '90% arabica, true specialty floral-fruity profile',
    'أرابيكا 90% — specialty coffee حقيقية، فلورال وفاكهي',
    'turkish-coffee',[230,440,840],{ images:[IMG_TC], is_new:true, flavor_notes:['Specialty','Floral'] }),

  // Espresso – 4 blends
  mkProduct('esp-1','espresso-economy-crema','Economy Crema','الكريمة الاقتصادية',
    'Excellent crema and high strength, ideal for large volumes',
    'كريمة ممتازة وقوة عالية — للكميات الكبيرة والماكينات المكتبية',
    'espresso',[135,260,500],{ images:[IMG_ESP], is_best_seller:true, flavor_notes:['Crema','Strong'] }),
  mkProduct('esp-2','espresso-classic-italian','Classic Italian','الكلاسيك الإيطالي',
    'Chocolate and caramel with rich crema, best for cappuccino & latte',
    'شوكولاتة وكراميل، كريمة غنية — للكابتشينو واللاتيه',
    'espresso',[200,380,720],{ images:[IMG_ESP], is_featured:true, flavor_notes:['Chocolate','Caramel'] }),
  mkProduct('esp-3','espresso-specialty-floral','Specialty Floral','الفلورال الـ Specialty',
    'Floral and fruity, best for direct espresso shots',
    'فلورال وفاكهي — للشوت المباشر',
    'espresso',[210,400,760],{ images:[IMG_ESP], is_new:true, flavor_notes:['Floral','Fruity'] }),
  mkProduct('esp-4','espresso-premium-vip','Premium VIP','بريميوم VIP',
    '90% arabica, golden crema, for 5-star hotels',
    'أرابيكا 90%، كريمة ذهبية — للفنادق 5 نجوم',
    'espresso',[255,490,940],{ images:[IMG_ESP], flavor_notes:['Premium','Arabica'] }),

  // Flavored Coffee – 19 flavors
  ...coffeeFlavors.map((f, i) => mkProduct(
    `fc-${f.id}`, `flavored-coffee-${f.id}`,
    `${f.nameEn} Coffee`, `قهوة ${f.nameAr}`,
    `${f.nameEn.toLowerCase()} flavored coffee`, `قهوة بنكهة ${f.nameAr}`,
    'flavored-coffee', [100, 190, 360],
    { images:[IMG_FC], is_featured: i < 3, is_best_seller: i < 5, flavor_notes:[f.nameEn] }
  )),

  // Coffee Mix – original + 11 flavors
  mkProduct('cm-original','coffee-mix-original','Coffee Mix Original','كوفي ميكس أوريجنال',
    'Classic 3-in-1 coffee mix','كوفي ميكس كلاسيك 3 في 1',
    'coffee-mix',[55,100,180],{ images:[IMG_CM], subcategory:'coffee-mix', is_featured:true, is_best_seller:true } as any),
  ...mixFlavors.map((f, i) => mkProduct(
    `cm-${f.id}`, `coffee-mix-${f.id}`,
    `${f.nameEn} Coffee Mix`, `كوفي ميكس ${f.nameAr}`,
    `${f.nameEn.toLowerCase()} coffee mix`, `كوفي ميكس ${f.nameAr}`,
    'coffee-mix', [65, 120, 220],
    { images:[IMG_CM], subcategory:'coffee-mix', is_featured: i < 2, flavor_notes:[f.nameEn] } as any
  )),

  // Cappuccino – original + 11 flavors
  mkProduct('cap-original','cappuccino-original','Cappuccino Original','كابتشينو أوريجنال',
    'Classic creamy cappuccino','كابتشينو كلاسيك كريمي',
    'coffee-mix',[65,120,220],{ images:[IMG_CAP], subcategory:'cappuccino', is_featured:true, is_best_seller:true } as any),
  ...mixFlavors.map((f, i) => mkProduct(
    `cap-${f.id}`, `cappuccino-${f.id}`,
    `${f.nameEn} Cappuccino`, `كابتشينو ${f.nameAr}`,
    `${f.nameEn.toLowerCase()} cappuccino`, `كابتشينو ${f.nameAr}`,
    'coffee-mix', [75, 140, 260],
    { images:[IMG_CAP], subcategory:'cappuccino', is_featured: i < 2, flavor_notes:[f.nameEn] } as any
  )),

  // Hot Chocolate – original + 11 flavors
  mkProduct('hc-original','hot-chocolate-original','Hot Chocolate Original','هوت شوكلت أوريجنال',
    'Rich and creamy hot chocolate','هوت شوكلت غني وكريمي',
    'coffee-mix',[60,110,200],{ images:[IMG_HC], subcategory:'hot-chocolate', is_featured:true, is_best_seller:true } as any),
  ...mixFlavors.map((f, i) => mkProduct(
    `hc-${f.id}`, `hot-chocolate-${f.id}`,
    `${f.nameEn} Hot Chocolate`, `هوت شوكلت ${f.nameAr}`,
    `${f.nameEn.toLowerCase()} hot chocolate`, `هوت شوكلت ${f.nameAr}`,
    'coffee-mix', [70, 130, 240],
    { images:[IMG_HC], subcategory:'hot-chocolate', is_featured: i < 2, flavor_notes:[f.nameEn] } as any
  )),
]

// ─── Flavor base options for customize-flavor ──────────────────────────────────
const flavorBaseOptions = [
  { id: 'coffee-mix',     nameEn: 'Coffee Mix',     nameAr: 'كوفي ميكس',    price250: 55,  price500: 100, price1000: 180 },
  { id: 'cappuccino',     nameEn: 'Cappuccino',     nameAr: 'كابتشينو',     price250: 65,  price500: 120, price1000: 220 },
  { id: 'hot-chocolate',  nameEn: 'Hot Chocolate',  nameAr: 'هوت شوكلت',   price250: 60,  price500: 110, price1000: 200 },
]

// ─── Customize Blend Component ─────────────────────────────────────────────────
function CustomizeBlend() {
  const { t, language } = useLanguage()
  const { addItem } = useCartStore()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [baseId, setBaseId] = useState<'turkish-base' | 'espresso-base' | null>(null)
  const [wantCustom, setWantCustom] = useState<boolean | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [selectedBeans, setSelectedBeans] = useState<Array<{ id: string; nameAr: string; nameEn: string; percent: string }>>([])
  const [selectedSize, setSelectedSize] = useState<'250g' | '500g' | '1kg'>('250g')

  const blendBases = [
    { id: 'turkish-base'  as const, nameAr: 'تركي', nameEn: 'Turkish Coffee', descAr: 'قاعدة تركي تقليدية بقوام قوي ورائحة واضحة', price250: 125 },
    { id: 'espresso-base' as const, nameAr: 'إسبريسو', nameEn: 'Espresso', descAr: 'قاعدة مناسبة لماكينات الإسبريسو مع كريمة ممتازة', price250: 135 },
  ]

  const availablePresets = baseId ? presetBlends[baseId] : []
  const selectedPreset = availablePresets.find((p) => p.id === selectedPresetId) ?? null

  const getPrice = () => {
    if (!baseId) return 0
    if (selectedPreset) {
      return selectedSize === '250g' ? selectedPreset.price250 : selectedSize === '500g' ? selectedPreset.price500 : selectedPreset.price1000
    }
    const basePrices = { 'turkish-base': [125, 240, 460], 'espresso-base': [135, 260, 500] }
    const idx = selectedSize === '250g' ? 0 : selectedSize === '500g' ? 1 : 2
    return basePrices[baseId][idx]
  }

  const toggleBean = (bean: { id: string; nameAr: string; nameEn: string }) => {
    const exists = selectedBeans.find((b) => b.id === bean.id)
    if (exists) { setSelectedBeans(selectedBeans.filter((b) => b.id !== bean.id)); return }
    if (selectedBeans.length >= 4) return
    setSelectedBeans([...selectedBeans, { ...bean, percent: '' }])
    setSelectedPresetId(null)
  }

  const updateBeanPercent = (id: string, val: string) =>
    setSelectedBeans((prev) => prev.map((b) => (b.id === id ? { ...b, percent: val } : b)))

  const handleAdd = () => {
    if (!baseId) return
    if (wantCustom && selectedBeans.length === 0) return
    if (!wantCustom && !selectedPreset) return

    const percents = selectedBeans.map((b) => Number(b.percent || 0)).filter((v) => v > 0)
    if (wantCustom && percents.length > 0 && percents.reduce((a, b) => a + b, 0) !== 100) {
      toast.error('يجب أن يكون مجموع النسب 100%')
      return
    }

    const baseName = language === 'ar' ? blendBases.find((b) => b.id === baseId)!.nameAr : blendBases.find((b) => b.id === baseId)!.nameEn
    const blendPart = selectedPreset
      ? (language === 'ar' ? selectedPreset.nameAr : selectedPreset.nameEn)
      : selectedBeans.map((b) => `${language === 'ar' ? b.nameAr : b.nameEn}${b.percent ? ` ${b.percent}%` : ''}`).join(' + ')

    addItem({
      id: `blend-${baseId}-${selectedPresetId ?? selectedBeans.map((b) => b.id).join('-')}-${selectedSize}`,
      product_id: `blend-${baseId}`,
      name_en: `Custom ${baseName} - ${blendPart}`,
      name_ar: `${baseName} مخصص - ${blendPart}`,
      size: selectedSize,
      price: getPrice(),
      quantity: 1,
      image: IMG_TC,
    })
    toast.success(t('Added to cart!', 'تمت الإضافة للسلة!'))
    setStep(1); setBaseId(null); setWantCustom(null); setSelectedPresetId(null); setSelectedBeans([]); setSelectedSize('250g')
  }

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-bold">{t('Customize Your Blend', 'صمم خلطة البن')}</h2>
          <p className="text-sm text-muted-foreground">{t('Choose base and blend', 'اختر القاعدة والتوليفة')}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:20 }}>
            <h3 className="font-semibold mb-4">{t('Select base:', 'اختر القاعدة:')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {blendBases.map((b) => (
                <button key={b.id} onClick={() => { setBaseId(b.id); setStep(2) }}
                  className={cn('p-5 rounded-xl border-2 text-right transition-all hover:border-primary', baseId === b.id ? 'border-primary bg-primary/5' : 'border-border')}>
                  <h4 className="font-bold text-lg mb-1">{language === 'ar' ? b.nameAr : b.nameEn}</h4>
                  <p className="text-xs text-muted-foreground">{b.descAr}</p>
                  <p className="text-sm text-primary font-medium mt-2">{t(`From ${b.price250} EGP`, `من ${b.price250} ج.م`)}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-medium">{t('Do you want to specify ratios yourself?', 'تحدد النسب بنفسك؟')}</span>
              <Button variant="ghost" size="sm" onClick={() => { setStep(1); setWantCustom(null) }}>{t('Back','رجوع')}</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={() => { setWantCustom(false); setStep(3) }}
                className="p-5 rounded-xl border-2 border-border hover:border-primary transition-all text-right">
                <p className="font-bold mb-1">{t('No, show me ready blends', 'لأ، ورّيني التوليفات الجاهزة')}</p>
                <p className="text-xs text-muted-foreground">{t('Choose from our expert blends', 'اختر من توليفاتنا المجربة')}</p>
              </button>
              <button onClick={() => { setWantCustom(true); setStep(3) }}
                className="p-5 rounded-xl border-2 border-border hover:border-primary transition-all text-right">
                <p className="font-bold mb-1">{t('Yes, I\'ll choose beans & ratios', 'أيوه، أنا هاختار الحبوب والنسب')}</p>
                <p className="text-xs text-muted-foreground">{t('Full control over your blend', 'تحكم كامل في خلطتك')}</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                {selectedPreset && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                    {language === 'ar' ? selectedPreset.nameAr : selectedPreset.nameEn}
                    <button onClick={() => setSelectedPresetId(null)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedBeans.map((b) => (
                  <span key={b.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                    {language === 'ar' ? b.nameAr : b.nameEn}{b.percent ? ` ${b.percent}%` : ''}
                    <button onClick={() => toggleBean(b)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>{t('Back','رجوع')}</Button>
            </div>

            {!wantCustom ? (
              <div className="grid md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {availablePresets.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPresetId(p.id)}
                    className={cn('text-right p-4 rounded-lg border transition-all', selectedPresetId === p.id ? 'border-primary bg-primary/5' : 'border-border')}>
                    <p className="font-bold">{language === 'ar' ? p.nameAr : p.nameEn}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.tierAr}</p>
                    <p className="text-xs mt-1 text-muted-foreground">{p.compositionAr}</p>
                    <p className="text-xs mt-1 text-primary/80 italic">{p.descAr}</p>
                    <p className="text-sm font-semibold text-primary mt-2">{t(`From ${p.price250} EGP`, `من ${p.price250} ج.م`)}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                {Object.entries(beanCatalog).map(([family, beans]) => (
                  <div key={family}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">{family}</p>
                    <div className="space-y-2">
                      {beans.map((bean) => {
                        const sel = selectedBeans.find((b) => b.id === bean.id)
                        return (
                          <div key={bean.id} className="p-2 border border-border rounded-lg">
                            <div className="flex items-center justify-between gap-2">
                              <button onClick={() => { toggleBean(bean); setSelectedPresetId(null) }}
                                className={cn('text-right flex-1 px-2 py-1 rounded-md transition-all', sel ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80')}>
                                {language === 'ar' ? bean.nameAr : bean.nameEn}
                              </button>
                              {sel && (
                                <Input type="number" min={0} max={100} value={sel.percent}
                                  onChange={(e) => updateBeanPercent(bean.id, e.target.value)}
                                  placeholder="%" className="w-20 h-8" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{bean.descAr}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Size & price */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-3">{t('Size:', 'الحجم:')}</h4>
              <div className="flex gap-2 mb-6">
                {(['250g','500g','1kg'] as const).map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', selectedSize === s ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80')}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('Total Price', 'السعر')}</p>
                  <p className="text-2xl font-bold text-primary">{getPrice()} {t('EGP','ج.م')}</p>
                </div>
                <Button size="lg" onClick={handleAdd}
                  disabled={!baseId || (wantCustom ? selectedBeans.length === 0 : !selectedPreset)}
                  className="gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {t('Add to Cart','أضف للسلة')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Customize Flavor Component ────────────────────────────────────────────────
function CustomizeFlavor() {
  const { t, language } = useLanguage()
  const { addItem } = useCartStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedBase, setSelectedBase] = useState<typeof flavorBaseOptions[0] | null>(null)
  const [selectedFlavors, setSelectedFlavors] = useState<typeof customFlavorOptions>([])
  const [selectedSize, setSelectedSize] = useState<'250g' | '500g' | '1kg'>('250g')

  const toggleFlavor = (f: typeof customFlavorOptions[0]) => {
    if (selectedFlavors.find((x) => x.id === f.id)) {
      setSelectedFlavors(selectedFlavors.filter((x) => x.id !== f.id))
    } else if (selectedFlavors.length < 3) {
      setSelectedFlavors([...selectedFlavors, f])
    }
  }

  const getPrice = () => {
    if (!selectedBase) return 0
    const base = selectedSize === '250g' ? selectedBase.price250 : selectedSize === '500g' ? selectedBase.price500 : selectedBase.price1000
    const extra = selectedFlavors.length * (selectedSize === '250g' ? 10 : selectedSize === '500g' ? 18 : 30)
    return base + extra
  }

  const handleAdd = () => {
    if (!selectedBase || selectedFlavors.length === 0) return
    const flavPart = selectedFlavors.map((f) => f.nameAr).join(' + ')
    addItem({
      id: `flavor-${selectedBase.id}-${selectedFlavors.map((f) => f.id).join('-')}-${selectedSize}`,
      product_id: `flavor-${selectedBase.id}`,
      name_en: `Custom ${selectedBase.nameEn} - ${flavPart}`,
      name_ar: `${selectedBase.nameAr} مخصص - ${flavPart}`,
      size: selectedSize,
      price: getPrice(),
      quantity: 1,
      image: IMG_CM,
    })
    toast.success(t('Added to cart!', 'تمت الإضافة للسلة!'))
    setStep(1); setSelectedBase(null); setSelectedFlavors([]); setSelectedSize('250g')
  }

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-bold">{t('Customize Your Flavor', 'صمم نكهتك')}</h2>
          <p className="text-sm text-muted-foreground">{t('Pick base then up to 3 flavors', 'اختر القاعدة ثم لغاية 3 نكهات')}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="f1" initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:20 }}>
            <h3 className="font-semibold mb-4">{t('Select base:', 'اختر القاعدة:')}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {flavorBaseOptions.map((b) => (
                <button key={b.id} onClick={() => { setSelectedBase(b); setStep(2) }}
                  className={cn('p-4 rounded-xl border-2 text-right transition-all hover:border-primary', selectedBase?.id === b.id ? 'border-primary bg-primary/5' : 'border-border')}>
                  <h4 className="font-bold">{language === 'ar' ? b.nameAr : b.nameEn}</h4>
                  <p className="text-sm text-primary font-medium mt-2">{t(`From ${b.price250} EGP`, `من ${b.price250} ج.م`)}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="f2" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">{t('Base:', 'القاعدة:')} <strong>{language === 'ar' ? selectedBase?.nameAr : selectedBase?.nameEn}</strong></span>
                {selectedFlavors.map((f) => (
                  <span key={f.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                    {f.nameAr}
                    <button onClick={() => toggleFlavor(f)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <span className="text-xs text-muted-foreground">({selectedFlavors.length}/3)</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>{t('Back','رجوع')}</Button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
              {customFlavorOptions.map((f) => {
                const isSel = selectedFlavors.find((x) => x.id === f.id)
                const isDisabled = !isSel && selectedFlavors.length >= 3
                return (
                  <button key={f.id} onClick={() => !isDisabled && toggleFlavor(f)} disabled={isDisabled}
                    className={cn('px-3 py-1.5 rounded-full text-sm transition-all',
                      isSel ? 'bg-primary text-primary-foreground' :
                      isDisabled ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' :
                      'bg-secondary hover:bg-secondary/80')}>
                    {isSel && <Check className="w-3 h-3 inline mr-1" />}
                    {f.nameAr}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex gap-2 mb-6">
                {(['250g','500g','1kg'] as const).map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', selectedSize === s ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80')}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('Total Price', 'السعر')}</p>
                  <p className="text-2xl font-bold text-primary">{getPrice()} {t('EGP','ج.م')}</p>
                </div>
                <Button size="lg" onClick={handleAdd} disabled={!selectedBase || selectedFlavors.length === 0} className="gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {t('Add to Cart','أضف للسلة')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Mix Sub-Tabs ───────────────────────────────────────────────────────────────
type MixTab = 'coffee-mix' | 'cappuccino' | 'hot-chocolate'
const mixTabs: { id: MixTab; labelEn: string; labelAr: string }[] = [
  { id: 'coffee-mix',     labelEn: 'Coffee Mix',    labelAr: 'كوفي ميكس' },
  { id: 'cappuccino',     labelEn: 'Cappuccino',    labelAr: 'كابتشينو' },
  { id: 'hot-chocolate',  labelEn: 'Hot Chocolate', labelAr: 'هوت شوكلت' },
]

// ─── Main Page ─────────────────────────────────────────────────────────────────
function ProductsPageInner() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [activeMixTab, setActiveMixTab] = useState<MixTab>('coffee-mix')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)
  const [dbProducts, setDbProducts] = useState<Product[] | null>(null)

  // Try to load products from database; fall back to hardcoded if DB is empty
  useEffect(() => {
    fetch('/api/products?limit=300')
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.length > 0) setDbProducts(d.data) })
      .catch(() => {})
  }, [])

  const currentCat = categories.find((c) => c.slug === activeCategory)
  const isCustomizeBlend = currentCat?.isCustomizeBlend
  const isCustomizeFlavor = currentCat?.isCustomizeFlavor
  const isCustomize = isCustomizeBlend || isCustomizeFlavor
  const hasMixTabs = currentCat?.hasMixTabs

  useEffect(() => {
    // Use database products when available, otherwise hardcoded
    const sourceProducts = dbProducts ?? allProducts

    if (isCustomize) { setFilteredProducts([]); return }
    let products = [...sourceProducts]

    if (activeCategory !== 'all') {
      products = products.filter((p) => {
        // Database products have a joined category object with slug
        const catSlug = (p as any).category?.slug ?? p.category_id
        return catSlug === activeCategory
      })
    }

    if (hasMixTabs) {
      products = products.filter((p) => (p as any).subcategory === activeMixTab)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      products = products.filter((p) => p.name_en.toLowerCase().includes(q) || p.name_ar.includes(searchQuery))
    }

    setFilteredProducts(products)
  }, [activeCategory, activeMixTab, searchQuery, isCustomize, hasMixTabs, dbProducts])

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    setActiveMixTab('coffee-mix')
    router.push(`/products?category=${slug}`, { scroll: false })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner — slides under the transparent header */}
      <div className="relative h-[45vh] min-h-[320px] flex items-center justify-center -mt-20 md:-mt-24 pt-20 md:pt-24 bg-[#1a0a00]">
        <Image src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600" alt="Our Products" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('Our Products', 'منتجاتنا')}
          </motion.h1>
          <motion.p initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {t('Discover our carefully curated selection of premium coffee.', 'اكتشف مجموعتنا المنتقاة من القهوة الفاخرة.')}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-28 bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-sm">
              <h2 className="font-serif text-lg font-semibold mb-4 px-2">{t('Categories', 'الفئات')}</h2>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button key={cat.slug} onClick={() => handleCategoryChange(cat.slug)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm flex items-center gap-2',
                      activeCategory === cat.slug ? 'bg-[#522500] text-white font-medium shadow-md scale-[1.02]' : 'text-foreground/80 hover:bg-secondary hover:text-foreground hover:scale-[1.01]',
                      (cat.isCustomizeBlend || cat.isCustomizeFlavor) && 'border-2 border-dashed border-primary/30'
                    )}>
                    {(cat.isCustomizeBlend || cat.isCustomizeFlavor) && <Sparkles className="w-4 h-4 shrink-0" />}
                    {t(cat.nameEn, cat.nameAr)}
                    {activeCategory === cat.slug && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            {isCustomizeBlend ? (
              <CustomizeBlend />
            ) : isCustomizeFlavor ? (
              <CustomizeFlavor />
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="text" placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50" />
                </div>

                {/* Mix sub-tabs */}
                {hasMixTabs && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {mixTabs.map((tab) => (
                      <button key={tab.id} onClick={() => setActiveMixTab(tab.id)}
                        className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0',
                          activeMixTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80')}>
                        {t(tab.labelEn, tab.labelAr)}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">{t(`Showing ${filteredProducts.length} products`, `عرض ${filteredProducts.length} منتج`)}</p>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <PackageSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="font-serif text-xl font-semibold mb-2">{t('No products found', 'لم يتم العثور على منتجات')}</h3>
                    <Button onClick={() => handleCategoryChange('all')}>{t('View All', 'عرض الكل')}</Button>
                  </div>
                ) : (
                  <motion.div initial="hidden" animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="h-10 w-56 bg-white/15 rounded-lg mx-auto" />
          </div>
        </div>
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  )
}
