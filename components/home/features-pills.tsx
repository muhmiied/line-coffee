'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/context/language'
import { Truck, Coffee, Shield, Clock, RefreshCw, Headphones } from 'lucide-react'
import { SectionReveal, FadeUp, StaggerContainer, viewportConfig } from '@/components/ui/motion-primitives'

const features = [
  { 
    icon: Truck, 
    labelEn: 'Free Shipping', 
    labelAr: 'شحن مجاني',
    descEn: 'Free delivery on orders over 200 EGP',
    descAr: 'توصيل مجاني للطلبات فوق 200 جنيه'
  },
  { 
    icon: Coffee, 
    labelEn: 'Freshly Roasted', 
    labelAr: 'محمصة طازجة',
    descEn: 'Roasted to order for peak freshness',
    descAr: 'محمصة حسب الطلب لأقصى نضارة'
  },
  { 
    icon: Shield, 
    labelEn: 'Quality Guarantee', 
    labelAr: 'ضمان الجودة',
    descEn: '100% satisfaction or your money back',
    descAr: 'رضا 100% أو استرداد أموالك'
  },
  { 
    icon: Clock, 
    labelEn: 'Fast Delivery', 
    labelAr: 'توصيل سريع',
    descEn: '1-3 day delivery across Egypt',
    descAr: 'توصيل خلال 1-3 أيام في مصر'
  },
  { 
    icon: RefreshCw, 
    labelEn: 'Easy Returns', 
    labelAr: 'إرجاع سهل',
    descEn: '30-day hassle-free return policy',
    descAr: 'سياسة إرجاع سهلة لمدة 30 يوم'
  },
  { 
    icon: Headphones, 
    labelEn: '24/7 Support', 
    labelAr: 'دعم 24/7',
    descEn: 'Expert help whenever you need it',
    descAr: 'مساعدة متخصصة في أي وقت'
  },
]

export function FeaturesPills() {
  const { t } = useLanguage()

  return (
    <SectionReveal className="py-12 md:py-16 bg-gradient-to-r from-secondary/80 via-background to-secondary/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeUp key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-foreground/80" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-sm md:text-base text-foreground mb-1">
                  {t(feature.labelEn, feature.labelAr)}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
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
