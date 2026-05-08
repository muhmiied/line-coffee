'use client'

import { motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import { ProductCard } from './product-card'
import { useLanguage } from '@/lib/context/language'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProductsGridProps {
  products: Product[]
}

export function ProductsGrid({ products }: ProductsGridProps) {
  const { t } = useLanguage()

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="font-serif text-xl font-semibold mb-2">
          {t('No products found', 'لم يتم العثور على منتجات')}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t(
            'Try adjusting your filters or search terms to find what you\'re looking for.',
            'حاول تعديل الفلاتر أو كلمات البحث للعثور على ما تبحث عنه.'
          )}
        </p>
        <Button asChild>
          <Link href="/products">{t('View All Products', 'عرض جميع المنتجات')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {t(
            `Showing ${products.length} products`,
            `عرض ${products.length} منتج`
          )}
        </p>
      </div>

      {/* Grid */}
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </div>
  )
}
