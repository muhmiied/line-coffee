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
    <div className="min-h-screen bg-[#FFDCC2]">
      {/* Hero — slides under the transparent header */}
      <div className="relative h-[55vh] min-h-[420px] flex items-center justify-center -mt-20 md:-mt-24 pt-20 md:pt-24">
        <Image
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600"
          alt="About Line Coffee"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            {t('Our Story', 'قصتنا')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            {t(
              'Crafting the perfect cup since 2019',
              'نصنع الكوب المثالي منذ 2019'
            )}
          </motion.p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-primary text-primary-foreground py-12">
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
                  <Icon className="h-8 w-8 mx-auto mb-3 text-primary-foreground/80" />
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    {t(stat.valueEn, stat.valueAr)}
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    {t(stat.labelEn, stat.labelAr)}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="py-16 md:py-24 bg-[#FFDCC2]/90">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                {t('From Passion to Perfection', 'من الشغف إلى الكمال')}
              </h2>
              <div className="space-y-4 text-muted-foreground">
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
            >
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"
                alt="Coffee beans"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-white/70">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              {t('Our Values', 'قيمنا')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                'The principles that guide everything we do',
                'المبادئ التي توجه كل ما نقوم به'
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
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
                className="bg-card p-6 rounded-xl border border-border"
              >
                <h3 className="font-serif text-xl font-semibold mb-3">
                  {t(value.titleEn, value.titleAr)}
                </h3>
                <p className="text-muted-foreground">
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
