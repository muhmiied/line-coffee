'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Search, ChevronDown, RefreshCw, Banknote, Wallet, CreditCard, MapPin, Phone, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

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
  }>
}

const STATUSES = [
  { value: 'pending',    en: 'Pending',          ar: 'معلق',          color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  { value: 'confirmed',  en: 'Confirmed',         ar: 'مؤكد',          color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { value: 'processing', en: 'Preparing',         ar: 'قيد التجهيز',   color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  { value: 'shipped',    en: 'Out for Delivery',  ar: 'في الطريق',     color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  { value: 'delivered',  en: 'Delivered',         ar: 'تم التسليم',    color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  { value: 'cancelled',  en: 'Cancelled',         ar: 'ملغي',          color: 'bg-red-500/15 text-red-400 border-red-500/20' },
]

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  cod: <Banknote className="h-3.5 w-3.5" />,
  electronic_wallet: <Wallet className="h-3.5 w-3.5" />,
  instapay: <CreditCard className="h-3.5 w-3.5" />,
}

function statusMeta(value: string) {
  return STATUSES.find((s) => s.value === value) || { en: value, ar: value, color: 'bg-white/5 text-white/40 border-white/10' }
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
    if (filterStatus !== 'all') list = list.filter((o) => o.status === filterStatus)
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

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
        toast.success(t('Order status updated', 'تم تحديث حالة الطلب'))
      } else {
        toast.error(t('Update failed', 'فشل التحديث'))
      }
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    } finally {
      setUpdating(null)
    }
  }

  const statusCounts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = orders.filter((o) => o.status === s.value).length
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
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
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
                    {/* Customer info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider">
                          {t('Customer', 'بيانات العميل')}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <User className="h-3.5 w-3.5 text-white/30 shrink-0" />
                          {customerName}
                        </div>
                        {customerPhone && customerPhone !== '-' && (
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Phone className="h-3 w-3 text-white/20 shrink-0" />
                            {customerPhone}
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
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider">
                          {t('Delivery Address', 'عنوان التوصيل')}
                        </p>
                        <div className="flex items-start gap-2 text-sm text-white/60">
                          <MapPin className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
                          {getCustomerAddress(order)}
                        </div>
                      </div>
                    </div>

                    {/* Payment info */}
                    <div>
                      <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider mb-2">
                        {t('Payment', 'الدفع')}
                      </p>
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

                    {/* Order items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider mb-2">
                          {t('Products', 'المنتجات')}
                        </p>
                        <div className="space-y-1.5 bg-[#180d04] rounded-xl border border-[#c8941a]/10 p-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-white/60">
                                {item.product_name}
                                {item.size && <span className="text-white/30 text-xs ml-1">({item.size})</span>}
                                {' × '}{item.quantity}
                              </span>
                              <span className="font-medium text-[#c8941a]/80 text-xs">
                                {item.total_price} {t('EGP', 'ج.م')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Totals */}
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
                          <span>
                            {t('Discount', 'الخصم')}
                            {order.discount_code && ` (${order.discount_code})`}
                          </span>
                          <span>- {order.discount_amount} {t('EGP', 'ج.م')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-white pt-1">
                        <span>{t('Total', 'الإجمالي')}</span>
                        <span className="text-[#c8941a]">{order.total} {t('EGP', 'ج.م')}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div>
                        <p className="text-[#c8941a]/50 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                          {t('Notes', 'ملاحظات')}
                        </p>
                        <p className="text-sm text-white/50 bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
