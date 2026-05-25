'use client'

import { useState } from 'react'
import { Search, Package, CheckCircle2, Clock, ChefHat, Truck, XCircle, Coffee } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import Image from 'next/image'
import Link from 'next/link'
import { getOrderItemDetailLines } from '@/lib/order-item-details'
import { ORDER_STATUS_LABELS } from '@/lib/order-status'
import { WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

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
  items: Array<{ product_name: string; size?: string; quantity: number; unit_price: number; total_price: number; customizations?: Record<string, unknown> | null }>
}

const STEP_CONFIG = [
  { key: 'pending',   icon: Clock,        ...ORDER_STATUS_LABELS.pending },
  { key: 'confirmed', icon: CheckCircle2, ...ORDER_STATUS_LABELS.confirmed },
  { key: 'preparing', icon: ChefHat,      ...ORDER_STATUS_LABELS.preparing },
  { key: 'shipped',   icon: Truck,        ...ORDER_STATUS_LABELS.shipped },
  { key: 'delivered', icon: CheckCircle2, ...ORDER_STATUS_LABELS.delivered },
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
    <div
      className="min-h-screen"
      style={{ background: '#0B0806' }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div
        className="py-12 px-4 text-center border-b border-[#B6885E]/12"
        style={{ background: 'linear-gradient(180deg, #18120D 0%, #0B0806 100%)' }}
      >
        <Link href="/" className="inline-block mb-6">
          <Image src="/brand/logo-white.svg" alt="Line Coffee" width={170} height={74} unoptimized />
        </Link>
        <h1 className="font-serif text-2xl font-bold mb-2 text-[#F5E6D8]">
          {t('Track Your Order', 'تتبع طلبك')}
        </h1>
        <p className="text-[#D6B79A]/65 text-sm">
          {t('Enter your order number to see the current status', 'أدخل رقم طلبك لمعرفة الحالة الحالية')}
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Search box */}
        <div className="rounded-2xl border border-[#B6885E]/15 bg-[#18120D]/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.3)] mb-6">
          <label className="block text-sm font-semibold mb-3 text-[#F5E6D8]">
            {t('Order Number', 'رقم الطلب')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && track()}
              placeholder={t('e.g. LC-1001', 'مثال: LC-1001')}
              className="flex-1 rounded-xl border border-[#B6885E]/18 bg-[#120D09]/80 px-4 py-3 text-sm text-[#F5E6D8] placeholder:text-[#D6B79A]/40 focus:outline-none focus:ring-2 focus:ring-[#D6A373]/25"
            />
            <button
              type="button"
              onClick={track}
              disabled={loading || !orderNumber.trim()}
              className="premium-button flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#0B0806]/40 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t('Track', 'تتبع')}
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="rounded-2xl border border-[#B6885E]/12 bg-[#18120D]/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 w-28 rounded bg-[#B6885E]/15" />
                  <div className="h-3 w-36 rounded bg-[#B6885E]/10" />
                </div>
                <div className="h-5 w-20 rounded bg-[#B6885E]/15" />
              </div>
              <div className="h-16 rounded-xl bg-[#B6885E]/8" />
            </div>
            <div className="rounded-2xl border border-[#B6885E]/12 bg-[#B6885E]/8 p-5 h-32" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-950/30 p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/50">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-red-300 text-sm font-medium">{error}</p>
            <p className="text-red-400/70 text-xs mt-1">
              {t('Please double-check your order number.', 'تأكد من رقم الطلب وحاول مجدداً.')}
            </p>
          </div>
        )}

        {/* Result */}
        {data && (
          <div className="space-y-4">

            {/* Order summary card */}
            <div className="rounded-2xl border border-[#B6885E]/15 bg-[#18120D]/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-serif font-bold text-lg text-[#F5E6D8]">#{data.order_number}</p>
                  <p className="text-[#D6B79A]/55 text-xs mt-0.5">
                    {new Date(data.created_at).toLocaleDateString(
                      language === 'ar' ? 'ar-EG' : 'en-GB',
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#D6A373] font-bold">
                    {Number(data.total).toLocaleString()} {t('EGP', 'ج.م')}
                  </p>
                </div>
              </div>

              {/* Status timeline */}
              {data.is_cancelled ? (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/25 px-4 py-4">
                  <div className="h-9 w-9 rounded-xl bg-red-950/50 flex items-center justify-center shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-300 font-semibold">{t('Order Cancelled', 'تم إلغاء الطلب')}</p>
                    {data.notes && data.notes.includes('سبب الإلغاء') && (
                      <p className="text-red-400/80 text-sm mt-1">{data.notes}</p>
                    )}
                    <p className="text-red-400/60 text-xs mt-1">
                      {t('Contact us if you have any questions.', 'تواصل معنا لأي استفسار.')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center justify-between relative">
                    {/* Track line background */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#B6885E]/20 z-0" />
                    {/* Track line fill */}
                    <div
                      className="absolute top-4 left-4 h-0.5 z-0 transition-all duration-700"
                      style={{
                        width: data.current_step >= 0
                          ? `${(data.current_step / (STEP_CONFIG.length - 1)) * 100}%`
                          : '0%',
                        background: 'linear-gradient(to right, #B6885E, #D6A373)',
                      }}
                    />
                    {STEP_CONFIG.map((step, idx) => {
                      const done = idx <= data.current_step
                      const current = idx === data.current_step
                      const Icon = step.icon
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                          <div className="relative">
                            {current && (
                              <span className="absolute inset-0 rounded-full bg-[#D6A373]/20 animate-ping [animation-duration:2s]" />
                            )}
                            <div
                              className={`relative h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                                done
                                  ? 'shadow-[0_0_12px_rgba(182,136,94,0.4)]'
                                  : 'bg-[#120D09]/80 border-2 border-[#B6885E]/22'
                              } ${current ? 'shadow-[0_0_0_4px_rgba(182,136,94,0.15)]' : ''}`}
                              style={done ? { background: 'linear-gradient(135deg, #B6885E, #D6A373)' } : undefined}
                            >
                              <Icon className={`h-4 w-4 ${done ? 'text-[#0B0806]' : 'text-[#B6885E]/40'}`} />
                            </div>
                          </div>
                          <p className={`text-[9px] text-center leading-tight max-w-[52px] ${
                            done ? 'text-[#D6A373] font-semibold' : 'text-[#D6B79A]/40'
                          }`}>
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
              <div className="rounded-2xl border border-[#B6885E]/15 bg-[#18120D]/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                <p className="text-[#D6A373] font-semibold text-sm mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('Order Items', 'محتويات الطلب')}
                </p>
                <div className="space-y-0">
                  {data.items.map((item, idx) => {
                    const isCustom = item.product_name.includes('Make Your') || item.product_name.includes('اختر')
                    const detailLines = getOrderItemDetailLines(item.customizations)
                    const sizeSegments = item.size && detailLines.length === 0
                      ? item.size.split(/[|/,]/).map(p => p.trim()).filter(Boolean)
                      : []
                    return (
                      <div key={idx} className="py-2.5 border-b border-[#B6885E]/10 last:border-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isCustom && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#D6A373]/12 text-[#D6A373] font-medium shrink-0">
                                  <Coffee className="h-3 w-3" />
                                  {t('Custom', 'مخصص')}
                                </span>
                              )}
                              <span className="text-sm font-medium text-[#F5E6D8]">{item.product_name}</span>
                            </div>
                            {sizeSegments.length > 1 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sizeSegments.map((seg, si) => (
                                  <span key={si} className="text-[10px] px-2 py-0.5 rounded-full bg-[#B6885E]/12 text-[#D6B79A]">
                                    {seg}
                                  </span>
                                ))}
                                <span className="text-[10px] text-[#D6B79A]/55 self-center">× {item.quantity}</span>
                              </div>
                            ) : (
                              <p className="text-xs text-[#D6B79A]/55 mt-0.5">
                                {item.size ? `${item.size} · ` : ''}× {item.quantity}
                              </p>
                            )}
                            {detailLines.length > 0 && (
                              <div className="mt-1.5 space-y-0.5 rounded-lg border border-[#B6885E]/10 bg-[#120D09]/60 p-2 text-xs text-[#D6B79A]/65">
                                {detailLines.map((line, lineIndex) => (
                                  <p key={lineIndex}>{t(line.en, line.ar)}</p>
                                ))}
                                {item.size && <p>{item.size}</p>}
                                <p>× {item.quantity}</p>
                              </div>
                            )}
                          </div>
                          <span className="text-[#D6A373] font-semibold text-sm shrink-0">
                            {item.total_price} {t('EGP', 'ج.م')}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-3 mt-1 border-t border-[#B6885E]/15 space-y-1">
                  {data.subtotal !== undefined && data.shipping_cost !== undefined && (
                    <div className="flex justify-between text-xs text-[#D6B79A]/55">
                      <span>{t('Delivery', 'توصيل')}</span>
                      <span>
                        {data.shipping_cost > 0
                          ? `${data.shipping_cost} ${t('EGP', 'ج.م')}`
                          : t('Free Delivery', 'توصيل مجاني')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#D6A373]">
                    <span>{t('Total', 'الإجمالي')}</span>
                    <span>{data.total} {t('EGP', 'ج.م')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Review CTA when delivered */}
            {data.status === 'delivered' && (
              <div className="rounded-2xl border border-[#B6885E]/15 bg-[#18120D]/80 p-5 text-center">
                <p className="text-sm font-semibold text-[#F5E6D8] mb-1">
                  {t('Your order arrived! How was it?', 'وصل طلبك! كيف كانت التجربة؟')}
                </p>
                <p className="text-xs text-[#D6B79A]/60 mb-3">
                  {t('Share your experience and help others discover great coffee.', 'شاركنا تجربتك وساعد الآخرين في اكتشاف قهوة مميزة.')}
                </p>
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D6A373]/30 bg-[#D6A373]/10 px-5 py-2 text-xs font-semibold text-[#D6A373] transition-all duration-200 hover:border-[#D6A373]/55 hover:bg-[#D6A373]/16 hover:text-[#F5E6D8]"
                >
                  {t('Leave a Review', 'اترك تقييماً')}
                </Link>
              </div>
            )}

            {/* Help */}
            <div className="text-center">
              <p className="text-[#D6B79A]/55 text-xs">{t('Need help?', 'تحتاج مساعدة؟')}</p>
              <a
                href={`https://wa.me/${WHATSAPP_ORDER_PHONE_E164}?text=${encodeURIComponent(t(`Hello, I need help with order #${data.order_number}`, `مرحباً، أحتاج مساعدة بخصوص الطلب #${data.order_number}`))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6A373] text-xs font-semibold hover:text-[#F5E6D8] transition-colors"
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
