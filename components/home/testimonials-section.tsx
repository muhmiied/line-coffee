'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <SectionReveal className="relative py-16 md:py-24 overflow-hidden">
      {/* Glass/Crystal gradient background - smoother transitions */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFDCC2] via-[#6b3200] to-[#FFF5ED]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#522500]/90 via-[#6b3200]/95 to-[#4a2200]/90" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#FFDCC2]/20 via-[#FFDCC2]/5 to-[#FFDCC2]/15" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      {/* Top fade from cream */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FFDCC2]/40 via-[#FFDCC2]/15 to-transparent" />
      {/* Bottom fade to cream */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FFF5ED]/40 via-[#FFDCC2]/15 to-transparent" />
      {/* Crystal shine effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#FFDCC2]/15 via-transparent to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-12">
          <FadeUp className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold max-w-md" style={{ color: '#FFDCC2' }}>
            <WordByWord text={t('What Our Customers Say', 'ماذا يقول عملاؤنا')} />
          </FadeUp>
          
          <FadeUp>
            <Button 
              asChild 
              className="group bg-[#522500] hover:bg-[#3d1c00] text-[#FFDCC2] border-2 border-[#FFDCC2]/30 hover:border-[#FFDCC2]/50 font-semibold px-6 py-3 shadow-lg"
            >
              <Link href="/products">
                {t('BROWSE OUR MENU', 'تصفح قائمتنا')}
                <ArrowRight
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:translate-x-1',
                    dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                  )}
                />
              </Link>
            </Button>
          </FadeUp>
        </div>

        {/* Testimonials Grid - 3 tall photos */}
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid md:grid-cols-3 gap-4 md:gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <ImageReveal key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
              {/* Customer Photo */}
              <Image
                src={testimonial.image}
                alt={t(testimonial.nameEn, testimonial.nameAr)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              {/* Quote at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-sm md:text-base mb-3 line-clamp-4" style={{ color: 'rgba(255, 220, 194, 0.9)' }}>
                  {t(testimonial.quoteEn, testimonial.quoteAr)}
                </p>
                <p className="font-medium" style={{ color: '#FFDCC2' }}>
                  {t(testimonial.nameEn, testimonial.nameAr)}
                </p>
              </div>
            </ImageReveal>
          ))}
        </StaggerContainer>
      </div>
    </SectionReveal>
  )
}
