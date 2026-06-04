'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/context/language'
import { getMediaObjectPosition, type SectionBuilderContent, type SiteMediaItem, type WebsiteSectionConfig } from '@/lib/media'

type AboutJourneyProps = {
  section: WebsiteSectionConfig
  content: SectionBuilderContent
  media: SiteMediaItem | null
}

export function AboutJourney({ section, content, media }: AboutJourneyProps) {
  const { t } = useLanguage()
  const storyBody = t(
    content.body_en || content.subtitle_en || section.defaultSubtitleEn,
    content.body_ar || content.subtitle_ar || content.body_en || section.defaultSubtitleAr,
  )
  const storyBodyParagraphs = storyBody.split(/\n+/).map((item) => item.trim()).filter(Boolean)

  return (
    <section className="relative py-16 md:py-24" style={{ background: '#0B0806' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-[#B6885E]/60 to-transparent" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: '#B6885E' }}>
                {t(content.eyebrow_en || 'Our Journey', content.eyebrow_ar || content.eyebrow_en || 'Ø±Ø­Ù„ØªÙ†Ø§')}
              </p>
            </div>
            <h2 className="mb-6 font-serif text-3xl font-bold md:text-4xl" style={{ color: '#F5E6D8' }}>
              {t(content.title_en || section.defaultTitleEn, content.title_ar || content.title_en || section.defaultTitleAr)}
            </h2>
            <div className="space-y-4 leading-relaxed" style={{ color: 'rgba(183,155,133,0.72)' }}>
              {storyBodyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square overflow-hidden rounded-2xl"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(182,136,94,0.1)' }}
          >
            <Image
              src={media?.image_url || section.fallbackImage}
              alt={t(media?.alt_en || content.title_en || 'Coffee beans', media?.alt_ar || content.title_ar || media?.alt_en || 'Coffee beans')}
              fill
              sizes="(min-width: 1024px) 44vw, 92vw"
              loading="lazy"
              className="object-cover"
              style={{ objectPosition: media ? getMediaObjectPosition(media) : 'center center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#B6885E]/8 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0B0806]/40 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
