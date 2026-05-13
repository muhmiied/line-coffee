'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Coffee, Heart, Award, Users } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'

const stats = [
  { icon: Coffee, valueEn: '50+', valueAr: '+٥٠', labelEn: 'Coffee Varieties', labelAr: 'نوع قهوة' },
  { icon: Users, valueEn: '10K+', valueAr: '+١٠ آلاف', labelEn: 'Happy Customers', labelAr: 'عميل سعيد' },
  { icon: Award, valueEn: '5+', valueAr: '+٥', labelEn: 'Years Experience', labelAr: 'سنوات خبرة' },
  { icon: Heart, valueEn: '100%', valueAr: '١٠٠٪', labelEn: 'Made with Love', labelAr: 'صنع بحب' },
]

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen" style={{ background: '#0B0806' }}>

      {/* Hero */}
      <div
        className="relative h-[55vh] min-h-[420px] flex items-center justify-center -mt-20 md:-mt-24 pt-20 md:pt-24"
        style={{ background: '#0B0806' }}
      >
        <Image
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600"
          alt="About Line Coffee"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.1)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-4"
            style={{ color: '#B6885E' }}
          >
            {t('Since 2019', 'منذ 2019')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ color: '#F5E6D8', textShadow: '0 4px 32px rgba(0,0,0,0.6)' }}
          >
            {t('Our Story', 'قصتنا')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'rgba(214,183,154,0.85)' }}
          >
            {t('Crafting the perfect cup since 2019', 'نصنع الكوب المثالي منذ 2019')}
          </motion.p>
        </div>
      </div>

      {/* Stats Strip — cinematic gold */}
      <div className="relative py-12 md:py-16" style={{ background: '#0F0A07' }}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/15 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'rgba(182,136,94,0.08)',
                      border: '1px solid rgba(182,136,94,0.22)',
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: '#B6885E' }} />
                  </div>
                  <div
                    className="font-serif text-3xl md:text-4xl font-bold mb-1"
                    style={{ color: '#D6A373' }}
                  >
                    {t(stat.valueEn, stat.valueAr)}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(183,155,133,0.65)' }}>
                    {t(stat.labelEn, stat.labelAr)}
                  </div>
                  <div className="mx-auto mt-3 h-px w-8 bg-gradient-to-r from-transparent via-[#B6885E]/40 to-transparent" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="relative py-16 md:py-24" style={{ background: '#0B0806' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gradient-to-r from-[#B6885E]/60 to-transparent" />
                <p className="text-[11px] tracking-[0.24em] uppercase font-semibold" style={{ color: '#B6885E' }}>
                  {t('Our Journey', 'رحلتنا')}
                </p>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6" style={{ color: '#F5E6D8' }}>
                {t('From Passion to Perfection', 'من الشغف إلى الكمال')}
              </h2>
              <div className="space-y-4 leading-relaxed" style={{ color: 'rgba(183,155,133,0.72)' }}>
                <p>
                  {t(
                    'Line Coffee started in 2019 with a simple mission: to bring the authentic taste of premium coffee to every Egyptian home. What began as a small family business has grown into a beloved brand trusted by thousands of coffee lovers.',
                    'بدأت لاين كوفي في 2019 بمهمة بسيطة: جلب المذاق الأصيل للقهوة الفاخرة لكل بيت مصري. ما بدأ كمشروع عائلي صغير تحول إلى علامة تجارية محبوبة يثق بها الآلاف من عشاق القهوة.'
                  )}
                </p>
                <p>
                  {t(
                    'We carefully source our beans from the finest growing regions and roast them with precision to unlock their full flavor potential. Every batch is crafted with love and attention to detail.',
                    'نختار حبوبنا بعناية من أفضل مناطق الزراعة ونحمصها بدقة لإطلاق كامل إمكانياتها من النكهة. كل دفعة مصنوعة بحب واهتمام بالتفاصيل.'
                  )}
                </p>
                <p>
                  {t(
                    'Today, we offer over 50 varieties of coffee and beverages, from classic Turkish coffee to innovative flavored blends. Our commitment to quality remains unchanged - only the best for our customers.',
                    'اليوم، نقدم أكثر من 50 نوعاً من القهوة والمشروبات، من القهوة التركية الكلاسيكية إلى الخلطات المنكهة المبتكرة. التزامنا بالجودة لم يتغير - الأفضل فقط لعملائنا.'
                  )}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(182,136,94,0.1)' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"
                alt="Coffee beans"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#B6885E]/8 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0B0806]/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 md:py-24" style={{ background: '#0F0A07' }}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: '#B6885E' }}>
                {t('What We Stand For', 'ما نؤمن به')}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F5E6D8' }}>
                {t('Our Values', 'قيمنا')}
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: 'rgba(183,155,133,0.72)' }}>
                {t('The principles that guide everything we do', 'المبادئ التي توجه كل ما نقوم به')}
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                titleEn: 'Quality First',
                titleAr: 'الجودة أولاً',
                descEn: 'We never compromise on quality. From sourcing to roasting to packaging, every step meets our high standards.',
                descAr: 'لا نساوم أبداً على الجودة. من الاختيار إلى التحميص إلى التغليف، كل خطوة تلبي معاييرنا العالية.',
              },
              {
                titleEn: 'Customer Love',
                titleAr: 'حب العملاء',
                descEn: 'Our customers are family. We listen, we care, and we always strive to exceed expectations.',
                descAr: 'عملاؤنا عائلتنا. نستمع، نهتم، ونسعى دائماً لتجاوز التوقعات.',
              },
              {
                titleEn: 'Innovation',
                titleAr: 'الابتكار',
                descEn: 'We constantly explore new flavors and blends to bring you unique coffee experiences.',
                descAr: 'نستكشف باستمرار نكهات وخلطات جديدة لنقدم لك تجارب قهوة فريدة.',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: 'rgba(24,18,13,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(182,136,94,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(182,136,94,0.1)',
                    border: '1px solid rgba(182,136,94,0.25)',
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: '#B6885E' }}>
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3" style={{ color: '#F5E6D8' }}>
                  {t(value.titleEn, value.titleAr)}
                </h3>
                <p className="leading-relaxed" style={{ color: 'rgba(183,155,133,0.72)' }}>
                  {t(value.descEn, value.descAr)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
