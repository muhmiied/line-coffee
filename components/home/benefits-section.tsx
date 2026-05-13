'use client'

import { motion } from 'framer-motion'
import { Truck, Shield, RefreshCw, Coffee, Clock, Headphones } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'

export function BenefitsSection() {
  const { t } = useLanguage()

  const benefits = [
    {
      icon: Truck,
      titleEn: 'Free Shipping',
      titleAr: 'شحن مجاني',
      descEn: 'Free delivery on orders over 200 SAR',
      descAr: 'توصيل مجاني للطلبات فوق 200 ريال',
    },
    {
      icon: Coffee,
      titleEn: 'Freshly Roasted',
      titleAr: 'محمصة طازجة',
      descEn: 'Roasted to order for peak freshness',
      descAr: 'محمصة عند الطلب لأعلى درجات النضارة',
    },
    {
      icon: Shield,
      titleEn: 'Quality Guarantee',
      titleAr: 'ضمان الجودة',
      descEn: '100% satisfaction or your money back',
      descAr: 'رضا 100% أو استرداد أموالك',
    },
    {
      icon: Clock,
      titleEn: 'Fast Delivery',
      titleAr: 'توصيل سريع',
      descEn: '1-3 day delivery across Saudi Arabia',
      descAr: 'توصيل خلال 1-3 أيام في جميع أنحاء المملكة',
    },
    {
      icon: RefreshCw,
      titleEn: 'Easy Returns',
      titleAr: 'إرجاع سهل',
      descEn: '30-day hassle-free return policy',
      descAr: 'سياسة إرجاع سهلة لمدة 30 يوماً',
    },
    {
      icon: Headphones,
      titleEn: '24/7 Support',
      titleAr: 'دعم على مدار الساعة',
      descEn: 'Expert help whenever you need it',
      descAr: 'مساعدة متخصصة متى احتجت إليها',
    },
  ]

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#0F0A07' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(182,136,94,0.05)_0%,_transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Section label */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#B6885E]/60" />
            <span
              className="text-[11px] tracking-[0.24em] uppercase font-semibold"
              style={{ color: '#B6885E' }}
            >
              {t('Why Line Coffee?', 'لماذا لاين كوفي؟')}
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#B6885E]/60" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: '#F5E6D8' }}>
            {t('More Than Just Coffee', 'أكثر من مجرد قهوة')}
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-center group"
            >
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 transition-all duration-400 group-hover:scale-110"
                style={{
                  background: 'rgba(182,136,94,0.08)',
                  border: '1px solid rgba(182,136,94,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(182,136,94,0.18)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(182,136,94,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(182,136,94,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <benefit.icon className="h-5 w-5" strokeWidth={1.5} style={{ color: '#B6885E' }} />
              </div>
              <h3
                className="font-semibold text-sm md:text-base mb-1.5 transition-colors duration-300 group-hover:text-[#D6A373]"
                style={{ color: '#F5E6D8' }}
              >
                {t(benefit.titleEn, benefit.titleAr)}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(183,155,133,0.65)' }}>
                {t(benefit.descEn, benefit.descAr)}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
