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
  { id: 'cappuccino', nameEn: 'Cappuccino', nameAr: 'كابتشينو', price250: 65, price500: 120, price1000: 220 },
  { id: 'coffee-mix', nameEn: 'Coffee Mix', nameAr: 'كوفي ميكس', price250: 55, price500: 100, price1000: 180 },
  { id: 'hot-chocolate', nameEn: 'Hot Chocolate', nameAr: 'هوت شوكلت', price250: 60, price500: 110, price1000: 200 },
]

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
  const [selectedSize, setSelectedSize] = useState<'250g' | '500g' | '1kg'>('250g')

  const toggleFlavor = (flavor: typeof allFlavors[0]) => {
    if (selectedFlavors.find(f => f.id === flavor.id)) {
      setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id))
    } else if (selectedFlavors.length < 3) {
      setSelectedFlavors([...selectedFlavors, flavor])
    }
  }

  const getPrice = () => {
    if (!selectedBase) return 0
    const basePrice = selectedSize === '250g' ? selectedBase.price250 : selectedSize === '500g' ? selectedBase.price500 : selectedBase.price1000
    const flavorPrice = selectedFlavors.length * (selectedSize === '250g' ? 10 : selectedSize === '500g' ? 18 : 30)
    return basePrice + flavorPrice
  }

  const handleAddToCart = () => {
    if (!selectedBase || selectedFlavors.length === 0) return

    const flavorNames = selectedFlavors.map(f => language === 'ar' ? f.nameAr : f.nameEn).join(' + ')
    const baseName = language === 'ar' ? selectedBase.nameAr : selectedBase.nameEn

    addItem({
      id: `custom-${selectedBase.id}-${selectedFlavors.map(f => f.id).join('-')}-${selectedSize}`,
      product_id: `custom-${selectedBase.id}`,
      name_en: `Custom ${selectedBase.nameEn} - ${selectedFlavors.map(f => f.nameEn).join(' + ')}`,
      name_ar: `${selectedBase.nameAr} مخصص - ${selectedFlavors.map(f => f.nameAr).join(' + ')}`,
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
            {t('Mix up to 3 flavors with your favorite base', 'امزج حتى 3 نكهات مع القاعدة المفضلة')}
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
              <span className="text-sm text-muted-foreground">{t('Flavors:', 'النكهات:')}</span>
              {selectedFlavors.length === 0 ? (
                <span className="text-sm text-muted-foreground italic">{t('None selected', 'لم يتم الاختيار')}</span>
              ) : (
                selectedFlavors.map((flavor) => (
                  <span
                    key={flavor.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm"
                  >
                    {language === 'ar' ? flavor.nameAr : flavor.nameEn}
                    <button onClick={() => toggleFlavor(flavor)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
              <span className="text-xs text-muted-foreground">({selectedFlavors.length}/3)</span>
            </div>

            {/* Flavor Categories */}
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
                disabled={selectedFlavors.length === 0}
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
