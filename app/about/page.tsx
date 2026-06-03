'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Coffee, Heart, Award, Users } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { getMediaObjectPosition, getSectionBuilderContent, getWebsiteSection, type SiteMediaItem } from '@/lib/media'

const aboutTopSectionConfig = getWebsiteSection('about_top')
const aboutStorySectionConfig = getWebsiteSection('about_story')
const aboutValuesSectionConfig = getWebsiteSection('about_values')

const stats = [
  { icon: Coffee, valueEn: '2015', valueAr: '٢٠١٥', labelEn: 'Family Business Roots', labelAr: 'جذور مشروع عائلي' },
  { icon: Award, valueEn: '28', valueAr: '٢٨', labelEn: 'Years at Bon Al Orouba', labelAr: 'سنة في بن العروبة' },
  { icon: Users, valueEn: 'Supply', valueAr: 'توريد', labelEn: 'Built for Cafes', labelAr: 'خبرة مع المقاهي' },
  { icon: Heart, valueEn: 'Online', valueAr: 'أونلاين', labelEn: 'Now Serving Direct', labelAr: 'خدمة مباشرة الآن' },
]

export default function AboutPage() {
  const { t } = useLanguage()
  const [aboutTopMedia, setAboutTopMedia] = useState<SiteMediaItem | null>(null)
  const [aboutStoryMedia, setAboutStoryMedia] = useState<SiteMediaItem | null>(null)
  const [aboutValuesMedia, setAboutValuesMedia] = useState<SiteMediaItem | null>(null)

  useEffect(() => {
    let mounted = true

    Promise.all([
      fetch('/api/media?section_key=about_top', { cache: 'no-store' }).then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/media?section_key=about_story', { cache: 'no-store' }).then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/media?section_key=about_values', { cache: 'no-store' }).then((res) => res.json()).catch(() => ({ data: [] })),
    ]).then(([topRes, storyRes, valuesRes]) => {
      if (!mounted) return
      if (Array.isArray(topRes?.data) && topRes.data[0]) setAboutTopMedia(topRes.data[0])
      if (Array.isArray(storyRes?.data) && storyRes.data[0]) setAboutStoryMedia(storyRes.data[0])
      if (Array.isArray(valuesRes?.data) && valuesRes.data[0]) setAboutValuesMedia(valuesRes.data[0])
    })

    return () => {
      mounted = false
    }
  }, [])

  const aboutTopContent = getSectionBuilderContent(aboutTopSectionConfig, aboutTopMedia)
  const aboutStoryContent = getSectionBuilderContent(aboutStorySectionConfig, aboutStoryMedia)
  const aboutValuesContent = getSectionBuilderContent(aboutValuesSectionConfig, aboutValuesMedia)
  const storyBody = t(
    aboutStoryContent.body_en || aboutStoryContent.subtitle_en || aboutStorySectionConfig.defaultSubtitleEn,
    aboutStoryContent.body_ar || aboutStoryContent.subtitle_ar || aboutStoryContent.body_en || aboutStorySectionConfig.defaultSubtitleAr,
  )
  const storyBodyParagraphs = storyBody.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  const valueCards = (aboutValuesContent.features || []).filter((item) => item.is_active !== false).slice(0, 3)

  return (
    <div className="min-h-screen" style={{ background: '#0B0806' }}>

      {/* Hero */}
      <div
        className="relative h-[55vh] min-h-[420px] flex items-center justify-center -mt-20 md:-mt-24 pt-20 md:pt-24"
        style={{ background: '#0B0806' }}
      >
        <Image
          src={aboutTopMedia?.image_url || aboutTopSectionConfig.fallbackImage}
          alt={t(aboutTopMedia?.alt_en || aboutTopContent.title_en || 'About Line Coffee', aboutTopMedia?.alt_ar || aboutTopContent.title_ar || aboutTopMedia?.alt_en || 'About Line Coffee')}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: aboutTopMedia ? getMediaObjectPosition(aboutTopMedia) : 'center center' }}
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.1)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-4"
            style={{ color: '#B6885E' }}
          >
            {t(aboutTopContent.eyebrow_en || 'Since 2019', aboutTopContent.eyebrow_ar || aboutTopContent.eyebrow_en || 'منذ 2019')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ color: '#F5E6D8', textShadow: '0 4px 32px rgba(0,0,0,0.6)' }}
          >
            {t(aboutTopContent.title_en || aboutTopSectionConfig.defaultTitleEn, aboutTopContent.title_ar || aboutTopContent.title_en || aboutTopSectionConfig.defaultTitleAr)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'rgba(214,183,154,0.85)' }}
          >
            {t(
              aboutTopContent.subtitle_en || aboutTopSectionConfig.defaultSubtitleEn,
              aboutTopContent.subtitle_ar || aboutTopContent.subtitle_en || aboutTopSectionConfig.defaultSubtitleAr,
            )}
          </motion.p>
        </div>
      </div>

      {/* Stats Strip — cinematic gold */}
      <div className="relative py-12 md:py-16" style={{ background: '#0F0A07' }}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/15 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'rgba(182,136,94,0.08)',
                      border: '1px solid rgba(182,136,94,0.22)',
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: '#B6885E' }} />
                  </div>
                  <div
                    className="font-serif text-3xl md:text-4xl font-bold mb-1"
                    style={{ color: '#D6A373' }}
                  >
                    {t(stat.valueEn, stat.valueAr)}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(183,155,133,0.65)' }}>
                    {t(stat.labelEn, stat.labelAr)}
                  </div>
                  <div className="mx-auto mt-3 h-px w-8 bg-gradient-to-r from-transparent via-[#B6885E]/40 to-transparent" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="relative py-16 md:py-24" style={{ background: '#0B0806' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gradient-to-r from-[#B6885E]/60 to-transparent" />
                <p className="text-[11px] tracking-[0.24em] uppercase font-semibold" style={{ color: '#B6885E' }}>
                  {t(aboutStoryContent.eyebrow_en || 'Our Journey', aboutStoryContent.eyebrow_ar || aboutStoryContent.eyebrow_en || 'رحلتنا')}
                </p>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6" style={{ color: '#F5E6D8' }}>
                {t(aboutStoryContent.title_en || aboutStorySectionConfig.defaultTitleEn, aboutStoryContent.title_ar || aboutStoryContent.title_en || aboutStorySectionConfig.defaultTitleAr)}
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
              className="relative aspect-square rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(182,136,94,0.1)' }}
            >
              <Image
                src={aboutStoryMedia?.image_url || aboutStorySectionConfig.fallbackImage}
                alt={t(aboutStoryMedia?.alt_en || aboutStoryContent.title_en || 'Coffee beans', aboutStoryMedia?.alt_ar || aboutStoryContent.title_ar || aboutStoryMedia?.alt_en || 'Coffee beans')}
                fill
                sizes="(min-width: 1024px) 44vw, 92vw"
                loading="lazy"
                className="object-cover"
                style={{ objectPosition: aboutStoryMedia ? getMediaObjectPosition(aboutStoryMedia) : 'center center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#B6885E]/8 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0B0806]/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 md:py-24" style={{ background: '#0F0A07' }}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: '#B6885E' }}>
                {t(aboutValuesContent.eyebrow_en || 'What We Stand For', aboutValuesContent.eyebrow_ar || aboutValuesContent.eyebrow_en || 'ما نؤمن به')}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F5E6D8' }}>
                {t(aboutValuesContent.title_en || aboutValuesSectionConfig.defaultTitleEn, aboutValuesContent.title_ar || aboutValuesContent.title_en || aboutValuesSectionConfig.defaultTitleAr)}
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: 'rgba(183,155,133,0.72)' }}>
                {t(aboutValuesContent.subtitle_en || aboutValuesSectionConfig.defaultSubtitleEn, aboutValuesContent.subtitle_ar || aboutValuesContent.subtitle_en || aboutValuesSectionConfig.defaultSubtitleAr)}
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {valueCards.map((value, index) => (
              <motion.div
                key={value.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: 'rgba(24,18,13,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(182,136,94,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(182,136,94,0.1)',
                    border: '1px solid rgba(182,136,94,0.25)',
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: '#B6885E' }}>
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3" style={{ color: '#F5E6D8' }}>
                  {t(value.title_en, value.title_ar || value.title_en)}
                </h3>
                <p className="leading-relaxed" style={{ color: 'rgba(183,155,133,0.72)' }}>
                  {t(value.description_en || '', value.description_ar || value.description_en || '')}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
