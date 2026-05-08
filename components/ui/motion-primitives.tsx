'use client'

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

export const viewportConfig = {
  once: true,
  amount: 0.1,
}

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
      staggerChildren: 0.15,
    },
  },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
}

export function SectionReveal({
  children,
  className,
  ...props
}: HTMLMotionProps<'section'> & { children: ReactNode }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={sectionVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  )
}

export function StaggerContainer({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div variants={sectionVariants} className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function FadeUp({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function ImageReveal({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div variants={imageVariants} className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function WordByWord({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const words = text.split(' ')

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={{
            hidden: { opacity: 0, y: 28 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.45, ease: 'easeOut' },
            },
          }}
          className="inline-block"
          style={{ marginInlineEnd: '0.35em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}
