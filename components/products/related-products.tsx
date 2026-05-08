'use client'

import { motion } from 'framer-motion'
import { ProductCard } from './product-card'
import { useLanguage } from '@/lib/context/language'
import type { Product } from '@/lib/types'

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const { t } = useLanguage()

  return (
    <section className="container mx-auto px-4 py-16 border-t">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-serif text-2xl md:text-3xl font-bold mb-8 text-center"
      >
        {t('You May Also Like', 'قد يعجبك أيضاً')}
      </motion.h2>

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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </section>
  )
}
