'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PackageSearch, Sparkles, ChevronRight, Check, X, ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/products/product-card'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

// Categories
const categories = [
  { slug: 'all', nameEn: 'All Products', nameAr: 'جميع المنتجات' },
  { slug: 'turkish-coffee', nameEn: 'Turkish Coffee', nameAr: 'قهوة تركي' },
  { slug: 'espresso', nameEn: 'Espresso', nameAr: 'إسبريسو' },
  { slug: 'flavored-coffee', nameEn: 'Flavored Coffee', nameAr: 'قهوة نكهات' },
  { slug: 'cappuccino', nameEn: 'Cappuccino', nameAr: 'كابتشينو', hasSubcategories: true },
  { slug: 'coffee-mix', nameEn: 'Coffee Mix', nameAr: 'كوفي ميكس', hasSubcategories: true },
  { slug: 'hot-chocolate', nameEn: 'Hot Chocolate', nameAr: 'هوت شوكلت', hasSubcategories: true },
  { slug: 'customize', nameEn: 'Customize Your Product', nameAr: 'صمم منتجك', isCustomize: true },
]

// Flavor options for customization
const flavorOptions = {
  nuts: [
    { id: 'hazelnut', nameEn: 'Hazelnut', nameAr: 'بندق' },
    { id: 'crushed-hazelnut', nameEn: 'Crushed Hazelnut', nameAr: 'بندق قطع' },
    { id: 'almond', nameEn: 'Almond', nameAr: 'لوز' },
    { id: 'pistachio', nameEn: 'Pistachio', nameAr: 'فستق' },
  ],
  chocolate: [
    { id: 'chocolate', nameEn: 'Chocolate', nameAr: 'شيكولاتة' },
    { id: 'chocolate-chips', nameEn: 'Chocolate Chips', nameAr: 'قطع شيكولاتة' },
    { id: 'nutella', nameEn: 'Nutella', nameAr: 'نوتيلا' },
    { id: 'oreo', nameEn: 'Oreo', nameAr: 'أوريو' },
    { id: 'lotus', nameEn: 'Lotus', nameAr: 'لوتس' },
    { id: 'cinnamon', nameEn: 'Cinnamon', nameAr: 'سينابون' },
    { id: 'coconut', nameEn: 'Coconut', nameAr: 'جوز الهند' },
  ],
  creamy: [
    { id: 'vanilla', nameEn: 'Vanilla', nameAr: 'فانيليا' },
    { id: 'caramel', nameEn: 'Caramel', nameAr: 'كراميل' },
  ],
  fruits: [
    { id: 'strawberry', nameEn: 'Strawberry', nameAr: 'فراولة' },
    { id: 'banana', nameEn: 'Banana', nameAr: 'موز' },
    { id: 'mango', nameEn: 'Mango', nameAr: 'مانجو' },
    { id: 'peach', nameEn: 'Peach', nameAr: 'خوخ' },
    { id: 'blueberry', nameEn: 'Blueberry', nameAr: 'توت' },
    { id: 'blackberry', nameEn: 'Blackberry', nameAr: 'توت أزرق' },
    { id: 'cherry', nameEn: 'Cherry', nameAr: 'كرز' },
    { id: 'apple', nameEn: 'Apple', nameAr: 'تفاح' },
    { id: 'grape', nameEn: 'Grape', nameAr: 'عنب' },
    { id: 'watermelon', nameEn: 'Watermelon', nameAr: 'بطيخ' },
    { id: 'guava', nameEn: 'Guava', nameAr: 'جوافة' },
    { id: 'pineapple', nameEn: 'Pineapple', nameAr: 'أناناس' },
    { id: 'orange', nameEn: 'Orange', nameAr: 'برتقال' },
  ],
  special: [
    { id: 'mocha', nameEn: 'Mocha', nameAr: 'موكا' },
    { id: 'apple-shisha', nameEn: 'Apple Shisha', nameAr: 'شيشة تفاح' },
    { id: 'grape-shisha', nameEn: 'Grape Shisha', nameAr: 'شيشة عنب' },
    { id: 'hot-cider', nameEn: 'Hot Cider', nameAr: 'هوت سيدر' },
  ],
}

// Base options for customization
const baseOptions = [
  {
    id: 'cappuccino',
    nameEn: 'Cappuccino',
    nameAr: 'كابتشينو',
    descriptionEn: 'Creamy and balanced with a smooth texture.',
    descriptionAr: 'كريمي ومتوازن بطعم ناعم.',
    price250: 65,
    price500: 120,
    price1000: 220,
  },
  {
    id: 'coffee-mix',
    nameEn: 'Coffee Mix',
    nameAr: 'كوفي ميكس',
    descriptionEn: 'Easy daily blend with sweet profile.',
    descriptionAr: 'خلطة يومية سهلة بطابع حلو.',
    price250: 55,
    price500: 100,
    price1000: 180,
  },
  {
    id: 'hot-chocolate',
    nameEn: 'Hot Chocolate',
    nameAr: 'هوت شوكلت',
    descriptionEn: 'Rich chocolate drink with deep cocoa notes.',
    descriptionAr: 'مشروب شوكولاتة غني بنكهة كاكاو واضحة.',
    price250: 60,
    price500: 110,
    price1000: 200,
  },
  {
    id: 'turkish-base',
    nameEn: 'Turkish Coffee Base',
    nameAr: 'بن تركي',
    descriptionEn: 'Traditional dense cup with strong aroma for authentic Turkish brewing.',
    descriptionAr: 'قاعدة تركي تقليدية بقوام قوي ورائحة واضحة.',
    price250: 85,
    price500: 160,
    price1000: 303,
  },
  {
    id: 'espresso-base',
    nameEn: 'Espresso Base',
    nameAr: 'بن إسبريسو',
    descriptionEn: 'Optimized for espresso machines with crema-focused extraction.',
    descriptionAr: 'قاعدة مناسبة لماكينات الإسبريسو مع كريمة ممتازة.',
    price250: 90,
    price500: 170,
    price1000: 324,
  },
]

