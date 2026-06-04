'use client'

import Image from 'next/image'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getVisualEffects,
  GRAIN_SVG,
  type SectionBuilderContent,
  type SiteMediaItem,
} from '@/lib/media'
import { useLanguage } from '@/lib/context/language'

type BlogHeroProps = {
  media: SiteMediaItem | null
  content: SectionBuilderContent
}

export function BlogHero({ media, content }: BlogHeroProps) {
  const { t } = useLanguage()
  const bgFx = getVisualEffects(media)
  const bgFilter = buildEffectsFilter(bgFx)
  const overlayOpacity = media ? getMediaOverlayOpacity(media, 0.78) : 0.78
  const bgOverlay = buildOverlayGradient(bgFx.gradient_type, bgFx.overlay_color, overlayOpacity)
  const eyebrowEn = content.eyebrow_en ?? 'Coffee Journal'
  const eyebrowAr = content.eyebrow_ar ?? 'مجلة القهوة'
  const titleEn = content.title_en ?? 'Blog'
  const titleAr = content.title_ar ?? 'المدونة'
  const subtitleEn = content.subtitle_en ?? 'Coffee stories, brewing guides & more'
  const subtitleAr = content.subtitle_ar ?? 'قصص القهوة، أدلة التحضير والمزيد'

  const hero = (
    <>
      {media?.image_url && (
        <>
          <Image
            src={media.image_url}
            alt={media.alt_en || content.title_en || ''}
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
            style={{ objectPosition: getMediaObjectPosition(media), filter: bgFilter || undefined }}
            unoptimized
          />
          <div className="absolute inset-0" style={{ background: bgOverlay }} />
          {Number(bgFx.grain || 0) > 0.05 && (
            <div className="absolute inset-0 mix-blend-screen" style={{ opacity: Number(bgFx.grain), backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px' }} />
          )}
        </>
      )}

      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center md:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]">
            {t(eyebrowEn, eyebrowAr)}
          </p>
          <h1 className="mb-3 font-serif text-3xl font-bold leading-[1.18] text-[#F5E6D8] md:text-5xl">
            {t(titleEn, titleAr)}
          </h1>
          <p className="text-lg text-[#D6B79A]/72">
            {t(subtitleEn, subtitleAr)}
          </p>
        </div>
      </div>
    </>
  )

  return hero
}
