'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const INITIAL_LOAD_KEY = 'line-coffee-initial-load'
const INITIAL_MS = 2400
const NAV_MS = 700

// ─── Realistic steam wisp ──────────────────────────────────────────────────────
// All visual styles live in .loader-steam-wisp / .loader-steam-fill (globals.css)
// Only dynamic prop-dependent values (left, height) stay in style.
function SteamWisp({
  offsetX = 0,
  delay = 0,
  height = 60,
  maxOpacity = 0.28,
}: {
  offsetX?: number
  delay?: number
  height?: number
  maxOpacity?: number
}) {
  const dir = offsetX >= 0 ? 1 : -1
  return (
    <motion.div
      className="loader-steam-wisp pointer-events-none"
      style={{ left: `calc(50% + ${offsetX}px)`, height }}
      initial={{ opacity: 0, scaleY: 0.1, y: 0, x: 0 }}
      animate={{
        opacity: [0, maxOpacity, maxOpacity * 0.62, 0],
        scaleY: [0.1, 1, 0.82, 0.35],
        y: [0, -(height * 0.5), -(height * 1.0), -(height * 1.5)],
        x: [0, dir * 3, dir * 5, dir * 2],
      }}
      transition={{
        duration: 4.2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.28, 0.65, 1],
      }}
    >
      <div className="loader-steam-fill" />
    </motion.div>
  )
}

// ─── Page loader orchestrator ──────────────────────────────────────────────────
export function PageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const prevPathRef = useRef(pathname)

  // First visit — full cinematic experience
  useEffect(() => {
    const seen = sessionStorage.getItem(INITIAL_LOAD_KEY) === 'true'
    if (!seen) {
      setIsLoading(true)
      setIsInitialLoad(true)
      setReady(true)
      const t = setTimeout(() => {
        setIsLoading(false)
        setIsInitialLoad(false)
        sessionStorage.setItem(INITIAL_LOAD_KEY, 'true')
      }, INITIAL_MS)
      return () => clearTimeout(t)
    } else {
      setIsInitialLoad(false)
      setReady(true)
    }
  }, [])

  // Page navigation — thin progress bar only
  useEffect(() => {
    if (!ready) return
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      setIsLoading(true)
      const t = setTimeout(() => setIsLoading(false), NAV_MS)
      return () => clearTimeout(t)
    }
  }, [pathname, searchParams, ready])

  if (!ready) return null

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key={isInitialLoad ? 'cinematic-initial' : `nav-${pathname}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: isInitialLoad ? 0.7 : 0.22,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
        >
          {isInitialLoad ? <CinematicLoader /> : <NavProgressLine />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Full cinematic initial loader ────────────────────────────────────────────
function CinematicLoader() {
  const totalSec = INITIAL_MS / 1000

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-auto">

      {/* Deep espresso background */}
      <div className="absolute inset-0 loader-espresso-bg" />

      {/* Circular vignette */}
      <div className="absolute inset-0 loader-vignette pointer-events-none" />

      {/* Warm amber bloom — fades in behind logo */}
      <motion.div
        className="absolute pointer-events-none loader-center-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.75, 1] }}
        transition={{ duration: totalSec * 0.85, ease: 'easeInOut' }}
      />

      {/* Gold brand pattern at 6% */}
      <div className="absolute inset-0 brand-pattern-gold loader-pattern-overlay pointer-events-none" />

      {/* Top warm ceiling */}
      <div className="absolute top-0 inset-x-0 h-[32%] loader-top-ambient pointer-events-none" />

      {/* ── Central content: steam → logo → tagline ── */}
      <div className="relative flex flex-col items-center">

        {/* Steam wisps — rise from top edge of logo */}
        <div className="relative w-[220px] md:w-[280px] h-[70px]">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <SteamWisp offsetX={-22} delay={0}    height={62} maxOpacity={0.30} />
            <SteamWisp offsetX={2}   delay={1.45} height={78} maxOpacity={0.25} />
            <SteamWisp offsetX={24}  delay={0.68} height={58} maxOpacity={0.28} />
          </motion.div>
        </div>

        {/* Logo — colored (golden amber), no manual recolouring */}
        <motion.div
          className="relative w-[220px] h-[94px] md:w-[280px] md:h-[120px]"
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient glow ring behind logo */}
          <motion.div
            className="absolute pointer-events-none loader-logo-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.72, 1] }}
            transition={{ duration: 2.4, delay: 0.32, ease: 'easeInOut' }}
          />

          <Image
            src="/brand/logo-colored.svg"
            alt="Line Coffee"
            fill
            priority
            unoptimized
            className="object-contain relative z-10"
          />
        </motion.div>

        {/* Thin gold rule */}
        <motion.div
          className="loader-gold-rule"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.78, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Tagline */}
        <motion.p
          className="font-serif uppercase loader-tagline"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Crafted with Precision
        </motion.p>
      </div>

      {/* ── Bottom progress line — thin gold fill ── */}
      <div className="absolute bottom-0 inset-x-0 loader-progress-track pointer-events-none">
        <motion.div
          className="loader-progress-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: totalSec - 0.48,
            delay: 0.08,
            ease: [0.22, 0.02, 0.56, 1],
          }}
        />
      </div>

      {/* Bottom warm ambient */}
      <div className="absolute bottom-0 inset-x-0 h-28 loader-bottom-ambient pointer-events-none" />
    </div>
  )
}

// ─── Minimal page-navigation indicator ────────────────────────────────────────
function NavProgressLine() {
  const durationSec = NAV_MS / 1000
  return (
    <div className="absolute top-0 inset-x-0 loader-nav-track">
      <motion.div
        className="loader-nav-fill"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: durationSec * 0.88, ease: [0.25, 0.04, 0.55, 1] }}
      />
    </div>
  )
}
