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

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const headingText = t(slides[currentSlide].headingEn, slides[currentSlide].headingAr)
  const subheadingText = t(slides[currentSlide].subheadingEn, slides[currentSlide].subheadingAr)

  return (
    <section
      ref={ref}
      className="relative min-h-[100vh] flex items-center overflow-hidden -mt-20 md:-mt-24 pt-48 md:pt-56"
    >
      {/* Decorative coffee bean - bottom left */}
      <div className="pointer-events-none absolute bottom-6 left-6 z-20 text-white/35 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
        <svg viewBox="0 0 64 64" fill="currentColor" className="h-16 w-16 md:h-20 md:w-20 -rotate-12">
          <path d="M31 6C18 10 10 23 15 35c5 13 19 22 31 18s18-18 12-30C53 11 42 4 31 6Zm2 8c8-2 17 4 20 12 3 9-1 19-10 22-8 3-18-3-21-12-3-8 2-19 11-22Z" />
        </svg>
      </div>

      {/* Background Images with transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
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
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 brand-pattern-dark opacity-[0.07]" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="max-w-6xl text-center mx-auto">
          {/* Stats - moved to top with animated counters */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10"
          >
            <div className="text-center">
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#FFDCC2]">
                <AnimatedCounter value={15} suffix="+" />
              </p>
              <p className="text-xs md:text-sm text-white/70">
                {t('Countries Sourced', 'دولة مصدر')}
              </p>
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#FFDCC2]">
                <AnimatedCounter value={50} suffix="K+" />
              </p>
              <p className="text-xs md:text-sm text-white/70">
                {t('Happy Customers', 'عميل سعيد')}
              </p>
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#FFDCC2]">
                <AnimatedCounter value={100} suffix="%" />
              </p>
              <p className="text-xs md:text-sm text-white/70">
                {t('Arabica Beans', 'حبوب أرابيكا')}
              </p>
            </div>
          </motion.div>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`heading-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative font-serif text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.02] mb-6 text-balance text-white drop-shadow-[0_3px_22px_rgba(0,0,0,0.55)]"
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
              className="text-lg md:text-2xl text-white/85 mb-10 max-w-3xl mx-auto text-pretty drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
            >
              {subheadingText}
            </motion.p>
          </AnimatePresence>

          {/* CTAs - Elegant outlined style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              size="lg" 
              variant="outline"
              asChild 
              className="group border-2 border-white/80 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-[#522500] transition-all duration-300"
            >
              <Link href="/products">
                {t('Shop Now', 'تسوق الآن')}
                <ArrowRight
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:translate-x-1',
                    dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                  )}
                />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="group border-2 border-[#522500] bg-[#522500] text-[#FFDCC2] hover:bg-[#3a1a00] hover:border-[#3a1a00] transition-all duration-300"
            >
              <Link href="/about">{t('Our Story', 'قصتنا')}</Link>
            </Button>
          </motion.div>


        </div>
      </motion.div>

      {/* Slide Navigation Arrows */}
      <div className="absolute inset-y-0 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="pointer-events-auto h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
        >
          <ChevronLeft className={cn('h-6 w-6', dir === 'rtl' && 'rotate-180')} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="pointer-events-auto h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
        >
          <ChevronRight className={cn('h-6 w-6', dir === 'rtl' && 'rotate-180')} />
        </Button>
      </div>

      {/* Slide Indicators - moved to right side */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-2 rounded-full transition-all duration-300',
              currentSlide === index
                ? 'h-8 bg-[#FFDCC2]'
                : 'h-2 bg-white/30 hover:bg-white/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
