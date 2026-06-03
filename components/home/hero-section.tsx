'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { cn, hasArabic } from '@/lib/utils'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import {
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getSectionBuilderContent,
  getSectionBuilderLayout,
  getVisualEffects,
  getWebsiteSection,
  type SectionBuilderLayout,
  type SectionStatBlock,
  type SiteMediaItem,
  type VisualEffects,
} from '@/lib/media'
import { HeroBackground } from '@/components/home/hero-background'

const heroSectionConfig = getWebsiteSection('hero')

function realArabic(s: string | null | undefined): string {
  return hasArabic(s) ? s! : ''
}

type HeroSlide = {
  image: string
  eyebrowEn?: string
  eyebrowAr?: string
  headingEn: string
  headingAr: string
  subheadingEn: string
  subheadingAr: string
  altEn?: string | null
  altAr?: string | null
  objectPosition?: string
  overlayOpacity?: number
  buttonTextEn?: string | null
  buttonTextAr?: string | null
  buttonLink?: string | null
  stats?: SectionStatBlock[]
  layout?: SectionBuilderLayout
  visualEffects?: VisualEffects
  animationDuration?: number
  titleScale?: number
  subtitleScale?: number
  titleWidth?: number
  textWidth?: number
  hiddenElements?: string[]
}

function elementTransform(layout: SectionBuilderLayout | undefined, elementId: string) {
  const position = layout?.elements?.[elementId]
  const x = elementId === 'main-copy' ? 0 : Number(position?.x || 0)
  const y = Number(position?.y || 0)
  return x || y ? { transform: `translate(${x}px, ${y}px)` } : undefined
}

const statLabelFallbacks: Record<string, string> = {
  'countries sourced': 'مصادر مختارة',
  'happy customers': 'عملاء سعداء',
  'arabica beans': 'حبوب أرابيكا',
  'origins curated': 'مصادر مختارة',
  'fresh roast window': 'نافذة تحميص طازج',
  'arabica focus': 'تركيز أرابيكا',
  'taste profiles': 'مسارات نكهة',
  'roast levels': 'درجات تحميص',
  'cups served': 'فنجان مُحضّر',
  'cairo dispatch': 'شحن داخل القاهرة',
  'peak freshness': 'ذروة النضارة',
  languages: 'لغتا خدمة',
  'blend paths': 'مسارات توليف',
  'flavor notes': 'لمسات نكهة',
  'your taste': 'على ذوقك',
}

function statLabel(stat: SectionStatBlock, language: string) {
  if (language !== 'ar') return stat.label_en
  if (realArabic(stat.label_ar)) return stat.label_ar
  return statLabelFallbacks[stat.label_en.toLowerCase()] || stat.label_en
}

