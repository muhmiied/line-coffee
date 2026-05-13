'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Instagram, Facebook } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { SectionReveal, FadeUp, ImageReveal, StaggerContainer, WordByWord, viewportConfig } from '@/components/ui/motion-primitives'

const instagramPhotos = [
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
]

export function InstagramSection() {
  const { t } = useLanguage()

  return (
    <SectionReveal className="cinematic-section relative py-16 md:py-24 overflow-hidden" style={{ background: '#0F0A07' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(182,136,94,0.05)_0%,_transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <FadeUp>
            <p className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-2" style={{ color: '#B6885E' }}>
              @linecoffee.eg
            </p>
          </FadeUp>
          <FadeUp className="font-serif text-3xl md:text-4xl font-bold mb-5" style={{ color: '#F5E6D8' }}>
            <WordByWord text={t('Follow Our Journey', 'تابع رحلتنا')} />
          </FadeUp>
          <FadeUp className="flex items-center justify-center gap-5">
            {[
              { href: 'https://instagram.com/linecoffee.eg', Icon: Instagram, label: 'Instagram' },
              { href: 'https://facebook.com/linecoffee', Icon: Facebook, label: 'Facebook' },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-[#D6A373]"
                style={{ color: 'rgba(183,155,133,0.6)' }}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </a>
            ))}
          </FadeUp>
        </div>

        {/* Photos Grid */}
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3"
        >
          {instagramPhotos.map((photo, index) => (
            <ImageReveal key={index}>
              <motion.a
                href="https://instagram.com/linecoffee.eg"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-image-card relative block aspect-square cursor-pointer overflow-hidden rounded-xl group"
              >
                <Image
                  src={photo}
                  alt={`Instagram photo ${index + 1}`}
                  fill
                  className="object-cover brightness-[0.84] contrast-[1.07] saturate-[1.04] transition-all duration-700 group-hover:scale-110 group-hover:brightness-[0.92]"
                />
                {/* Cinematic warm overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#B6885E]/8 to-transparent" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#0B0806]/0 group-hover:bg-[#0B0806]/35 transition-colors duration-400 flex items-center justify-center">
                  <Instagram
                    className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(182,136,94,0.5))' }}
                  />
                </div>
                {/* Gold border on hover */}
                <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-1 ring-[#B6885E]/35 transition-all duration-400" />
              </motion.a>
            </ImageReveal>
          ))}
        </StaggerContainer>
      </div>
    </SectionReveal>
  )
}