const beanCatalog = {
  arabica: [
    { id: 'brazilian', nameAr: 'برازيلي', nameEn: 'Brazilian', descriptionAr: 'ناعم وحلو، شوكولاتة خفيفة، مرارة منخفضة', descriptionEn: 'Smooth and sweet, light chocolate, low bitterness' },
    { id: 'colombian', nameAr: 'كولومبي', nameEn: 'Colombian', descriptionAr: 'متوازن، كراميل وفاكهة خفيفة، مناسب لأغلب الأذواق', descriptionEn: 'Balanced with caramel and light fruit notes' },
    { id: 'ethiopian', nameAr: 'حبشي (إثيوبي)', nameEn: 'Ethiopian', descriptionAr: 'فلورال وفاكهي، حموضة خفيفة، specialty coffee', descriptionEn: 'Floral and fruity with light acidity' },
    { id: 'guatemalan', nameAr: 'جواتيمالا', nameEn: 'Guatemalan', descriptionAr: 'شوكولاتة داكنة، جسم متوسط، مميز', descriptionEn: 'Dark chocolate and medium body' },
    { id: 'yemeni', nameAr: 'يمني', nameEn: 'Yemeni', descriptionAr: 'تراثي وعطري، مميز جداً، نكهة فريدة', descriptionEn: 'Heritage aromatic profile with unique notes' },
    { id: 'peruvian', nameAr: 'بيرو', nameEn: 'Peruvian', descriptionAr: 'ناعم ونظيف، حموضة خفيفة', descriptionEn: 'Clean and smooth with light acidity' },
    { id: 'costa-rican', nameAr: 'كوستاريكا', nameEn: 'Costa Rican', descriptionAr: 'فاكهي ومشرق، حموضة حيوية', descriptionEn: 'Fruity and bright with lively acidity' },
    { id: 'mexican', nameAr: 'ميكسيكي', nameEn: 'Mexican', descriptionAr: 'خفيف وناعم، مناسب للشرب اليومي', descriptionEn: 'Light smooth profile for daily drinking' },
  ],
  robusta: [
    { id: 'indonesian', nameAr: 'إندونيسي', nameEn: 'Indonesian', descriptionAr: 'قوي وثقيل، ترابي، كافيين عالي', descriptionEn: 'Strong, heavy body, earthy, high caffeine' },
    { id: 'indonesian-xl', nameAr: 'إندونيسي XL', nameEn: 'Indonesian XL', descriptionAr: 'أقوى من العادي، جسم كامل جداً', descriptionEn: 'Stronger than regular Indonesian with full body' },
    { id: 'indian', nameAr: 'هندي', nameEn: 'Indian', descriptionAr: 'متوازن وقوي، مناسب كـbase', descriptionEn: 'Balanced and strong, good base bean' },
    { id: 'indian-plantation', nameAr: 'هندي بلانتيشن', nameEn: 'Indian Plantation', descriptionAr: 'ناعم نسبياً مقارنة بباقي الروبوستا', descriptionEn: 'Relatively smoother robusta profile' },
    { id: 'vietnamese', nameAr: 'فيتنامي', nameEn: 'Vietnamese', descriptionAr: 'الأقوى، مرارة عالية، كريمة ممتازة في الإسبريسو', descriptionEn: 'Strongest profile, high bitterness, great crema' },
  ],
}

