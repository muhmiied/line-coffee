'use client'

import { cn } from '@/lib/utils'

interface MarqueeProps {
  children: React.ReactNode
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  speed?: 'slow' | 'normal' | 'fast'
}

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  speed = 'normal',
}: MarqueeProps) {
  const speedMap = {
    slow: '60s',
    normal: '40s',
    fast: '20s',
  }

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max gap-8',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
        style={{
          animation: `marquee ${speedMap[speed]} linear infinite ${reverse ? 'reverse' : ''}`,
        }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
