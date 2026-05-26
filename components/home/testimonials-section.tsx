'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Quote, Star } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import { FadeUp, SectionReveal, StaggerContainer, viewportConfig } from '@/components/ui/motion-primitives'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getSectionBuilderContent,
  getVisualEffects,
  getWebsiteSection,
  GRAIN_SVG,
  type SiteMediaItem,
} from '@/lib/media'

// Section config — matches the 'testimonials' key in WEBSITE_SECTIONS
const sectionConfig = getWebsiteSection('testimonials')

// Maps the 5 fixed OBJECT_POSITION_OPTIONS values to Tailwind classes
const OBJ_POS_CLASS: Record<string, string> = {
  'center center': 'object-center',
  'center top':    'object-top',
  'center bottom': 'object-bottom',
  'left center':   'object-left',
  'right center':  'object-right',
}
function objPosClass(pos: string) {
  return OBJ_POS_CLASS[pos] ?? 'object-center'
}

type Testimonial = {
  id: string
  customer_name: string
  customer_avatar: string | null
  content_en: string | null
  content_ar: string | null
  rating: number
  customer_type_en?: string | null
  customer_type_ar?: string | null
  customer_city_en?: string | null
  customer_city_ar?: string | null
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: 'fallback-1',
    customer_name: 'Mariam Hassan',
    customer_avatar: null,
    customer_type_en: 'Home brewer',
    customer_type_ar: 'تحضير منزلي',
    customer_city_en: 'Cairo',
    customer_city_ar: 'القاهرة',
    content_en: 'The roast arrives fresh and beautifully balanced. It turned my morning coffee into a quiet little ritual.',
    content_ar: 'وصلت القهوة طازجة ومتوازنة جدًا. أصبحت قهوتي الصباحية طقسًا هادئًا أنتظره كل يوم.',
    rating: 5,
  },
  {
    id: 'fallback-2',
    customer_name: 'Omar Nabil',
    customer_avatar: null,
    customer_type_en: 'Espresso lover',
    customer_type_ar: 'محب للإسبريسو',
    customer_city_en: 'Alexandria',
    customer_city_ar: 'الإسكندرية',
    content_en: 'Smooth crema, warm aroma, and a finish that feels premium without being heavy.',
    content_ar: 'كريما ناعمة ورائحة دافئة ونهاية فاخرة من غير ثقل. تجربة ممتازة للإسبريسو.',
    rating: 5,
  },
  {
    id: 'fallback-3',
    customer_name: 'Nour El-Din',
    customer_avatar: null,
    customer_type_en: 'Filter coffee fan',
    customer_type_ar: 'محب للقهوة المقطرة',
    customer_city_en: 'Giza',
    customer_city_ar: 'الجيزة',
    content_en: 'Elegant packaging, clear flavor notes, and delivery that kept the beans fragrant.',
    content_ar: 'تغليف أنيق، نكهات واضحة، والتوصيل حافظ على رائحة البن ونضارته.',
    rating: 5,
  },
]

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'LC'
  )
}

function hasArabic(s: string | null | undefined): boolean {
  return !!s && /\p{Script=Arabic}/u.test(s)
}

function localizedText(language: string, en: string | null | undefined, ar: string | null | undefined) {
  return language === 'ar' ? (hasArabic(ar) ? ar! : en || '') : (en || ar || '')
}