const presetBlends = {
  'turkish-base': [
    { id: 'turkish-strength', nameAr: 'قوة الصباح', nameEn: 'Morning Strength', tierAr: 'اقتصادي', tierEn: 'Economy', price250: 125, price500: 240, price1000: 460, descriptionAr: 'روبوستا قوي مع حلاوة خفيفة من البرازيلي — كافيين عالي، مناسب لبداية يومك', descriptionEn: 'Strong robusta with light Brazilian sweetness and high caffeine', compositionAr: 'إندونيسي روبوستا 40% + برازيلي 35% + فيتنامي 25%' },
    { id: 'turkish-balance', nameAr: 'التوازن المثالي', nameEn: 'Perfect Balance', tierAr: 'وسط', tierEn: 'Medium', price250: 170, price500: 320, price1000: 600, descriptionAr: 'نكهة مثيرة للاهتمام — فلورال خفيف مع ثقل الروبوستا، مناسب للفنادق والكافيهات', descriptionEn: 'Interesting floral profile with robusta body', compositionAr: 'كولومبي 25% + حبشي 25% + إندونيسي 50%' },
    { id: 'turkish-clean', nameAr: 'النظافة المحترفة', nameEn: 'Professional Clean Cup', tierAr: 'وسط بريميوم', tierEn: 'Mid-premium', price250: 200, price500: 380, price1000: 720, descriptionAr: 'أرابيكا 65% نظيف ومتسق — شوكولاتة واضحة، مناسب للمحترفين', descriptionEn: '65% arabica clean cup with clear chocolate notes', compositionAr: 'برازيلي 40% + هندي بلانتيشن 25% + إندونيسي 20% + فيتنامي 15%' },
    { id: 'turkish-premium', nameAr: 'البريميوم', nameEn: 'Premium', tierAr: 'بريميوم', tierEn: 'Premium', price250: 230, price500: 440, price1000: 840, descriptionAr: 'أرابيكا 90% — specialty coffee حقيقية، فلورال وفاكهي', descriptionEn: '90% arabica, true specialty floral-fruity profile', compositionAr: 'حبشي 45% + كولومبي 30% + هندي بلانتيشن 15% + إندونيسي 10%' },
  ],
  'espresso-base': [
    { id: 'espresso-crema-economy', nameAr: 'الكريمة الاقتصادية', nameEn: 'Economy Crema', tierAr: 'اقتصادي', tierEn: 'Economy', price250: 135, price500: 260, price1000: 500, descriptionAr: 'كريمة ممتازة وقوة عالية — مناسب للكميات الكبيرة', descriptionEn: 'Excellent crema and high power for volume brewing', compositionAr: 'فيتنامي 45% + برازيلي 35% + إندونيسي 20%' },
    { id: 'espresso-italian', nameAr: 'الكلاسيك الإيطالي', nameEn: 'Classic Italian', tierAr: 'وسط', tierEn: 'Medium', price250: 200, price500: 380, price1000: 720, descriptionAr: 'شوكولاتة وكراميل، كريمة غنية — الأنسب للكابتشينو واللاتيه', descriptionEn: 'Chocolate-caramel profile with rich crema', compositionAr: 'برازيلي 35% + فيتنامي 30% + هندي بلانتيشن 20% + إندونيسي 15%' },
    { id: 'espresso-specialty', nameAr: 'الفلورال الـ Specialty', nameEn: 'Specialty Floral', tierAr: 'وسط بريميوم', tierEn: 'Mid-premium', price250: 210, price500: 400, price1000: 760, descriptionAr: 'فلورال وفاكهي، أخف كريمة — الأفضل كشوت مباشر لعشاق الـ specialty', descriptionEn: 'Floral-fruity with lighter crema for direct shots', compositionAr: 'حبشي 50% + جواتيمالا 25% + برازيلي 25%' },
    { id: 'espresso-vip', nameAr: 'بريميوم VIP', nameEn: 'Premium VIP', tierAr: 'بريميوم', tierEn: 'Premium', price250: 255, price500: 490, price1000: 940, descriptionAr: 'أرابيكا 90%، كولومبي واضح وقوي، كريمة ذهبية — للفنادق 5 نجوم والـ VIP', descriptionEn: '90% arabica with strong Colombian profile and golden crema', compositionAr: 'كولومبي 40% + حبشي 30% + هندي بلانتيشن 20% + إندونيسي 10%' },
  ],
}

// All flavors flat array
const allFlavors = [
  ...flavorOptions.nuts,
  ...flavorOptions.chocolate,
  ...flavorOptions.creamy,
  ...flavorOptions.fruits,
  ...flavorOptions.special,
]

