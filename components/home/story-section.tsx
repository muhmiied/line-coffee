'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Leaf, Award, Heart } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'
import { getMediaObjectPosition, type SiteMediaItem } from '@/lib/media'

export function StorySection() {
  const { t, dir } = useLanguage()
  const [storyMedia, setStoryMedia] = useState<SiteMediaItem | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['20%', '-20%'])

  useEffect(() => {
    let mounted = true

    fetch('/api/media?usage_area=about_lower', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data) && json.data[0]?.image_url) {
          setStoryMedia(json.data[0])
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

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
      descEn: "Small-batch roasting by master roasters to bring out each bean's unique character.",
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
    <section ref={ref} className="cinematic-section relative py-24 md:py-36 overflow-hidden" style={{ background: '#0F0A07' }}>

      {/* ── Cinematic background ── */}
      {/* Parallax coffee farm image */}
      <div className="absolute inset-0">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80"
            alt="Coffee farm"
            fill
            className="object-cover opacity-10"
          />
        </motion.div>
        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-[#0F0A07]/80" />
        {/* Warm radial glow — left side (content side) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_20%_50%,_rgba(182,136,94,0.09)_0%,_transparent_70%)]" />
        {/* Right image glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_50%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
      </div>

      {/* Gold edge lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20 xl:gap-24">

          {/* ── Content ── */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Label */}
            <div className="premium-section-kicker mx-auto mb-5 lg:mx-0">
              <div className="hidden" />
              <p
                className="text-xs md:text-sm tracking-[0.24em] uppercase font-bold"
                style={{ color: '#D6A373' }}
              >
                {t('Our Story', 'قصتنا')}
              </p>
            </div>

            <h2
              className="premium-heading-shimmer font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-[1.1] text-center lg:text-start"
              style={{ color: '#F5E6D8' }}
            >
              {t('From Distant Farms to Your Cup', 'من المزارع البعيدة إلى كوبك')}
            </h2>

            <p className="text-lg mb-10 text-pretty leading-relaxed" style={{ color: 'rgba(214,183,154,0.75)' }}>
              {t(
                "Line Coffee began with a simple mission: to bring the world's finest coffee to Saudi Arabia. We travel to the most renowned coffee-growing regions, building lasting relationships with farmers who share our passion for exceptional quality.",
                'بدأت لاين كوفي بمهمة بسيطة: جلب أفضل قهوة في العالم إلى المملكة العربية السعودية. نسافر إلى أشهر مناطق زراعة القهوة، نبني علاقات دائمة مع المزارعين الذين يشاركوننا شغفنا بالجودة الاستثنائية.'
              )}
            </p>

            {/* Values */}
            <div className="space-y-7 mb-10">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="premium-info-card flex gap-4 group"
                >
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'rgba(182,136,94,0.1)',
                      border: '1px solid rgba(182,136,94,0.28)',
                    }}
                  >
                    <value.icon className="h-4 w-4" style={{ color: '#B6885E' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#F5E6D8' }}>
                      {t(value.titleEn, value.titleAr)}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(183,155,133,0.7)' }}>
                      {t(value.descEn, value.descAr)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/about"
              className="premium-button-outline group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-wide"
            >
              {t('Learn More About Us', 'تعرف علينا أكثر')}
              <ArrowRight
                className={cn(
                  'h-4 w-4 transition-transform group-hover:translate-x-1',
                  dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
                )}
              />
            </Link>
          </motion.div>

          {/* ── Image column ── */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <div className="absolute -inset-4 rounded-2xl bg-[#FFDCC2]/10 blur-3xl" />
            <div className="absolute -inset-1 rounded-2xl border border-[#FFDCC2]/10" />

            <div className="premium-image-card group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#FFDCC2]/15 bg-[#120D09] shadow-2xl">
            <Image
                src={storyMedia?.image_url || '/images/story.jpg'}
                alt={t(storyMedia?.alt_en || 'Line Coffee premium Arabica and Robusta story', storyMedia?.alt_ar || storyMedia?.alt_en || 'Line Coffee premium Arabica and Robusta story')}
                fill
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="object-cover object-center brightness-[0.82] contrast-[1.12] saturate-[1.08] transition-transform duration-700 group-hover:scale-[1.035]"
                style={{ objectPosition: storyMedia ? getMediaObjectPosition(storyMedia) : 'center center' }}
              />
              {/* Cinematic warm grade and soft vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/78 via-[#0F0A07]/18 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_34%,_rgba(11,8,6,0.58)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFDCC2]/12 via-transparent to-[#522500]/32 mix-blend-soft-light" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFDCC2]/35 to-transparent" />
            </div>

            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className={cn(
                'luxury-panel absolute -bottom-6 rounded-2xl p-5 shadow-2xl',
                dir === 'rtl' ? '-right-4 md:-right-6' : '-left-4 md:-left-6'
              )}
            >
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <p className="font-serif text-2xl font-bold" style={{ color: '#D6A373' }}>10+</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(183,155,133,0.65)' }}>
                    {t('Years of Excellence', 'سنوات من التميز')}
                  </p>
                </div>
                <div className="w-px h-10" style={{ background: 'rgba(182,136,94,0.2)' }} />
                <div className="text-center">
                  <p className="font-serif text-2xl font-bold" style={{ color: '#D6A373' }}>25+</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(183,155,133,0.65)' }}>
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
