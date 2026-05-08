'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Header } from './header'

const DEFAULT_TEXT = '🚀 توصيل مجاني على الطلبات فوق 500 ج'

export function StickyTopBar() {
  const [annVisible, setAnnVisible] = useState(false)
  const [annText, setAnnText] = useState(DEFAULT_TEXT)

  useEffect(() => {
    fetch('/api/settings/announcement')
      .then((r) => r.json())
      .then((d) => {
        setAnnText(d?.text ?? DEFAULT_TEXT)
        setAnnVisible(d?.active !== false)
      })
      .catch(() => setAnnVisible(true))
  }, [])

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      {annVisible && (
        <div className="bg-[#3d1a00] text-[#FFDCC2] text-sm text-center px-10 py-2.5 relative flex items-center justify-center min-h-[38px]">
          <span>{annText}</span>
          <button
            onClick={() => setAnnVisible(false)}
            aria-label="إغلاق الإعلان"
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <Header />
    </div>
  )
}
