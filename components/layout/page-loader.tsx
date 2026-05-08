'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const INITIAL_LOAD_KEY = 'line-coffee-initial-load'

export function PageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [ready, setReady] = useState(false)
  const prevPathRef = useRef(pathname)

  // Handle initial page load
  useEffect(() => {
    const hasSeenInitial = sessionStorage.getItem(INITIAL_LOAD_KEY) === 'true'
    
    if (!hasSeenInitial) {
      setIsLoading(true)
      setIsInitialLoad(true)
      setReady(true)
      
      const timer = setTimeout(() => {
        setIsLoading(false)
        setIsInitialLoad(false)
        sessionStorage.setItem(INITIAL_LOAD_KEY, 'true')
      }, 2800)
      
      return () => clearTimeout(timer)
    } else {
      setIsInitialLoad(false)
      setReady(true)
    }
  }, [])

  // Handle route changes
  useEffect(() => {
    if (!ready) return
    
    // Check if path actually changed
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      setIsLoading(true)
      
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams, ready])

  if (!ready) return null

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] overflow-hidden"
        >
          {/* Cream/light background base */}
          <div className="absolute inset-0 bg-[#FFDCC2]" />
          
          {/* Brown coffee that fills from bottom to top */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={{ 
              duration: isInitialLoad ? 2.2 : 1.2,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {/* Dark brown base */}
            <div className="absolute inset-0 bg-[#522500]" />
            
            {/* Pattern overlay */}
            <div className="absolute inset-0 brand-pattern-dark opacity-[0.12]" />
            
            {/* Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1a00]/50 via-transparent to-[#6b3000]/30" />
            
            {/* Coffee surface wave effect */}
            <motion.svg 
              viewBox="0 0 1200 40" 
              preserveAspectRatio="none" 
              className="absolute -top-[39px] left-0 w-full h-10"
            >
              <motion.path
                fill="#522500"
                animate={{
                  d: [
                    "M0 20 Q 100 5, 200 20 T 400 20 T 600 20 T 800 20 T 1000 20 T 1200 20 V 40 H 0 Z",
                    "M0 20 Q 100 35, 200 20 T 400 20 T 600 20 T 800 20 T 1000 20 T 1200 20 V 40 H 0 Z",
                    "M0 20 Q 100 5, 200 20 T 400 20 T 600 20 T 800 20 T 1000 20 T 1200 20 V 40 H 0 Z",
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.svg>
          </motion.div>

          {/* Logo container - centered */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="relative">
              {/* Logo outline (transparent/faded) */}
              <motion.div
                className="relative h-20 w-[16rem] md:h-28 md:w-[22rem]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Image
                  src="/brand/logo-white.svg"
                  alt="Line Coffee"
                  fill
                  priority
                  unoptimized
                  className="object-contain opacity-20"
                />
              </motion.div>
              
              {/* Logo fill effect - clips from bottom to top like coffee filling */}
              <div className="absolute inset-0">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 overflow-hidden"
                  initial={{ height: '0%' }}
                  animate={{ height: '100%' }}
                  transition={{ 
                    duration: isInitialLoad ? 2 : 1,
                    delay: isInitialLoad ? 0.4 : 0.2,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <div className="relative h-20 w-[16rem] md:h-28 md:w-[22rem]" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <Image
                      src="/brand/logo-white.svg"
                      alt="Line Coffee"
                      fill
                      priority
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </motion.div>
              </div>
              
              {/* Coffee drip effect below logo */}
              <motion.div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: isInitialLoad ? 1 : 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-[#FFDCC2]/70"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: [0, 16, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2 + (isInitialLoad ? 1.2 : 0.6),
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Floating coffee bean particles */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[#FFDCC2]/40"
                style={{
                  left: `${10 + i * 11}%`,
                }}
                initial={{ 
                  y: '120%',
                  opacity: 0,
                  scale: 0.5 + Math.random() * 0.5
                }}
                animate={{ 
                  y: '-20%',
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 2.5 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'linear',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
