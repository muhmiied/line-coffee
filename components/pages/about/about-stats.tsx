'use client'

import { motion } from 'framer-motion'
import { Award, Coffee, Heart, Users, type LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'

export type AboutStat = {
  icon: LucideIcon
  valueEn: string
  valueAr: string
  labelEn: string
  labelAr: string
}

export const DEFAULT_ABOUT_STATS: AboutStat[] = [
  { icon: Coffee, valueEn: '2015', valueAr: 'Ù¢Ù Ù¡Ù¥', labelEn: 'Family Business Roots', labelAr: 'Ø¬Ø°ÙˆØ± Ù…Ø´Ø±ÙˆØ¹ Ø¹Ø§Ø¦Ù„ÙŠ' },
  { icon: Award, valueEn: '28', valueAr: 'Ù¢Ù¨', labelEn: 'Years at Bon Al Orouba', labelAr: 'Ø³Ù†Ø© ÙÙŠ Ø¨Ù† Ø§Ù„Ø¹Ø±ÙˆØ¨Ø©' },
  { icon: Users, valueEn: 'Supply', valueAr: 'ØªÙˆØ±ÙŠØ¯', labelEn: 'Built for Cafes', labelAr: 'Ø®Ø¨Ø±Ø© Ù…Ø¹ Ø§Ù„Ù…Ù‚Ø§Ù‡ÙŠ' },
  { icon: Heart, valueEn: 'Online', valueAr: 'Ø£ÙˆÙ†Ù„Ø§ÙŠÙ†', labelEn: 'Now Serving Direct', labelAr: 'Ø®Ø¯Ù…Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ø§Ù„Ø¢Ù†' },
]

type AboutStatsProps = {
  stats?: AboutStat[]
}

export function AboutStats({ stats = DEFAULT_ABOUT_STATS }: AboutStatsProps) {
  const { t } = useLanguage()

  return (
    <div className="relative py-12 md:py-16" style={{ background: '#0F0A07' }}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/15 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
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
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background: 'rgba(182,136,94,0.08)',
                    border: '1px solid rgba(182,136,94,0.22)',
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#B6885E' }} />
                </div>
                <div
                  className="mb-1 font-serif text-3xl font-bold md:text-4xl"
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
  )
}