export function TestimonialsSection() {
  const { t, language, dir } = useLanguage()

  // Testimonial cards — from testimonials table
  const [items, setItems] = useState<Testimonial[]>(fallbackTestimonials)

  // Section-level background — from admin Media Builder (banners table, section_key=testimonials)
  const [sectionMedia, setSectionMedia] = useState<SiteMediaItem | null>(null)

  // Fetch testimonial cards
  useEffect(() => {
    let mounted = true
    fetch('/api/testimonials?featured=true&limit=3', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data) && json.data.length > 0) {
          setItems(json.data)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  // Fetch section background from Media Builder
  useEffect(() => {
    let mounted = true
    fetch('/api/media?section_key=testimonials', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data) && json.data.length > 0) {
          const first = json.data.find((item: SiteMediaItem) => item.image_url) ?? null
          setSectionMedia(first)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const testimonials = useMemo(() => items.slice(0, 3), [items])

  // Allow admin to override section title / eyebrow via Media Builder content field
  const sectionContent = getSectionBuilderContent(sectionConfig, sectionMedia)
  const eyebrow = t(
    sectionContent.eyebrow_en || 'Customer Notes',
    hasArabic(sectionContent.eyebrow_ar) ? sectionContent.eyebrow_ar! : 'آراء العملاء',
  )
  const heading = t(
    sectionContent.title_en || 'Loved in Everyday Rituals',
    hasArabic(sectionContent.title_ar) ? sectionContent.title_ar! : 'قهوة أحبها عملاؤنا في طقوسهم اليومية',
  )

  // Background image and overlay values
  const hasBgImage = Boolean(sectionMedia?.image_url)
  const overlayOpacity = sectionMedia && hasBgImage ? getMediaOverlayOpacity(sectionMedia) : 0.98
  const objectPosition = sectionMedia ? getMediaObjectPosition(sectionMedia) : 'center center'

  // Visual effects from Media Builder
  const bgFx = getVisualEffects(sectionMedia)
  const hasBgFx = hasBgImage && Object.keys(bgFx).length > 0
  const bgImgFilter = buildEffectsFilter(bgFx)
  const bgOverlayGrad = buildOverlayGradient(bgFx.gradient_type, bgFx.overlay_color, overlayOpacity)
  const bgFxVignette = Number(bgFx.vignette ?? 0)
  const bgFxGlow = Number(bgFx.glow ?? 0)
  const bgFxGrain = Number(bgFx.grain ?? 0)

  return (
    <SectionReveal
      className="cinematic-section relative overflow-hidden py-14 md:py-28"
      style={{ background: '#0B0806' }}
    >
      {/* Admin-controlled background image (section_key=testimonials in banners table) */}
      {hasBgImage && (
        <Image
          src={sectionMedia!.image_url!}
          alt={sectionMedia?.alt_en || ''}
          fill
          sizes="100vw"
          loading="lazy"
          className={cn('object-cover', objPosClass(objectPosition))}
          style={hasBgFx && bgImgFilter ? { filter: bgImgFilter } : undefined}
        />
      )}

      {/* Dark overlay — dynamic gradient when effects active, solid when not */}
      {hasBgFx
        ? <div className="absolute inset-0" style={{ background: bgOverlayGrad }} />
        : <div className="absolute inset-0" style={{ backgroundColor: `rgba(11,8,6,${overlayOpacity})` }} />
      }
      {hasBgFx && bgFxVignette > 0.05 && <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${bgFxVignette.toFixed(2)}) 100%)` }} />}
      {hasBgFx && bgFxGlow > 0.05 && <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, rgba(182,136,94,${bgFxGlow.toFixed(2)}) 0%, transparent 70%)` }} />}
      {hasBgFx && bgFxGrain > 0.05 && <div className="pointer-events-none absolute inset-0" style={{ opacity: bgFxGrain, backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '180px 180px', mixBlendMode: 'screen' }} />}

      {/* Warm glow — always present */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_rgba(182,136,94,0.07)_0%,_transparent_70%)]" />

      {/* Section edge lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section header */}
        <div className="mb-8 flex flex-col gap-6 md:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl text-center lg:text-start">
            <FadeUp>
              <div className="premium-section-kicker mx-auto mb-5 lg:mx-0">
                <div className="hidden" />
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373] md:text-sm">
                  {eyebrow}
                </span>
              </div>
            </FadeUp>
            <FadeUp>
              <h2 className="premium-heading-shimmer font-serif text-3xl font-bold leading-[1.16] text-[#F5E6D8] sm:text-4xl md:text-5xl">
                {heading}
              </h2>
            </FadeUp>
          </div>

          <FadeUp>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/products"
                className="premium-button group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-wide"
              >
                {t('Browse Menu', 'تصفح القائمة')}
                <ArrowRight
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:translate-x-1',
                    dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1',
                  )}
                />
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center justify-center rounded-full border border-[#B6885E]/25 bg-[#F5E6D8]/5 px-7 py-3 text-sm font-semibold text-[#F5E6D8] transition-all duration-300 hover:border-[#D6A373]/45 hover:bg-[#D6A373]/10"
              >
                {t('Leave a Review', 'اترك تقييمك')}
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Testimonial cards — portrait photo layout */}
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid gap-4 md:grid-cols-3"
        >
          {testimonials.map((testimonial) => {
            const quote = localizedText(language, testimonial.content_en, testimonial.content_ar)
            const customerType = localizedText(language, testimonial.customer_type_en, testimonial.customer_type_ar)
            const customerCity = localizedText(language, testimonial.customer_city_en, testimonial.customer_city_ar)
            const meta = [customerType, customerCity].filter(Boolean).join(language === 'ar' ? '، ' : ', ')
            const rating = Math.max(0, Math.min(5, Math.round(testimonial.rating || 5)))

            return (
              <article
                key={testimonial.id}
                className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-[#B6885E]/16 bg-[#120D09]/78 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.42)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#D6A373]/35 hover:bg-[#160F0A]/86 hover:shadow-[0_32px_80px_rgba(0,0,0,0.55),0_0_28px_rgba(182,136,94,0.10)] md:min-h-[340px]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#D6A373]/10 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          'h-4 w-4',
                          index < rating ? 'fill-[#D6A373] text-[#D6A373]' : 'text-[#B6885E]/25',
                        )}
                      />
                    ))}
                  </div>
                  <Quote className="h-7 w-7 shrink-0 text-[#D6A373]/35" />
                </div>

                <p
                  className={cn(
                    'line-clamp-5 flex-1 text-base leading-8 text-[#F5E6D8]/78 md:text-[1.02rem]',
                    language === 'ar' && 'text-right',
                  )}
                >
                  {quote}
                </p>

                <div className={cn('mt-7 flex items-center gap-4 border-t border-[#B6885E]/14 pt-5', dir === 'rtl' && 'flex-row-reverse')}>
                  {testimonial.customer_avatar ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#D6A373]/30 bg-[#1A100A]">
                      <Image
                        src={testimonial.customer_avatar}
                        alt={testimonial.customer_name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D6A373]/28 bg-[radial-gradient(circle_at_30%_20%,_rgba(214,163,115,0.28),_rgba(82,37,0,0.30)_55%,_rgba(11,8,6,0.8))] text-sm font-bold text-[#F5E6D8] shadow-inner">
                      {initials(testimonial.customer_name)}
                    </div>
                  )}
                  <div className={cn('min-w-0', language === 'ar' && 'text-right')}>
                    <p className="truncate font-serif text-lg font-bold leading-snug text-[#F5E6D8]">
                      {testimonial.customer_name}
                    </p>
                    {meta && (
                      <p className={cn('mt-1 truncate text-xs font-medium text-[#D6A373]/72', language === 'ar' ? 'tracking-normal' : 'uppercase tracking-[0.14em]')}>
                        {meta}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </StaggerContainer>
      </div>
    </SectionReveal>
  )
}
