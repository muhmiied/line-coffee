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

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80',
    headingEn: 'Experience Coffee Like Never Before',
    headingAr: 'اختبر القهوة كما لم تفعل من قبل',
    subheadingEn: 'Discover our carefully sourced single-origin beans and signature blends, roasted to perfection for the ultimate coffee experience.',
    subheadingAr: 'اكتشف حبوبنا من الأصل الواحد المختارة بعناية وخلطاتنا المميزة، المحمصة بإتقان لتجربة القهوة المثالية.',
  },
  {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
    headingEn: 'Crafted With Passion & Precision',
    headingAr: 'مصنوعة بشغف وإتقان',
    subheadingEn: 'From the finest farms to your cup, we bring you exceptional quality with every sip.',
    subheadingAr: 'من أفضل المزارع إلى كوبك، نقدم لك جودة استثنائية مع كل رشفة.',
  },
  {
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80',
    headingEn: 'Your Daily Ritual, Elevated',
    headingAr: 'طقوسك اليومية، بمستوى أعلى',
    subheadingEn: 'Transform your morning routine with our premium Turkish coffee and specialty blends.',
    subheadingAr: 'حوّل روتينك الصباحي مع قهوتنا التركية الفاخرة وخلطاتنا المميزة.',
  },
  {
    image: 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=1920&q=80',
    headingEn: 'Bold Flavor. Smooth Finish.',
    headingAr: 'نكهة قوية. نهاية ناعمة.',
    subheadingEn: 'Signature blends crafted for cappuccino, coffee mix, and hot chocolate lovers—classic or flavored.',
    subheadingAr: 'خلطات مميزة لعشاق الكابتشينو والكوفي ميكس والهوت شوكلت—كلاسيك أو نكهات.',
  },
]

export function HeroSection() {
  const { t, dir } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const headingText = t(slides[currentSlide].headingEn, slides[currentSlide].headingAr)
  const subheadingText = t(slides[currentSlide].subheadingEn, slides[currentSlide].subheadingAr)

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92svh] items-center overflow-hidden -mt-16 pt-32 pb-24 sm:-mt-[4.5rem] sm:pt-40 sm:pb-28 md:-mt-24 md:min-h-[110vh] md:pt-52 md:pb-44"
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
          <Image
            src={slides[currentSlide].image}
            alt="Coffee background"
            fill
            className="object-cover"
            priority
          />

          {/* Cinematic grading stack */}
          {/* 1. Dark base overlay */}
          <div className="absolute inset-0 bg-black/60" />
          {/* 2. Warm brown tone cast — luxury cinema feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
          {/* 3. Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
          {/* 4. Bottom lift — keeps content readable */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
          {/* 5. Top scrim */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
          {/* 6. Ambient gold glow — center warmth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.12)_0%,_transparent_70%)]" />

        </motion.div>
      </AnimatePresence>

      {/* ── Hero content ── */}
      <motion.div style={{ opacity }} className="container mx-auto px-4 relative z-20">
        <div className="max-w-6xl text-center mx-auto">

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 flex flex-wrap justify-center gap-5 sm:gap-8 md:mb-12 md:gap-16"
          >
            {[
              { value: 15, suffix: '+', labelEn: 'Countries Sourced', labelAr: 'دولة مصدر' },
              { value: 50, suffix: 'K+', labelEn: 'Happy Customers', labelAr: 'عميل سعيد' },
              { value: 100, suffix: '%', labelEn: 'Arabica Beans', labelAr: 'حبوب أرابيكا' },
            ].map((stat) => (
              <div key={stat.labelEn} className="text-center">
                <p className="font-serif text-2xl md:text-3xl font-bold" style={{ color: '#D6A373' }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs md:text-sm mt-0.5" style={{ color: 'rgba(245,230,216,0.55)' }}>
                  {t(stat.labelEn, stat.labelAr)}
                </p>
                {/* Thin gold underline */}
                <div className="mx-auto mt-1.5 h-px w-8 bg-gradient-to-r from-transparent via-[#B6885E]/50 to-transparent" />
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`heading-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative mb-5 font-serif text-4xl font-extrabold leading-[1.05] text-balance min-[380px]:text-5xl md:mb-6 md:text-7xl lg:text-8xl"
              style={{
                color: '#F5E6D8',
                textShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 80px rgba(182,136,94,0.15)',
              }}
            >
              <WordByWord text={headingText} />
            </motion.h1>
          </AnimatePresence>

          {/* Subheadline */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`subheading-${currentSlide}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-pretty md:mb-10 md:text-xl"
              style={{ color: 'rgba(214,183,154,0.85)' }}
            >
              {subheadingText}
            </motion.p>
          </AnimatePresence>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {/* Primary — gold gradient */}
            <Link
              href="/products"
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
              {t('Shop Now', 'تسوق الآن')}
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
