'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Header } from './header'

const DEFAULT_TEXT = '🚀 توصيل مجاني على الطلبات فوق 200 ج'

export function StickyTopBar() {
  const pathname = usePathname()
  const [annVisible, setAnnVisible] = useState(false)
  const [annText, setAnnText] = useState(DEFAULT_TEXT)

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) return
    fetch('/api/settings/announcement')
      .then((r) => r.json())
      .then((d) => {
        setAnnText(d?.text ?? DEFAULT_TEXT)
        setAnnVisible(d?.active !== false)
      })
      .catch(() => setAnnVisible(true))
  }, [pathname])

  if (pathname.startsWith('/dashboard/admin')) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {annVisible && (
        <div className="relative flex min-h-[38px] items-center justify-center border-b border-[#B6885E]/15 bg-[#120D09]/95 px-10 py-2.5 text-center text-sm text-[#F5E6D8] shadow-[0_10px_34px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#B6885E]/10 to-transparent" aria-hidden />
          <span className="relative z-10">{annText}</span>
          <button
            onClick={() => setAnnVisible(false)}
            aria-label="إغلاق الإعلان"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D6B79A] transition-opacity hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <Header />
    </div>
  )
}