// Product data based on your list
const allProducts: Product[] = [
  // Turkish Coffee
  {
    id: 'tc-medium-roast',
    slug: 'turkish-coffee-medium-roast',
    name_en: 'Turkish Coffee Medium Roast',
    name_ar: 'قهوة تركية محوج وسط',
    description_en: 'Classic Turkish coffee with medium roast',
    description_ar: 'قهوة تركية كلاسيكية محوجة وسط',
    category_id: 'turkish-coffee',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'],
    origin: 'Turkey',
    roast_level: 'medium',
    flavor_notes: ['Rich', 'Balanced'],
    is_featured: true,
    is_best_seller: true,
    is_new: false,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'tc-mr-250', product_id: 'tc-medium-roast', size: '250g', price: 125, compare_at_price: null, sku: null, is_available: true },
      { id: 'tc-mr-500', product_id: 'tc-medium-roast', size: '500g', price: 240, compare_at_price: null, sku: null, is_available: true },
      { id: 'tc-mr-1000', product_id: 'tc-medium-roast', size: '1kg', price: 460, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  {
    id: 'tc-dark-roast',
    slug: 'turkish-coffee-dark-roast',
    name_en: 'Turkish Coffee Dark Roast',
    name_ar: 'قهوة تركية محوج غامق',
    description_en: 'Bold Turkish coffee with dark roast',
    description_ar: 'قهوة تركية قوية محوجة غامق',
    category_id: 'turkish-coffee',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'],
    origin: 'Turkey',
    roast_level: 'dark',
    flavor_notes: ['Bold', 'Intense'],
    is_featured: true,
    is_best_seller: false,
    is_new: false,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'tc-dr-250', product_id: 'tc-dark-roast', size: '250g', price: 125, compare_at_price: null, sku: null, is_available: true },
      { id: 'tc-dr-500', product_id: 'tc-dark-roast', size: '500g', price: 240, compare_at_price: null, sku: null, is_available: true },
      { id: 'tc-dr-1000', product_id: 'tc-dark-roast', size: '1kg', price: 460, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  {
    id: 'tc-plain',
    slug: 'turkish-coffee-plain',
    name_en: 'Turkish Coffee Plain',
    name_ar: 'قهوة تركية سادة',
    description_en: 'Pure Turkish coffee without additives',
    description_ar: 'قهوة تركية نقية بدون إضافات',
    category_id: 'turkish-coffee',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'],
    origin: 'Turkey',
    roast_level: 'medium',
    flavor_notes: ['Pure', 'Traditional'],
    is_featured: false,
    is_best_seller: true,
    is_new: false,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'tc-p-250', product_id: 'tc-plain', size: '250g', price: 125, compare_at_price: null, sku: null, is_available: true },
      { id: 'tc-p-500', product_id: 'tc-plain', size: '500g', price: 240, compare_at_price: null, sku: null, is_available: true },
      { id: 'tc-p-1000', product_id: 'tc-plain', size: '1kg', price: 460, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  // Espresso
  {
    id: 'esp-medium',
    slug: 'espresso-medium-roast',
    name_en: 'Espresso Medium Roast',
    name_ar: 'إسبريسو محوج وسط',
    description_en: 'Perfect espresso with medium roast',
    description_ar: 'إسبريسو مثالي محوج وسط',
    category_id: 'espresso',
    images: ['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800'],
    origin: 'Italy',
    roast_level: 'medium',
    flavor_notes: ['Smooth', 'Balanced'],
    is_featured: true,
    is_best_seller: false,
    is_new: false,
    is_visible: true,
    stock_quantity: 80,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'esp-m-250', product_id: 'esp-medium', size: '250g', price: 135, compare_at_price: null, sku: null, is_available: true },
      { id: 'esp-m-500', product_id: 'esp-medium', size: '500g', price: 260, compare_at_price: null, sku: null, is_available: true },
      { id: 'esp-m-1000', product_id: 'esp-medium', size: '1kg', price: 500, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  {
    id: 'esp-dark',
    slug: 'espresso-dark-roast',
    name_en: 'Espresso Dark Roast',
    name_ar: 'إسبريسو محوج غامق',
    description_en: 'Bold espresso with dark roast',
    description_ar: 'إسبريسو قوي محوج غامق',
    category_id: 'espresso',
    images: ['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800'],
    origin: 'Italy',
    roast_level: 'dark',
    flavor_notes: ['Bold', 'Intense'],
    is_featured: false,
    is_best_seller: true,
    is_new: false,
    is_visible: true,
    stock_quantity: 80,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'esp-d-250', product_id: 'esp-dark', size: '250g', price: 135, compare_at_price: null, sku: null, is_available: true },
      { id: 'esp-d-500', product_id: 'esp-dark', size: '500g', price: 260, compare_at_price: null, sku: null, is_available: true },
      { id: 'esp-d-1000', product_id: 'esp-dark', size: '1kg', price: 500, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  // Flavored Coffee
  ...allFlavors.map((flavor, idx) => ({
    id: `fc-${flavor.id}`,
    slug: `flavored-coffee-${flavor.id}`,
    name_en: `${flavor.nameEn} Coffee`,
    name_ar: `قهوة ${flavor.nameAr}`,
    description_en: `Delicious ${flavor.nameEn.toLowerCase()} flavored coffee`,
    description_ar: `قهوة بنكهة ${flavor.nameAr} اللذيذة`,
    category_id: 'flavored-coffee',
    images: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800'],
    origin: 'Egypt',
    roast_level: 'medium' as const,
    flavor_notes: [flavor.nameEn],
    is_featured: idx < 3,
    is_best_seller: idx < 5,
    is_new: idx === 0,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: `fc-${flavor.id}-250`, product_id: `fc-${flavor.id}`, size: '250g' as const, price: 100, compare_at_price: null, sku: null, is_available: true },
      { id: `fc-${flavor.id}-500`, product_id: `fc-${flavor.id}`, size: '500g' as const, price: 190, compare_at_price: null, sku: null, is_available: true },
      { id: `fc-${flavor.id}-1000`, product_id: `fc-${flavor.id}`, size: '1kg' as const, price: 360, compare_at_price: null, sku: null, is_available: true },
    ],
  })),
  // Cappuccino Classic
  {
    id: 'cap-classic',
    slug: 'cappuccino-classic',
    name_en: 'Cappuccino Classic',
    name_ar: 'كابتشينو كلاسيك',
    description_en: 'Creamy classic cappuccino mix',
    description_ar: 'كابتشينو كلاسيك كريمي',
    category_id: 'cappuccino',
    subcategory: 'classic',
    images: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800'],
    origin: 'Italy',
    roast_level: 'medium',
    flavor_notes: ['Creamy', 'Smooth'],
    is_featured: true,
    is_best_seller: true,
    is_new: false,
    is_visible: true,
    stock_quantity: 120,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'cap-c-250', product_id: 'cap-classic', size: '250g', price: 65, compare_at_price: null, sku: null, is_available: true },
      { id: 'cap-c-500', product_id: 'cap-classic', size: '500g', price: 120, compare_at_price: null, sku: null, is_available: true },
      { id: 'cap-c-1000', product_id: 'cap-classic', size: '1kg', price: 220, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  // Cappuccino Flavored
  ...allFlavors.map((flavor, idx) => ({
    id: `cap-${flavor.id}`,
    slug: `cappuccino-${flavor.id}`,
    name_en: `${flavor.nameEn} Cappuccino`,
    name_ar: `كابتشينو ${flavor.nameAr}`,
    description_en: `Delicious ${flavor.nameEn.toLowerCase()} flavored cappuccino`,
    description_ar: `كابتشينو بنكهة ${flavor.nameAr} اللذيذة`,
    category_id: 'cappuccino',
    subcategory: 'flavored',
    images: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800'],
    origin: 'Egypt',
    roast_level: 'medium' as const,
    flavor_notes: [flavor.nameEn],
    is_featured: idx < 3,
    is_best_seller: idx < 5,
    is_new: idx === 0,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: `cap-${flavor.id}-250`, product_id: `cap-${flavor.id}`, size: '250g' as const, price: 75, compare_at_price: null, sku: null, is_available: true },
      { id: `cap-${flavor.id}-500`, product_id: `cap-${flavor.id}`, size: '500g' as const, price: 140, compare_at_price: null, sku: null, is_available: true },
      { id: `cap-${flavor.id}-1000`, product_id: `cap-${flavor.id}`, size: '1kg' as const, price: 260, compare_at_price: null, sku: null, is_available: true },
    ],
  })),
  // Coffee Mix Classic
  {
    id: 'cm-classic',
    slug: 'coffee-mix-classic',
    name_en: 'Coffee Mix Classic',
    name_ar: 'كوفي ميكس كلاسيك',
    description_en: '3-in-1 classic coffee mix',
    description_ar: 'كوفي ميكس كلاسيك 3 في 1',
    category_id: 'coffee-mix',
    subcategory: 'classic',
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800'],
    origin: 'Egypt',
    roast_level: 'medium',
    flavor_notes: ['Balanced', 'Sweet'],
    is_featured: true,
    is_best_seller: true,
    is_new: false,
    is_visible: true,
    stock_quantity: 200,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'cm-c-250', product_id: 'cm-classic', size: '250g', price: 55, compare_at_price: null, sku: null, is_available: true },
      { id: 'cm-c-500', product_id: 'cm-classic', size: '500g', price: 100, compare_at_price: null, sku: null, is_available: true },
      { id: 'cm-c-1000', product_id: 'cm-classic', size: '1kg', price: 180, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  // Coffee Mix Flavored
  ...allFlavors.map((flavor, idx) => ({
    id: `cm-${flavor.id}`,
    slug: `coffee-mix-${flavor.id}`,
    name_en: `${flavor.nameEn} Coffee Mix`,
    name_ar: `كوفي ميكس ${flavor.nameAr}`,
    description_en: `Delicious ${flavor.nameEn.toLowerCase()} flavored coffee mix`,
    description_ar: `كوفي ميكس بنكهة ${flavor.nameAr} اللذيذة`,
    category_id: 'coffee-mix',
    subcategory: 'flavored',
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800'],
    origin: 'Egypt',
    roast_level: 'medium' as const,
    flavor_notes: [flavor.nameEn],
    is_featured: idx < 3,
    is_best_seller: idx < 5,
    is_new: idx === 0,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: `cm-${flavor.id}-250`, product_id: `cm-${flavor.id}`, size: '250g' as const, price: 65, compare_at_price: null, sku: null, is_available: true },
      { id: `cm-${flavor.id}-500`, product_id: `cm-${flavor.id}`, size: '500g' as const, price: 120, compare_at_price: null, sku: null, is_available: true },
      { id: `cm-${flavor.id}-1000`, product_id: `cm-${flavor.id}`, size: '1kg' as const, price: 220, compare_at_price: null, sku: null, is_available: true },
    ],
  })),
  // Hot Chocolate Classic
  {
    id: 'hc-classic',
    slug: 'hot-chocolate-classic',
    name_en: 'Hot Chocolate Classic',
    name_ar: 'هوت شوكلت كلاسيك',
    description_en: 'Rich and creamy hot chocolate',
    description_ar: 'هوت شوكلت غني وك����يمي',
    category_id: 'hot-chocolate',
    subcategory: 'classic',
    images: ['https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800'],
    origin: 'Egypt',
    roast_level: null,
    flavor_notes: ['Chocolate', 'Creamy'],
    is_featured: true,
    is_best_seller: true,
    is_new: false,
    is_visible: true,
    stock_quantity: 150,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'hc-c-250', product_id: 'hc-classic', size: '250g', price: 60, compare_at_price: null, sku: null, is_available: true },
      { id: 'hc-c-500', product_id: 'hc-classic', size: '500g', price: 110, compare_at_price: null, sku: null, is_available: true },
      { id: 'hc-c-1000', product_id: 'hc-classic', size: '1kg', price: 200, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  // Hot Chocolate Flavored
  ...allFlavors.map((flavor, idx) => ({
    id: `hc-${flavor.id}`,
    slug: `hot-chocolate-${flavor.id}`,
    name_en: `${flavor.nameEn} Hot Chocolate`,
    name_ar: `هوت شوكلت ${flavor.nameAr}`,
    description_en: `Delicious ${flavor.nameEn.toLowerCase()} flavored hot chocolate`,
    description_ar: `هوت شوكلت بنكهة ${flavor.nameAr} اللذيذة`,
    category_id: 'hot-chocolate',
    subcategory: 'flavored',
    images: ['https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800'],
    origin: 'Egypt',
    roast_level: null,
    flavor_notes: [flavor.nameEn],
    is_featured: idx < 3,
    is_best_seller: idx < 5,
    is_new: idx === 0,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: `hc-${flavor.id}-250`, product_id: `hc-${flavor.id}`, size: '250g' as const, price: 70, compare_at_price: null, sku: null, is_available: true },
      { id: `hc-${flavor.id}-500`, product_id: `hc-${flavor.id}`, size: '500g' as const, price: 130, compare_at_price: null, sku: null, is_available: true },
      { id: `hc-${flavor.id}-1000`, product_id: `hc-${flavor.id}`, size: '1kg' as const, price: 240, compare_at_price: null, sku: null, is_available: true },
    ],
  })),
]

