'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PackageSearch, Sparkles, ChevronRight, Check, X, ShoppingBag, Coffee, Scale, SlidersHorizontal, Minus, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'
import { getCustomStockIssue } from '@/lib/custom-stock'
import { useLanguage } from '@/lib/context/language'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'
import {
  calculateBlendPrice,
  calculateFlavorPrice,
  CUSTOMIZE_FLAVOR_ADDITIONS,
  CUSTOMIZE_FLAVOR_BASES,
  DEFAULT_CUSTOM_BLEND_BEANS,
  type CoffeeBeanOption,
  type FlavorAdditionOption,
  type FlavorBaseOption,
  type PackageSize,
} from '@/lib/config/customization'
import { getMediaObjectPosition, getMediaOverlayOpacity, type SiteMediaItem } from '@/lib/media'
import { toast } from 'sonner'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type DbCategory = {
  id: string
  slug: string
  name_en: string
  name_ar: string
  image_url: string | null
}

type SidebarCategory = {
  slug: string
  nameEn: string
  nameAr: string
  isCustomizeBlend?: boolean
  isCustomizeFlavor?: boolean
}

// â”€â”€â”€ Fallback categories shown when DB fetch returns empty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FALLBACK_DB_CATEGORIES: DbCategory[] = [
  { id: 'tc',  slug: 'turkish-coffee',  name_en: 'Turkish Coffee',  name_ar: 'Ø§Ù„Ù‚Ù‡ÙˆØ© Ø§Ù„ØªØ±ÙƒÙŠ',    image_url: null },
  { id: 'esp', slug: 'espresso',        name_en: 'Espresso',         name_ar: 'Ø§Ù„Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ',        image_url: null },
  { id: 'fc',  slug: 'flavored-coffee', name_en: 'Flavored Coffee',  name_ar: 'Ø§Ù„Ù‚Ù‡ÙˆØ© Ø¨Ø§Ù„Ù†ÙƒÙ‡Ø§Øª', image_url: null },
  { id: 'cm',  slug: 'coffee-mix',      name_en: 'Coffee Mix',       name_ar: 'ÙƒÙˆÙÙŠ Ù…ÙŠÙƒØ³',        image_url: null },
  { id: 'cap', slug: 'cappuccino',      name_en: 'Cappuccino',       name_ar: 'ÙƒØ§Ø¨ØªØ´ÙŠÙ†Ùˆ',          image_url: null },
  { id: 'hc',  slug: 'hot-chocolate',   name_en: 'Hot Chocolate',    name_ar: 'Ù‡ÙˆØª Ø´ÙˆÙƒÙ„ÙŠØª',       image_url: null },
  { id: 'nc',  slug: 'nescafe',         name_en: 'Nescafe',          name_ar: 'Ù†Ø³ÙƒØ§ÙÙŠÙ‡',           image_url: null },
]

// â”€â”€â”€ Static special sidebar entries (not stored in DB) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALL_ENTRY: SidebarCategory = { slug: 'all', nameEn: 'All Products', nameAr: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª' }
const CUSTOMIZE_BLEND_ENTRY: SidebarCategory = { slug: 'customize-blend', nameEn: 'Make Your Espresso Blend', nameAr: 'Ø§ØµÙ†Ø¹ ØªÙˆÙ„ÙŠÙØ© Ø§Ù„Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ Ø§Ù„Ø®Ø§ØµØ© Ø¨Ùƒ', isCustomizeBlend: true }
const CUSTOMIZE_FLAVOR_ENTRY: SidebarCategory = { slug: 'customize-flavor', nameEn: 'Make Your Flavor', nameAr: 'Ø§ØµÙ†Ø¹ Ù†ÙƒÙ‡ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©', isCustomizeFlavor: true }


const customFlavorOptions: FlavorAdditionOption[] = CUSTOMIZE_FLAVOR_ADDITIONS

// â”€â”€â”€ Helper to build a Product object â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    low_stock_threshold: 10,
    is_manually_out_of_stock: false,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: `${id}-250`, product_id: id, size: '250g', price: prices[0], compare_at_price: null, sku: null, is_available: true },
      { id: `${id}-500`, product_id: id, size: '500g', price: prices[1], compare_at_price: null, sku: null, is_available: true },
      { id: `${id}-1kg`, product_id: id, size: '1kg',  price: prices[2], compare_at_price: null, sku: null, is_available: true },
    ],
  }
}

// Last-resort fallback products used only when API products are unavailable.
const IMG_TC   = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'
const IMG_ESP  = 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800'
const IMG_FC   = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800'
const IMG_CAP  = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800'
const IMG_CM   = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800'
const IMG_HC   = 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800'

