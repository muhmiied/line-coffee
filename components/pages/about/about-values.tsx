'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/context/language'
import { type SectionBuilderContent, type WebsiteSectionConfig } from '@/lib/media'

type AboutValuesProps = {
  section: WebsiteSectionConfig
  content: SectionBuilderContent
}

export function AboutValues({ section, content }: AboutValuesProps) {
  const { t } = useLanguage()
  const valueCards = (content.features || []).filter((item) => item.is_active !== false).slice(0, 3)

  return (
    <section className="relative py-16 md:py-24" style={{ background: '#0F0A07' }}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(182,136,94,0.04)_0%,_transparent_70%)]" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: '#B6885E' }}>
              {t(content.eyebrow_en || 'What We Stand For', content.eyebrow_ar || content.eyebrow_en || 'Ù…Ø§ Ù†Ø¤Ù…Ù† Ø¨Ù‡')}
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl" style={{ color: '#F5E6D8' }}>
              {t(content.title_en || section.defaultTitleEn, content.title_ar || content.title_en || section.defaultTitleAr)}
            </h2>
            <p className="mx-auto max-w-2xl" style={{ color: 'rgba(183,155,133,0.72)' }}>
              {t(content.subtitle_en || section.defaultSubtitleEn, content.subtitle_ar || content.subtitle_en || section.defaultSubtitleAr)}
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {valueCards.map((value, index) => (
            <motion.div
              key={value.id || index}
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
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(182,136,94,0.1)',
                  border: '1px solid rgba(182,136,94,0.25)',
                }}
              >
                <span className="text-sm font-bold" style={{ color: '#B6885E' }}>
                  0{index + 1}
                </span>
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold" style={{ color: '#F5E6D8' }}>
                {t(value.title_en, value.title_ar || value.title_en)}
              </h3>
              <p className="leading-relaxed" style={{ color: 'rgba(183,155,133,0.72)' }}>
                {t(value.description_en || '', value.description_ar || value.description_en || '')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
