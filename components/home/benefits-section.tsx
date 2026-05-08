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
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-sm md:text-base mb-1">
                {t(benefit.titleEn, benefit.titleAr)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(benefit.descEn, benefit.descAr)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
