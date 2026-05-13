'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Quote } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import { SectionReveal, FadeUp, ImageReveal, StaggerContainer, WordByWord, viewportConfig } from '@/components/ui/motion-primitives'

const testimonials = [
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=900&fit=crop',
    nameEn: 'Ahmed Hassan',
    nameAr: 'أحمد حسن',
    quoteEn: '"The best Turkish coffee I\'ve ever had. The aroma fills my kitchen every morning and brings me so much joy."',
    quoteAr: '"أفضل قهوة تركية تذوقتها على الإطلاق. الرائحة تملأ مطبخي كل صباح وتجلب لي الكثير من السعادة."',
  },
  {
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=900&fit=crop',
    nameEn: 'Sarah Mohamed',
    nameAr: 'سارة محمد',
    quoteEn: '"Line Coffee has transformed my daily routine. The quality is unmatched and the flavors are incredible."',
    quoteAr: '"لاين كوفي غيّرت روتيني اليومي. الجودة لا مثيل لها والنكهات مذهلة."',
  },
  {
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=900&fit=crop',
    nameEn: 'Omar Ali',
    nameAr: 'عمر علي',
    quoteEn: '"Finally found a coffee that reminds me of my grandmother\'s brew. Authentic taste, premium quality."',
    quoteAr: '"أخيراً وجدت قهوة تذكرني بقهوة جدتي. طعم أصيل وجودة فاخرة."',
  },
]

export function TestimonialsSection() {
  const { t, dir } = useLanguage()

  return (
    <SectionReveal className="relative py-20 md:py-32 overflow-hidden" style={{ background: '#0B0806' }}>

      {/* Cinematic layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_rgba(182,136,94,0.07)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div className="max-w-lg">
            <FadeUp>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-gradient-to-r from-[#B6885E]/60 to-transparent" />
                <span
                  className="text-[11px] tracking-[0.24em] uppercase font-semibold"
                  style={{ color: '#B6885E' }}
                >
                  {t('Testimonials', 'آراء العملاء')}
                </span>
              </div>
            </FadeUp>
            <FadeUp>
              <h2
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]"
                style={{ color: '#F5E6D8' }}
              >
                <WordByWord text={t('What Our Customers Say', 'ماذا يقول عملاؤنا')} />
              </h2>
            </FadeUp>
          </div>

          <FadeUp>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 self-start lg:self-auto"
              style={{
                background: 'linear-gradient(135deg, #B6885E 0%, #D6A373 100%)',
                color: '#0B0806',
                boxShadow: '0 4px 20px rgba(182,136,94,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(182,136,94,0.5)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(182,136,94,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {t('BROWSE OUR MENU', 'تصفح قائمتنا')}
              <ArrowRight
                className={cn(
                  'h-4 w-4 transition-transform group-hover:translate-x-1',
                  dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                )}
              />
            </Link>
          </FadeUp>
        </div>

        {/* Testimonials grid */}
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid md:grid-cols-3 gap-4 md:gap-5"
        >
          {testimonials.map((testimonial, index) => (
            <ImageReveal
              key={index}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden group"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
            >
              {/* Customer Photo */}
              <Image
                src={testimonial.image}
                alt={t(testimonial.nameEn, testimonial.nameAr)}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Cinematic overlay stack */}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#B6885E]/8 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/95 via-[#0B0806]/35 to-transparent" />
              {/* Gold border on hover */}
              <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-1 ring-[#B6885E]/30 transition-all duration-500" />

              {/* Quote content at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Quote
                  className="h-5 w-5 mb-3 opacity-60"
                  style={{ color: '#B6885E' }}
                />
                <p
                  className="text-sm md:text-[15px] mb-4 leading-relaxed line-clamp-4"
                  style={{ color: 'rgba(245,230,216,0.88)' }}
                >
                  {t(testimonial.quoteEn, testimonial.quoteAr)}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-px flex-1"
                    style={{ background: 'rgba(182,136,94,0.25)' }}
                  />
                  <p className="font-semibold text-sm" style={{ color: '#D6A373' }}>
                    {t(testimonial.nameEn, testimonial.nameAr)}
                  </p>
                </div>
              </div>
            </ImageReveal>
          ))}
        </StaggerContainer>

      </div>
    </SectionReveal>
  )
}
