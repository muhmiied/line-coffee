'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { useLanguage } from '@/lib/context/language'
import { useSectionContent } from '@/lib/hooks/use-section-media'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getVisualEffects,
  GRAIN_SVG,
} from '@/lib/media'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

export function BestSellersSection() {
  const { t, dir } = useLanguage()
  const { media: sectionMedia, content: sectionContent } = useSectionContent('best_sellers')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const bgFx = getVisualEffects(sectionMedia)
  const bgFilter = buildEffectsFilter(bgFx)
  const overlayOpacity = sectionMedia ? getMediaOverlayOpacity(sectionMedia, 0.72) : 0.72
  const bgOverlay = buildOverlayGradient(bgFx.gradient_type, bgFx.overlay_color, overlayOpacity)
  const buttonHref = sectionContent.button_link || '/products?filter=best-seller'

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      if (!supabase) { setIsLoading(false); return }
      const { data } = await supabase
        .from('products')
        .select('*, sizes:product_sizes(*)')
        .eq('is_best_seller', true)
        .eq('is_visible', true)
        .limit(4)
      setProducts(data || [])
      setIsLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <section className="cinematic-section relative py-20 md:py-28 overflow-hidden bg-[#0d0600]">
      {sectionMedia?.image_url && (
        <>
          <Image
            src={sectionMedia.image_url}
            alt={sectionMedia.alt_en || sectionContent.title_en || ''}
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
            style={{ objectPosition: getMediaObjectPosition(sectionMedia), filter: bgFilter || undefined }}
            unoptimized
          />
          <div className="absolute inset-0" style={{ background: bgOverlay }} />
          {Number(bgFx.grain || 0) > 0.05 && (
            <div className="absolute inset-0 mix-blend-screen" style={{ opacity: Number(bgFx.grain), backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px' }} />
          )}
        </>
      )}

      {/* Ambient warm glow — center depth */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] rounded-full bg-[#3d1800]/25 blur-[80px]" />
      </div>

      {/* Top edge fade into previous section */}
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#0a0400]/60 to-transparent pointer-events-none" aria-hidden />
      {/* Bottom edge fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0a0400]/60 to-transparent pointer-events-none" aria-hidden />

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="text-center md:text-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-section-kicker mx-auto mb-5 md:mx-0"
            >
              <div className="hidden" />
              <span className="text-xs md:text-sm tracking-[0.24em] uppercase font-bold text-[#D6A373]">
                {t(sectionContent.eyebrow_en || 'Top Picks', sectionContent.eyebrow_ar || 'الأكثر اختياراً')}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="premium-heading-shimmer font-serif text-4xl md:text-5xl font-bold text-[#FFDCC2]"
            >
              {t(sectionContent.title_en || 'Best Sellers', sectionContent.title_ar || 'الأكثر مبيعاً')}
            </motion.h2>
            {(sectionContent.subtitle_en || sectionContent.subtitle_ar) && (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#D6B79A]/64">
                {t(sectionContent.subtitle_en || '', sectionContent.subtitle_ar || sectionContent.subtitle_en || '')}
              </p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href={buttonHref}
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium',
                'text-[#FFDCC2]/45 hover:text-[#FFDCC2]/80 transition-colors duration-200 group',
              )}
            >
              {t(sectionContent.button_text_en || 'View All Best Sellers', sectionContent.button_text_ar || 'عرض الأكثر مبيعاً')}
              <ArrowRight
                className={cn(
                  'h-4 w-4 transition-transform group-hover:translate-x-1',
                  dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                )}
              />
            </Link>
          </motion.div>
        </div>

        {/* ── Products grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
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
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
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