const fallbackSlides: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80',
    eyebrowEn: 'Signature Roasts',
    eyebrowAr: 'تحميصات مميزة',
    headingEn: 'Coffee Crafted for Quiet Luxury',
    headingAr: 'قهوة مصممة لرفاهية هادئة',
    subheadingEn: 'Selected beans, slow-roasted for depth, warmth, and a finish that lingers beautifully.',
    subheadingAr: 'حبوب منتقاة بعناية، نحمصها بهدوء لتمنحك عمقًا ودفئًا ونهاية لا تُنسى.',
    buttonTextEn: 'Shop Coffee',
    buttonTextAr: 'تسوق القهوة',
    stats: [
      { id: 'origin', value: '15+', label_en: 'Origins Curated', label_ar: 'مصادر مختارة', is_active: true },
      { id: 'roast', value: '72h', label_en: 'Fresh Roast Window', label_ar: 'نافذة تحميص طازج', is_active: true },
      { id: 'arabica', value: '100%', label_en: 'Arabica Focus', label_ar: 'تركيز أرابيكا', is_active: true },
    ],
  },
  {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
    eyebrowEn: 'House Blends',
    eyebrowAr: 'توليفات البيت',
    headingEn: 'A Blend With a Softer Signature',
    headingAr: 'توليفة بنعومة تترك أثرها',
    subheadingEn: 'Balanced profiles for espresso, filter, and slow mornings at home.',
    subheadingAr: 'نكهات متوازنة للإسبريسو والفلتر وصباحات المنزل الهادئة.',
    buttonTextEn: 'Explore Blends',
    buttonTextAr: 'استكشف التوليفات',
    stats: [
      { id: 'profiles', value: '8', label_en: 'Taste Profiles', label_ar: 'مسارات نكهة', is_active: true },
      { id: 'craft', value: '3', label_en: 'Roast Levels', label_ar: 'درجات تحميص', is_active: true },
      { id: 'cups', value: '24K+', label_en: 'Cups Served', label_ar: 'فنجان مُحضّر', is_active: true },
    ],
  },
  {
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80',
    eyebrowEn: 'Fresh Delivery',
    eyebrowAr: 'توصيل طازج',
    headingEn: 'Roasted Fresh, Arriving With Care',
    headingAr: 'تحميص طازج يصل إليك بعناية',
    subheadingEn: 'From our roaster to your door across Egypt, packed to preserve aroma and comfort.',
    subheadingAr: 'من محمصتنا إلى بابك داخل مصر، بتغليف يحافظ على الرائحة ودفء التجربة.',
    buttonTextEn: 'Order Now',
    buttonTextAr: 'اطلب الآن',
    stats: [
      { id: 'delivery', value: '24h', label_en: 'Cairo Dispatch', label_ar: 'شحن داخل القاهرة', is_active: true },
      { id: 'freshness', value: '7d', label_en: 'Peak Freshness', label_ar: 'ذروة النضارة', is_active: true },
      { id: 'support', value: '2', label_en: 'Languages', label_ar: 'لغتا خدمة', is_active: true },
    ],
  },
  {
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1920&q=80',
    eyebrowEn: 'Custom Experience',
    eyebrowAr: 'تجربة مصممة لك',
    headingEn: 'Build Your Ritual, Bean by Bean',
    headingAr: 'اصنع طقسك الخاص حبةً بحبة',
    subheadingEn: 'Create an espresso blend or flavored coffee profile that feels unmistakably yours.',
    subheadingAr: 'كوّن توليفة إسبريسو أو نكهة قهوة تشبه ذوقك وتفاصيل يومك.',
    buttonTextEn: 'Create Your Blend',
    buttonTextAr: 'اصنع توليفتك',
    stats: [
      { id: 'custom', value: '4', label_en: 'Blend Paths', label_ar: 'مسارات توليف', is_active: true },
      { id: 'flavors', value: '12+', label_en: 'Flavor Notes', label_ar: 'لمسات نكهة', is_active: true },
      { id: 'control', value: '100%', label_en: 'Your Taste', label_ar: 'على ذوقك', is_active: true },
    ],
  },
]

