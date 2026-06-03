'use client'

import Image from 'next/image'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  GRAIN_SVG,
  type VisualEffects,
} from '@/lib/media'

/**
 * Cinematic overlay stack shared by HeroSection and the admin editor preview.
 * Uses inline styles for all gradients to avoid Tailwind JIT cache issues.
 */
export function HeroBackground({
  image,
  imageAlt = '',
  objectPosition,
  overlayOpacity = 0.52,
  visualEffects,
  isRtl,
  priority = false,
  useImgTag = false,
}: {
  image: string
  imageAlt?: string
  objectPosition?: string
  overlayOpacity?: number
  visualEffects?: VisualEffects
  isRtl: boolean
  priority?: boolean
  useImgTag?: boolean
}) {
  const fx = visualEffects || {}
  const hasFx = Object.keys(fx).length > 0
  const imgFilter = buildEffectsFilter(fx)
  const overlayGrad = buildOverlayGradient(fx.gradient_type, fx.overlay_color, overlayOpacity)
  const fxVignette = Number(fx.vignette ?? 0)
  const fxGlow = Number(fx.glow ?? 0)
  const fxGrain = Number(fx.grain ?? 0)

  const sideGrad = isRtl
    ? 'linear-gradient(270deg, rgba(11,8,6,0.80) 0%, rgba(11,8,6,0.52) 36%, rgba(11,8,6,0.16) 64%, transparent 100%)'
    : 'linear-gradient(90deg, rgba(11,8,6,0.80) 0%, rgba(11,8,6,0.52) 36%, rgba(11,8,6,0.16) 64%, transparent 100%)'

  return (
    <>
      {/* Background image */}
      {useImgTag ? (
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: objectPosition || 'center center',
            ...(hasFx && imgFilter ? { filter: imgFilter } : {}),
          }}
        />
      ) : (
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
          style={{
            objectPosition: objectPosition || (isRtl ? 'left center' : 'right center'),
            ...(hasFx && imgFilter ? { filter: imgFilter } : {}),
          }}
          priority={priority}
        />
      )}

      {/* 1. Dark base overlay */}
      {hasFx
        ? <div className="absolute inset-0" style={{ background: overlayGrad }} />
        : <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
      }

      {/* 2. Soft vignette — edges only, center stays open */}
      {fxVignette > 0.05
        ? <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${fxVignette.toFixed(2)}) 100%)` }} />
        : <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.38) 100%)' }} />
      }

      {/* 3. Bottom lift — blends hero into the section below */}
      <div
        className="absolute inset-x-0 bottom-0 h-[50%]"
        style={{ background: 'linear-gradient(to top, #0B0806 0%, rgba(11,8,6,0.50) 40%, transparent 100%)' }}
      />

      {/* 4. Side gradient — darkens behind text for contrast */}
      <div className="absolute inset-0" style={{ background: sideGrad }} />

      {/* 5. Ambient gold glow */}
      {fxGlow > 0.05
        ? <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 65%, rgba(182,136,94,${fxGlow.toFixed(2)}) 0%, transparent 70%)` }} />
        : <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 65%, rgba(182,136,94,0.14) 0%, transparent 70%)' }} />
      }

      {/* 6. Film grain */}
      {fxGrain > 0.05 && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: fxGrain, backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '180px 180px', mixBlendMode: 'screen' }}
        />
      )}
    </>
  )
}
