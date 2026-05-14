'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/context/auth'
import { useLanguage } from '@/lib/context/language'
import {
  TrendingUp,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Coffee,
  XCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type DashboardData = {
  stats: {
    totalSales: number
    deliveredRevenue: number
    activeOrders: {
      confirmed:  { count: number; total: number }
      processing: { count: number; total: number }
      shipped:    { count: number; total: number }
      totalCount: number
      totalAmount: number
    }
    cancelledOrders: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    salesChange: number
    ordersChange: number
    customersChange: number
  }
  salesChart: Array<{ date: string; label: string; sales: number }>
  recentOrders: Array<{
    id: string
    order_number: string
    status: string
    total: number
    created_at: string
    shipping_address: { first_name?: string; last_name?: string } | null
  }>
  topProducts: Array<{ id: string; name: string; image: string | null; price: number; sold: number }>
  categories: Array<{ id: string; name: string; image: string | null; productCount: number }>
  reviews: Array<{ id: string; customer_name: string; content: string; rating: number; created_at: string }>
  customers: { total: number; newThisMonth: number; returningThisMonth: number }
}

const statusConfig: Record<string, { en: string; ar: string; className: string }> = {
  pending:    { en: 'Pending',     ar: 'معلق',          className: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' },
  confirmed:  { en: 'Confirmed',   ar: 'مؤكد',          className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
  processing: { en: 'Processing',  ar: 'قيد التجهيز',   className: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
  shipped:    { en: 'Shipped',     ar: 'تم الشحن',      className: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' },
  delivered:  { en: 'Delivered',   ar: 'تم التسليم',    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
  cancelled:  { en: 'Cancelled',   ar: 'ملغي',          className: 'bg-red-500/15 text-red-400 border border-red-500/20' },
}

function StatusBadge({ status, t }: { status: string; t: (en: string, ar: string) => string }) {
  const cfg = statusConfig[status] || { en: status, ar: status, className: 'bg-white/10 text-white/50 border border-white/10' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
      {t(cfg.en, cfg.ar)}
    </span>
  )
}

function StatCard({ label, value, change, icon: Icon, t }: {
  label: string; value: string; change?: number; icon: React.ElementType
  t: (en: string, ar: string) => string
}) {
  const positive = (change ?? 0) >= 0
  return (
    <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5 hover:border-[#c8941a]/25 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-[#c8941a]/10 border border-[#c8941a]/15 flex items-center justify-center">
          <Icon className="h-5 w-5 text-[#c8941a]" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
      {change !== undefined && (
        <p className="text-[10px] text-white/20 mt-0.5">{t('vs last month', 'مقارنة بالشهر الماضي')}</p>
      )}
    </div>
  )
}

function ActiveOrdersCard({ data, t }: {
  data: DashboardData['stats']['activeOrders']
  t: (en: string, ar: string) => string
}) {
  return (
    <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5 hover:border-[#c8941a]/25 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Package className="h-5 w-5 text-blue-400" />
        </div>
        <p className="text-2xl font-bold text-white">{data.totalCount}</p>
      </div>
      <p className="text-xs text-white/40 mb-3">{t('In Progress', 'قيد التنفيذ')}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-emerald-400 font-medium">{t('Confirmed', 'مؤكد')}</span>
          <span className="text-white/40">{data.confirmed.count} · {data.confirmed.total.toLocaleString()} EGP</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-blue-400 font-medium">{t('Preparing', 'قيد التجهيز')}</span>
          <span className="text-white/40">{data.processing.count} · {data.processing.total.toLocaleString()} EGP</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-indigo-400 font-medium">{t('Shipped', 'تم الشحن')}</span>
          <span className="text-white/40">{data.shipped.count} · {data.shipped.total.toLocaleString()} EGP</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/[0.05]">
        <p className="text-[#c8941a] font-bold text-sm">{data.totalAmount.toLocaleString()} EGP</p>
        <p className="text-white/20 text-[10px] mt-0.5">{t('Total pending amount', 'إجمالي المبالغ المعلقة')}</p>
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#180d04] border border-[#c8941a]/20 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-white/40 text-[11px] mb-1">{label}</p>
      <p className="text-[#c8941a] font-bold text-sm">{Number(payload[0].value).toLocaleString()} EGP</p>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= rating ? 'text-[#c8941a] fill-[#c8941a]' : 'text-white/15'}`} />
      ))}
    </div>
  )
}

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.05] rounded-xl ${className}`} />
}

export default function AdminOverviewPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data)
        else setError(json.error || 'Failed to load')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  const pieColors = ['#c8941a', '#3a2000']
  const customerPieData = data
    ? [
        { name: t('New', 'جدد'), value: data.customers.newThisMonth },
        { name: t('Returning', 'عائدون'), value: data.customers.returningThisMonth },
      ]
    : []

  const dateLabel = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen p-6 space-y-5 bg-[#0f0900]" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Welcome banner (logo card) ── */}
      <div className="relative rounded-2xl overflow-hidden border border-[#c8941a]/15">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0900] via-[#120600] to-[#0a0300]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8941a]/30 to-transparent" />

        <div className="relative flex items-center justify-between px-6 py-5">
          <div>
            <Image src="/brand/logo-white.svg" alt="Line Coffee" width={170} height={74} unoptimized className="object-contain mb-3" />
            <p className="text-white/40 text-xs">{t("Here's what's happening with your store today.", 'إليك ملخص أداء متجرك اليوم')}</p>
          </div>
          <div className="text-right">
            <p className="text-[#c8941a] text-3xl font-bold tracking-tight">
              {loading ? '—' : `${(data?.stats.deliveredRevenue || 0).toLocaleString()} EGP`}
            </p>
            <p className="text-white/30 text-xs mt-1">{t('Collected Revenue', 'الإيرادات المحصلة')}</p>
            <p className="text-white/15 text-[10px] mt-0.5">{dateLabel}</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Sk key={i} className="h-36" />)}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('Total Sales', 'إجمالي المبيعات')}
            value={`${(data?.stats.deliveredRevenue || 0).toLocaleString()} EGP`}
            change={data?.stats.salesChange || 0}
            icon={CheckCircle2}
            t={t}
          />
          <ActiveOrdersCard data={data!.stats.activeOrders} t={t} />
          <StatCard
            label={t('Total Customers', 'إجمالي العملاء')}
            value={String(data?.stats.totalCustomers || 0)}
            change={data?.stats.customersChange || 0}
            icon={Users}
            t={t}
          />
          <StatCard
            label={t('Cancelled Orders', 'الطلبات الملغاة')}
            value={String(data?.stats.cancelledOrders || 0)}
            icon={XCircle}
            t={t}
          />
        </div>
      )}

      {/* ── Row 2: Chart + Recent orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Sales chart */}
        <div className="lg:col-span-2 bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white/90 font-bold text-sm">{t('Sales Overview', 'نظرة عامة على المبيعات')}</h3>
              <p className="text-white/25 text-xs mt-0.5">{t('Last 30 days', 'آخر 30 يوماً')}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#c8941a]" />
              <span className="text-white/25 text-xs">{t('Sales', 'المبيعات')}</span>
            </div>
          </div>
          {loading ? <Sk className="h-52" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={data?.salesChart || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8941a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c8941a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#c8941a" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: '#c8941a', stroke: '#0f0900', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
            <h3 className="text-white/90 font-bold text-sm">{t('Recent Orders', 'آخر الطلبات')}</h3>
            <a href="/dashboard/admin/orders" className="flex items-center gap-1 text-[#c8941a] text-xs hover:opacity-70 transition-opacity">
              {t('View All', 'عرض الكل')} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Sk key={i} className="h-14" />)}</div>
          ) : (data?.recentOrders || []).length === 0 ? (
            <div className="py-16 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-white/10" />
              <p className="text-white/25 text-sm">{t('No orders yet', 'لا توجد طلبات بعد')}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {data?.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0">
                    <p className="text-white/80 text-xs font-semibold">#{order.order_number}</p>
                    <p className="text-white/30 text-[10px] mt-0.5 truncate">
                      {order.shipping_address?.first_name || '—'} · {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <StatusBadge status={order.status} t={t} />
                    <span className="text-[#c8941a] text-[11px] font-bold">{Number(order.total).toLocaleString()} EGP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Categories + Customers donut + Top products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Categories */}
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.04]">
            <h3 className="text-white/90 font-bold text-sm">{t('Popular Categories', 'الفئات الشعبية')}</h3>
          </div>
          {loading ? (
            <div className="p-4 grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <Sk key={i} className="h-24" />)}</div>
          ) : (data?.categories || []).length === 0 ? (
            <div className="py-14 text-center">
              <Coffee className="h-8 w-8 mx-auto mb-2 text-white/10" />
              <p className="text-white/25 text-sm">{t('No categories', 'لا توجد فئات')}</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 gap-3">
              {data?.categories.map(cat => (
                <div key={cat.id} className="bg-[#0f0900] border border-white/[0.04] rounded-xl overflow-hidden hover:border-[#c8941a]/20 transition-colors">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-16 object-cover opacity-75" />
                  ) : (
                    <div className="w-full h-16 bg-[#c8941a]/5 flex items-center justify-center">
                      <Coffee className="h-5 w-5 text-[#c8941a]/30" />
                    </div>
                  )}
                  <div className="px-3 py-2">
                    <p className="text-white/70 text-[11px] font-semibold truncate">{cat.name}</p>
                    <p className="text-white/25 text-[9px] mt-0.5">{cat.productCount} {t('Products', 'منتج')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customers donut */}
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.04]">
            <h3 className="text-white/90 font-bold text-sm">{t('Customers This Month', 'عملاء هذا الشهر')}</h3>
          </div>
          <div className="p-5 flex flex-col items-center justify-center">
            {loading ? <Sk className="h-44 w-full" /> : (
              <>
                <div className="relative">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={customerPieData.every(d => d.value === 0) ? [{ name: '-', value: 1 }] : customerPieData}
                        cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}
                      >
                        {customerPieData.every(d => d.value === 0)
                          ? <Cell fill="rgba(255,255,255,0.05)" />
                          : customerPieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)
                        }
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-white font-bold text-2xl">{data?.customers.total || 0}</p>
                    <p className="text-white/30 text-[10px]">{t('Total', 'إجمالي')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#c8941a]" />
                    <div>
                      <p className="text-white/50 text-[10px]">{t('New', 'جدد')}</p>
                      <p className="text-white font-bold text-sm">{data?.customers.newThisMonth || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#3a2000]" />
                    <div>
                      <p className="text-white/50 text-[10px]">{t('Returning', 'عائدون')}</p>
                      <p className="text-white font-bold text-sm">{data?.customers.returningThisMonth || 0}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.04]">
            <h3 className="text-white/90 font-bold text-sm">{t('Top Products', 'أفضل المنتجات')}</h3>
            <p className="text-white/25 text-[10px] mt-0.5">{t('Last 30 days', 'آخر 30 يوماً')}</p>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Sk key={i} className="h-12" />)}</div>
          ) : (data?.topProducts || []).length === 0 ? (
            <div className="py-14 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-white/10" />
              <p className="text-white/25 text-sm">{t('No sales data', 'لا توجد بيانات مبيعات')}</p>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {data?.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <span className="text-[#c8941a]/40 font-bold text-sm w-4 text-center shrink-0">{i + 1}</span>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-[#c8941a]/10 flex items-center justify-center shrink-0">
                      <Coffee className="h-4 w-4 text-[#c8941a]/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-[11px] font-semibold truncate">{p.name}</p>
                    <p className="text-white/30 text-[9px]">{p.sold} {t('Sold', 'مباع')}</p>
                  </div>
                  <p className="text-[#c8941a] text-[11px] font-bold shrink-0">{p.price.toLocaleString()} EGP</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Reviews ── */}
      <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-white/90 font-bold text-sm">{t('Recent Reviews', 'آخر المراجعات')}</h3>
        </div>
        {loading ? (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Sk key={i} className="h-28" />)}
          </div>
        ) : (data?.reviews || []).length === 0 ? (
          <div className="py-12 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-white/10" />
            <p className="text-white/25 text-sm">{t('No reviews yet', 'لا توجد مراجعات بعد')}</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.reviews.map(r => (
              <div key={r.id} className="bg-[#0f0900] border border-white/[0.04] rounded-xl p-4 hover:border-[#c8941a]/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#c8941a]/15 border border-[#c8941a]/20 flex items-center justify-center">
                      <span className="text-[#c8941a] text-[10px] font-bold">{r.customer_name.charAt(0)}</span>
                    </div>
                    <p className="text-white/70 text-xs font-semibold">{r.customer_name}</p>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-white/40 text-xs leading-relaxed line-clamp-3">{r.content}</p>
                <p className="text-white/20 text-[9px] mt-3">
                  {new Date(r.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
