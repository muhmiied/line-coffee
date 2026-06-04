'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/context/language'
import { getMediaObjectPosition, type SectionBuilderContent, type SiteMediaItem, type WebsiteSectionConfig } from '@/lib/media'

type AboutHeroProps = {
  section: WebsiteSectionConfig
  content: SectionBuilderContent
  media: SiteMediaItem | null
}

export function AboutHero({ section, content, media }: AboutHeroProps) {
  const { t } = useLanguage()

  return (
    <div
      className="relative flex h-[55vh] min-h-[420px] items-center justify-center -mt-20 pt-20 md:-mt-24 md:pt-24"
      style={{ background: '#0B0806' }}
    >
      <Image
        src={media?.image_url || section.fallbackImage}
        alt={t(media?.alt_en || content.title_en || 'About Line Coffee', media?.alt_ar || content.title_ar || media?.alt_en || 'About Line Coffee')}
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: media ? getMediaObjectPosition(media) : 'center center' }}
        priority
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.1)_0%,_transparent_70%)]" />

      <div className="relative z-10 px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: '#B6885E' }}
        >
          {t(content.eyebrow_en || 'Since 2019', content.eyebrow_ar || content.eyebrow_en || 'Ù…Ù†Ø° 2019')}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 font-serif text-4xl font-bold md:text-5xl lg:text-6xl"
          style={{ color: '#F5E6D8', textShadow: '0 4px 32px rgba(0,0,0,0.6)' }}
        >
          {t(content.title_en || section.defaultTitleEn, content.title_ar || content.title_en || section.defaultTitleAr)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg md:text-xl"
          style={{ color: 'rgba(214,183,154,0.85)' }}
        >
          {t(
            content.subtitle_en || section.defaultSubtitleEn,
            content.subtitle_ar || content.subtitle_en || section.defaultSubtitleAr,
          )}
        </motion.p>
      </div>
    </div>
  )
}
