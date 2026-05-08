'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Leaf, Award, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

export function StorySection() {
  const { t, dir } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['20%', '-20%'])

  const values = [
    {
      icon: Leaf,
      titleEn: 'Sustainably Sourced',
      titleAr: 'مصادر مستدامة',
      descEn: 'Direct relationships with farmers ensuring fair trade and environmental responsibility.',
      descAr: 'علاقات مباشرة مع المزارعين تضمن التجارة العادلة والمسؤولية البيئية.',
    },
    {
      icon: Award,
      titleEn: 'Expert Roasting',
      titleAr: 'تحميص احترافي',
      descEn: 'Small-batch roasting by master roasters to bring out each bean\'s unique character.',
      descAr: 'تحميص بكميات صغيرة من قبل محمصين محترفين لإبراز الطابع الفريد لكل حبة.',
    },
    {
      icon: Heart,
      titleEn: 'Passion for Quality',
      titleAr: 'شغف بالجودة',
      descEn: 'From farm to cup, every step is guided by our commitment to excellence.',
      descAr: 'من المزرعة إلى الكوب، كل خطوة موجهة بالتزامنا بالتميز.',
    },
  ]

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Glass/Crystal gradient background - smoother transitions */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFDCC2] via-[#6b3200] to-[#FFDCC2]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#522500]/90 via-[#6b3200]/95 to-[#4a2200]/90" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#FFDCC2]/20 via-[#FFDCC2]/5 to-[#FFDCC2]/15" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      {/* Top fade from cream */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FFDCC2]/40 via-[#FFDCC2]/15 to-transparent" />
      {/* Bottom fade to cream */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FFDCC2]/40 via-[#FFDCC2]/15 to-transparent" />
      {/* Crystal shine effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFDCC2]/10 via-transparent to-transparent" />
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80"
            alt="Coffee farm"
            fill
            className="object-cover opacity-15"
          />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ color: '#FFDCC2' }}
          >
            <p className="font-medium mb-4" style={{ color: '#FFDCC2' }}>
              {t('Our Story', 'قصتنا')}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              {t(
                'From Distant Farms to Your Cup',
                'من المزارع البعيدة إلى كوبك'
              )}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 text-pretty">
              {t(
                'Line Coffee began with a simple mission: to bring the world\'s finest coffee to Saudi Arabia. We travel to the most renowned coffee-growing regions, building lasting relationships with farmers who share our passion for exceptional quality.',
                'بدأت لاين كوفي بمهمة بسيطة: جلب أفضل قهوة في العالم إلى المملكة العربية السعودية. نسافر إلى أشهر مناطق زراعة القهوة، نبني علاقات دائمة مع المزارعين الذين يشاركوننا شغفنا بالجودة الاستثنائية.'
              )}
            </p>

            {/* Values */}
            <div className="space-y-6 mb-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-[#FFDCC2] flex items-center justify-center">
                    <value.icon className="h-5 w-5 text-[#FFDCC2]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t(value.titleEn, value.titleAr)}
                    </h3>
                    <p className="text-primary-foreground/70 text-sm">
                      {t(value.descEn, value.descAr)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="secondary" size="lg" asChild className="group">
              <Link href="/about">
                {t('Learn More About Us', 'تعرف علينا أكثر')}
                <ArrowRight
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:translate-x-1',
                    dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                  )}
                />
              </Link>
            </Button>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
                alt="Coffee preparation"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={cn(
                'absolute -bottom-6 glass rounded-xl p-6 shadow-xl max-w-xs',
                dir === 'rtl' ? '-right-4 md:-right-8' : '-left-4 md:-left-8'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-serif text-3xl font-bold text-primary">10+</p>
                  <p className="text-xs text-muted-foreground">
                    {t('Years of Excellence', 'سنوات من التميز')}
                  </p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="font-serif text-3xl font-bold text-primary">25+</p>
                  <p className="text-xs text-muted-foreground">
                    {t('Farm Partners', 'شريك مزارع')}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
