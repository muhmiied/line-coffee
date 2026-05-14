'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  speed?: number
  reveal?: boolean
  revealDirection?: 'left' | 'right' | 'up' | 'down'
}

export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.5,
  reveal = false,
  revealDirection = 'left',
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`])

  const revealVariants: Variants = {
    hidden: {
      clipPath:
        revealDirection === 'left'
          ? 'inset(0 100% 0 0)'
          : revealDirection === 'right'
          ? 'inset(0 0 0 100%)'
          : revealDirection === 'up'
          ? 'inset(100% 0 0 0)'
          : 'inset(0 0 100% 0)',
    },
    visible: {
      clipPath: 'inset(0 0 0 0)',
      transition: {
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  }

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0"
        style={{ y }}
        initial={reveal ? 'hidden' : undefined}
        whileInView={reveal ? 'visible' : undefined}
        viewport={{ once: true, margin: '-100px' }}
        variants={reveal ? revealVariants : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover scale-110"
        />
      </motion.div>
    </div>
  )
}
