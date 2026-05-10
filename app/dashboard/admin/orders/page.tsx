'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Package, Search, ChevronDown, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

type Order = {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  notes?: string | null
  shipping_address?: {
    first_name?: string
    last_name?: string
    phone?: string
    street_address?: string
    city?: string
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
  { value: 'pending',    label: 'معلق',          color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'confirmed',  label: 'مؤكد',          color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'processing', label: 'قيد التجهيز',   color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'shipped',    label: 'تم الشحن',       color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'delivered',  label: 'تم التسليم',     color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'cancelled',  label: 'ملغي',           color: 'bg-red-100 text-red-800 border-red-200' },
]

function statusMeta(value: string) {
  return STATUSES.find((s) => s.value === value) || { label: value, color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

export default function AdminOrdersPage() {
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
      toast.error('فشل في تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let list = [...orders]
    if (filterStatus !== 'all') list = list.filter((o) => o.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
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
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
        toast.success('تم تحديث حالة الطلب')
      } else {
        toast.error('فشل التحديث')
      }
    } catch {
      toast.error('فشل التحديث')
    } finally {
      setUpdating(null)
    }
  }

  const statusCounts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = orders.filter((o) => o.status === s.value).length
    return acc
  }, {})

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a0a00] flex items-center gap-2">
            <Package className="h-6 w-6 text-[#522500]" /> إدارة الطلبات
          </h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} طلب إجمالي</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-[#522500] bg-white border border-[#e8ddd5] px-4 py-2 rounded-xl hover:bg-[#faf7f4] transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> تحديث
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterStatus === 'all' ? 'bg-[#522500] text-[#FFDCC2] border-[#522500]' : 'bg-white text-gray-600 border-[#e8ddd5] hover:border-[#522500]/40'}`}
        >
          الكل ({orders.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterStatus === s.value ? 'bg-[#522500] text-[#FFDCC2] border-[#522500]' : 'bg-white text-gray-600 border-[#e8ddd5] hover:border-[#522500]/40'}`}
          >
            {s.label} ({statusCounts[s.value] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="بحث برقم الطلب أو اسم العميل أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#e8ddd5] rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-[#522500] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8ddd5] py-16 text-center">
          <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const meta = statusMeta(order.status)
            const expanded = expandedId === order.id
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-[#e8ddd5] overflow-hidden shadow-sm"
              >
                {/* Row */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#1a0a00] text-sm">#{order.order_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                      {order.shipping_address?.phone && ` · ${order.shipping_address.phone}`}
                      {' · '}{new Date(order.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>

                  {/* Total */}
                  <span className="font-bold text-[#522500] text-sm whitespace-nowrap">
                    {Number(order.total).toLocaleString('ar-EG')} ج.م
                  </span>

                  {/* Status Select */}
                  <div className="relative">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="appearance-none bg-[#faf7f4] border border-[#e8ddd5] rounded-xl py-2 pr-3 pl-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#522500]/30 cursor-pointer disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    className="text-xs text-[#522500] hover:underline"
                  >
                    {expanded ? 'إخفاء' : 'التفاصيل'}
                  </button>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-[#f0e8e0] px-5 py-4 bg-[#faf7f4] space-y-3">
                    {/* Address */}
                    {order.shipping_address && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">عنوان الشحن</p>
                        <p className="text-sm text-gray-700">
                          {order.shipping_address.street_address}{order.shipping_address.city && `, ${order.shipping_address.city}`}
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">المنتجات</p>
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {item.product_name}
                                {item.size && <span className="text-gray-400 text-xs ml-1">({item.size})</span>}
                                {' × '}{item.quantity}
                              </span>
                              <span className="font-medium text-[#522500]">{item.total_price} ج.م</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">ملاحظات</p>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
