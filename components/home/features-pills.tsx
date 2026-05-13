'use client'

import { useLanguage } from '@/lib/context/language'
import { Truck, Coffee, Shield, Clock, RefreshCw, Headphones } from 'lucide-react'
import { SectionReveal, FadeUp, StaggerContainer, viewportConfig } from '@/components/ui/motion-primitives'

const features = [
  {
    icon: Truck,
    labelEn: 'Free Shipping',
    labelAr: 'شحن مجاني',
    descEn: 'Free delivery on orders over 200 EGP',
    descAr: 'توصيل مجاني للطلبات فوق 200 جنيه',
  },
  {
    icon: Coffee,
    labelEn: 'Freshly Roasted',
    labelAr: 'محمصة طازجة',
    descEn: 'Roasted to order for peak freshness',
    descAr: 'محمصة حسب الطلب لأقصى نضارة',
  },
  {
    icon: Shield,
    labelEn: 'Quality Guarantee',
    labelAr: 'ضمان الجودة',
    descEn: '100% satisfaction or your money back',
    descAr: 'رضا 100% أو استرداد أموالك',
  },
  {
    icon: Clock,
    labelEn: 'Fast Delivery',
    labelAr: 'توصيل سريع',
    descEn: '1-3 day delivery across Egypt',
    descAr: 'توصيل خلال 1-3 أيام في مصر',
  },
  {
    icon: RefreshCw,
    labelEn: 'Easy Returns',
    labelAr: 'إرجاع سهل',
    descEn: '30-day hassle-free return policy',
    descAr: 'سياسة إرجاع سهلة لمدة 30 يوم',
  },
  {
    icon: Headphones,
    labelEn: '24/7 Support',
    labelAr: 'دعم 24/7',
    descEn: 'Expert help whenever you need it',
    descAr: 'مساعدة متخصصة في أي وقت',
  },
]

export function FeaturesPills() {
  const { t } = useLanguage()

  return (
    <SectionReveal className="cinematic-section relative py-14 md:py-20 overflow-hidden" style={{ background: '#0B0806' }}>
      {/* Subtle gold line separators */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
      {/* Ambient center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeUp key={index} className="premium-info-card flex flex-col items-center text-center group">
                {/* Gold icon ring */}
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-400 group-hover:scale-110"
                  style={{
                    background: 'rgba(182,136,94,0.08)',
                    border: '1px solid rgba(182,136,94,0.2)',
                    boxShadow: '0 0 0 0 rgba(182,136,94,0)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(182,136,94,0.15)'
                    el.style.boxShadow = '0 0 20px rgba(182,136,94,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(182,136,94,0.08)'
                    el.style.boxShadow = '0 0 0 0 rgba(182,136,94,0)'
                  }}
                >
                  <Icon
                    className="w-5 h-5 md:w-6 md:h-6 transition-colors duration-300"
                    strokeWidth={1.5}
                    style={{ color: '#B6885E' }}
                  />
                </div>
                <h3
                  className="font-semibold text-sm md:text-base mb-1 transition-colors duration-300 group-hover:text-[#D6A373]"
                  style={{ color: '#F5E6D8' }}
                >
                  {t(feature.labelEn, feature.labelAr)}
                </h3>
                <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'rgba(183,155,133,0.7)' }}>
                  {t(feature.descEn, feature.descAr)}
                </p>
              </FadeUp>
            )
          })}
        </StaggerContainer>
      </div>
    </SectionReveal>
  )
}
