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

const FALLBACK_CATEGORIES = [
  { slug: 'turkish-coffee',  nameEn: 'Turkish Coffee',  nameAr: 'قهوة تركي',    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=1000&fit=crop' },
  { slug: 'espresso',        nameEn: 'Espresso',         nameAr: 'إسبريسو',       image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=1000&fit=crop' },
  { slug: 'flavored-coffee', nameEn: 'Flavored Coffee',  nameAr: 'قهوة نكهات',   image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=1000&fit=crop' },
  { slug: 'coffee-mix',      nameEn: 'Coffee Mix',       nameAr: 'كوفي ميكس',    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=1000&fit=crop' },
  { slug: 'cappuccino',      nameEn: 'Cappuccino',       nameAr: 'كابتشينو',      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=1000&fit=crop' },
  { slug: 'hot-chocolate',   nameEn: 'Hot Chocolate',    nameAr: 'هوت شوكلت',    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&h=1000&fit=crop' },
]

export function CategoriesSection() {
  const { t, dir } = useLanguage()
  const [categories, setCategories] = useState<Array<{
    slug: string; nameEn: string; nameAr: string; image: string; isCustomize?: boolean
  }>>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = (res.data as DbCategory[])
            .filter((c) => c.is_visible)
            .map((c) => ({
              slug: c.slug,
              nameEn: c.name_en,
              nameAr: c.name_ar,
              image: c.image_url ?? 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop',
            }))
          setCategories([...(mapped.length > 0 ? mapped : FALLBACK_CATEGORIES), CUSTOMIZE_ENTRY])
        } else {
          setCategories([...FALLBACK_CATEGORIES, CUSTOMIZE_ENTRY])
        }
      })
      .catch(() => {
        setCategories([...FALLBACK_CATEGORIES, CUSTOMIZE_ENTRY])
      })
      .finally(() => setLoaded(true))
  }, [])

  return (
    <SectionReveal className="cinematic-section relative py-20 md:py-28 overflow-hidden" style={{ background: '#0F0A07' }}>

      {/* Cinematic background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,_rgba(182,136,94,0.08)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,_rgba(182,136,94,0.05)_0%,_transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#B6885E]/60" />
              <span className="text-xs md:text-sm tracking-[0.24em] uppercase font-bold" style={{ color: '#D6A373' }}>
                {t('Browse by Category', 'تصفح حسب الفئة')}
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#B6885E]/60" />
            </div>
          </FadeUp>
          <FadeUp>
            <h2 className="premium-heading-shimmer font-serif text-4xl md:text-5xl font-bold leading-[1.18]" style={{ color: '#F5E6D8' }}>
              <WordByWord text={t('Shop by Category', 'تسوق حسب الفئة')} />
            </h2>
          </FadeUp>
        </div>

        {/* Categories Grid */}
        {loaded && categories.length > 0 && (
          <StaggerContainer
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4"
          >
            {categories.map((category) => (
              <ImageReveal key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className={cn(
                    'premium-image-card group relative block aspect-[3/4] overflow-hidden rounded-xl',
                    category.isCustomize && 'ring-1 ring-[#B6885E]/50'
                  )}
                >
                  {/* Background Image */}
                  <Image
                    src={category.image}
                    alt={t(category.nameEn, category.nameAr)}
                    fill
                    className="object-cover brightness-[0.82] contrast-[1.08] saturate-[1.04] transition-all duration-700 group-hover:scale-110 group-hover:brightness-[0.9]"
                  />

                  {/* Cinematic overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-500" />
                  {/* Warm tone cast */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#B6885E]/10 to-transparent" />
                  {/* Bottom gradient */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-t from-[#0B0806]/92 via-[#0B0806]/30 to-transparent',
                    category.isCustomize && 'from-[#1B0D05]/95 via-[#B6885E]/20'
                  )} />
                  {/* Gold border on hover */}
                  <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-1 ring-[#B6885E]/40 transition-all duration-400" />

                  {/* Customize Badge */}
                  {category.isCustomize && (
                    <div
                      className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-1"
                      style={{
                        background: 'linear-gradient(135deg, #B6885E, #D6A373)',
                        color: '#0B0806',
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      {t('NEW', 'جديد')}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3
                      className="font-serif text-sm md:text-base font-semibold text-center mb-1.5 leading-snug"
                      style={{ color: '#F5E6D8' }}
                    >
                      {t(category.nameEn, category.nameAr)}
                    </h3>
                    <div
                      className="flex items-center justify-center gap-1 text-xs transition-all duration-300 group-hover:gap-2"
                      style={{ color: 'rgba(214,163,115,0.75)' }}
                    >
                      <span>{category.isCustomize ? t('Create Now', 'ابدأ الآن') : t('Explore', 'استكشف')}</span>
                      <ArrowRight
                        className={cn(
                          'h-3.5 w-3.5 transition-transform group-hover:translate-x-1',
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
        {!loaded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl animate-pulse"
                style={{ background: 'rgba(182,136,94,0.06)' }}
              />
            ))}
          </div>
        )}

      </div>
    </SectionReveal>
  )
}
