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
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: 'fallback-1',
    customer_name: 'Line Coffee Customer',
    customer_avatar: null,
    content_en: 'Fresh, balanced, and beautifully packed. It feels like a café cup at home.',
    content_ar: 'طازجة ومتوازنة ومغلفة بعناية. تشعر وكأنها قهوة مقهى في البيت.',
    rating: 5,
  },
  {
    id: 'fallback-2',
    customer_name: 'Premium Blend Lover',
    customer_avatar: null,
    content_en: 'The aroma is rich and the flavor stays consistent every time.',
    content_ar: 'الرائحة غنية والطعم ثابت ومميز في كل مرة.',
    rating: 5,
  },
  {
    id: 'fallback-3',
    customer_name: 'Daily Coffee Ritual',
    customer_avatar: null,
    content_en: 'Elegant coffee with a smooth finish and fast delivery.',
    content_ar: 'قهوة أنيقة بنهاية ناعمة وتوصيل سريع.',
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
    sectionContent.eyebrow_en || 'Testimonials',
    sectionContent.eyebrow_ar || sectionContent.eyebrow_en || 'آراء العملاء',
  )
  const heading = t(
    sectionContent.title_en || 'What Our Customers Say',
    sectionContent.title_ar || sectionContent.title_en || 'ماذا يقول عملاؤنا',
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
      className="cinematic-section relative overflow-hidden py-20 md:py-28"
      style={{ background: '#0B0806' }}
    >
      {/* Admin-controlled background image (section_key=testimonials in banners table) */}
      {hasBgImage && (
        <Image
          src={sectionMedia!.image_url!}
          alt={sectionMedia?.alt_en || ''}
          fill
          className={cn('object-cover', objPosClass(objectPosition))}
          style={hasBgFx && bgImgFilter ? { filter: bgImgFilter } : undefined}
          priority={false}
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
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
              <h2 className="premium-heading-shimmer font-serif text-4xl font-bold leading-[1.16] text-[#F5E6D8] md:text-5xl">
                {heading}
              </h2>
            </FadeUp>
          </div>

          <FadeUp>
            <Link
              href="/products"
              className="premium-button group inline-flex items-center gap-2 self-start rounded-full px-7 py-3 text-sm font-semibold tracking-wide lg:self-auto"
            >
              {t('BROWSE OUR MENU', 'تصفح قائمتنا')}
              <ArrowRight
                className={cn(
                  'h-4 w-4 transition-transform group-hover:translate-x-1',
                  dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1',
                )}
              />
            </Link>
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
            const quote = language === 'ar' ? testimonial.content_ar : testimonial.content_en

            return (
              <article
                key={testimonial.id}
                className="group relative h-[380px] overflow-hidden rounded-2xl border border-[#B6885E]/14 shadow-[0_24px_64px_rgba(0,0,0,0.45)] transition-all duration-500 hover:border-[#D6A373]/30 hover:shadow-[0_32px_80px_rgba(0,0,0,0.55)] sm:h-[440px]"
              >
                {/* Portrait photo from testimonials.customer_avatar, or initials fallback */}
                {testimonial.customer_avatar ? (
                  <Image
                    src={testimonial.customer_avatar}
                    alt={testimonial.customer_name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2a1505] via-[#180c03] to-[#0B0806] flex items-center justify-center">
                    <span className="font-serif text-7xl font-bold text-[#B6885E]/20 select-none">
                      {initials(testimonial.customer_name)}
                    </span>
                  </div>
                )}

                {/* Top fade + quote icon */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0B0806]/60 to-transparent" />
                <Quote className="absolute right-5 top-5 h-6 w-6 text-[#D6A373]/60" />

                {/* Bottom gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0B0806] via-[#0B0806]/80 to-transparent" />

                {/* Card text */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="mb-2 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          'h-3.5 w-3.5',
                          index < testimonial.rating
                            ? 'fill-[#D6A373] text-[#D6A373]'
                            : 'text-[#B6885E]/25',
                        )}
                      />
                    ))}
                  </div>
                  <p className="font-serif text-lg font-bold text-[#F5E6D8] leading-snug mb-2">
                    {testimonial.customer_name}
                  </p>
                  <p
                    className={cn(
                      'line-clamp-3 text-sm leading-relaxed text-[#F5E6D8]/65',
                      language === 'ar' && 'text-right',
                    )}
                  >
                    {quote || testimonial.content_en || testimonial.content_ar}
                  </p>
                </div>
              </article>
            )
          })}
        </StaggerContainer>
      </div>
    </SectionReveal>
  )
}
