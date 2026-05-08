'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hoverText, setHoverText] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 400 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    setIsMounted(true)
    
    // Only show custom cursor on desktop
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) return

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setIsVisible(true)
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cursorText = target.closest('[data-cursor]')?.getAttribute('data-cursor')
      if (cursorText) {
        setIsHovering(true)
        setHoverText(cursorText)
      }
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
      setHoverText('')
    }

    const handleMouseOut = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseout', handleMouseOut)
    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter as EventListener)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseout', handleMouseOut)
      document.querySelectorAll('[data-cursor]').forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter as EventListener)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [cursorX, cursorY])

  // Don't render on server or before mount
  if (!isMounted) return null

  return (
    <>
      {/* Cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#522500] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Cursor ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-[#522500] rounded-full pointer-events-none z-[9998] hidden md:flex items-center justify-center"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHovering ? 2 : 1,
          backgroundColor: isHovering ? 'rgba(82, 37, 0, 0.9)' : 'rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.2 }}
      >
        {isHovering && hoverText && (
          <span className="text-[10px] font-medium text-white whitespace-nowrap">
            {hoverText}
          </span>
        )}
      </motion.div>
    </>
  )
}
