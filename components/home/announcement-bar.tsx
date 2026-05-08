'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

export function AnnouncementBar() {
  const { t, dir } = useLanguage()
  const [isDismissed, setIsDismissed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const announcements = [
    t(
      'Free shipping on orders over 200 EGP',
      'شحن مجاني للطلبات فوق 200 جنيه'
    ),
    t(
      'Use code WELCOME10 for 10% off your first order',
      'استخدم كود WELCOME10 للحصول على خصم 10% على طلبك الأول'
    ),
  ]

  const fullText = announcements.join('  •  ')

  useEffect(() => {
    // Check if dismissed in session
    const dismissed = sessionStorage.getItem('announcement-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('announcement-dismissed', 'true')
  }

  if (isDismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] overflow-hidden h-10 bg-[#522500]">
      <div className="relative z-10 flex items-center">
        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden">
          <div 
            className={cn(
              "flex whitespace-nowrap animate-ticker",
              dir === 'rtl' && 'animate-ticker-rtl'
            )}
          >
            {/* Duplicate content for seamless loop */}
            {[...Array(4)].map((_, i) => (
              <span
                key={i} 
                className="inline-flex items-center text-sm font-serif mx-8 h-10"
                style={{ color: '#FFDCC2' }}
              >
                {fullText}
                <span className="mx-6">|</span>
              </span>
            ))}
          </div>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="shrink-0 h-7 w-7 mr-2 text-white/80 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes ticker-rtl {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker-rtl {
          animation: ticker-rtl 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
