'use client'

import { useLanguage } from '@/lib/context/language'
import { Coffee } from 'lucide-react'

const phrases = [
  { en: 'Premium Coffee', ar: 'قهوة فاخرة' },
  { en: 'Handcrafted', ar: 'صناعة يدوية' },
  { en: 'Since 2020', ar: 'منذ 2020' },
  { en: 'Arabica Beans', ar: 'حبوب أرابيكا' },
  { en: 'Specialty Roasts', ar: 'تحميص مميز' },
  { en: 'Turkish Coffee', ar: 'قهوة تركية' },
  { en: 'Fresh Daily', ar: 'طازج يومياً' },
  { en: 'Premium Quality', ar: 'جودة عالية' },
]

export function MarqueeSection() {
  const { t } = useLanguage()

  return (
    <div className="py-6 bg-[#522500] overflow-hidden">
      <div className="flex w-max gap-8 animate-marquee">
        {[...phrases, ...phrases].map((phrase, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-[#FFDCC2] text-lg md:text-xl font-serif whitespace-nowrap">
              {t(phrase.en, phrase.ar)}
            </span>
            <Coffee className="h-5 w-5 text-[#FFDCC2]/60" />
          </div>
        ))}
      </div>
    </div>
  )
}
