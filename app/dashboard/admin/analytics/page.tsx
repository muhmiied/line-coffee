'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Package, Users, ShoppingBag, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

type StatsData = {
  stats: {
    totalSales: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    salesChange: number
    ordersChange: number
    customersChange: number
  }
  salesChart: Array<{ date: string; label: string; sales: number }>
  recentOrders: Array<{ status: string; total: number }>
  topProducts: Array<{ id: string; name: string; sold: number; price: number }>
  customers: { total: number; newThisMonth: number; returningThisMonth: number }
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#180d04] border border-[#c8941a]/20 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-white/40 text-[11px] mb-1">{label}</p>
      <p className="text-[#c8941a] font-bold text-sm">{Number(payload[0].value).toLocaleString()}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { t, language } = useLanguage()
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      const json = await res.json()
      if (json.success) setData(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const statusCounts: Record<string, number> = {}
  ;(data?.recentOrders || []).forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })
  const statusChart = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  const pieColors = ['#c8941a', '#3a2000', '#5a3a10', '#8a5a18', '#a87020']
  const customerPie = data
    ? [
        { name: t('New', 'جدد'), value: data.customers.newThisMonth },
        { name: t('Returning', 'عائدون'), value: data.customers.returningThisMonth },
      ]
    : []

  const Sk = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-white/[0.04] rounded-xl ${className}`} />
  )

  return (
    <div className="min-h-screen bg-[#0f0900] p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Analytics', 'التحليلات')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{t('Last 30 days overview', 'نظرة عامة على آخر 30 يوماً')}</p>
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('Total Revenue', 'إجمالي الإيرادات'), value: `${(data?.stats.totalSales || 0).toLocaleString()} EGP`, change: data?.stats.salesChange || 0, icon: TrendingUp },
          { label: t('Total Orders', 'إجمالي الطلبات'), value: String(data?.stats.totalOrders || 0), change: data?.stats.ordersChange || 0, icon: Package },
          { label: t('Total Customers', 'إجمالي العملاء'), value: String(data?.stats.totalCustomers || 0), change: data?.stats.customersChange || 0, icon: Users },
          { label: t('Products Listed', 'المنتجات المدرجة'), value: String(data?.stats.totalProducts || 0), change: 0, icon: ShoppingBag },
        ].map(card => (
          <div key={card.label} className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5">
            <div className="h-9 w-9 rounded-xl bg-[#c8941a]/10 border border-[#c8941a]/15 flex items-center justify-center mb-3">
              <card.icon className="h-4 w-4 text-[#c8941a]" />
            </div>
            {loading ? <Sk className="h-7 w-24 mb-1" /> : <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>}
            <p className="text-xs text-white/35 mt-1">{card.label}</p>
            {card.change !== 0 && (
              <p className={`text-[10px] mt-1 font-semibold ${card.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}% {t('vs last month', 'مقارنة بالشهر الماضي')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Sales chart — full width */}
      <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white/90 font-bold text-sm">{t('Revenue Over Time', 'الإيرادات عبر الزمن')}</h3>
            <p className="text-white/25 text-xs mt-0.5">{t('Daily sales — last 30 days', 'المبيعات اليومية — آخر 30 يوماً')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c8941a]" />
            <span className="text-white/25 text-xs">EGP</span>
          </div>
        </div>
        {loading ? <Sk className="h-56" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.salesChart || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8941a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c8941a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#c8941a" strokeWidth={2} fill="url(#goldGrad2)" dot={false}
                activeDot={{ r: 4, fill: '#c8941a', stroke: '#0f0900', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row: Top Products + Order Status + Customer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Products bar chart */}
        <div className="lg:col-span-1 bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5">
          <h3 className="text-white/90 font-bold text-sm mb-4">{t('Top Products', 'أكثر المنتجات مبيعاً')}</h3>
          {loading ? <Sk className="h-44" /> : (data?.topProducts || []).length === 0 ? (
            <p className="text-white/20 text-xs text-center py-16">{t('No data yet', 'لا توجد بيانات بعد')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.topProducts || []} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="sold" fill="#c8941a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order status bar chart */}
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5">
          <h3 className="text-white/90 font-bold text-sm mb-4">{t('Orders by Status', 'الطلبات حسب الحالة')}</h3>
          {loading ? <Sk className="h-44" /> : statusChart.length === 0 ? (
            <p className="text-white/20 text-xs text-center py-16">{t('No orders yet', 'لا توجد طلبات بعد')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#c8941a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Customer donut */}
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-5">
          <h3 className="text-white/90 font-bold text-sm mb-4">{t('Customer Segments', 'شرائح العملاء')}</h3>
          {loading ? <Sk className="h-44" /> : (
            <div className="flex flex-col items-center">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={customerPie.every(d => d.value === 0) ? [{ name: '-', value: 1 }] : customerPie}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}
                    >
                      {customerPie.every(d => d.value === 0)
                        ? <Cell fill="rgba(255,255,255,0.05)" />
                        : customerPie.map((_, i) => <Cell key={i} fill={pieColors[i]} />)
                      }
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-white font-bold text-xl">{data?.customers.total || 0}</p>
                  <p className="text-white/30 text-[9px]">{t('Total', 'إجمالي')}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#c8941a]" />
                  <div>
                    <p className="text-white/40 text-[10px]">{t('New', 'جدد')}</p>
                    <p className="text-white font-bold text-sm">{data?.customers.newThisMonth || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#3a2000]" />
                  <div>
                    <p className="text-white/40 text-[10px]">{t('Returning', 'عائدون')}</p>
                    <p className="text-white font-bold text-sm">{data?.customers.returningThisMonth || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
