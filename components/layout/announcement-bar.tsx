'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnnouncementData {
  text: string
  active: boolean
}

export function AnnouncementBar() {
  const [data, setData] = useState<AnnouncementData | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('ann-dismissed') === '1'
    if (wasDismissed) {
      setDismissed(true)
      document.documentElement.style.setProperty('--ann-h', '0px')
      return
    }
    fetch('/api/settings/announcement')
      .then((r) => r.json())
      .then((d: AnnouncementData) => setData(d))
      .catch(() => setData({ text: 'مرحباً بكم في لاين كوفي — توصيل لجميع أنحاء مصر 🚀', active: true }))
  }, [])

  useEffect(() => {
    if (data?.active && !dismissed && barRef.current) {
      const h = barRef.current.offsetHeight
      document.documentElement.style.setProperty('--ann-h', `${h}px`)
    } else {
      document.documentElement.style.setProperty('--ann-h', '0px')
    }
  }, [data, dismissed])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('ann-dismissed', '1')
    document.documentElement.style.setProperty('--ann-h', '0px')
  }

  if (!data?.active || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={barRef}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-[#3d1a00] text-[#FFDCC2] text-sm text-center overflow-hidden"
      >
        <div className="px-10 py-2 flex items-center justify-center min-h-[36px]">
          <span>{data.text}</span>
          <button
            onClick={dismiss}
            aria-label="إغلاق الإعلان"
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
