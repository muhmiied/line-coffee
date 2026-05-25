'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Search, ChevronDown, RefreshCw, Banknote, Wallet, CreditCard, MapPin, Phone, Mail, User, MessageCircle, X, Coffee } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'
import { getOrderItemDetailLines } from '@/lib/order-item-details'
import { normalizeOrderStatus } from '@/lib/order-status'

type Order = {
  id: string
  order_number: string
  status: string
  payment_method?: string | null
  payment_status?: string | null
  total: number
  subtotal?: number
  shipping_cost?: number
  discount_amount?: number
  discount_code?: string | null
  notes?: string | null
  created_at: string
  customer_name?: string | null
  customer_phone?: string | null
  customer_email?: string | null
  address?: string | null
  shipping_address?: {
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    city?: string
    email?: string
  } | null
  items?: Array<{
    product_name: string
    size?: string
    quantity: number
    unit_price: number
    total_price: number
    customizations?: Record<string, unknown> | null
  }>
}

type CancelModal = { orderId: string; orderNumber: string; currentNotes: string | null | undefined }
type WhatsAppPending = { phone: string; orderNumber: string; newStatus: string; cancellationReason?: string | null }

const STATUSES = [
  { value: 'pending',    en: 'Pending',          ar: 'معلق',          color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  { value: 'confirmed',  en: 'Confirmed',         ar: 'مؤكد',          color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { value: 'preparing',  en: 'Preparing',         ar: 'قيد التجهيز',   color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  { value: 'shipped',    en: 'Out for Delivery',  ar: 'في الطريق',     color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  { value: 'delivered',  en: 'Delivered',         ar: 'تم التسليم',    color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  { value: 'cancelled',  en: 'Cancelled',         ar: 'ملغي',          color: 'bg-red-500/15 text-red-400 border-red-500/20' },
]

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  cod: <Banknote className="h-3.5 w-3.5" />,
  electronic_wallet: <Wallet className="h-3.5 w-3.5" />,
  instapay: <CreditCard className="h-3.5 w-3.5" />,
}

const STATUS_WA_MESSAGES: Record<string, (n: string, r?: string | null) => string> = {
  confirmed:  (n: string) => `✅ طلبك رقم *#${n}* تم تأكيده بنجاح 🎉\n\nشكراً لتسوقك من *لاين كوفي* ☕`,
  preparing: (n: string) => `☕ طلبك رقم *#${n}* قيد التجهيز الآن!\n\nنعمل على تحضيره بأفضل جودة 💛`,
  shipped:    (n: string) => `🚗 طلبك رقم *#${n}* في الطريق إليك!\n\nستصلك قريباً إن شاء الله 🙏`,
  delivered:  (n: string) => `✅ طلبك رقم *#${n}* وصل!\n\nنتمنى تكون بخير وتعجبك قهوتنا ☕💛\n*لاين كوفي*`,
  cancelled:  (n: string, r?: string | null) =>
    `❌ للأسف طلبك رقم *#${n}* تم إلغاؤه.\n${r ? `السبب: ${r}\n` : ''}\nللاستفسار تواصل معنا. *لاين كوفي*`,
}

function buildWhatsAppUrl(phone: string, orderNumber: string, status: string, reason?: string | null) {
  const fn = STATUS_WA_MESSAGES[status]
  if (!fn) return null
  const text = fn(orderNumber, reason)
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

function statusMeta(value: string) {
  const status = normalizeOrderStatus(value) || value
  return STATUSES.find((s) => s.value === status) || { en: value, ar: value, color: 'bg-white/5 text-white/40 border-white/10' }
}

export default function AdminOrdersPage() {
  const { t, language } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [cancelModal, setCancelModal] = useState<CancelModal | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [whatsappPending, setWhatsappPending] = useState<WhatsAppPending | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' })
      const data = await res.json()
      const list = data?.data?.orders || []
      setOrders(list)
      setFiltered(list)
    } catch {
      toast.error(t('Failed to load orders', 'فشل في تحميل الطلبات'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let list = [...orders]
    if (filterStatus !== 'all') list = list.filter((o) => (normalizeOrderStatus(o.status) || o.status) === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.includes(q) ||
          o.shipping_address?.first_name?.toLowerCase().includes(q) ||
          o.shipping_address?.phone?.includes(q)
      )
    }
    setFiltered(list)
  }, [search, filterStatus, orders])

  const doUpdateStatus = async (orderId: string, status: string, cancellationReason?: string) => {
    setUpdating(orderId)
    try {
      const order = orders.find(o => o.id === orderId)
      const body: Record<string, unknown> = { status }
      if (status === 'cancelled' && cancellationReason?.trim()) {
        body.cancellation_reason = cancellationReason.trim()
        body.notes = order?.notes || undefined
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(t('Update failed', 'فشل التحديث'))
        return
      }

      const savedStatus = json?.data?.status || status
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: savedStatus } : o)))
      toast.success(t('Order status updated', 'تم تحديث حالة الطلب'))

      // If server returned WhatsApp info, prompt admin to notify customer
      if (json.whatsapp) {
        setWhatsappPending({
          phone: json.whatsapp.phone,
          orderNumber: json.whatsapp.orderNumber,
          newStatus: json.whatsapp.newStatus,
          cancellationReason: json.whatsapp.cancellationReason,
        })
      }
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    } finally {
      setUpdating(null)
      setCancelModal(null)
      setCancelReason('')
    }
  }

  const handleStatusChange = (order: Order, newStatus: string) => {
    if (newStatus === 'cancelled') {
      setCancelModal({ orderId: order.id, orderNumber: order.order_number, currentNotes: order.notes })
      setCancelReason('')
    } else {
      doUpdateStatus(order.id, newStatus)
    }
  }

  const statusCounts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = orders.filter((o) => (normalizeOrderStatus(o.status) || o.status) === s.value).length
    return acc
  }, {})

  const getCustomerName = (order: Order) =>
    order.customer_name ||
    [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(' ') ||
    t('Guest', 'ضيف')

  const getCustomerPhone = (order: Order) =>
    order.customer_phone || order.shipping_address?.phone || '-'

  const getCustomerAddress = (order: Order) =>
    order.address ||
    [order.shipping_address?.address, order.shipping_address?.city].filter(Boolean).join(', ') ||
    '-'

  const paymentMethodLabel = (method?: string | null) => {
    const labels: Record<string, { en: string; ar: string }> = {
      cod: { en: 'Cash on Delivery', ar: 'الدفع عند الاستلام' },
      electronic_wallet: { en: 'E-Wallet', ar: 'محفظة إلكترونية' },
      instapay: { en: 'InstaPay', ar: 'إنستاباي' },
    }
    if (!method) return '-'
    const label = labels[method]
    return label ? t(label.en, label.ar) : method
  }

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Order Management', 'إدارة الطلبات')}</h2>
          <p className="text-white/30 text-xs mt-0.5">
            {orders.length} {t('total orders', 'طلب إجمالي')}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label={t('Refresh', 'تحديث')}
          className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            filterStatus === 'all'
              ? 'bg-[#c8941a]/15 text-[#c8941a] border-[#c8941a]/30'
              : 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:text-white/60'
          }`}
        >
          {t('All', 'الكل')} ({orders.length})
        </button>
        {STATUSES.map((s) => (
          <button
            type="button"
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filterStatus === s.value
                ? 'bg-[#c8941a]/15 text-[#c8941a] border-[#c8941a]/30'
                : 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:text-white/60'
            }`}
          >
            {t(s.en, s.ar)} ({statusCounts[s.value] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
        <input
          type="text"
          placeholder={t('Search by order no., name or phone...', 'بحث برقم الطلب أو الاسم أو الهاتف...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
        />
      </div>

      {/* WhatsApp notification prompt */}
      {whatsappPending && (
        <div className="mb-5 flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm">
            {t('Send status update to customer via WhatsApp?', 'إرسال تحديث الحالة للعميل عبر واتساب؟')}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={buildWhatsAppUrl(whatsappPending.phone, whatsappPending.orderNumber, whatsappPending.newStatus, whatsappPending.cancellationReason) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setWhatsappPending(null)}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {t('Send WhatsApp', 'إرسال واتساب')}
            </a>
            <button
              type="button"
              onClick={() => setWhatsappPending(null)}
              className="h-7 w-7 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              aria-label={t('Dismiss', 'تجاهل')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-20 border border-[#c8941a]/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-16 w-16 rounded-2xl bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center mb-4">
            <Package className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-white/40 text-sm">{t('No orders found', 'لا توجد طلبات')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const meta = statusMeta(order.status)
            const expanded = expandedId === order.id
            const customerName = getCustomerName(order)
            const customerPhone = getCustomerPhone(order)
            const normalizedStatus = normalizeOrderStatus(order.status) || order.status

            return (
              <div
                key={order.id}
                className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden hover:border-[#c8941a]/20 transition-all"
              >
                {/* Row */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-bold text-white text-sm">#{order.order_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
                        {t(meta.en, meta.ar)}
                      </span>
                      {order.payment_method && (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          {PAYMENT_ICONS[order.payment_method] || null}
                          {paymentMethodLabel(order.payment_method)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/30">
                      {customerName}
                      {customerPhone && customerPhone !== '-' ? ` · ${customerPhone}` : ''}
                      {' · '}
                      {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB')}
                    </p>
                  </div>

                  <span className="font-bold text-[#c8941a] text-sm whitespace-nowrap">
                    {Number(order.total).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}{' '}
                    {t('EGP', 'ج.م')}
                  </span>

                  {/* Status selector */}
                  <div className="relative">
                    <select
                      value={normalizedStatus}
                      disabled={updating === order.id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      aria-label={t('Change order status', 'تغيير حالة الطلب')}
                      className="appearance-none bg-[#0f0900] border border-[#c8941a]/20 text-white/60 rounded-xl py-2 pr-3 pl-7 text-xs font-medium focus:outline-none focus:border-[#c8941a]/40 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value} className="bg-[#0f0900]">
                          {t(s.en, s.ar)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    className="text-xs text-[#c8941a]/60 hover:text-[#c8941a] transition-colors"
                  >
                    {expanded ? t('Hide', 'إخفاء') : t('Details', 'التفاصيل')}
                  </button>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-[#c8941a]/10 px-5 py-4 bg-[#0f0900] space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider">{t('Customer', 'بيانات العميل')}</p>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <User className="h-3.5 w-3.5 text-white/30 shrink-0" />{customerName}
                        </div>
                        {customerPhone && customerPhone !== '-' && (
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Phone className="h-3 w-3 text-white/20 shrink-0" />{customerPhone}
                          </div>
                        )}
                        {(order.customer_email || order.shipping_address?.email) && (
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Mail className="h-3 w-3 text-white/20 shrink-0" />
                            {order.customer_email || order.shipping_address?.email}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider">{t('Delivery Address', 'عنوان التوصيل')}</p>
                        <div className="flex items-start gap-2 text-sm text-white/60">
                          <MapPin className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
                          {getCustomerAddress(order)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider mb-2">{t('Payment', 'الدفع')}</p>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        {order.payment_method && PAYMENT_ICONS[order.payment_method]}
                        <span>{paymentMethodLabel(order.payment_method)}</span>
                        {order.payment_status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            order.payment_status === 'paid' ? 'bg-green-500/15 text-green-400 border-green-500/20' :
                            order.payment_status === 'failed' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                            'bg-white/5 text-white/40 border-white/10'
                          }`}>
                            {order.payment_status}
                          </span>
                        )}
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider mb-2">{t('Products', 'المنتجات')}</p>
                        <div className="space-y-1 bg-[#180d04] rounded-xl border border-[#c8941a]/10 p-3">
                          {order.items.map((item, idx) => {
                            const isCustom = item.product_name.includes('Make Your') || item.product_name.includes('اختر')
                            const detailLines = getOrderItemDetailLines(item.customizations)
                            const sizeParts = !detailLines.length && item.size
                              ? item.size.split(/[|/,]/).map((p: string) => p.trim()).filter(Boolean)
                              : []
                            return (
                              <div key={idx} className="py-2 border-b border-[#c8941a]/5 last:border-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {isCustom && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#c8941a]/15 text-[#c8941a] font-medium shrink-0">
                                          <Coffee className="h-2.5 w-2.5" />
                                          {t('Custom', 'مخصص')}
                                        </span>
                                      )}
                                      <span className="text-white/70 text-sm">{item.product_name}</span>
                                    </div>
                                    {detailLines.length > 0 ? (
                                      <div className="mt-1.5 space-y-0.5">
                                        {detailLines.map((line, li) => (
                                          <p key={li} className="text-[11px] text-white/40 leading-snug">
                                            {language === 'ar' ? line.ar : line.en}
                                          </p>
                                        ))}
                                        {item.size && <p className="text-[11px] text-[#c8941a]/40">{item.size}</p>}
                                        <span className="text-[10px] text-white/25">× {item.quantity}</span>
                                      </div>
                                    ) : sizeParts.length > 1 ? (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {sizeParts.map((part: string, pi: number) => (
                                          <span key={pi} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/[0.07]">{part}</span>
                                        ))}
                                        <span className="text-[10px] text-white/25 self-center">× {item.quantity}</span>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-white/30 mt-0.5">
                                        {item.size ? `${item.size} · ` : ''}× {item.quantity}
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-semibold text-[#c8941a]/80 text-xs shrink-0 mt-0.5">{item.total_price} {t('EGP', 'ج.م')}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-[#c8941a]/10 pt-3 space-y-1.5">
                      {order.subtotal !== undefined && (
                        <div className="flex justify-between text-xs text-white/30">
                          <span>{t('Subtotal', 'المجموع الفرعي')}</span>
                          <span>{order.subtotal} {t('EGP', 'ج.م')}</span>
                        </div>
                      )}
                      {order.shipping_cost !== undefined && order.shipping_cost > 0 && (
                        <div className="flex justify-between text-xs text-white/30">
                          <span>{t('Shipping', 'الشحن')}</span>
                          <span>{order.shipping_cost} {t('EGP', 'ج.م')}</span>
                        </div>
                      )}
                      {order.discount_amount !== undefined && order.discount_amount > 0 && (
                        <div className="flex justify-between text-xs text-green-400/70">
                          <span>{t('Discount', 'الخصم')}{order.discount_code && ` (${order.discount_code})`}</span>
                          <span>- {order.discount_amount} {t('EGP', 'ج.م')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-white pt-1">
                        <span>{t('Total', 'الإجمالي')}</span>
                        <span className="text-[#c8941a]">{order.total} {t('EGP', 'ج.م')}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div>
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider mb-1.5">{t('Notes', 'ملاحظات')}</p>
                        <p className="text-sm text-white/50 bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 whitespace-pre-line">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setCancelModal(null); setCancelReason('') }} />
          <div className="relative w-full max-w-md bg-[#0f0900] border border-red-500/25 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div>
                <h3 className="text-white font-bold text-sm">{t('Cancel Order', 'إلغاء الطلب')}</h3>
                <p className="text-white/40 text-xs mt-0.5">#{cancelModal.orderNumber}</p>
              </div>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => { setCancelModal(null); setCancelReason('') }} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-2">{t('Reason for cancellation (optional)', 'سبب الإلغاء (اختياري)')}</label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder={t('e.g. Item out of stock, customer requested cancellation...', 'مثال: المنتج غير متاح، العميل طلب الإلغاء...')}
                  rows={3}
                  dir="rtl"
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none"
                />
                <p className="text-white/25 text-[10px] mt-1.5">{t('This reason will be visible in the order notes and sent to the customer if you choose.', 'يظهر السبب في ملاحظات الطلب ويمكن إرساله للعميل.')}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={() => { setCancelModal(null); setCancelReason('') }}
                className="px-4 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                {t('Go Back', 'رجوع')}
              </button>
              <button
                type="button"
                onClick={() => doUpdateStatus(cancelModal.orderId, 'cancelled', cancelReason)}
                disabled={updating === cancelModal.orderId}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                {updating === cancelModal.orderId ? t('Cancelling...', 'جارٍ الإلغاء...') : t('Confirm Cancellation', 'تأكيد الإلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