const LAST_RESORT_PRODUCTS: Product[] = [
  // â”€â”€ Turkish Coffee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Prices mirror the expected public catalog fallback values.
  mkProduct('tc-1','velvet-turkish','Velvet Turkish','ÙÙŠÙ„ÙÙŠØª ØªØ±ÙƒÙŠ',
    'Velvety smooth body with balanced bitterness and warm roast depth.',
    'Ù‚ÙˆØ§Ù… Ù…Ø®Ù…Ù„ÙŠ Ù†Ø§Ø¹Ù… Ù…Ø¹ Ù…Ø±Ø§Ø±Ø© Ù…ØªÙˆØ§Ø²Ù†Ø© ÙˆØ¹Ù…Ù‚ ØªØ­Ù…ÙŠØµ Ø¯Ø§ÙØ¦.',
    'turkish-coffee',[200,400,800],{ images:[IMG_TC], is_featured:true, is_best_seller:true, flavor_notes:['Balanced','Velvety'] }),
  mkProduct('tc-2','cairo-nights','Cairo Nights','Ù„ÙŠØ§Ù„ÙŠ Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©',
    'Dark roast with deep caramel undertones â€” a cup that captures the night.',
    'ØªØ­Ù…ÙŠØµ Ø¯Ø§ÙƒÙ† Ù…Ø¹ Ù†ØºÙ…Ø§Øª ÙƒØ±Ø§Ù…ÙŠÙ„ Ø¹Ù…ÙŠÙ‚Ø© â€” ÙƒÙˆØ¨ ÙŠØ¬Ø³Ù‘Ø¯ Ù„ÙŠØ§Ù„ÙŠ Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©.',
    'turkish-coffee',[220,440,880],{ images:[IMG_TC], is_featured:true, flavor_notes:['Caramel','Dark Roast'] }),
  mkProduct('tc-3','midnight-turkish','Midnight Turkish','Ù…ÙŠØ¯Ù†Ø§ÙŠØª ØªØ±ÙƒÙŠ',
    'Rich and full-bodied with a smoky chocolate finish.',
    'ØºÙ†ÙŠ ÙˆØ«Ù‚ÙŠÙ„ Ø§Ù„Ù‚ÙˆØ§Ù… Ù…Ø¹ Ù†Ù‡Ø§ÙŠØ© Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ© Ù…Ø¯Ø®Ù†Ø©.',
    'turkish-coffee',[235,470,940],{ images:[IMG_TC], flavor_notes:['Chocolate','Smoky'] }),
  mkProduct('tc-4','royal-line','Royal Line','Ø±ÙˆÙŠØ§Ù„ Ù„Ø§ÙŠÙ†',
    'A premium specialty blend of finest arabica â€” floral, fruity, and refined.',
    'ØªÙˆÙ„ÙŠÙØ© specialty Ù…Ù† Ø£Ø¬ÙˆØ¯ Ø§Ù„Ø£Ø±Ø§Ø¨ÙŠÙƒØ§ â€” ÙÙ„ÙˆØ±Ø§Ù„ ÙˆÙØ§ÙƒÙ‡ÙŠ ÙˆØ±Ø§Ù‚ÙŠ.',
    'turkish-coffee',[410,825,1650],{ images:[IMG_TC], is_new:true, flavor_notes:['Specialty','Floral','Fruity'] }),

  // â”€â”€ Espresso â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  mkProduct('esp-1','line-crema','Line Crema','Ù„Ø§ÙŠÙ† ÙƒØ±ÙŠÙ…Ø§',
    'Excellent crema and high strength â€” ideal for espresso machines and large volumes.',
    'ÙƒØ±ÙŠÙ…Ø© Ù…Ù…ØªØ§Ø²Ø© ÙˆÙ‚ÙˆØ© Ø¹Ø§Ù„ÙŠØ© â€” Ù…Ø«Ø§Ù„ÙŠ Ù„Ù…Ø§ÙƒÙŠÙ†Ø§Øª Ø§Ù„Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ ÙˆØ§Ù„ÙƒÙ…ÙŠØ§Øª Ø§Ù„ÙƒØ¨ÙŠØ±Ø©.',
    'espresso',[165,330,660],{ images:[IMG_ESP], is_best_seller:true, flavor_notes:['Crema','Strong'] }),
  mkProduct('esp-2','first-line','First Line','ÙÙŠØ±Ø³Øª Ù„Ø§ÙŠÙ†',
    'Chocolate and caramel balance with rich crema â€” perfect for cappuccino and latte.',
    'ØªÙˆØ§Ø²Ù† Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ© ÙˆÙƒØ±Ø§Ù…ÙŠÙ„ Ù…Ø¹ ÙƒØ±ÙŠÙ…Ø© ØºÙ†ÙŠØ© â€” Ù…Ø«Ø§Ù„ÙŠ Ù„Ù„ÙƒØ§Ø¨ØªØ´ÙŠÙ†Ùˆ ÙˆØ§Ù„Ù„Ø§ØªÙŠÙ‡.',
    'espresso',[190,380,760],{ images:[IMG_ESP], is_featured:true, flavor_notes:['Chocolate','Caramel'] }),
  mkProduct('esp-3','headshot','HEADSHOT','Ù‡ÙŠØ¯ Ø´ÙˆØª',
    'Precision-roasted espresso with bright acidity and clean body.',
    'Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ Ù…Ø­Ù…Øµ Ø¨Ø¯Ù‚Ø© Ù…Ø¹ Ø­Ù…ÙˆØ¶Ø© Ù†Ø§Ø¨Ø¶Ø© ÙˆÙ‚ÙˆØ§Ù… Ù†Ø¸ÙŠÙ.',
    'espresso',[190,380,760],{ images:[IMG_ESP], is_new:true, flavor_notes:['Bright','Clean'] }),
  mkProduct('esp-4','gold-shot','Gold Shot','Ø¬ÙˆÙ„Ø¯ Ø´ÙˆØª',
    'Single-origin specialty espresso â€” golden crema and complex florals.',
    'Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ specialty Ø£Ø­Ø§Ø¯ÙŠ Ø§Ù„Ù…ØµØ¯Ø± â€” ÙƒØ±ÙŠÙ…Ø© Ø°Ù‡Ø¨ÙŠØ© ÙˆÙÙ„ÙˆØ±Ø§Ù„ Ù…Ø¹Ù‚Ø¯.',
    'espresso',[260,520,1040],{ images:[IMG_ESP], flavor_notes:['Specialty','Floral'] }),

  // â”€â”€ Flavored Coffee (French Coffee) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  mkProduct('fc-1','french-coffee','French Coffee','Ù‚Ù‡ÙˆØ© ÙØ±Ù†Ø³ÙŠØ©',
    'Classic French-roast coffee blend â€” bold, smooth, and full-bodied.',
    'ØªÙˆÙ„ÙŠÙØ© Ù‚Ù‡ÙˆØ© ÙØ±Ù†Ø³ÙŠ ÙƒÙ„Ø§Ø³ÙŠÙƒ â€” Ø¬Ø±ÙŠØ¦Ø© ÙˆÙ†Ø§Ø¹Ù…Ø© ÙˆØ«Ù‚ÙŠÙ„Ø© Ø§Ù„Ù‚ÙˆØ§Ù….',
    'flavored-coffee',[87,174,349],{ images:[IMG_FC], is_featured:true, is_best_seller:true, flavor_notes:['French Roast','Bold'] }),
  mkProduct('fc-2','french-coffee-flavored','Flavored French Coffee','Ù‚Ù‡ÙˆØ© ÙØ±Ù†Ø³ÙŠØ© Ø¨Ø§Ù„Ù†ÙƒÙ‡Ø§Øª',
    'French roast coffee with premium added flavor â€” a refined sensory experience.',
    'Ù‚Ù‡ÙˆØ© ÙØ±Ù†Ø³ÙŠ Ø¨Ù†ÙƒÙ‡Ø© Ù…Ø¶Ø§ÙØ© ÙØ§Ø®Ø±Ø© â€” ØªØ¬Ø±Ø¨Ø© Ø­Ø³ÙŠØ© Ø±Ø§Ù‚ÙŠØ©.',
    'flavored-coffee',[87,174,349],{ images:[IMG_FC], is_featured:true, flavor_notes:['French Roast','Flavored'] }),
  mkProduct('fc-3','french-coffee-pieces','French Coffee with Pieces','Ù‚Ù‡ÙˆØ© ÙØ±Ù†Ø³ÙŠØ© Ø¨Ù‚Ø·Ø¹',
    'French roast coffee enriched with real chocolate or hazelnut pieces.',
    'Ù‚Ù‡ÙˆØ© ÙØ±Ù†Ø³ÙŠ Ù…Ø¹ Ù‚Ø·Ø¹ Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ© Ø£Ùˆ Ø¨Ù†Ø¯Ù‚ Ø­Ù‚ÙŠÙ‚ÙŠØ©.',
    'flavored-coffee',[107,214,429],{ images:[IMG_FC], flavor_notes:['French Roast','Pieces'] }),

  // â”€â”€ Coffee Mix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  mkProduct('cm-1','coffee-mix-original','Original Coffee Mix','ÙƒÙˆÙÙŠ Ù…ÙŠÙƒØ³ Ø£ÙˆØ±ÙŠØ¬ÙŠÙ†Ø§Ù„',
    'Classic balanced coffee mix â€” smooth, creamy, and consistently satisfying.',
    'ÙƒÙˆÙÙŠ Ù…ÙŠÙƒØ³ ÙƒÙ„Ø§Ø³ÙŠÙƒ Ù…ØªÙˆØ§Ø²Ù† â€” Ù†Ø§Ø¹Ù… ÙˆÙƒØ±ÙŠÙ…ÙŠ ÙˆÙ…ÙØ±Ø¶Ù Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ù….',
    'coffee-mix',[88,176,352],{ images:[IMG_CM], is_featured:true, is_best_seller:true, flavor_notes:['Balanced','Creamy'] }),
  mkProduct('cm-2','coffee-mix-flavored','Flavored Coffee Mix','ÙƒÙˆÙÙŠ Ù…ÙŠÙƒØ³ Ù†ÙƒÙ‡Ø§Øª',
    'Coffee mix infused with premium flavors â€” a richer, more aromatic experience.',
    'ÙƒÙˆÙÙŠ Ù…ÙŠÙƒØ³ Ø¨Ù†ÙƒÙ‡Ø§Øª ÙØ§Ø®Ø±Ø© Ù…Ø¶Ø§ÙØ© â€” ØªØ¬Ø±Ø¨Ø© Ø£ØºÙ†Ù‰ ÙˆØ£ÙƒØ«Ø± Ø¹Ø·Ø±Ø§Ù‹.',
    'coffee-mix',[108,216,432],{ images:[IMG_CM], is_featured:true, flavor_notes:['Flavored','Aromatic'] }),

  // â”€â”€ Cappuccino â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  mkProduct('cap-1','cappuccino-original','Original Cappuccino','ÙƒØ§Ø¨ØªØ´ÙŠÙ†Ùˆ Ø£ÙˆØ±ÙŠØ¬ÙŠÙ†Ø§Ù„',
    'Classic creamy cappuccino mix â€” perfectly balanced foam and espresso.',
    'ÙƒØ§Ø¨ØªØ´ÙŠÙ†Ùˆ ÙƒØ±ÙŠÙ…ÙŠ ÙƒÙ„Ø§Ø³ÙŠÙƒ â€” ØªÙˆØ§Ø²Ù† Ù…Ø«Ø§Ù„ÙŠ Ø¨ÙŠÙ† Ø§Ù„Ø±ØºÙˆØ© ÙˆØ§Ù„Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ.',
    'cappuccino',[108,216,432],{ images:[IMG_CAP], is_featured:true, is_best_seller:true, flavor_notes:['Creamy','Classic'] }),
  mkProduct('cap-2','cappuccino-flavored','Flavored Cappuccino','ÙƒØ§Ø¨ØªØ´ÙŠÙ†Ùˆ Ù†ÙƒÙ‡Ø§Øª',
    'Premium cappuccino mix with an added layer of flavor complexity.',
    'ÙƒØ§Ø¨ØªØ´ÙŠÙ†Ùˆ ÙØ§Ø®Ø± Ù…Ø¹ Ø·Ø¨Ù‚Ø© Ø¥Ø¶Ø§ÙÙŠØ© Ù…Ù† ØªØ¹Ù‚ÙŠØ¯ Ø§Ù„Ù†ÙƒÙ‡Ø©.',
    'cappuccino',[128,256,512],{ images:[IMG_CAP], is_featured:true, flavor_notes:['Flavored','Premium'] }),

  // â”€â”€ Nescafe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  mkProduct('nc-1','nescafe-classic','Classic Nescafe','Ù†Ø³ÙƒØ§ÙÙŠÙ‡ ÙƒÙ„Ø§Ø³ÙŠÙƒ',
    'The original instant coffee â€” rich and satisfying every time.',
    'Ø§Ù„Ù‚Ù‡ÙˆØ© Ø§Ù„ÙÙˆØ±ÙŠØ© Ø§Ù„Ø£ØµÙ„ÙŠØ© â€” ØºÙ†ÙŠØ© ÙˆÙ…ÙØ±Ø¶ÙŠØ© ÙÙŠ ÙƒÙ„ Ù…Ø±Ø©.',
    'nescafe',[244,488,976],{ images:[IMG_CM], is_best_seller:true, flavor_notes:['Classic','Rich'] }),
  mkProduct('nc-2','nescafe-gold','Gold Nescafe','Ù†Ø³ÙƒØ§ÙÙŠÙ‡ Ø¬ÙˆÙ„Ø¯',
    'Premium gold-blend instant coffee â€” smoother, more refined, and aromatic.',
    'Ù‚Ù‡ÙˆØ© ÙÙˆØ±ÙŠØ© Ø¬ÙˆÙ„Ø¯ ÙØ§Ø®Ø±Ø© â€” Ø£ÙƒØ«Ø± Ù†Ø¹ÙˆÙ…Ø© ÙˆØ£Ø±Ù‚Ù‰ Ø¹Ø·Ø±Ø§Ù‹.',
    'nescafe',[284,568,1136],{ images:[IMG_CM], is_featured:true, flavor_notes:['Premium','Smooth'] }),

  // â”€â”€ Hot Chocolate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Prices not yet confirmed â€” products are hidden until admin sets correct prices
  mkProduct('hc-1','hot-chocolate-original','Hot Chocolate','Ù‡ÙˆØª Ø´ÙˆÙƒÙ„ÙŠØª',
    'Rich and creamy hot chocolate â€” coming soon.',
    'Ù‡ÙˆØª Ø´ÙˆÙƒÙ„ÙŠØª ØºÙ†ÙŠ ÙˆÙƒØ±ÙŠÙ…ÙŠ â€” Ù‚Ø±ÙŠØ¨Ø§Ù‹.',
    'hot-chocolate',[0,0,0],{ images:[IMG_HC], is_visible:false }),
]

