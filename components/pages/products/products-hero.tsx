'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/context/language'
import { getMediaObjectPosition, getMediaOverlayOpacity, type SiteMediaItem } from '@/lib/media'
import { cn } from '@/lib/utils'

type ProductsHeroProps = {
  media: SiteMediaItem | null
  previewMode?: boolean
  previewOverrides?: {
    title?: string
    subtitle?: string
  }
}

export function ProductsHero({ media, previewMode = false, previewOverrides }: ProductsHeroProps) {
  const { t, language } = useLanguage()
  const titleEn = previewOverrides?.title ?? media?.title_en ?? 'Our Products'
  const titleAr = previewOverrides?.title ?? media?.title_ar ?? media?.title_en ?? 'منتجاتنا'
  const subtitleEn = previewOverrides?.subtitle ?? media?.subtitle_en ?? 'Discover our carefully curated selection of premium coffee.'
  const subtitleAr = previewOverrides?.subtitle ?? media?.subtitle_ar ?? media?.subtitle_en ?? 'اكتشف مجموعتنا المنتقاة من القهوة الفاخرة.'

  return (
    <div
      className={cn(
        'relative flex h-[45vh] min-h-[320px] items-center justify-center',
        previewMode ? 'pt-0' : '-mt-20 pt-20 md:-mt-24 md:pt-24',
      )}
      style={{ background: '#0B0806' }}
    >
      <Image
        src={media?.image_url || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600'}
        alt={language === 'ar' ? media?.alt_ar || media?.alt_en || 'Our Products' : media?.alt_en || media?.alt_ar || 'Our Products'}
        fill
        className="object-cover brightness-[0.58] contrast-[1.14] saturate-[1.08]"
        style={{ objectPosition: media ? getMediaObjectPosition(media) : 'center center' }}
        priority={!previewMode}
      />
      <div className="absolute inset-0 bg-black" style={{ opacity: media ? getMediaOverlayOpacity(media, 0.6) : 0.6 }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.08)_0%,_transparent_70%)]" />
      <div className="relative z-10 px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 font-serif text-4xl font-bold md:text-5xl lg:text-6xl"
        >
          {t(titleEn, titleAr)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-2xl text-lg text-white/90 md:text-xl"
        >
          {t(subtitleEn, subtitleAr)}
        </motion.p>
      </div>
    </div>
  )
}
