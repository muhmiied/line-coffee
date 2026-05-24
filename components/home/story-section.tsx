'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Leaf, Award, Heart, Coffee } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import {
  buildEffectsFilter,
  getMediaObjectPosition,
  getSectionBuilderContent,
  getSectionBuilderLayout,
  getVisualEffects,
  getWebsiteSection,
  GRAIN_SVG,
  type SectionBuilderLayout,
  type SiteMediaItem,
} from '@/lib/media'

const storySectionConfig = getWebsiteSection('about_lower')

const storyIcons = {
  leaf: Leaf,
  award: Award,
  heart: Heart,
  coffee: Coffee,
}

function elementTransform(layout: SectionBuilderLayout, elementId: string) {
  const position = layout.elements?.[elementId]
  const x = Number(position?.x || 0)
  const y = Number(position?.y || 0)
  return x || y ? { transform: `translate(${x}px, ${y}px)` } : undefined
}

export function StorySection() {
  const { t, dir } = useLanguage()
  const [storySlides, setStorySlides] = useState<SiteMediaItem[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['20%', '-20%'])

  useEffect(() => {
    let mounted = true

    fetch('/api/media?section_key=about_lower', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data)) {
          setStorySlides(json.data.filter((item: SiteMediaItem) => item.image_url))
          setCurrentSlide(0)
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (storySlides.length <= 1) return
    const duration = Number(storySlides[currentSlide]?.animation_duration || 6000)
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % storySlides.length)
    }, Number.isFinite(duration) ? duration : 6000)

    return () => window.clearInterval(timer)
  }, [currentSlide, storySlides])

  const storyMedia = storySlides[currentSlide] || null
  const storyContent = getSectionBuilderContent(storySectionConfig, storyMedia)
  const storyLayout = getSectionBuilderLayout(storySectionConfig, storyMedia)
  const storyFx = getVisualEffects(storyMedia)
  const storyHasFx = Object.keys(storyFx).length > 0
  const storyImgFilter = buildEffectsFilter(storyFx)
  const storyFxGrain = Number(storyFx.grain ?? 0)
  const storyFxVignette = Number(storyFx.vignette ?? 0)
  const storyFeatures = (storyContent.features || []).filter((item) => item.is_active !== false)
  const storyStats = (storyContent.stats || []).filter((item) => item.is_active !== false)
  const storyTitle = t(storyContent.title_en || storySectionConfig.defaultTitleEn, storyContent.title_ar || storyContent.title_en || storySectionConfig.defaultTitleAr)
  const storyEyebrow = t(storyContent.eyebrow_en || 'Our Story', storyContent.eyebrow_ar || storyContent.eyebrow_en || 'Ù‚ØµØªÙ†Ø§')
  const storyBody = t(storyContent.body_en || storyContent.subtitle_en || storySectionConfig.defaultSubtitleEn, storyContent.body_ar || storyContent.subtitle_ar || storyContent.body_en || storySectionConfig.defaultSubtitleAr)
  const storyButtonText = t(storyContent.button_text_en || 'Learn More About Us', storyContent.button_text_ar || storyContent.button_text_en || 'ØªØ¹Ø±Ù Ø¹Ù„ÙŠÙ†Ø§ Ø£ÙƒØ«Ø±')
  const storyButtonHref = storyContent.button_link || storyMedia?.button_link || storyMedia?.link_url || '/about'

  const values = [
    {
      icon: Leaf,
      titleEn: 'Sustainably Sourced',
      titleAr: 'مصادر مستدامة',
      descEn: 'Direct relationships with farmers ensuring fair trade and environmental responsibility.',
      descAr: 'علاقات مباشرة مع المزارعين تضمن التجارة العادلة والمسؤولية البيئية.',
    },
    {
      icon: Award,
      titleEn: 'Expert Roasting',
      titleAr: 'تحميص احترافي',
      descEn: "Small-batch roasting by master roasters to bring out each bean's unique character.",
      descAr: 'تحميص بكميات صغيرة من قبل محمصين محترفين لإبراز الطابع الفريد لكل حبة.',
    },
    {
      icon: Heart,
      titleEn: 'Passion for Quality',
      titleAr: 'شغف بالجودة',
      descEn: 'From farm to cup, every step is guided by our commitment to excellence.',
      descAr: 'من المزرعة إلى الكوب، كل خطوة موجهة بالتزامنا بالتميز.',
    },
  ]

  return (
    <section ref={ref} className="cinematic-section relative py-24 md:py-36 overflow-hidden" style={{ background: '#0F0A07' }}>

      {/* ── Cinematic background ── */}
      {/* Parallax coffee farm image */}
      <div className="absolute inset-0">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80"
            alt="Coffee farm"
            fill
            className="object-cover opacity-10"
          />
        </motion.div>
        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-[#0F0A07]/80" />
        {/* Warm radial glow — left side (content side) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_20%_50%,_rgba(182,136,94,0.09)_0%,_transparent_70%)]" />
        {/* Right image glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_50%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
      </div>

      {/* Gold edge lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20 xl:gap-24">

          {/* ── Content ── */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            style={elementTransform(storyLayout, 'story-copy')}
          >
            {/* Label */}
            <div className="premium-section-kicker mx-auto mb-5 lg:mx-0">
              <div className="hidden" />
              <p
                className="text-xs md:text-sm tracking-[0.24em] uppercase font-bold"
                style={{ color: '#D6A373' }}
              >
                {storyEyebrow}
              </p>
            </div>

            <h2
              className="premium-heading-shimmer font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-[1.1] text-center lg:text-start"
              style={{ color: '#F5E6D8' }}
            >
              {storyTitle}
            </h2>

            <p className="text-lg mb-10 text-pretty leading-relaxed" style={{ color: 'rgba(214,183,154,0.75)' }}>
              {storyBody}
            </p>

            {/* Values */}
            <div className="space-y-7 mb-10">
              {storyFeatures.map((value, index) => {
                const Icon = storyIcons[(value.icon || 'leaf') as keyof typeof storyIcons] || Leaf
                return (
                <motion.div
                  key={value.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="premium-info-card flex gap-4 group"
                  style={elementTransform(storyLayout, `feature-${value.id}`)}
                >
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'rgba(182,136,94,0.1)',
                      border: '1px solid rgba(182,136,94,0.28)',
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: '#B6885E' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#F5E6D8' }}>
                      {t(value.title_en, value.title_ar || value.title_en)}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(183,155,133,0.7)' }}>
                      {t(value.description_en || '', value.description_ar || value.description_en || '')}
                    </p>
                  </div>
                </motion.div>
              )})}
            </div>

            {/* CTA */}
            <Link
              href={storyButtonHref}
              className="premium-button-outline group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-wide"
            >
              {storyButtonText}
              <ArrowRight
                className={cn(
                  'h-4 w-4 transition-transform group-hover:translate-x-1',
                  dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                )}
              />
            </Link>
          </motion.div>

          {/* ── Image column ── */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
            style={elementTransform(storyLayout, 'story-image')}
          >
            <div className="absolute -inset-4 rounded-2xl bg-[#FFDCC2]/10 blur-3xl" />
            <div className="absolute -inset-1 rounded-2xl border border-[#FFDCC2]/10" />

            <div className="premium-image-card group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#FFDCC2]/15 bg-[#120D09] shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={storyMedia?.id || 'story-fallback'}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={storyMedia?.image_url || '/images/story.jpg'}
                    alt={t(storyMedia?.alt_en || 'Line Coffee premium Arabica and Robusta story', storyMedia?.alt_ar || storyMedia?.alt_en || 'Line Coffee premium Arabica and Robusta story')}
                    fill
                    sizes="(min-width: 1024px) 44vw, 92vw"
                    className={cn('object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]', !storyHasFx && 'brightness-[0.82] contrast-[1.12] saturate-[1.08]')}
                    style={{ objectPosition: storyMedia ? getMediaObjectPosition(storyMedia) : 'center center', ...(storyHasFx && storyImgFilter ? { filter: storyImgFilter } : {}) }}
                  />
                </motion.div>
              </AnimatePresence>
              {/* Cinematic warm grade and soft vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/78 via-[#0F0A07]/18 to-transparent" />
              {storyFxVignette > 0.05
                ? <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 34%, rgba(11,8,6,${storyFxVignette.toFixed(2)}) 100%)` }} />
                : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_34%,_rgba(11,8,6,0.58)_100%)]" />
              }
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFDCC2]/12 via-transparent to-[#522500]/32 mix-blend-soft-light" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFDCC2]/35 to-transparent" />
              {storyFxGrain > 0.05 && <div className="pointer-events-none absolute inset-0" style={{ opacity: storyFxGrain, backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '180px 180px', mixBlendMode: 'screen' }} />}
            </div>

            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className={cn(
                'luxury-panel absolute -bottom-6 rounded-2xl p-5 shadow-2xl',
                dir === 'rtl' ? '-right-4 md:-right-6' : '-left-4 md:-left-6'
              )}
              style={elementTransform(storyLayout, 'story-stats')}
            >
              <div className="flex items-center gap-5">
                {storyStats.slice(0, 3).map((stat, index) => (
                  <div key={stat.id} className="flex items-center gap-5">
                    <div className="text-center">
                      <p className="font-serif text-2xl font-bold" style={{ color: '#D6A373' }}>{stat.value}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(183,155,133,0.65)' }}>
                        {t(stat.label_en, stat.label_ar || stat.label_en)}
                      </p>
                    </div>
                    {index < Math.min(storyStats.length, 3) - 1 && (
                      <div className="w-px h-10" style={{ background: 'rgba(182,136,94,0.2)' }} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
