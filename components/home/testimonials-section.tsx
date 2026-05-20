'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Quote, Star } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import { FadeUp, SectionReveal, StaggerContainer, viewportConfig } from '@/components/ui/motion-primitives'

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
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'LC'
}

export function TestimonialsSection() {
  const { t, language, dir } = useLanguage()
  const [items, setItems] = useState<Testimonial[]>(fallbackTestimonials)

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

    return () => {
      mounted = false
    }
  }, [])

  const testimonials = useMemo(() => items.slice(0, 3), [items])

  return (
    <SectionReveal className="cinematic-section relative overflow-hidden py-20 md:py-28" style={{ background: '#0B0806' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_rgba(182,136,94,0.07)_0%,_transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl text-center lg:text-start">
            <FadeUp>
              <div className="premium-section-kicker mx-auto mb-5 lg:mx-0">
                <div className="hidden" />
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373] md:text-sm">
                  {t('Testimonials', 'آراء العملاء')}
                </span>
              </div>
            </FadeUp>
            <FadeUp>
              <h2 className="premium-heading-shimmer font-serif text-4xl font-bold leading-[1.16] text-[#F5E6D8] md:text-5xl">
                {t('What Our Customers Say', 'ماذا يقول عملاؤنا')}
              </h2>
            </FadeUp>
          </div>

          <FadeUp>
            <Link
              href="/products"
              className="premium-button group inline-flex items-center gap-2 self-start rounded-full px-7 py-3 text-sm font-semibold tracking-wide lg:self-auto"
            >
              {t('BROWSE OUR MENU', 'تصفح قائمتنا')}
              <ArrowRight className={cn('h-4 w-4 transition-transform group-hover:translate-x-1', dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1')} />
            </Link>
          </FadeUp>
        </div>

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
                className="rounded-2xl border border-[#B6885E]/14 bg-[#120D09]/72 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6A373]/30"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#B6885E]/24 bg-[#B6885E]/14 text-sm font-bold text-[#D6A373]">
                    {testimonial.customer_avatar ? (
                      <Image
                        src={testimonial.customer_avatar}
                        alt={testimonial.customer_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      initials(testimonial.customer_name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-bold text-[#F5E6D8]">{testimonial.customer_name}</p>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn('h-3.5 w-3.5', index < testimonial.rating ? 'fill-[#D6A373] text-[#D6A373]' : 'text-[#B6885E]/25')}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Quote className="mb-3 h-5 w-5 text-[#B6885E]/70" />
                <p className="line-clamp-5 text-sm leading-relaxed text-[#F5E6D8]/82">
                  {quote || testimonial.content_en || testimonial.content_ar}
                </p>
              </article>
            )
          })}
        </StaggerContainer>
      </div>
    </SectionReveal>
  )
}
