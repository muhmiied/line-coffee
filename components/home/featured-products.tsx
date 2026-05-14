'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { useLanguage } from '@/lib/context/language'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

export function FeaturedProducts() {
  const { t, dir } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, sizes:product_sizes(*)')
        .eq('is_featured', true)
        .eq('is_visible', true)
        .limit(4)

      setProducts(data || [])
      setIsLoading(false)
    }

    fetchProducts()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <section className="cinematic-section relative py-20 md:py-28 overflow-hidden bg-[#0d0600]">

      {/* Ambient warm glow */}
      <div className="absolute inset-0 brand-pattern-gold opacity-[0.05] pointer-events-none" aria-hidden />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#3d1800]/22 blur-[70px] pointer-events-none" aria-hidden />
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#0a0400]/60 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0a0400]/60 to-transparent pointer-events-none" aria-hidden />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="h-px w-8 bg-[#c8941a]/55" />
              <span className="text-[11px] tracking-[0.22em] uppercase font-semibold text-[#c8941a]/75">
                {t('Curated Selection', 'مجموعة مختارة')}
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="font-serif text-3xl md:text-4xl font-bold text-[#FFDCC2]"
            >
              {t('Featured Coffees', 'قهوة مميزة')}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#FFDCC2]/45 hover:text-[#FFDCC2]/80 transition-colors duration-200 group"
            >
              {t('View All Products', 'عرض جميع المنتجات')}
              <ArrowRight
                className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                  dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : ''
                }`}
              />
            </Link>
          </motion.div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="luxury-panel overflow-hidden rounded-2xl animate-pulse">
                <div className="aspect-[4/5] bg-[#2a1006]/50" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-[#2a1006]/50 rounded-full w-1/3" />
                  <div className="h-4 bg-[#2a1006]/50 rounded-full w-3/4" />
                  <div className="h-3 bg-[#2a1006]/50 rounded-full w-1/2" />
                  <div className="h-5 bg-[#2a1006]/50 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
