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
    <SectionReveal className="py-16 md:py-24 bg-gradient-to-t from-secondary/50 via-background to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <FadeUp className="text-primary font-medium mb-2">
            @linecoffee.eg
          </FadeUp>
          <FadeUp className="font-serif text-3xl md:text-4xl font-bold mb-4">
            <WordByWord text={t('Follow Our Journey', 'تابع رحلتنا')} />
          </FadeUp>
          <FadeUp className="flex items-center justify-center gap-4">
            <a
              href="https://instagram.com/linecoffee.eg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm">Instagram</span>
            </a>
            <a
              href="https://facebook.com/linecoffee"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span className="text-sm">Facebook</span>
            </a>
          </FadeUp>
        </div>

        {/* Photos Grid - 6 square photos */}
        <StaggerContainer
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4"
        >
          {instagramPhotos.map((photo, index) => (
            <ImageReveal
              key={index}
            >
              <motion.a
                href="https://instagram.com/linecoffee.eg"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-square rounded-lg overflow-hidden group cursor-pointer"
              >
                <Image
                  src={photo}
                  alt={`Instagram photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-300 flex items-center justify-center">
                  <Instagram className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.a>
            </ImageReveal>
          ))}
        </StaggerContainer>
      </div>
    </SectionReveal>
  )
}
