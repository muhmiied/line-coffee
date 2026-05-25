'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import { WordByWord } from '@/components/ui/motion-primitives'
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

// Only trust a string as Arabic if it actually contains Arabic characters.
// Prevents English text saved-as-Arabic (editor bug) from overriding proper fallbacks.
function realArabic(s: string | null | undefined): string {
  return s && /[؀-ۿ]/.test(s) ? s : ''
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
}

function elementTransform(layout: SectionBuilderLayout | undefined, elementId: string) {
  const position = layout?.elements?.[elementId]
  const x = Number(position?.x || 0)
  const y = Number(position?.y || 0)
  return x || y ? { transform: `translate(${x}px, ${y}px)` } : undefined
}

const fallbackSlides: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80',
    headingEn: 'Every Cup, a Story Worth Savoring',
    headingAr: 'كل فنجان قصةٌ تستحق التأمل',
    subheadingEn: 'Hand-selected beans, precision-roasted to unlock depth, warmth, and character in every sip.',
    subheadingAr: 'حبوب منتقاة بعناية، محمصة بدقة لتكشف العمق والدفء في كل رشفة.',
  },
  {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
    headingEn: 'The Art of the Perfect Blend',
    headingAr: 'فن التوليفة المثالية',
    subheadingEn: 'Rich, complex, and unmistakably Line Coffee — crafted for those who settle for nothing less.',
    subheadingAr: 'غنية ومعقدة لا تُنسى — صُنعت لمن لا يرضى إلا بالأفضل.',
  },
  {
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80',
    headingEn: 'Freshly Roasted, Delivered to Your Door',
    headingAr: 'تحميص طازج يصل إلى بابك',
    subheadingEn: 'Premium freshness delivered across Egypt — from our roaster straight to your kitchen.',
    subheadingAr: 'نضارة فاخرة توصّل في كل أنحاء مصر — من محمصتنا إلى مطبخك مباشرةً.',
  },
]
export function HeroSection() {
  const { t, dir } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<HeroSlide[] | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

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
              headingEn: content.title_en || item.title_en || fallbackSlides[index % fallbackSlides.length].headingEn,
              headingAr: realArabic(content.title_ar) || realArabic(item.title_ar) || fallbackSlides[index % fallbackSlides.length].headingAr,
              subheadingEn: content.subtitle_en || item.subtitle_en || fallbackSlides[index % fallbackSlides.length].subheadingEn,
              subheadingAr: realArabic(content.subtitle_ar) || realArabic(item.subtitle_ar) || fallbackSlides[index % fallbackSlides.length].subheadingAr,
              altEn: item.alt_en,
              altAr: item.alt_ar,
              objectPosition: getMediaObjectPosition(item),
              overlayOpacity: getMediaOverlayOpacity(item, 0.6),
              buttonTextEn: content.button_text_en || item.button_text_en,
              buttonTextAr: content.button_text_ar || item.button_text_ar,
              buttonLink: content.button_link || item.button_link || item.link_url,
              stats: content.stats,
              layout: getSectionBuilderLayout(heroSectionConfig, item),
              visualEffects: getVisualEffects(item),
              animationDuration: typeof item.animation_duration === 'number' && item.animation_duration > 0 ? item.animation_duration : 6000,
              titleScale: typeof content.title_scale === 'number' ? Math.min(1.6, Math.max(0.6, content.title_scale)) : undefined,
              subtitleScale: typeof content.subtitle_scale === 'number' ? Math.min(1.4, Math.max(0.6, content.subtitle_scale)) : undefined,
            }
          })

        setSlides(mediaSlides.length > 0 ? mediaSlides : fallbackSlides)
        setCurrentSlide(0)
      })
      .catch(() => {
        if (mounted) setSlides(fallbackSlides)
      })

    return () => {
      mounted = false
    }
  }, [])

  const currentHeroSlide = slides?.[currentSlide]
  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => slides ? (prev + 1) % slides.length : 0)
  const prevSlide = () => setCurrentSlide((prev) => slides ? (prev - 1 + slides.length) % slides.length : 0)

  const headingText = currentHeroSlide ? t(currentHeroSlide.headingEn, currentHeroSlide.headingAr) : ''
  const subheadingText = currentHeroSlide ? t(currentHeroSlide.subheadingEn, currentHeroSlide.subheadingAr) : ''
  const headingDir = /[؀-ۿ]/.test(headingText) ? 'rtl' : 'ltr'
  const imageAlt = currentHeroSlide ? t(currentHeroSlide.altEn || 'Coffee background', currentHeroSlide.altAr || currentHeroSlide.altEn || 'Coffee background') : 'Coffee background'
  const primaryButtonText = currentHeroSlide ? t(currentHeroSlide.buttonTextEn || 'Shop Now', realArabic(currentHeroSlide.buttonTextAr) || 'تسوق الآن') : ''
  const primaryButtonHref = currentHeroSlide?.buttonLink || '/products'
  const currentLayout = currentHeroSlide?.layout
  const titleScale = currentHeroSlide?.titleScale ?? 1
  const subtitleScale = currentHeroSlide?.subtitleScale ?? 1
  const heroStats = currentHeroSlide?.stats && currentHeroSlide.stats.length > 0
    ? currentHeroSlide.stats.filter((stat) => stat.is_active !== false)
    : [
        { id: 'countries', value: '15+', label_en: 'Countries Sourced', label_ar: 'دولة مصدر' },
        { id: 'customers', value: '50K+', label_en: 'Happy Customers', label_ar: 'عميل سعيد' },
        { id: 'arabica', value: '100%', label_en: 'Arabica Beans', label_ar: 'حبوب أرابيكا' },
      ]


  if (!currentHeroSlide || !slides) {
    return (
      <section
        ref={ref}
        className="relative flex h-[86svh] min-h-[620px] items-center overflow-hidden -mt-16 pt-28 pb-16 sm:-mt-[4.5rem] sm:pt-32 sm:pb-20 md:-mt-24 md:h-[86vh] md:min-h-[720px] md:max-h-[820px] md:pt-44 md:pb-28"
        style={{ background: '#0B0806' }}
      >
        <div className="absolute inset-0 bg-[#0B0806]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.10)_0%,_transparent_70%)]" />
      </section>
    )
  }

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

      {/* ── Slide backgrounds ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{ y }}
          className="absolute inset-0 z-0"
        >
          <HeroBackground
            image={currentHeroSlide.image}
            imageAlt={imageAlt}
            objectPosition={currentHeroSlide.objectPosition || (dir === 'rtl' ? 'left center' : 'right center')}
            overlayOpacity={currentHeroSlide.overlayOpacity ?? 0.6}
            visualEffects={currentHeroSlide.visualEffects}
            isRtl={dir === 'rtl'}
            priority={currentSlide === 0}
          />

        </motion.div>
      </AnimatePresence>

      {/* ── Hero content ── */}
      <motion.div style={{ opacity }} className="container mx-auto px-4 relative z-20">
        <div
          className={cn(
            'mx-auto flex max-w-7xl pt-2 md:pt-6',
            dir === 'rtl' ? 'justify-start text-right' : 'justify-start text-left'
          )}
          style={elementTransform(currentLayout, 'main-copy')}
        >
          <div className="max-w-[35rem] md:max-w-[38rem]">

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`heading-${currentSlide}`}
              dir={headingDir}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative mb-5 line-clamp-3 max-w-3xl font-serif text-4xl font-extrabold leading-[1.05] text-balance min-[380px]:text-5xl md:mb-6 md:text-6xl lg:text-7xl"
              style={{
                color: '#F5E6D8',
                textShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 80px rgba(182,136,94,0.15)',
                ...(titleScale !== 1 && { transform: `scale(${titleScale})`, transformOrigin: headingDir === 'rtl' ? 'top right' : 'top left' }),
              }}
            >
              <WordByWord text={headingText} />
            </motion.h1>
          </AnimatePresence>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="mb-8 line-clamp-2 max-w-xl text-base leading-relaxed text-pretty md:mb-10 md:text-lg"
            style={{ color: 'rgba(214,183,154,0.85)', ...(subtitleScale !== 1 && { transform: `scale(${subtitleScale})`, transformOrigin: dir === 'rtl' ? 'top right' : 'top left' }) }}
          >
            {subheadingText}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            {/* Primary — gold gradient */}
            <Link
              href={primaryButtonHref}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300"
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

            {/* Secondary — ghost with gold border */}
            <Link
              href="/about"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300"
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
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            className="mt-12 grid max-w-xl grid-cols-1 gap-4 border-t border-[#B6885E]/22 pt-7 min-[420px]:grid-cols-3 sm:gap-7 md:mt-14 md:pt-8"
          >
            {heroStats.map((stat) => {
              const numericValue = Number(String(stat.value).replace(/\D/g, ''))
              const suffix = String(stat.value).replace(/[0-9]/g, '')
              return (
                <div key={stat.id}>
                  <p className="font-serif text-2xl font-bold md:text-3xl" style={{ color: '#D6A373' }}>
                    {Number.isFinite(numericValue) ? <AnimatedCounter value={numericValue} suffix={suffix} /> : stat.value}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] md:text-xs" style={{ color: 'rgba(245,230,216,0.55)' }}>
                    {t(stat.label_en, stat.label_ar || stat.label_en)}
                  </p>
                </div>
              )
            })}
          </motion.div>

          </div>
        </div>
      </motion.div>

      {/* ── Slide nav arrows ── */}
      <div className="absolute inset-y-0 left-3 right-3 z-20 hidden items-center justify-between pointer-events-none sm:flex md:left-4 md:right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="pointer-events-auto h-11 w-11 rounded-full backdrop-blur-md text-white border transition-all duration-200"
          style={{
            background: 'rgba(24,18,13,0.55)',
            borderColor: 'rgba(182,136,94,0.25)',
          }}
        >
          <ChevronLeft className={cn('h-5 w-5', dir === 'rtl' && 'rotate-180')} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="pointer-events-auto h-11 w-11 rounded-full backdrop-blur-md text-white border transition-all duration-200"
          style={{
            background: 'rgba(24,18,13,0.55)',
            borderColor: 'rgba(182,136,94,0.25)',
          }}
        >
          <ChevronRight className={cn('h-5 w-5', dir === 'rtl' && 'rotate-180')} />
        </Button>
      </div>

      {/* ── Slide indicators ── */}
      <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 sm:flex md:right-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="rounded-full transition-all duration-400"
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