// Customize Your Product Component
function CustomizeProduct() {
  const { t, language } = useLanguage()
  const { addItem } = useCartStore()
  const [step, setStep] = useState(1)
  const [selectedBase, setSelectedBase] = useState<typeof baseOptions[0] | null>(null)
  const [selectedFlavors, setSelectedFlavors] = useState<typeof allFlavors>([])
  const [selectedBeans, setSelectedBeans] = useState<Array<{ id: string; nameAr: string; nameEn: string; percent: string }>>([])
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<'250g' | '500g' | '1kg'>('250g')

  const isBeanBase = selectedBase?.id === 'turkish-base' || selectedBase?.id === 'espresso-base'
  const availablePresets = (selectedBase && selectedBase.id in presetBlends)
    ? presetBlends[selectedBase.id as keyof typeof presetBlends]
    : []

  const toggleFlavor = (flavor: typeof allFlavors[0]) => {
    if (selectedFlavors.find(f => f.id === flavor.id)) {
      setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id))
    } else if (selectedFlavors.length < 3) {
      setSelectedFlavors([...selectedFlavors, flavor])
    }
  }

  const toggleBean = (bean: { id: string; nameAr: string; nameEn: string }) => {
    const exists = selectedBeans.find((item) => item.id === bean.id)
    if (exists) {
      setSelectedBeans(selectedBeans.filter((item) => item.id !== bean.id))
      return
    }
    if (selectedBeans.length >= 4) return
    setSelectedBeans([...selectedBeans, { ...bean, percent: '' }])
    setSelectedPresetId(null)
  }

  const updateBeanPercent = (beanId: string, percent: string) => {
    setSelectedBeans((prev) => prev.map((bean) => (bean.id === beanId ? { ...bean, percent } : bean)))
  }

  const selectedPreset = availablePresets.find((preset) => preset.id === selectedPresetId) || null

  const getPrice = () => {
    if (!selectedBase) return 0
    if (isBeanBase && selectedPreset) {
      if (selectedSize === '250g') return selectedPreset.price250
      if (selectedSize === '500g') return selectedPreset.price500
      return selectedPreset.price1000
    }
    const basePrice = selectedSize === '250g' ? selectedBase.price250 : selectedSize === '500g' ? selectedBase.price500 : selectedBase.price1000
    const flavorPrice = selectedFlavors.length * (selectedSize === '250g' ? 10 : selectedSize === '500g' ? 18 : 30)
    return basePrice + flavorPrice
  }

  const handleAddToCart = () => {
    if (!selectedBase) return
    if (!isBeanBase && selectedFlavors.length === 0) return
    if (isBeanBase && !selectedPreset && selectedBeans.length === 0) return

    const baseName = language === 'ar' ? selectedBase.nameAr : selectedBase.nameEn
    const beanPercentValues = selectedBeans
      .map((bean) => Number(bean.percent || 0))
      .filter((value) => value > 0)
    const beansPercentTotal = beanPercentValues.reduce((sum, value) => sum + value, 0)
    if (isBeanBase && beanPercentValues.length > 0 && beansPercentTotal !== 100) {
      toast.error(t('Percentages must total 100%', 'يجب أن يكون مجموع النسب 100%'))
      return
    }

    const customPart = isBeanBase
      ? selectedPreset
        ? `${selectedPreset.nameEn} / ${selectedPreset.nameAr}`
        : selectedBeans
            .map((bean) =>
              `${language === 'ar' ? bean.nameAr : bean.nameEn}${bean.percent ? ` ${bean.percent}%` : ` (${t('standard', 'ستاندرد')})`}`,
            )
            .join(' + ')
      : selectedFlavors.map((f) => (language === 'ar' ? f.nameAr : f.nameEn)).join(' + ')

    addItem({
      id: `custom-${selectedBase.id}-${selectedPresetId || selectedBeans.map((b) => b.id).join('-') || selectedFlavors.map((f) => f.id).join('-')}-${selectedSize}`,
      product_id: `custom-${selectedBase.id}`,
      name_en: `Custom ${selectedBase.nameEn} - ${customPart}`,
      name_ar: `${selectedBase.nameAr} مخصص - ${customPart}`,
      size: selectedSize,
      price: getPrice(),
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
    })

    toast.success(t('Added to cart!', 'تمت الإضافة للسلة!'))
    
    // Reset
    setStep(1)
    setSelectedBase(null)
    setSelectedFlavors([])
    setSelectedBeans([])
    setSelectedPresetId(null)
    setSelectedSize('250g')
  }

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-bold">
            {t('Create Your Perfect Blend', 'صمم خلطتك المثالية')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('Choose base, then custom flavors or coffee-bean blends', 'اختَر القاعدة ثم خصّص النكهات أو توليفات البن')}
          </p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
        )}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
          {t('Choose Base', 'اختر القاعدة')}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
        )}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
          {t('Add Flavors', 'أضف النكهات')}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="font-semibold mb-4">{t('Select your base:', 'اختر القاعدة:')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {baseOptions.map((base) => (
                <button
                  key={base.id}
                  onClick={() => {
                    setSelectedBase(base)
                    setStep(2)
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left hover:border-primary',
                    selectedBase?.id === base.id ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <h4 className="font-semibold mb-1">{language === 'ar' ? base.nameAr : base.nameEn}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {language === 'ar' ? base.descriptionAr : base.descriptionEn}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(`From ${base.price250} EGP`, `من ${base.price250} ج.م`)}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Selected Base */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('Base:', 'القاعدة:')}</span>
                <span className="font-semibold">{language === 'ar' ? selectedBase?.nameAr : selectedBase?.nameEn}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                {t('Change', 'تغيير')}
              </Button>
            </div>

            {/* Selected Flavors */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-muted-foreground">{isBeanBase ? t('Blend:', 'التوليفة:') : t('Flavors:', 'النكهات:')}</span>
              {(!isBeanBase && selectedFlavors.length === 0) || (isBeanBase && selectedBeans.length === 0 && !selectedPreset) ? (
                <span className="text-sm text-muted-foreground italic">{t('None selected', 'لم يتم الاختيار')}</span>
              ) : (
                <>
                  {selectedPreset && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                      {language === 'ar' ? selectedPreset.nameAr : selectedPreset.nameEn}
                      <button onClick={() => setSelectedPresetId(null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {!isBeanBase && selectedFlavors.map((flavor) => (
                    <span
                      key={flavor.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm"
                    >
                      {language === 'ar' ? flavor.nameAr : flavor.nameEn}
                      <button onClick={() => toggleFlavor(flavor)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {isBeanBase && selectedBeans.map((bean) => (
                    <span
                      key={bean.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm"
                    >
                      {language === 'ar' ? bean.nameAr : bean.nameEn}{bean.percent ? ` ${bean.percent}%` : ''}
                      <button onClick={() => toggleBean(bean)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </>
              )}
              {!isBeanBase && <span className="text-xs text-muted-foreground">({selectedFlavors.length}/3)</span>}
            </div>

            {!isBeanBase ? (
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(flavorOptions).map(([category, flavors]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 capitalize">
                      {category === 'nuts' ? t('Nuts', 'المكسرات') :
                       category === 'chocolate' ? t('Chocolate & Sweet', 'شوكولاتة وحلويات') :
                       category === 'creamy' ? t('Creamy', 'كريمي') :
                       category === 'fruits' ? t('Fruits', 'فواكه') :
                       t('Special', 'مميزة')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {flavors.map((flavor) => {
                        const isSelected = selectedFlavors.find(f => f.id === flavor.id)
                        const isDisabled = !isSelected && selectedFlavors.length >= 3
                        return (
                          <button
                            key={flavor.id}
                            onClick={() => !isDisabled && toggleFlavor(flavor)}
                            disabled={isDisabled}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm transition-all',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : isDisabled
                                ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                                : 'bg-secondary hover:bg-secondary/80 text-foreground'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            {language === 'ar' ? flavor.nameAr : flavor.nameEn}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{t('Ready blends', 'التوليفات الجاهزة')}</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {availablePresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedPresetId(preset.id)
                          setSelectedBeans([])
                        }}
                        className={cn(
                          'text-left p-3 rounded-lg border transition-all',
                          selectedPresetId === preset.id ? 'border-primary bg-primary/5' : 'border-border'
                        )}
                      >
                        <p className="font-medium">{language === 'ar' ? preset.nameAr : preset.nameEn}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' ? preset.tierAr : preset.tierEn}
                          {' — '}{t('from', 'من')} {preset.price250} {t('EGP', 'ج.م')}
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">{preset.compositionAr}</p>
                        <p className="text-xs mt-1 text-primary/80 italic">{language === 'ar' ? preset.descriptionAr : preset.descriptionEn}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{t('Or build your blend', 'أو صمّم خلطتك')}</h4>
                  {Object.entries(beanCatalog).map(([family, beans]) => (
                    <div key={family} className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">{family === 'arabica' ? 'Arabica' : 'Robusta'}</p>
                      <div className="space-y-2">
                        {beans.map((bean) => {
                          const selected = selectedBeans.find((item) => item.id === bean.id)
                          return (
                            <div key={bean.id} className="p-2 border border-border rounded-lg">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  className={cn(
                                    'text-left flex-1 px-2 py-1 rounded-md transition-all',
                                    selected ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                                  )}
                                  onClick={() => {
                                    toggleBean(bean)
                                    setSelectedPresetId(null)
                                  }}
                                >
                                  {language === 'ar' ? bean.nameAr : bean.nameEn}
                                </button>
                                {selected && (
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={selected.percent}
                                    onChange={(e) => updateBeanPercent(bean.id, e.target.value)}
                                    placeholder="%"
                                    className="w-20 h-8"
                                  />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {language === 'ar' ? bean.descriptionAr : bean.descriptionEn}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-3">{t('Select Size:', 'اختر الحجم:')}</h4>
              <div className="flex gap-2">
                {(['250g', '500g', '1kg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    {size === '250g' ? t('250g (Quarter)', '250 جم (ربع)') :
                     size === '500g' ? t('500g (Half)', '500 جم (نص)') :
                     t('1kg (Kilo)', '1 كجم (كيلو)')}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Total Price', 'السعر الإجمالي')}</p>
                <p className="text-2xl font-bold text-primary">
                  {getPrice()} {t('EGP', 'ج.م')}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!selectedBase || (!isBeanBase && selectedFlavors.length === 0) || (isBeanBase && selectedBeans.length === 0 && !selectedPreset)}
                className="gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {t('Add to Cart', 'أضف للسلة')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProductsPageInner() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [activeSubTab, setActiveSubTab] = useState<'classic' | 'flavored'>('classic')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)

  const currentCategory = categories.find((c) => c.slug === activeCategory)
  const hasSubcategories = currentCategory?.hasSubcategories
  const isCustomize = currentCategory?.isCustomize

  useEffect(() => {
    let products = [...allProducts]

    if (activeCategory !== 'all' && !isCustomize) {
      products = products.filter((p) => p.category_id === activeCategory)

      if (hasSubcategories) {
        products = products.filter((p) => 
          activeSubTab === 'classic' 
            ? (p as any).subcategory === 'classic' || !(p as any).subcategory
            : (p as any).subcategory === 'flavored'
        )
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      products = products.filter(
        (p) =>
          p.name_en.toLowerCase().includes(query) ||
          p.name_ar.includes(searchQuery)
      )
    }

    setFilteredProducts(products)
  }, [activeCategory, activeSubTab, searchQuery, hasSubcategories, isCustomize])

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    setActiveSubTab('classic')
    router.push(`/products?category=${slug}`, { scroll: false })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600"
          alt="Our Products"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            {t('Our Products', 'منتجاتنا')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            {t(
              'Discover our carefully curated selection of premium coffee and beverages.',
              'اكتشف مجموعتنا المنتقاة بعناية من القهوة والمشروبات الفاخرة.'
            )}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-28 bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-sm">
              <h2 className="font-serif text-lg font-semibold mb-4 px-2">
                {t('Categories', 'الفئات')}
              </h2>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm flex items-center gap-2',
                      activeCategory === category.slug
                        ? 'bg-[#522500] text-white font-medium shadow-md scale-[1.02]'
                        : 'text-foreground/80 hover:bg-secondary hover:text-foreground hover:scale-[1.01]',
                      category.isCustomize && 'border-2 border-dashed border-primary/30'
                    )}
                  >
                    {category.isCustomize && <Sparkles className="w-4 h-4" />}
                    {t(category.nameEn, category.nameAr)}
                    {activeCategory === category.slug && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {isCustomize ? (
              <CustomizeProduct />
            ) : (
              <>
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('Search products...', 'ابحث عن المنتجات...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50"
                  />
                </div>

                {/* Subcategory Tabs */}
                {hasSubcategories && (
                  <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'classic' | 'flavored')} className="mb-6">
                    <TabsList>
                      <TabsTrigger value="classic">{t('Classic', 'كلاسيك')}</TabsTrigger>
                      <TabsTrigger value="flavored">{t('Flavored', 'نكهات')}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}

                {/* Products Count */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    {t(
                      `Showing ${filteredProducts.length} products`,
                      `عرض ${filteredProducts.length} منتج`
                    )}
                  </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <PackageSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="font-serif text-xl font-semibold mb-2">
                      {t('No products found', 'لم يتم العثور على منتجات')}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      {t(
                        'Try adjusting your filters or search terms.',
                        'حاول تعديل الفلاتر أو كلمات البحث.'
                      )}
                    </p>
                    <Button onClick={() => handleCategoryChange('all')}>
                      {t('View All Products', 'عرض جميع المنتجات')}
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
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
    <Suspense
      fallback={
        <div className="min-h-screen">
          <div className="bg-primary text-primary-foreground py-12 md:py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="h-10 w-56 bg-white/15 rounded-lg mx-auto" />
              <div className="h-5 w-[26rem] max-w-full bg-white/10 rounded-lg mx-auto mt-4" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-10">
            <div className="h-10 w-full bg-secondary/60 rounded-lg" />
          </div>
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  )
}
