'use client'

import { useEffect, useState } from 'react'
import { Tag, X, Copy } from 'lucide-react'
import { useAuth } from '@/lib/context/auth'
import { useLanguage } from '@/lib/context/language'
import { toast } from 'sonner'

type DiscountData = { code: string; type: 'percentage' | 'fixed'; value: number }

export function DiscountBanner() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [discount, setDiscount] = useState<DiscountData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!user) { setDiscount(null); return }
    // Check sessionStorage so it only shows once per session after login
    const key = `discount_dismissed_${user.id}`
    if (sessionStorage.getItem(key)) { setDismissed(true); return }

    fetch('/api/discounts/my')
      .then(r => r.json())
      .then(json => { if (json.discount) setDiscount(json.discount) })
      .catch(() => {})
  }, [user])

  const dismiss = () => {
    setDismissed(true)
    if (user) sessionStorage.setItem(`discount_dismissed_${user.id}`, '1')
  }

  const copyCode = () => {
    if (!discount) return
    navigator.clipboard.writeText(discount.code)
    toast.success(t('Code copied!', 'تم نسخ الكود!'))
  }

  if (!discount || dismissed || !user) return null

  const valueText = discount.type === 'percentage'
    ? `${discount.value}%`
    : `${discount.value} EGP`

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1a0900] border border-[#c8941a]/40 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="bg-gradient-to-r from-[#c8941a]/20 to-transparent p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#c8941a]/20 border border-[#c8941a]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Tag className="h-4 w-4 text-[#c8941a]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  {t('You have an exclusive offer! 🎉', 'لديك عرض حصري! 🎉')}
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  {t(`Get ${valueText} off your order`, `احصل على خصم ${valueText} على طلبك`)}
                </p>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex items-center gap-1.5 mt-2 bg-[#c8941a] hover:bg-[#b8840f] text-black font-bold text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="font-mono tracking-wider">{discount.code}</span>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('Dismiss', 'إغلاق')}
              className="text-white/30 hover:text-white/60 transition-colors shrink-0 mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