export function HeroSection() {
  const { t, dir, language } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<HeroSlide[] | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    if (!slides || slides.length <= 1) return
    const duration = slides[currentSlide]?.animationDuration ?? 6000
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, duration)
    return () => clearTimeout(timer)
  }, [currentSlide, slides])

  useEffect(() => {
    let mounted = true
    fetch('/api/media?usage_area=hero', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return
        if (!Array.isArray(json?.data) || json.data.length === 0) {
          setSlides(fallbackSlides)
          return
        }
        const mediaSlides = (json.data as SiteMediaItem[])
          .filter((item) => item.image_url)
          .map((item, index): HeroSlide => {
            const content = getSectionBuilderContent(heroSectionConfig, item)
            return {
              image: item.image_url,
              eyebrowEn: content.eyebrow_en || fallbackSlides[index % fallbackSlides.length].eyebrowEn,
              eyebrowAr: realArabic(content.eyebrow_ar) || fallbackSlides[index % fallbackSlides.length].eyebrowAr,
              headingEn: content.title_en || item.title_en || fallbackSlides[index % fallbackSlides.length].headingEn,
              headingAr: realArabic(content.title_ar) || realArabic(item.title_ar) || fallbackSlides[index % fallbackSlides.length].headingAr,
              subheadingEn: content.subtitle_en || item.subtitle_en || fallbackSlides[index % fallbackSlides.length].subheadingEn,
              subheadingAr: realArabic(content.subtitle_ar) || realArabic(item.subtitle_ar) || fallbackSlides[index % fallbackSlides.length].subheadingAr,
              altEn: item.alt_en,
              altAr: item.alt_ar,
              objectPosition: getMediaObjectPosition(item),
              overlayOpacity: getMediaOverlayOpacity(item, 0.52),
              buttonTextEn: content.button_text_en || item.button_text_en,
              buttonTextAr: content.button_text_ar || item.button_text_ar,
              buttonLink: content.button_link || item.button_link || item.link_url,
              stats: content.stats,
              layout: getSectionBuilderLayout(heroSectionConfig, item),
              hiddenElements: content.hidden_elements || [],
              visualEffects: getVisualEffects(item),
              animationDuration: typeof item.animation_duration === 'number' && item.animation_duration > 0 ? item.animation_duration : 6000,
              titleScale: typeof content.title_scale === 'number' ? Math.min(1.25, Math.max(0.75, content.title_scale)) : undefined,
              subtitleScale: typeof content.subtitle_scale === 'number' ? Math.min(1.15, Math.max(0.75, content.subtitle_scale)) : undefined,
              titleWidth: typeof content.title_width === 'number' ? Math.min(920, Math.max(280, content.title_width)) : undefined,
              textWidth: typeof content.text_width === 'number' ? Math.min(920, Math.max(280, content.text_width)) : undefined,
            }
          })
        setSlides(mediaSlides.length > 0 ? mediaSlides : fallbackSlides)
        setCurrentSlide(0)
      })
      .catch(() => {
        if (mounted) setSlides(fallbackSlides)
      })
    return () => { mounted = false }
  }, [])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => slides ? (prev + 1) % slides.length : 0)
  const prevSlide = () => setCurrentSlide((prev) => slides ? (prev - 1 + slides.length) % slides.length : 0)

  if (!slides) {
    return (
      <section
        ref={ref}
        className="relative flex h-[86svh] min-h-[620px] items-center overflow-hidden -mt-16 pt-28 pb-16 sm:-mt-[4.5rem] sm:pt-32 sm:pb-20 md:-mt-24 md:h-[86vh] md:min-h-[720px] md:max-h-[820px] md:pt-44 md:pb-28"
        style={{ background: '#0B0806' }}
      >
        <div className="absolute inset-0 bg-[#0B0806]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 65%, rgba(182,136,94,0.10) 0%, transparent 70%)' }} />
      </section>
    )
  }

  const currentHeroSlide = slides[currentSlide]
  const headingText = t(currentHeroSlide.headingEn, currentHeroSlide.headingAr)
  const subheadingText = t(currentHeroSlide.subheadingEn, currentHeroSlide.subheadingAr)
  const eyebrowText = t(currentHeroSlide.eyebrowEn || '', currentHeroSlide.eyebrowAr || currentHeroSlide.eyebrowEn || '')
  const headingDir = hasArabic(headingText) ? 'rtl' : 'ltr'
  const hiddenElements = currentHeroSlide.hiddenElements || []
  const showEyebrow = !!eyebrowText
    && !['line coffee', 'لاين كوفي'].includes(eyebrowText.trim().toLowerCase())
    && !hiddenElements.includes('eyebrow')
  const showSubtitle = !hiddenElements.includes('subtitle')
  const showButtons = !hiddenElements.includes('buttons')
  const showStats = !hiddenElements.includes('stats')
  const imageAlt = t(currentHeroSlide.altEn || 'Coffee background', currentHeroSlide.altAr || currentHeroSlide.altEn || 'Coffee background')
  const primaryButtonText = t(currentHeroSlide.buttonTextEn || 'Shop Coffee', realArabic(currentHeroSlide.buttonTextAr) || 'تسوق القهوة')
  const primaryButtonHref = currentHeroSlide.buttonLink || '/products'
  const currentLayout = currentHeroSlide.layout
  const titleScale = currentHeroSlide.titleScale ?? 1
  const subtitleScale = currentHeroSlide.subtitleScale ?? 1
  const heroTitleWidth = currentHeroSlide.titleWidth ?? currentHeroSlide.textWidth
  const elStyle = (id: string) => {
    const pos = currentLayout?.elements?.[id]
    return pos?.x || pos?.y ? { transform: `translate(${Number(pos.x || 0)}px, ${Number(pos.y || 0)}px)` } : undefined
  }
  const heroStats = currentHeroSlide.stats && currentHeroSlide.stats.length > 0
    ? currentHeroSlide.stats.filter((stat) => stat.is_active !== false)
    : [
        { id: 'origin', value: '15+', label_en: 'Origins Curated', label_ar: 'مصادر مختارة' },
        { id: 'freshness', value: '72h', label_en: 'Fresh Roast Window', label_ar: 'نافذة تحميص طازج' },
        { id: 'arabica', value: '100%', label_en: 'Arabica Focus', label_ar: 'تركيز أرابيكا' },
      ]

  return (
    <section
      ref={ref}
      className="relative flex h-[86svh] min-h-[620px] items-center overflow-hidden -mt-16 pt-28 pb-16 sm:-mt-[4.5rem] sm:pt-32 sm:pb-20 md:-mt-24 md:h-[86vh] md:min-h-[720px] md:max-h-[820px] md:pt-44 md:pb-28"
      style={{ background: '#0B0806' }}
    >
      {/* ── Decorative coffee bean ── */}
      <div className="pointer-events-none absolute bottom-6 left-6 z-20 opacity-20">
        <svg viewBox="0 0 64 64" fill="#B6885E" className="h-16 w-16 md:h-20 md:w-20 -rotate-12">
          <path d="M31 6C18 10 10 23 15 35c5 13 19 22 31 18s18-18 12-30C53 11 42 4 31 6Zm2 8c8-2 17 4 20 12 3 9-1 19-10 22-8 3-18-3-21-12-3-8 2-19 11-22Z" />
        </svg>
      </div>

      {/* ── Slide backgrounds — crossfade independently ── */}
      <AnimatePresence>
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ y }}
          className="absolute inset-0 z-0"
        >
          <HeroBackground
            image={currentHeroSlide.image}
            imageAlt={imageAlt}
            objectPosition={currentHeroSlide.objectPosition || (dir === 'rtl' ? 'left center' : 'right center')}
            overlayOpacity={currentHeroSlide.overlayOpacity ?? 0.52}
            visualEffects={currentHeroSlide.visualEffects}
            isRtl={dir === 'rtl'}
            priority={currentSlide === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Hero content — entire block transitions as one unit ── */}
      <motion.div style={{ opacity }} className="relative z-20 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              'flex w-full pt-2 md:pt-6',
              dir === 'rtl' ? 'justify-end text-right' : 'justify-start text-left'
            )}
            style={elementTransform(currentLayout, 'main-copy')}
          >
            <div
              className={cn('max-w-[35rem] md:max-w-[38rem]', dir === 'rtl' ? 'ml-auto' : 'mr-auto')}
              style={heroTitleWidth ? { maxWidth: heroTitleWidth } : undefined}
            >
              {/* Eyebrow */}
              {showEyebrow && (
                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] md:text-sm"
                  style={{ color: '#D6A373', ...elStyle('eyebrow') }}
                >
                  {eyebrowText}
                </p>
              )}

              {/* Headline */}
              <h1
                dir={headingDir}
                aria-label={headingText}
                className="mb-5 line-clamp-3 font-serif font-extrabold leading-[0.98] text-balance md:mb-6"
                style={{
                  fontSize: 'clamp(2.8rem,5.4vw,5.8rem)',
                  color: '#F5E6D8',
                  textShadow: '0 2px 24px rgba(0,0,0,0.85)',
                  ...(titleScale !== 1 && { transform: `scale(${titleScale})`, transformOrigin: headingDir === 'rtl' ? 'top right' : 'top left' }),
                  ...elStyle('title'),
                }}
              >
                {headingText}
              </h1>

              {/* Subtitle */}
              {showSubtitle && (
                <p
                  className="mb-8 line-clamp-2 max-w-xl text-base leading-relaxed text-pretty md:mb-10 md:text-lg"
                  style={{
                    color: 'rgba(214,183,154,0.95)',
                    ...(subtitleScale !== 1 && { transform: `scale(${subtitleScale})`, transformOrigin: dir === 'rtl' ? 'top right' : 'top left' }),
                    ...elStyle('subtitle'),
                  }}
                >
                  {subheadingText}
                </p>
              )}

              {/* CTAs */}
              {showButtons && (
                <div dir={dir} className="flex flex-col gap-4 sm:flex-row" style={elStyle('buttons')}>
                  <Link
                    href={primaryButtonHref}
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 min-w-[9.5rem]"
                    style={{
                      background: 'linear-gradient(135deg, #B6885E 0%, #D6A373 100%)',
                      color: '#0B0806',
                      boxShadow: '0 4px 24px rgba(182,136,94,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 40px rgba(182,136,94,0.55), inset 0 1px 0 rgba(255,255,255,0.2)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 24px rgba(182,136,94,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {primaryButtonText}
                    <ArrowRight
                      className={cn(
                        'h-4 w-4 transition-transform group-hover:translate-x-1',
                        dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                      )}
                    />
                  </Link>

                  <Link
                    href="/about"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 min-w-[9.5rem]"
                    style={{
                      background: 'rgba(182,136,94,0.08)',
                      color: '#D6A373',
                      border: '1px solid rgba(182,136,94,0.35)',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(182,136,94,0.15)'
                      e.currentTarget.style.borderColor = 'rgba(182,136,94,0.6)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(182,136,94,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(182,136,94,0.35)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {t('Our Story', 'قصتنا')}
                  </Link>
                </div>
              )}

              {/* Stats row */}
              {showStats && (
                <div
                  className={cn(
                    'mt-12 grid max-w-xl grid-cols-1 gap-4 border-t border-[#B6885E]/22 pt-7 min-[420px]:grid-cols-3 sm:gap-7 md:mt-14 md:pt-8',
                    dir === 'rtl' ? 'ml-auto text-right' : 'mr-auto text-left'
                  )}
                  style={elStyle('stats')}
                >
                  {heroStats.map((stat) => {
                    const numericValue = Number(String(stat.value).replace(/\D/g, ''))
                    const suffix = String(stat.value).replace(/[0-9]/g, '')
                    return (
                      <div key={stat.id}>
                        <p dir="ltr" className="font-serif text-2xl font-bold md:text-3xl" style={{ color: '#D6A373' }}>
                          {Number.isFinite(numericValue) ? <AnimatedCounter value={numericValue} suffix={suffix} /> : stat.value}
                        </p>
                        <p
                          className={cn(
                            'mt-1 text-[11px] md:text-xs',
                            language === 'ar' ? 'tracking-normal' : 'uppercase tracking-[0.18em]'
                          )}
                          style={{ color: 'rgba(245,230,216,0.75)' }}
                        >
                          {statLabel(stat, language)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Slide nav arrows ── */}
      <div className="absolute inset-y-0 left-3 right-3 z-20 hidden items-center justify-between pointer-events-none sm:flex md:left-4 md:right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="pointer-events-auto h-11 w-11 rounded-full backdrop-blur-md text-white border transition-all duration-200"
          style={{ background: 'rgba(24,18,13,0.55)', borderColor: 'rgba(182,136,94,0.25)' }}
        >
          <ChevronLeft className={cn('h-5 w-5', dir === 'rtl' && 'rotate-180')} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="pointer-events-auto h-11 w-11 rounded-full backdrop-blur-md text-white border transition-all duration-200"
          style={{ background: 'rgba(24,18,13,0.55)', borderColor: 'rgba(182,136,94,0.25)' }}
        >
          <ChevronRight className={cn('h-5 w-5', dir === 'rtl' && 'rotate-180')} />
        </Button>
      </div>

      {/* ── Slide indicators ── */}
      <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 sm:flex md:right-6">
        {slides.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => goToSlide(index)}
            className="rounded-full transition-all duration-300"
            style={{
              width: '6px',
              height: currentSlide === index ? '32px' : '6px',
              background: currentSlide === index
                ? 'linear-gradient(180deg, #D6A373, #B6885E)'
                : 'rgba(245,230,216,0.25)',
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ── Bottom fade into next section ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, #0B0806, transparent)' }}
      />
    </section>
  )
}
