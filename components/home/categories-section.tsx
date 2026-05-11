'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import { SectionReveal, FadeUp, ImageReveal, StaggerContainer, WordByWord, viewportConfig } from '@/components/ui/motion-primitives'

const CUSTOMIZE_ENTRY = {
  slug: 'customize',
  nameEn: 'Customize Your Product',
  nameAr: 'صمم منتجك',
  image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop',
  isCustomize: true,
}

type DbCategory = {
  id: string
  slug: string
  name_en: string
  name_ar: string
  image_url: string | null
  sort_order: number
  is_visible: boolean
}

export function CategoriesSection() {
  const { t, dir } = useLanguage()
  const [categories, setCategories] = useState<Array<{
    slug: string; nameEn: string; nameAr: string; image: string; isCustomize?: boolean
  }>>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const mapped = (res.data as DbCategory[])
            .filter((c) => c.is_visible)
            .map((c) => ({
              slug: c.slug,
              nameEn: c.name_en,
              nameAr: c.name_ar,
              image: c.image_url ?? 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop',
            }))
          setCategories([...mapped, CUSTOMIZE_ENTRY])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <SectionReveal className="relative py-16 md:py-24 overflow-hidden">
      {/* Glass/Crystal gradient background - cream tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5ED] via-[#FFDCC2]/60 to-[#FFE8D6]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#522500]/5 via-transparent to-[#522500]/3" />
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/20 to-transparent" />
      {/* Crystal shine effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <FadeUp className="text-primary font-medium mb-2">
            {t('Browse by Category', 'تصفح حسب الفئة')}
          </FadeUp>
          <FadeUp className="font-serif text-3xl md:text-4xl font-bold">
            <WordByWord text={t('Shop by Category', 'تسوق حسب الفئة')} />
          </FadeUp>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <StaggerContainer
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4"
          >
            {categories.map((category) => (
              <ImageReveal key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className={cn(
                    'group relative block overflow-hidden rounded-xl aspect-[3/4]',
                    category.isCustomize && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  {/* Background Image */}
                  <Image
                    src={category.image}
                    alt={t(category.nameEn, category.nameAr)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent',
                    category.isCustomize && 'from-primary/90 via-primary/40'
                  )} />

                  {/* Customize Badge */}
                  {category.isCustomize && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {t('NEW', 'جديد')}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="font-serif text-base md:text-lg font-semibold text-white mb-1 text-center">
                      {t(category.nameEn, category.nameAr)}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                      <span>{category.isCustomize ? t('Create Now', 'ابدأ الآن') : t('Explore', 'استكشف')}</span>
                      <ArrowRight
                        className={cn(
                          'h-4 w-4 transition-transform group-hover:translate-x-1',
                          dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                        )}
                      />
                    </div>
                  </div>
                </Link>
              </ImageReveal>
            ))}
          </StaggerContainer>
        )}

        {/* Skeleton while loading */}
        {categories.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-primary/10 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </SectionReveal>
  )
}
