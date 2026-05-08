'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'
import { useLanguage } from '@/lib/context/language'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

// Best seller products data
const bestSellerProducts: Product[] = [
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
    id: 'cap-classic',
    slug: 'cappuccino-classic',
    name_en: 'Cappuccino Classic',
    name_ar: 'كابتشينو كلاسيك',
    description_en: 'Creamy classic cappuccino mix',
    description_ar: 'كابتشينو كلاسيك كريمي',
    category_id: 'cappuccino',
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
  {
    id: 'fc-hazelnut',
    slug: 'flavored-coffee-hazelnut',
    name_en: 'Hazelnut Coffee',
    name_ar: 'قهوة بندق',
    description_en: 'Delicious hazelnut flavored coffee',
    description_ar: 'قهوة بنكهة البندق اللذيذة',
    category_id: 'flavored-coffee',
    images: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800'],
    origin: 'Egypt',
    roast_level: 'medium',
    flavor_notes: ['Hazelnut', 'Sweet'],
    is_featured: true,
    is_best_seller: true,
    is_new: false,
    is_visible: true,
    stock_quantity: 100,
    created_at: '',
    updated_at: '',
    sizes: [
      { id: 'fc-hz-250', product_id: 'fc-hazelnut', size: '250g', price: 100, compare_at_price: null, sku: null, is_available: true },
      { id: 'fc-hz-500', product_id: 'fc-hazelnut', size: '500g', price: 190, compare_at_price: null, sku: null, is_available: true },
      { id: 'fc-hz-1000', product_id: 'fc-hazelnut', size: '1kg', price: 360, compare_at_price: null, sku: null, is_available: true },
    ],
  },
  {
    id: 'hc-classic',
    slug: 'hot-chocolate-classic',
    name_en: 'Hot Chocolate Classic',
    name_ar: 'هوت شوكلت كلاسيك',
    description_en: 'Rich and creamy hot chocolate',
    description_ar: 'هوت شوكلت غني وكريمي',
    category_id: 'hot-chocolate',
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
]

export function BestSellersSection() {
  const { t, dir } = useLanguage()

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Glass/Crystal gradient background - cream tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F3] via-[#FFDCC2]/40 to-[#FFF5ED]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#522500]/5 via-transparent to-[#522500]/3" />
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/20 to-transparent" />
      {/* Crystal shine effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-primary font-medium mb-2"
            >
              <TrendingUp className="h-4 w-4" />
              {t('Top Picks', 'الأكثر اختياراً')}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl md:text-4xl font-bold text-balance"
            >
              {t('Best Sellers', 'الأكثر مبيعاً')}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" asChild className="group">
              <Link href="/products?filter=best-seller">
                {t('View All Best Sellers', 'عرض الأكثر مبيعاً')}
                <ArrowRight
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:translate-x-1',
                    dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                  )}
                />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Products Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
