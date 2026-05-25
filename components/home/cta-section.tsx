'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

export function CTASection() {
  const { t, dir } = useLanguage()

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-primary"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80"
              alt="Coffee background"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              loading="lazy"
              className="object-cover opacity-30"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 lg:py-20">
            <div className="max-w-2xl mx-auto text-center text-primary-foreground">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance"
              >
                {t(
                  'Start Your Coffee Journey Today',
                  'ابدأ رحلة القهوة الخاصة بك اليوم'
                )}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-primary-foreground/80 text-lg mb-8 text-pretty"
              >
                {t(
                  'Join thousands of coffee lovers who have discovered the Line Coffee difference. Your perfect cup awaits.',
                  'انضم إلى آلاف عشاق القهوة الذين اكتشفوا تميز لاين كوفي. كوبك المثالي في انتظارك.'
                )}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button size="lg" variant="secondary" asChild className="group">
                  <Link href="/products">
                    {t('Shop Our Collection', 'تسوق مجموعتنا')}
                    <ArrowRight
                      className={cn(
                        'h-4 w-4 transition-transform group-hover:translate-x-1',
                        dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                      )}
                    />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/contact">{t('Contact Us', 'تواصل معنا')}</Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl" />
        </motion.div>
      </div>
    </section>
  )
}
