'use client'

import { useState } from 'react'
import { Search, Package, CheckCircle2, Clock, ChefHat, Truck, XCircle } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import Image from 'next/image'
import Link from 'next/link'

type TrackData = {
  order_number: string
  status: string
  total: number
  subtotal?: number
  shipping_cost?: number
  created_at: string
  updated_at: string
  notes?: string | null
  is_cancelled: boolean
  current_step: number
  steps: string[]
  items: Array<{ product_name: string; size?: string; quantity: number; unit_price: number; total_price: number }>
}

const STEP_CONFIG = [
  { key: 'pending',    icon: Clock,        en: 'Order Placed',    ar: 'تم الطلب' },
  { key: 'confirmed',  icon: CheckCircle2, en: 'Confirmed',       ar: 'تم التأكيد' },
  { key: 'processing', icon: ChefHat,      en: 'Being Prepared',  ar: 'قيد التجهيز' },
  { key: 'shipped',    icon: Truck,        en: 'Out for Delivery', ar: 'في الطريق' },
  { key: 'delivered',  icon: CheckCircle2, en: 'Delivered',       ar: 'تم التسليم' },
]

export default function TrackPage() {
  const { t, language } = useLanguage()
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TrackData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const track = async () => {
    if (!orderNumber.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/orders/track?order_number=${encodeURIComponent(orderNumber.trim())}`)
      const json = await res.json()
      if (!json.success) {
        setError(t('Order not found. Please check the order number.', 'الطلب غير موجود. تأكد من رقم الطلب.'))
      } else {
        setData(json.data)
      }
    } catch {
      setError(t('Network error. Please try again.', 'خطأ في الاتصال. حاول مجدداً.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#522500] py-12 px-4 text-center">
        <Link href="/" className="inline-block mb-6">
          <Image src="/brand/logo-white.svg" alt="Line Coffee" width={170} height={74} unoptimized />
        </Link>
        <h1 className="text-[#FFDCC2] text-2xl font-bold mb-2">{t('Track Your Order', 'تتبع طلبك')}</h1>
        <p className="text-[#FFDCC2]/60 text-sm">{t('Enter your order number to see the current status', 'أدخل رقم طلبك لمعرفة الحالة الحالية')}</p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Search box */}
        <div className="bg-white border border-[#e8ddd5] rounded-2xl p-5 shadow-sm mb-6">
          <label className="block text-[#522500] text-sm font-semibold mb-3">{t('Order Number', 'رقم الطلب')}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && track()}
              placeholder={t('e.g. LC-1001', 'مثال: LC-1001')}
              className="flex-1 border border-[#e8ddd5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30 bg-[#fafaf5]"
            />
            <button
              type="button"
              onClick={track}
              disabled={loading || !orderNumber.trim()}
              className="flex items-center gap-2 bg-[#522500] hover:bg-[#3d1b00] text-[#FFDCC2] px-5 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#FFDCC2] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t('Track', 'تتبع')}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {data && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-white border border-[#e8ddd5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#522500] font-bold text-lg">#{data.order_number}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(data.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#522500] font-bold">{Number(data.total).toLocaleString()} {t('EGP', 'ج.م')}</p>
                </div>
              </div>

              {/* Status timeline */}
              {data.is_cancelled ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-red-600 font-semibold text-sm">{t('Order Cancelled', 'تم إلغاء الطلب')}</p>
                    {data.notes && data.notes.includes('سبب الإلغاء') && (
                      <p className="text-red-400 text-xs mt-0.5">{data.notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center justify-between relative">
                    {/* Progress line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#e8ddd5] z-0" />
                    <div
                      className="absolute top-4 left-4 h-0.5 bg-[#522500] z-0 transition-all duration-700"
                      style={{ width: data.current_step >= 0 ? `${(data.current_step / (STEP_CONFIG.length - 1)) * 100}%` : '0%' }}
                    />
                    {STEP_CONFIG.map((step, idx) => {
                      const done = idx <= data.current_step
                      const current = idx === data.current_step
                      const Icon = step.icon
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                            done ? 'bg-[#522500]' : 'bg-white border-2 border-[#e8ddd5]'
                          } ${current ? 'ring-2 ring-[#522500]/30 ring-offset-2' : ''}`}>
                            <Icon className={`h-4 w-4 ${done ? 'text-[#FFDCC2]' : 'text-gray-300'}`} />
                          </div>
                          <p className={`text-[9px] text-center leading-tight max-w-[52px] ${done ? 'text-[#522500] font-semibold' : 'text-gray-400'}`}>
                            {t(step.en, step.ar)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order items */}
            {data.items.length > 0 && (
              <div className="bg-white border border-[#e8ddd5] rounded-2xl p-5 shadow-sm">
                <p className="text-[#522500] font-semibold text-sm mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('Order Items', 'محتويات الطلب')}
                </p>
                <div className="space-y-2">
                  {data.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-[#f0ebe5] last:border-0">
                      <span className="text-gray-700">
                        {item.product_name}
                        {item.size && <span className="text-gray-400 text-xs ml-1">({item.size})</span>}
                        <span className="text-gray-400 ml-1">× {item.quantity}</span>
                      </span>
                      <span className="text-[#522500] font-medium">{item.total_price} {t('EGP', 'ج.م')}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 mt-1 border-t border-[#e8ddd5] space-y-1">
                  {data.subtotal !== undefined && data.shipping_cost !== undefined && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{t('Delivery', 'توصيل')}</span>
                      <span>{data.shipping_cost > 0 ? `${data.shipping_cost} ${t('EGP', 'ج.م')}` : t('Free Delivery', 'توصيل مجاني')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#522500]">
                    <span>{t('Total', 'الإجمالي')}</span>
                    <span>{data.total} {t('EGP', 'ج.م')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Help */}
            <div className="text-center">
              <p className="text-gray-400 text-xs">{t('Need help?', 'تحتاج مساعدة؟')}</p>
              <a
                href={`https://wa.me/201004761171?text=${encodeURIComponent(t(`Hello, I need help with order #${data.order_number}`, `مرحباً، أحتاج مساعدة بخصوص الطلب #${data.order_number}`))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#522500] text-xs font-semibold hover:underline"
              >
                {t('Contact us on WhatsApp', 'تواصل معنا على واتساب')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
