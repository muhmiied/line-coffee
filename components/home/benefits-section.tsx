'use client'

import { motion } from 'framer-motion'
import { Coffee, Headphones, ShieldCheck, Truck } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'

export function BenefitsSection() {
  const { t } = useLanguage()

  const benefits = [
    {
      icon: Headphones,
      titleEn: '24/7 Support',
      titleAr: 'دعم على مدار الساعة',
      descEn: 'Responsive help whenever your coffee ritual needs care',
      descAr: 'مساعدة سريعة كلما احتجت دعماً لتجربة قهوتك',
    },
    {
      icon: Truck,
      titleEn: 'Fast Delivery',
      titleAr: 'توصيل سريع',
      descEn: 'Carefully packed orders delivered across Egypt',
      descAr: 'طلبات مغلفة بعناية وتصل بسرعة داخل مصر',
    },
    {
      icon: Coffee,
      titleEn: 'Freshly Roasted',
      titleAr: 'تحميص طازج',
      descEn: 'Coffee prepared to preserve aroma, body, and freshness',
      descAr: 'قهوة مجهزة للحفاظ على الرائحة والقوام والطزاجة',
    },
    {
      icon: ShieldCheck,
      titleEn: 'Premium Quality',
      titleAr: 'حفظ الجودة',
      descEn: 'Selected beans and packaging that protect every blend',
      descAr: 'حبوب مختارة وتغليف يحافظ على جودة كل خلطة',
    },
  ]

  return (
    <section className="cinematic-section relative overflow-hidden py-20 md:py-28" style={{ background: '#0F0A07' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(182,136,94,0.05)_0%,_transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-14 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#B6885E]/60" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: '#B6885E' }}>
              {t('Why Line Coffee?', 'لماذا لاين كوفي؟')}
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#B6885E]/60" />
          </div>
          <h2 className="font-serif text-2xl font-bold leading-[1.22] md:text-3xl" style={{ color: '#F5E6D8' }}>
            {t('Care In Every Detail', 'عناية في كل تفصيلة')}
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.titleEn}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              className="group rounded-2xl border border-[#B6885E]/14 bg-[#120D09]/70 p-6 text-center shadow-[0_18px_55px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6A373]/32 hover:bg-[#1A120D]/78"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#B6885E]/22 bg-[#B6885E]/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_28px_rgba(182,136,94,0.18)]">
                <benefit.icon className="h-6 w-6 text-[#D6A373]" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-bold text-[#F5E6D8] transition-colors duration-300 group-hover:text-[#D6A373]">
                {t(benefit.titleEn, benefit.titleAr)}
              </h3>
              <p className="mx-auto max-w-[15rem] text-sm leading-relaxed text-[#D6B79A]/68">
                {t(benefit.descEn, benefit.descAr)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
