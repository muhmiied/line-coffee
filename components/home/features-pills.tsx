'use client'

import { Coffee, Headphones, ShieldCheck, Truck } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { useSectionContent } from '@/lib/hooks/use-section-media'
import { SectionReveal, FadeUp, StaggerContainer, viewportConfig } from '@/components/ui/motion-primitives'

const iconMap = {
  coffee: Coffee,
  headphones: Headphones,
  support: Headphones,
  shield: ShieldCheck,
  quality: ShieldCheck,
  truck: Truck,
  delivery: Truck,
}

const fallbackFeatures = [
  {
    icon: Headphones,
    labelEn: '24/7 Support',
    labelAr: 'دعم على مدار الساعة',
    descEn: 'Responsive help whenever your coffee ritual needs care',
    descAr: 'مساعدة سريعة كلما احتجت دعما لتجربة قهوتك',
  },
  {
    icon: Truck,
    labelEn: 'Fast Delivery',
    labelAr: 'توصيل سريع',
    descEn: 'Carefully packed orders delivered across Egypt',
    descAr: 'طلبات مغلفة بعناية وتصل بسرعة داخل مصر',
  },
  {
    icon: Coffee,
    labelEn: 'Freshly Roasted',
    labelAr: 'تحميص طازج',
    descEn: 'Coffee prepared to preserve aroma, body, and freshness',
    descAr: 'قهوة مجهزة للحفاظ على الرائحة والقوام والطزاجة',
  },
  {
    icon: ShieldCheck,
    labelEn: 'Premium Quality',
    labelAr: 'حفظ الجودة',
    descEn: 'Selected beans and packaging that protect every blend',
    descAr: 'حبوب مختارة وتغليف يحافظ على جودة كل خلطة',
  },
]

export function FeaturesPills() {
  const { t } = useLanguage()
  const { content } = useSectionContent('home_features')
  const controlledFeatures = (content.features || [])
    .filter((feature) => feature.is_active !== false)
    .map((feature) => ({
      icon: iconMap[(feature.icon || 'coffee') as keyof typeof iconMap] || Coffee,
      labelEn: feature.title_en,
      labelAr: feature.title_ar,
      descEn: feature.description_en || '',
      descAr: feature.description_ar || feature.description_en || '',
    }))
  const features = controlledFeatures.length > 0 ? controlledFeatures : fallbackFeatures

  return (
    <SectionReveal className="cinematic-section relative overflow-hidden py-14 md:py-20" style={{ background: '#0B0806' }}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />

      <div className="container relative z-10 mx-auto px-4">
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <FadeUp key={feature.labelEn} className="premium-info-card group flex flex-col items-center text-center">
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105 md:h-16 md:w-16"
                  style={{
                    background: 'rgba(182,136,94,0.08)',
                    border: '1px solid rgba(182,136,94,0.2)',
                  }}
                >
                  <Icon
                    className="h-5 w-5 transition-colors duration-300 md:h-6 md:w-6"
                    strokeWidth={1.5}
                    style={{ color: '#B6885E' }}
                  />
                </div>
                <h3
                  className="mb-1 text-sm font-semibold transition-colors duration-300 group-hover:text-[#D6A373] md:text-base"
                  style={{ color: '#F5E6D8' }}
                >
                  {t(feature.labelEn, feature.labelAr)}
                </h3>
                <p className="text-xs leading-relaxed md:text-sm" style={{ color: 'rgba(183,155,133,0.7)' }}>
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