// â”€â”€â”€ Flavor base options for customize-flavor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const flavorBaseOptions = CUSTOMIZE_FLAVOR_BASES

const CUSTOMIZE_FLAVOR_GROUPS = [
  { key: 'original', nameEn: 'Original LINE', nameAr: 'Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ', min: 1, max: 1 },
  { key: 'sweets', nameEn: 'sweets LINE', nameAr: 'Ø­Ù„ÙˆÙŠØ§Øª', min: 2, max: 8 },
  { key: 'nuts', nameEn: 'Nuts', nameAr: 'Ù…ÙƒØ³Ø±Ø§Øª', min: 9, max: 12 },
  { key: 'fruits', nameEn: 'Fruits', nameAr: 'ÙÙˆØ§ÙƒÙ‡', min: 13, max: 24 },
  { key: 'special', nameEn: 'Special Order', nameAr: 'Ø³ÙŠØ¨Ø´ÙŠÙ„ Ø£ÙˆØ±Ø¯Ø±', min: 25, max: 30 },
]

function getCustomizeFlavorGroup(sortOrder: number | undefined) {
  const order = Number(sortOrder || 0)
  return CUSTOMIZE_FLAVOR_GROUPS.find((group) => order >= group.min && order <= group.max) || CUSTOMIZE_FLAVOR_GROUPS[4]
}

const SIZE_OPTIONS: PackageSize[] = ['250g', '500g', '1kg']

function getFlavorBaseImage(baseId: string) {
  if (baseId === 'turkish-coffee') return IMG_TC
  if (baseId === 'cappuccino') return IMG_CAP
  return IMG_CM
}

function formatOptionName(language: 'en' | 'ar', item: { nameEn: string; nameAr: string }) {
  return language === 'ar' ? item.nameAr : item.nameEn
}

function getEqualBlendRatios(count: number) {
  if (count <= 0) return []

  const baseTenths = Math.floor(1000 / count)
  return Array.from({ length: count }, (_, index) => {
    if (index === count - 1) {
      return (1000 - baseTenths * (count - 1)) / 10
    }
    return baseTenths / 10
  })
}

