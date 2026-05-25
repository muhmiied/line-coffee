'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  GRAIN_SVG,
  type VisualEffects,
} from '@/lib/media'

/**
 * Shared cinematic overlay stack used by BOTH the live HeroSection and the
 * admin editor preview. Any visual change here is automatically reflected in
 * both places — no more duplicate overlay code.
 *
 * Renders only absolute-positioned layers. The caller provides the container.
 */
export function HeroBackground({
  image,
  imageAlt = '',
  objectPosition,
  overlayOpacity = 0.6,
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
  /** Editor passes true — avoids next/image domain restrictions for blob/Unsplash URLs */
  useImgTag?: boolean
}) {
  const fx = visualEffects || {}
  const hasFx = Object.keys(fx).length > 0
  const imgFilter = buildEffectsFilter(fx)
  const overlayGrad = buildOverlayGradient(fx.gradient_type, fx.overlay_color, overlayOpacity)
  const fxVignette = Number(fx.vignette ?? 0)
  const fxGlow = Number(fx.glow ?? 0)
  const fxGrain = Number(fx.grain ?? 0)

  return (
    <>
      {/* ── Background image ── */}
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

      {/* ── Cinematic grading stack ── */}

      {/* 1. Dark base overlay */}
      {hasFx
        ? <div className="absolute inset-0" style={{ background: overlayGrad }} />
        : <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
      }

      {/* 2. Warm brown tone cast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />

      {/* 3. Vignette */}
      {fxVignette > 0.05
        ? <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${fxVignette.toFixed(2)}) 100%)` }} />
        : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
      }

      {/* 4. Bottom lift */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />

      {/* 5. Top scrim */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />

      {/* 6. Side gradient — direction flips for RTL */}
      <div
        className={cn(
          'absolute inset-0',
          isRtl
            ? 'bg-[linear-gradient(270deg,_rgba(11,8,6,0.94)_0%,_rgba(11,8,6,0.72)_34%,_rgba(11,8,6,0.26)_64%,_rgba(11,8,6,0.08)_100%)]'
            : 'bg-[linear-gradient(90deg,_rgba(11,8,6,0.94)_0%,_rgba(11,8,6,0.72)_34%,_rgba(11,8,6,0.26)_64%,_rgba(11,8,6,0.08)_100%)]'
        )}
      />

      {/* 7. Ambient gold glow */}
      {fxGlow > 0.05
        ? <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 65%, rgba(182,136,94,${fxGlow.toFixed(2)}) 0%, transparent 70%)` }} />
        : <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.12)_0%,_transparent_70%)]" />
      }

      {/* 8. Film grain */}
      {fxGrain > 0.05 && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: fxGrain, backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '180px 180px', mixBlendMode: 'screen' }}
        />
      )}
    </>
  )
}