function formatRatio(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function isOptionOutOfStock(option: {
  stockQuantity?: number
  isManuallyOutOfStock?: boolean
}) {
  return option.isManuallyOutOfStock === true ||
    (typeof option.stockQuantity === 'number' && option.stockQuantity <= 0)
}

function getFlavorAvailability(flavor: FlavorAdditionOption, baseId: string) {
  return flavor.availabilityByBase?.[baseId] ?? {
    stockQuantity: flavor.stockQuantity,
    lowStockThreshold: flavor.lowStockThreshold,
    isManuallyOutOfStock: flavor.isManuallyOutOfStock,
  }
}

// â”€â”€â”€ Make Your Espresso Blend Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MakeYourEspressoBlend() {
  const { t, language } = useLanguage()
  const { addItem, items } = useCartStore()
  const [blendMode, setBlendMode] = useState<'quick' | 'custom'>('quick')
  const [beanOptions, setBeanOptions] = useState<CoffeeBeanOption[]>(
    DEFAULT_CUSTOM_BLEND_BEANS.filter((bean) => bean.isVisible),
  )
  const [selectedBeans, setSelectedBeans] = useState<Array<CoffeeBeanOption & { percent: string }>>([])
  const [selectedSize, setSelectedSize] = useState<PackageSize>('250g')
  const [blendQuantity, setBlendQuantity] = useState(1)

  const groupedBeans = useMemo(() => {
    const visible = beanOptions.filter((bean) => bean.isVisible)
    return {
      arabica: visible.filter((bean) => bean.family === 'arabica'),
      robusta: visible.filter((bean) => bean.family === 'robusta'),
    }
  }, [beanOptions])

  const finalBlendBeans = useMemo(() => {
    const quickRatios = getEqualBlendRatios(selectedBeans.length)

    return selectedBeans.map((bean, index) => ({
      ...bean,
      finalPercent: blendMode === 'quick'
        ? quickRatios[index] ?? 0
        : Number(bean.percent || 0),
    }))
  }, [blendMode, selectedBeans])

  const ratioTotal = finalBlendBeans.reduce((sum, bean) => sum + bean.finalPercent, 0)
  const ratioIsValid = blendMode === 'quick'
    ? selectedBeans.length > 0
    : selectedBeans.length > 0
      && selectedBeans.every((bean) => Number(bean.percent || 0) > 0)
      && Math.round(ratioTotal * 10) / 10 === 100
  const totalPrice = finalBlendBeans.length > 0
    ? calculateBlendPrice(finalBlendBeans.map((bean) => ({ price: bean.price, percent: bean.finalPercent })), 'ratios', selectedSize, false)
    : 0
  const blendDisplayPrice = totalPrice * blendQuantity
  const blendPartEn = finalBlendBeans
    .map((bean) => `${bean.nameEn} ${formatRatio(bean.finalPercent)}%`)
    .join(' + ')
  const blendPartAr = finalBlendBeans
    .map((bean) => `${bean.nameAr} ${formatRatio(bean.finalPercent)}%`)
    .join(' + ')
  const blendKey = finalBlendBeans
    .map((bean) => `${bean.id}-${formatRatio(bean.finalPercent)}`)
    .join('-')
  const blendCartItem = finalBlendBeans.length > 0 ? {
    id: `espresso-blend-${blendKey}-${selectedSize}`,
    product_id: 'make-your-espresso-blend',
    name_en: 'Make Your Espresso Blend',
    name_ar: 'توليفة الإسبريسو الخاصة بك',
    size: selectedSize,
    price: totalPrice,
    quantity: blendQuantity,
    image: IMG_ESP,
    customizations: {
      type: 'espresso-blend',
      mode: blendMode,
      title_en: 'Make Your Espresso Blend',
      title_ar: 'توليفة الإسبريسو الخاصة بك',
      summary_en: blendPartEn,
      summary_ar: blendPartAr,
      beans: finalBlendBeans.map((bean) => ({
        id: bean.id,
        name_en: bean.nameEn,
        name_ar: bean.nameAr,
        family: bean.family,
        origin: bean.origin ?? null,
        percent: bean.finalPercent,
        stock_quantity: bean.stockQuantity ?? null,
        is_manually_out_of_stock: bean.isManuallyOutOfStock === true,
      })),
    },
  } : null
  const blendStockIssue = blendCartItem
    ? getCustomStockIssue(items, blendCartItem, blendQuantity)
    : null

  useEffect(() => {
    fetch('/api/customization-options', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const beans = d?.data?.beans
        if (Array.isArray(beans)) {
          setBeanOptions(beans)
          setSelectedBeans((current) => current.filter((bean) =>
            beans.some((item: CoffeeBeanOption) => item.id === bean.id && !isOptionOutOfStock(item))
          ))
        }
      })
      .catch(() => {})
  }, [])

  const toggleBean = (bean: CoffeeBeanOption) => {
    if (isOptionOutOfStock(bean)) {
      toast.error(t('This bean is out of stock', 'Ù‡Ø°Ø§ Ø§Ù„Ù†ÙˆØ¹ ØºÙŠØ± Ù…ØªØ§Ø­ Ø­Ø§Ù„ÙŠØ§Ù‹'))
      return
    }

    setSelectedBeans((prev) => {
      const exists = prev.some((item) => item.id === bean.id)
      return exists
        ? prev.filter((item) => item.id !== bean.id)
        : [...prev, { ...bean, percent: blendMode === 'custom' ? '0' : '' }]
    })
  }

  const handleBlendModeChange = (mode: 'quick' | 'custom') => {
    if (mode === blendMode) return

    if (mode === 'custom') {
      const quickRatios = getEqualBlendRatios(selectedBeans.length)
      setSelectedBeans((prev) => prev.map((bean, index) => ({
        ...bean,
        percent: formatRatio(quickRatios[index] ?? 0),
      })))
    }

    setBlendMode(mode)
  }

  const updateBeanPercent = (id: string, val: string) => {
    const rawValue = Number(val)
    const nextValue = val === '' || !Number.isFinite(rawValue)
      ? ''
      : String(Math.min(100, Math.max(0, rawValue)))
    setSelectedBeans((prev) => prev.map((bean) => (bean.id === id ? { ...bean, percent: nextValue } : bean)))
  }

  const handleAdd = () => {
    if (selectedBeans.length === 0) {
      toast.error(t('Select at least one bean', 'Ø§Ø®ØªØ± Ù†ÙˆØ¹ Ø¨Ù† ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„'))
      return
    }

    if (!ratioIsValid) {
      toast.error(t('Set ratios to exactly 100%', 'Ø§Ø¬Ø¹Ù„ Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„Ù†Ø³Ø¨ 100% Ø¨Ø§Ù„Ø¶Ø¨Ø·'))
      return
    }

    if (!blendCartItem) return

    if (blendStockIssue) {
      toast.error(t(blendStockIssue.messageEn, blendStockIssue.messageAr))
      return
    }

    addItem(blendCartItem)
    toast.success(t('Added to cart!', 'تمت الإضافة للسلة!'))
    return
  }


  const renderBeanGroup = (
    family: 'arabica' | 'robusta',
    titleEn: string,
    titleAr: string,
    descriptionEn: string,
    descriptionAr: string,
  ) => (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#B6885E]/15 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-[#D6A373]" />
            <h3 className="font-serif text-2xl font-bold text-[#F5E6D8]">{t(titleEn, titleAr)}</h3>
            <span className="rounded-full bg-[#B6885E]/12 px-3 py-1 text-xs font-semibold text-[#D6A373]">
              {groupedBeans[family].length} {t('Types', 'Ø£Ù†ÙˆØ§Ø¹')}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#D6B79A]/75">{t(descriptionEn, descriptionAr)}</p>
        </div>
      </div>

      <div className={cn('grid gap-3', family === 'arabica' ? 'md:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-5')}>
        {groupedBeans[family].map((bean) => {
          const selectedBean = finalBlendBeans.find((item) => item.id === bean.id)
          const selected = Boolean(selectedBean)
          const outOfStock = isOptionOutOfStock(bean)
          return (
            <article
              role="button"
              aria-disabled={outOfStock}
              tabIndex={outOfStock ? -1 : 0}
              key={bean.id}
              onClick={() => {
                if (!outOfStock) toggleBean(bean)
              }}
              onKeyDown={(event) => {
                if (!outOfStock && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  toggleBean(bean)
                }
              }}
              className={cn(
                'group relative min-h-32 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300',
                'bg-gradient-to-br from-[#1B140F]/90 to-[#0B0806]/88',
                outOfStock
                  ? 'cursor-not-allowed border-[#B6885E]/8 opacity-45 grayscale'
                  : selected
                    ? 'border-[#D6A373]/55 bg-[#B6885E]/9 shadow-[0_0_38px_rgba(182,136,94,0.18)] hover:-translate-y-1'
                    : 'border-[#B6885E]/16 hover:-translate-y-1 hover:border-[#D6A373]/38 hover:bg-[#B6885E]/5',
              )}
            >
              {outOfStock && (
                <div className="pointer-events-none absolute inset-0 z-10 bg-[#0B0806]/22" />
              )}
              {outOfStock && (
                <span className="absolute right-4 top-4 z-20 rounded-full border border-red-300/20 bg-red-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200">
                  {t('Out of Stock', 'ØºÙŠØ± Ù…ØªØ§Ø­')}
                </span>
              )}
              <div className="pointer-events-none absolute right-5 top-4 h-16 w-16 rounded-full bg-[#B6885E]/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-serif text-xl font-bold leading-tight text-[#F5E6D8]">
                      {formatOptionName(language, bean)}
                    </h4>
                    <span className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                      selected ? 'border-[#D6A373] bg-[#D6A373] text-[#0B0806]' : 'border-[#B6885E]/30 text-[#D6A373]',
                    )}>
                      {selected ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#D6B79A]/76">
                    {language === 'ar' ? bean.descAr : bean.descEn}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#D6A373]">
                    <span>{bean.origin || t('Premium origin', 'Ù…Ù†Ø´Ø£ ÙØ§Ø®Ø±')}</span>
                    <span>{bean.price} {t('EGP/kg', 'Ø¬.Ù…/ÙƒØ¬Ù…')}</span>
                  </div>
                  {selected && blendMode === 'custom' && (
                    <div
                      className="flex items-center gap-2 rounded-xl border border-[#D6A373]/18 bg-[#0B0806]/55 p-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedBeans.find((item) => item.id === bean.id)?.percent ?? ''}
                        onChange={(event) => updateBeanPercent(bean.id, event.target.value)}
                        placeholder="0"
                        className="h-9 border-[#B6885E]/18 bg-[#120D09]/80 text-center text-sm"
                      />
                      <span className="text-sm font-semibold text-[#D6A373]">%</span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )

  return (
    <div className="luxury-panel overflow-hidden rounded-2xl">
      <div className="border-b border-[#B6885E]/15 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#B6885E]/12 ring-1 ring-[#B6885E]/20">
              <Sparkles className="h-7 w-7 text-[#D6A373]" />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#F5E6D8] md:text-4xl">{t('Make Your Espresso Blend', 'Ø§ØµÙ†Ø¹ ØªÙˆÙ„ÙŠÙØ© Ø§Ù„Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ Ø§Ù„Ø®Ø§ØµØ© Ø¨Ùƒ')}</h2>
              <p className="mt-1 text-sm text-[#D6B79A]/75">{t('Choose espresso beans, then use quick balance or custom ratios.', 'Ø§Ø®ØªØ± Ø­Ø¨ÙˆØ¨ Ø§Ù„Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ Ø«Ù… Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø³Ø±ÙŠØ¹ Ø£Ùˆ Ø§Ù„Ù†Ø³Ø¨ Ø§Ù„Ù…Ø®ØµØµØ©.')}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2 rounded-2xl border border-[#B6885E]/15 bg-[#0B0806]/55 p-1 sm:max-w-md sm:grid-cols-2">
          {([
            { value: 'quick' as const, labelEn: 'Quick Select', labelAr: 'Ø§Ø®ØªÙŠØ§Ø± Ø³Ø±ÙŠØ¹' },
            { value: 'custom' as const, labelEn: 'Custom Ratios', labelAr: 'Ù†Ø³Ø¨ Ù…Ø®ØµØµØ©' },
          ]).map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => handleBlendModeChange(mode.value)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                blendMode === mode.value
                  ? 'bg-[#D6A373] text-[#0B0806] shadow-[0_8px_24px_rgba(182,136,94,0.18)]'
                  : 'text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8]',
              )}
            >
              {t(mode.labelEn, mode.labelAr)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
        <div className="space-y-8">
          {renderBeanGroup('arabica', 'Arabica', 'Ø£Ø±Ø§Ø¨ÙŠÙƒØ§', 'Smooth, aromatic and complex with lower bitterness.', 'Ù†Ø§Ø¹Ù…Ø© ÙˆØ¹Ø·Ø±ÙŠØ© ÙˆÙ…Ø¹Ù‚Ø¯Ø© Ø¨Ù…Ø±Ø§Ø±Ø© Ø£Ù‚Ù„.')}
          {renderBeanGroup('robusta', 'Robusta', 'Ø±ÙˆØ¨ÙˆØ³ØªØ§', 'Bold, rich and high-caffeine beans for stronger blends.', 'Ù‚ÙˆÙŠØ© ÙˆØºÙ†ÙŠØ© ÙˆØ¹Ø§Ù„ÙŠØ© Ø§Ù„ÙƒØ§ÙÙŠÙŠÙ† Ù„ØªÙˆÙ„ÙŠÙØ§Øª Ø£Ø«Ù‚Ù„.')}

          <section className="rounded-2xl border border-[#B6885E]/18 bg-[#120D09]/68 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B6885E]/12 ring-1 ring-[#B6885E]/22">
                  <Scale className="h-6 w-6 text-[#D6A373]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#D6A373]">
                    {blendMode === 'quick'
                      ? t('Auto Blend Ratios', 'Ù†Ø³Ø¨ ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù„Ù„ØªÙˆÙ„ÙŠÙØ©')
                      : t('Set Your Perfect Ratio', 'Ø­Ø¯Ø¯ Ù†Ø³Ø¨ØªÙƒ Ø§Ù„Ù…Ø«Ø§Ù„ÙŠØ©')}
                  </h3>
                  <p className="text-sm text-[#D6B79A]/72">
                    {blendMode === 'quick'
                      ? t('Selected beans are balanced evenly for an easy espresso blend.', 'ÙŠØªÙ… ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø­Ø¨ÙˆØ¨ Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© Ø¨Ø§Ù„ØªØ³Ø§ÙˆÙŠ Ù„ØªÙˆÙ„ÙŠÙØ© Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ Ø³Ù‡Ù„Ø©.')
                      : t('Adjust each selected bean until the total reaches 100%.', 'Ø§Ø¶Ø¨Ø· ÙƒÙ„ Ù†ÙˆØ¹ Ø¨Ù† Ø­ØªÙ‰ ÙŠØµÙ„ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø¥Ù„Ù‰ 100%.')}
                  </p>
                </div>
              </div>
              {blendMode === 'custom' && (
                <div className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold',
                  ratioIsValid ? 'border-[#D6A373]/25 bg-[#D6A373]/10 text-[#D6A373]' : 'border-red-400/25 bg-red-500/10 text-red-300',
                )}>
                  {t('Total', 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹')}: {formatRatio(ratioTotal || 0)}%
                </div>
              )}
            </div>

            {selectedBeans.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-[#B6885E]/28 px-4 py-6 text-center text-sm text-[#D6B79A]/65">
                {t('Selected beans will appear here.', 'Ø³ØªØ¸Ù‡Ø± Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ø¨Ù† Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© Ù‡Ù†Ø§.')}
              </p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {finalBlendBeans.map((bean) => (
                  <div key={bean.id} className="rounded-xl border border-[#B6885E]/14 bg-[#0B0806]/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#F5E6D8]">{formatOptionName(language, bean)}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-[#D6B79A]/45">{bean.family}</p>
                      </div>
                      <button type="button" onClick={() => toggleBean(bean)} className="rounded-full p-1 text-[#D6B79A]/55 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8]">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {blendMode === 'custom' && (
                      <p className="mt-3 text-sm font-semibold text-[#D6A373]">{formatRatio(bean.finalPercent)}%</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-[#B6885E]/18 bg-[#0B0806]/72 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] lg:sticky lg:top-28">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#D6A373]/75">{t('Live Price', 'Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ø¨Ø§Ø´Ø±')}</p>
            <p className="mt-2 font-serif text-4xl font-bold text-[#D6A373]">{blendDisplayPrice} {t('EGP', 'Ø¬.Ù…')}</p>
            <p className="mt-1 text-xs text-[#D6B79A]/58">{t('Updates instantly as you customize.', 'ÙŠØªØºÙŠØ± ÙÙˆØ±Ø§Ù‹ Ù…Ø¹ ÙƒÙ„ Ø§Ø®ØªÙŠØ§Ø±.')}</p>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-[#B6885E]/14 bg-[#120D09]/70 p-4">
                <p className="mb-3 text-sm font-semibold text-[#F5E6D8]">
                  {t(`Selected Beans (${selectedBeans.length})`, `Ø§Ù„Ø­Ø¨ÙˆØ¨ Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© (${selectedBeans.length})`)}
                </p>
                {selectedBeans.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[#B6885E]/18 px-3 py-3 text-center text-xs text-[#D6B79A]/50">
                    {t('Select beans to start your blend.', 'Ø§Ø®ØªØ± Ø­Ø¨ÙˆØ¨ Ù„Ø¨Ø¯Ø¡ Ø§Ù„ØªÙˆÙ„ÙŠÙØ©.')}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {finalBlendBeans.map((bean) => (
                      <div key={bean.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#B6885E]/12 bg-[#120D09]/55 px-3 py-2 text-xs">
                        <span className="truncate font-medium text-[#F5E6D8]/82">{formatOptionName(language, bean)}</span>
                        {blendMode === 'custom' && (
                          <span className="shrink-0 font-bold text-[#D6A373]">{formatRatio(bean.finalPercent)}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Weight', 'Ø§Ù„ÙˆØ²Ù†')}</p>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'rounded-xl border px-2 py-3 text-sm font-semibold transition-all duration-200',
                      selectedSize === size ? 'border-[#D6A373]/55 bg-[#D6A373] text-[#0B0806] shadow-[0_0_18px_rgba(182,136,94,0.22)]' : 'border-[#B6885E]/16 bg-[#120D09]/70 text-[#D6B79A] hover:border-[#D6A373]/38 hover:bg-[#B6885E]/8 hover:text-[#F5E6D8]',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Quantity', 'Ø§Ù„ÙƒÙ…ÙŠØ©')}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setBlendQuantity((q) => Math.max(1, q - 1))}
                  disabled={blendQuantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-base font-semibold text-[#F5E6D8]">{blendQuantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setBlendQuantity((q) => q + 1)}
                  disabled={!blendCartItem}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {selectedBeans.length > 0 && blendMode === 'custom' && !ratioIsValid && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {t('Total ratio must equal 100%', 'Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„Ù†Ø³Ø¨ ÙŠØ¬Ø¨ Ø£Ù† ÙŠØ³Ø§ÙˆÙŠ 100%')}
              </p>
            )}

            {blendStockIssue && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {t(blendStockIssue.messageEn, blendStockIssue.messageAr)}
              </p>
            )}

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={selectedBeans.length === 0 || !ratioIsValid || Boolean(blendStockIssue)}
              className="premium-button w-full gap-2 rounded-full"
            >
              <ShoppingBag className="h-5 w-5" />
              {t('Add to Cart', 'Ø£Ø¶Ù Ù„Ù„Ø³Ù„Ø©')}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

// â”€â”€â”€ Customize Flavor Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CustomizeFlavor() {
  const { t, language } = useLanguage()
  const { addItem, items } = useCartStore()
  const [baseOptions, setBaseOptions] = useState<FlavorBaseOption[]>(flavorBaseOptions)
  const [additionOptions, setAdditionOptions] = useState<FlavorAdditionOption[]>(customFlavorOptions)
  const [selectedBase, setSelectedBase] = useState<FlavorBaseOption>(flavorBaseOptions[0])
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorAdditionOption[]>([])
  const [selectedSize, setSelectedSize] = useState<PackageSize>('250g')
  const [flavorQuantity, setFlavorQuantity] = useState(1)
  const valveBag = false

  const filteredAdditions = useMemo(() => {
    return additionOptions.filter(
      (flavor) => !flavor.bases || flavor.bases.includes(selectedBase.id)
    )
  }, [additionOptions, selectedBase.id])

  const groupedFilteredAdditions = useMemo(() => {
    return CUSTOMIZE_FLAVOR_GROUPS
      .map((group) => ({
        group,
        flavors: filteredAdditions
          .filter((flavor) => getCustomizeFlavorGroup(flavor.sortOrder).key === group.key)
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
      }))
      .filter((entry) => entry.flavors.length > 0)
  }, [filteredAdditions])

  const totalPrice = selectedBase
    ? calculateFlavorPrice(selectedBase.price, selectedFlavors, selectedSize, valveBag)
    : 0
  const flavorDisplayPrice = totalPrice * flavorQuantity
  const selectedFlavorDeltaPerKg = selectedFlavors.reduce((sum, flavor) => sum + Number(flavor.price || 0), 0)
  const totalPricePerKg = Number(selectedBase?.price || 0) + selectedFlavorDeltaPerKg
  const flavorPartEn = selectedFlavors.map((flavor) => flavor.nameEn).join(' + ')
  const flavorPartAr = selectedFlavors.map((flavor) => flavor.nameAr).join(' + ')
  const flavorCartItem = selectedBase && selectedFlavors.length > 0 ? {
    id: `flavor-${selectedBase.id}-${selectedFlavors.map((flavor) => flavor.id).join('-')}-${selectedSize}-${valveBag ? 'valve' : 'plain'}`,
    product_id: `custom-flavor-${selectedBase.id}`,
    name_en: `Make Your Flavor - ${selectedBase.nameEn} - ${flavorPartEn}`,
    name_ar: `Ø§ØµÙ†Ø¹ Ù†ÙƒÙ‡ØªÙƒ Ø§Ù„Ø®Ø§ØµØ© - ${selectedBase.nameAr} - ${flavorPartAr}`,
    size: selectedSize,
    price: totalPrice,
    quantity: flavorQuantity,
    image: getFlavorBaseImage(selectedBase.id),
    customizations: {
      type: 'flavor',
      valve_bag: valveBag,
      base: {
        id: selectedBase.id,
        name_en: selectedBase.nameEn,
        name_ar: selectedBase.nameAr,
        raw_price: selectedBase.price,
      },
      flavors: selectedFlavors.map((flavor) => {
        const availability = getFlavorAvailability(flavor, selectedBase.id)

        return {
          id: flavor.id,
          name_en: flavor.nameEn,
          name_ar: flavor.nameAr,
          type: flavor.type,
          raw_price: flavor.price,
          stock_quantity: availability.stockQuantity ?? null,
          is_manually_out_of_stock: availability.isManuallyOutOfStock === true,
        }
      }),
    },
  } : null
  const flavorStockIssue = flavorCartItem
    ? getCustomStockIssue(items, flavorCartItem, flavorQuantity)
    : null

  const toggleFlavor = (flavor: FlavorAdditionOption) => {
    if (isOptionOutOfStock(getFlavorAvailability(flavor, selectedBase.id))) {
      toast.error(t('This flavor is out of stock', 'Ù‡Ø°Ù‡ Ø§Ù„Ù†ÙƒÙ‡Ø© ØºÙŠØ± Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§Ù‹'))
      return
    }

    setSelectedFlavors((prev) => {
      const exists = prev.some((item) => item.id === flavor.id)
      if (exists) return prev.filter((item) => item.id !== flavor.id)
      if (prev.length >= 3) {
        toast.error(t('Choose up to 3 flavors', 'Ø§Ø®ØªØ± Ø­ØªÙ‰ 3 Ù†ÙƒÙ‡Ø§Øª ÙÙ‚Ø·'))
        return prev
      }
      return [...prev, flavor]
    })
  }

  useEffect(() => {
    fetch('/api/customization-options', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const nextBases = d?.data?.flavorBases
        const nextAdditions = d?.data?.flavorAdditions

        if (Array.isArray(nextBases) && nextBases.length > 0) {
          setBaseOptions(nextBases)
          setSelectedBase((current) => nextBases.find((base) => base.id === current.id) || nextBases[0])
        }

        if (Array.isArray(nextAdditions)) {
          setAdditionOptions(nextAdditions)
          setSelectedFlavors((current) => current.filter((flavor) =>
            nextAdditions.some((item) =>
              item.id === flavor.id && !isOptionOutOfStock(getFlavorAvailability(item, selectedBase.id))
            )
          ))
        }
      })
      .catch(() => {})
  }, [])

  const handleAdd = () => {
    if (!selectedBase || selectedFlavors.length === 0) {
      toast.error(t('Choose a base and at least one flavor', 'Ø§Ø®ØªØ± Ù‚Ø§Ø¹Ø¯Ø© ÙˆÙ†ÙƒÙ‡Ø© ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„'))
      return
    }

    if (!flavorCartItem) return

    if (flavorStockIssue) {
      toast.error(t(flavorStockIssue.messageEn, flavorStockIssue.messageAr))
      return
    }

    addItem(flavorCartItem)
    toast.success(t('Added to cart!', 'ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ù„Ù„Ø³Ù„Ø©!'))
    return
  }


  return (
    <div className="luxury-panel overflow-hidden rounded-2xl">
      <div className="border-b border-[#B6885E]/15 p-5 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#B6885E]/12 ring-1 ring-[#B6885E]/20">
            <Sparkles className="h-7 w-7 text-[#D6A373]" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#F5E6D8] md:text-4xl">{t('Make Your Flavor', 'Ø§ØµÙ†Ø¹ Ù†ÙƒÙ‡ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©')}</h2>
            <p className="mt-1 text-sm text-[#D6B79A]/75">{t('Pick a base, then add up to 3 premium flavors.', 'Ø§Ø®ØªØ± Ø§Ù„Ù‚Ø§Ø¹Ø¯Ø© Ø«Ù… Ø£Ø¶Ù Ø­ØªÙ‰ 3 Ù†ÙƒÙ‡Ø§Øª ÙØ§Ø®Ø±Ø©.')}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-3">
              <Coffee className="h-5 w-5 text-[#D6A373]" />
              <h3 className="font-serif text-2xl font-bold text-[#F5E6D8]">{t('Choose Your Base', 'Ø§Ø®ØªØ± Ø§Ù„Ù‚Ø§Ø¹Ø¯Ø©')}</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {baseOptions.map((base) => {
                const selected = selectedBase.id === base.id
                const previewPrice = calculateFlavorPrice(base.price, [], selectedSize, valveBag)
                return (
                  <button
                    type="button"
                    key={base.id}
                    onClick={() => {
                    setSelectedBase(base)
                    setSelectedFlavors((prev) =>
                      prev.filter((f) => !f.bases || f.bases.includes(base.id))
                    )
                  }}
                    className={cn(
                      'relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1',
                      selected
                        ? 'border-[#D6A373]/55 bg-[#B6885E]/12 shadow-[0_0_38px_rgba(182,136,94,0.16)]'
                        : 'border-[#B6885E]/16 bg-[#120D09]/72 hover:border-[#D6A373]/35',
                    )}
                  >
                    <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#B6885E]/10 blur-2xl" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-serif text-xl font-bold text-[#F5E6D8]">{formatOptionName(language, base)}</h4>
                        {selected && <Check className="h-5 w-5 text-[#D6A373]" />}
                      </div>
                      <p className="mt-3 text-sm text-[#D6B79A]/68">{base.price} {t('EGP/kg', 'Ø¬.Ù…/ÙƒØ¬Ù…')}</p>
                      <p className="mt-1 text-xs text-[#D6A373]">{t('From', 'Ù…Ù†')} {previewPrice} {t('EGP', 'Ø¬.Ù…')}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-5 w-5 text-[#D6A373]" />
                  <h3 className="font-serif text-2xl font-bold text-[#F5E6D8]">{t('Choose Flavors', 'Ø§Ø®ØªØ± Ø§Ù„Ù†ÙƒÙ‡Ø§Øª')}</h3>
                </div>
                <p className="mt-1 text-sm text-[#D6B79A]/70">{t('Standard flavor adds 50 EGP/kg. Chunks add 70 EGP/kg.', 'Ø§Ù„Ù†ÙƒÙ‡Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ© ØªØ¶ÙŠÙ 50 Ø¬.Ù…/ÙƒØ¬Ù… ÙˆØ§Ù„Ù‚Ø·Ø¹ ØªØ¶ÙŠÙ 70 Ø¬.Ù…/ÙƒØ¬Ù….')}</p>
              </div>
              <span className="w-fit rounded-full border border-[#B6885E]/18 bg-[#120D09]/70 px-3 py-1 text-xs text-[#D6B79A]">
                {selectedFlavors.length}/3
              </span>
            </div>

            <div className="space-y-5">
              {groupedFilteredAdditions.map(({ group, flavors }) => (
                <div key={group.key}>
                  <h4 className="mb-2 font-serif text-lg font-bold text-[#F5E6D8]">
                    {t(group.nameEn, group.nameAr)}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {flavors.map((flavor) => {
                      const selected = selectedFlavors.some((item) => item.id === flavor.id)
                      const outOfStock = isOptionOutOfStock(getFlavorAvailability(flavor, selectedBase.id))
                      const disabled = outOfStock || (!selected && selectedFlavors.length >= 3)
                      return (
                        <button
                          type="button"
                          key={flavor.id}
                          onClick={() => {
                            if (!outOfStock) toggleFlavor(flavor)
                          }}
                          disabled={disabled}
                          className={cn(
                            'relative rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300',
                            selected
                              ? 'border-[#D6A373]/55 bg-[#D6A373] text-[#0B0806]'
                              : outOfStock
                                ? 'cursor-not-allowed border-[#B6885E]/8 bg-[#120D09]/35 text-[#D6B79A]/30 opacity-55 grayscale'
                                : disabled
                                  ? 'border-[#B6885E]/8 bg-[#120D09]/35 text-[#D6B79A]/28'
                                : 'border-[#B6885E]/14 bg-[#120D09]/76 text-[#D6B79A] hover:-translate-y-0.5 hover:border-[#D6A373]/35 hover:text-[#F5E6D8]',
                          )}
                        >
                          {selected && <Check className="mr-1 inline h-3.5 w-3.5" />}
                          {formatOptionName(language, flavor)}
                          <span className="ml-2 text-xs opacity-70">+{flavor.price}</span>
                          {outOfStock && (
                            <span className="ml-2 rounded-full bg-red-950/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-red-200">
                              {t('Out of Stock', 'ØºÙŠØ± Ù…ØªØ§Ø­')}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-[#B6885E]/18 bg-[#0B0806]/72 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] lg:sticky lg:top-28">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#D6A373]/75">{t('Live Price', 'Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ø¨Ø§Ø´Ø±')}</p>
            <p className="mt-2 font-serif text-4xl font-bold text-[#D6A373]">{flavorDisplayPrice} {t('EGP', 'Ø¬.Ù…')}</p>
            <p className="mt-1 text-xs text-[#D6B79A]/58">{t('Updates from your base, flavors, and selected weight.', 'ÙŠØªØ­Ø¯Ø« Ø­Ø³Ø¨ Ø§Ù„Ù‚Ø§Ø¹Ø¯Ø© ÙˆØ§Ù„Ù†ÙƒÙ‡Ø§Øª ÙˆØ§Ù„ÙˆØ²Ù† Ø§Ù„Ù…Ø®ØªØ§Ø±.')}</p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Weight', 'Ø§Ù„ÙˆØ²Ù†')}</p>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'rounded-xl border px-2 py-3 text-sm font-semibold transition-all duration-200',
                      selectedSize === size ? 'border-[#D6A373]/55 bg-[#D6A373] text-[#0B0806] shadow-[0_0_18px_rgba(182,136,94,0.22)]' : 'border-[#B6885E]/16 bg-[#120D09]/70 text-[#D6B79A] hover:border-[#D6A373]/38 hover:bg-[#B6885E]/8 hover:text-[#F5E6D8]',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#F5E6D8]">{t('Quantity', 'Ø§Ù„ÙƒÙ…ÙŠØ©')}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setFlavorQuantity((q) => Math.max(1, q - 1))}
                  disabled={flavorQuantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-base font-semibold text-[#F5E6D8]">{flavorQuantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setFlavorQuantity((q) => q + 1)}
                  disabled={!flavorCartItem}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#120D09]/70 text-[#D6B79A] transition-all duration-200 hover:border-[#D6A373]/40 hover:text-[#F5E6D8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#B6885E]/12 bg-[#120D09]/60 p-4">
              <p className="mb-3 text-sm font-semibold text-[#F5E6D8]">
                {t(`Selected Flavors (${selectedFlavors.length})`, `Ø§Ù„Ù†ÙƒÙ‡Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© (${selectedFlavors.length})`)}
              </p>
              <p className="mb-2.5 text-xs font-medium text-[#D6B79A]/60">
                {t('Base', 'Ø§Ù„Ù‚Ø§Ø¹Ø¯Ø©')}: <span className="text-[#F5E6D8]/80">{formatOptionName(language, selectedBase)}</span>
              </p>
              {selectedFlavors.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#B6885E]/18 px-3 py-3 text-center text-xs text-[#D6B79A]/50">
                  {t('No flavors selected yet.', 'Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ù†ÙƒÙ‡Ø§Øª Ø¨Ø¹Ø¯.')}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedFlavors.map((flavor) => (
                    <span key={flavor.id} className="rounded-full border border-[#D6A373]/32 bg-[#D6A373]/12 px-2.5 py-1 text-xs font-medium text-[#D6A373]">
                      {formatOptionName(language, flavor)}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 space-y-1 text-xs text-[#D6B79A]/62">
                <div className="flex items-center justify-between gap-3">
                  <span>{t('Base price', 'Ø³Ø¹Ø± Ø§Ù„Ù‚Ø§Ø¹Ø¯Ø©')}</span>
                  <span className="text-[#F5E6D8]/80">{selectedBase.price} {t('EGP/kg', 'Ø¬.Ù…/ÙƒØ¬Ù…')}</span>
                </div>
                {selectedFlavors.length > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span>{t('Flavor additions', 'Ø¥Ø¶Ø§ÙØ§Øª Ø§Ù„Ù†ÙƒÙ‡Ø§Øª')}</span>
                    <span className="text-[#F5E6D8]/80">+{selectedFlavorDeltaPerKg} {t('EGP/kg', 'Ø¬.Ù…/ÙƒØ¬Ù…')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-[#B6885E]/10 pt-1">
                  <span>{t('Total per kg', 'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù„Ù„ÙƒÙŠÙ„Ùˆ')}</span>
                  <span className="text-[#D6A373]">{totalPricePerKg} {t('EGP/kg', 'Ø¬.Ù…/ÙƒØ¬Ù…')}</span>
                </div>
              </div>
            </div>

            {flavorStockIssue && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {t(flavorStockIssue.messageEn, flavorStockIssue.messageAr)}
              </p>
            )}

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={!selectedBase || selectedFlavors.length === 0 || Boolean(flavorStockIssue)}
              className="premium-button w-full gap-2 rounded-full"
            >
              <ShoppingBag className="h-5 w-5" />
              {t('Add to Cart', 'Ø£Ø¶Ù Ù„Ù„Ø³Ù„Ø©')}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}


// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ProductsPageInner() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([])
  const [productsBanner, setProductsBanner] = useState<SiteMediaItem | null>(null)

  // Fetch categories from DB; fall back to hardcoded if DB is empty or unreachable
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length > 0) setDbCategories(d.data)
        else setDbCategories(FALLBACK_DB_CATEGORIES)
      })
      .catch(() => setDbCategories(FALLBACK_DB_CATEGORIES))
  }, [])

  useEffect(() => {
    let mounted = true

    fetch('/api/media?section_key=products_banner', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data) && json.data[0]?.image_url) {
          setProductsBanner(json.data[0])
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  // Fetch products from API first; use fallback only as a last-resort recovery path.
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const loadProducts = async () => {
      setProductsLoading(true)

      try {
        const response = await fetch('/api/products?limit=300', {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Products API failed')

        const data = await response.json()
        if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('Products API returned no products')
        }

        if (!cancelled) setProducts(data.data)
      } catch (error) {
        if (cancelled || (error instanceof Error && error.name === 'AbortError')) return
        setProducts(LAST_RESORT_PRODUCTS)
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }

    loadProducts()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  // Build sidebar categories from DB, injecting special UI entries
  const sidebarCategories = useMemo<SidebarCategory[]>(() => {
    const mainCats = dbCategories.map(c => ({
      slug: c.slug,
      nameEn: c.name_en,
      nameAr: c.name_ar,
    }))
    return [ALL_ENTRY, ...mainCats, CUSTOMIZE_BLEND_ENTRY, CUSTOMIZE_FLAVOR_ENTRY]
  }, [dbCategories])

  const currentCat = sidebarCategories.find((c) => c.slug === activeCategory)
  const isCustomizeBlend = currentCat?.isCustomizeBlend
  const isCustomizeFlavor = currentCat?.isCustomizeFlavor
  const isCustomize = isCustomizeBlend || isCustomizeFlavor

  const categorySlugById = useMemo(() => {
    const map = new Map<string, string>()
    dbCategories.forEach((category) => map.set(category.id, category.slug))
    return map
  }, [dbCategories])

  const filteredProducts = useMemo(() => {
    if (isCustomize) return []
    let nextProducts = [...products]

    if (activeCategory !== 'all') {
      nextProducts = nextProducts.filter((product) => {
        const catSlug =
          product.category?.slug ??
          (product.category_id ? categorySlugById.get(product.category_id) : undefined) ??
          product.category_id
        return catSlug === activeCategory
      })
    }

    // Classic / Original always sorts first within a category
    nextProducts.sort((a, b) => {
      const aFirst = /classic|original/i.test(a.name_en) ? 0 : 1
      const bFirst = /classic|original/i.test(b.name_en) ? 0 : 1
      return aFirst - bFirst
    })

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      nextProducts = nextProducts.filter((product) => product.name_en.toLowerCase().includes(q) || product.name_ar.includes(searchQuery))
    }

    return nextProducts
  }, [activeCategory, searchQuery, isCustomize, products, categorySlugById])

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    router.push(`/products?category=${slug}`, { scroll: false })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B0806' }}>
      {/* Hero Banner */}
      <div className="relative h-[45vh] min-h-[320px] flex items-center justify-center -mt-20 md:-mt-24 pt-20 md:pt-24" style={{ background: '#0B0806' }}>
        <Image
          src={productsBanner?.image_url || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600'}
          alt={language === 'ar' ? productsBanner?.alt_ar || productsBanner?.alt_en || 'Our Products' : productsBanner?.alt_en || productsBanner?.alt_ar || 'Our Products'}
          fill
          className="object-cover brightness-[0.58] contrast-[1.14] saturate-[1.08]"
          style={{ objectPosition: productsBanner ? getMediaObjectPosition(productsBanner) : 'center center' }}
          priority
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: productsBanner ? getMediaOverlayOpacity(productsBanner, 0.6) : 0.6 }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.08)_0%,_transparent_70%)]" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t(productsBanner?.title_en || 'Our Products', productsBanner?.title_ar || productsBanner?.title_en || 'Ù…Ù†ØªØ¬Ø§ØªÙ†Ø§')}
          </motion.h1>
          <motion.p initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {t(
              productsBanner?.subtitle_en || 'Discover our carefully curated selection of premium coffee.',
              productsBanner?.subtitle_ar || productsBanner?.subtitle_en || 'Ø§ÙƒØªØ´Ù Ù…Ø¬Ù…ÙˆØ¹ØªÙ†Ø§ Ø§Ù„Ù…Ù†ØªÙ‚Ø§Ø© Ù…Ù† Ø§Ù„Ù‚Ù‡ÙˆØ© Ø§Ù„ÙØ§Ø®Ø±Ø©.',
            )}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="luxury-panel sticky top-28 rounded-2xl p-4">
              <h2 className="font-serif text-lg font-semibold mb-4 px-2">{t('Categories', 'Ø§Ù„ÙØ¦Ø§Øª')}</h2>
              <nav className="space-y-1">
                {sidebarCategories.map((cat) => (
                  <button type="button" key={cat.slug} onClick={() => handleCategoryChange(cat.slug)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 border',
                      activeCategory === cat.slug ? 'font-medium scale-[1.02] border-[#D6A373]/30' : 'border-transparent text-[#D6B79A]/75 hover:border-[#B6885E]/20 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8] hover:scale-[1.01]',
                      (cat.isCustomizeBlend || cat.isCustomizeFlavor) && 'border-2 border-dashed border-primary/30'
                    )}
                    style={activeCategory === cat.slug ? {
                      background: 'linear-gradient(135deg, #B6885E 0%, #D6A373 100%)',
                      color: '#0B0806',
                      boxShadow: '0 4px 16px rgba(182,136,94,0.3)',
                    } : undefined}>
                    {(cat.isCustomizeBlend || cat.isCustomizeFlavor) && <Sparkles className="w-4 h-4 shrink-0" />}
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                    {activeCategory === cat.slug && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            {isCustomizeBlend ? (
              <MakeYourEspressoBlend />
            ) : isCustomizeFlavor ? (
              <CustomizeFlavor />
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="text" placeholder={t('Search products...', 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª...')}
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-[#B6885E]/20 bg-[#120D09]/70 pl-10 text-[#F5E6D8] placeholder:text-[#B79B85]/50 focus-visible:ring-[#B6885E]/30" />
                </div>

<div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">{t(`Showing ${filteredProducts.length} products`, `Ø¹Ø±Ø¶ ${filteredProducts.length} Ù…Ù†ØªØ¬`)}</p>
                </div>

                {productsLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="luxury-card overflow-hidden rounded-xl border border-[#B6885E]/[16%] bg-[#120D09]/70">
                        <div className="h-32 animate-pulse bg-[#2A1810]/60 min-[380px]:h-36 sm:h-40 lg:h-44" />
                        <div className="space-y-3 p-3 sm:p-4">
                          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#2A1810]/70" />
                          <div className="h-3 w-full animate-pulse rounded-full bg-[#2A1810]/50" />
                          <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#2A1810]/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <PackageSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="font-serif text-xl font-semibold mb-2">{t('No products found', 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ù…Ù†ØªØ¬Ø§Øª')}</h3>
                    <Button onClick={() => handleCategoryChange('all')}>{t('View All', 'Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„')}</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
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
      <div className="min-h-screen" style={{ background: '#0B0806' }}>
        <div className="relative h-[45vh] min-h-[320px] flex items-center justify-center -mt-20 md:-mt-24" style={{ background: '#0F0A07' }}>
          <div className="container mx-auto px-4 text-center">
            <div className="h-10 w-56 rounded-lg mx-auto" style={{ background: 'rgba(182,136,94,0.1)' }} />
          </div>
        </div>
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  )
}
