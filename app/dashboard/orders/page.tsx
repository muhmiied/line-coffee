'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Package } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { Button } from '@/components/ui/button'

type OrderItem = {
  id: string
  product_name: string
  size: string | null
  quantity: number
  total_price: number
}

type Order = {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  created_at: string
  items?: OrderItem[]
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function DashboardOrdersPage() {
  const { t, language, dir } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    const response = await fetch('/api/orders', { cache: 'no-store' })
    const data = await response.json()
    setOrders(data?.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const cancelOrder = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    })
    await loadOrders()
  }

  return (
    <div className="min-h-screen pb-8 pt-32 sm:pt-36 md:pt-40">
      <div className="container mx-auto px-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/dashboard">
                {dir === 'rtl' ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {t('Back to Dashboard', 'العودة إلى لوحة التحكم')}
              </Link>
            </Button>
            <h1 className="font-serif text-3xl font-bold">{t('My Orders', 'طلباتي')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('Track your orders and follow their status', 'تابع طلباتك وحالة كل طلب')}
            </p>
          </div>

          {loading ? (
            <div className="text-muted-foreground">{t('Loading...', 'جاري التحميل...')}</div>
          ) : orders.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t('No orders yet', 'لا توجد طلبات حتى الآن')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary">#{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || 'bg-secondary text-foreground'}`}>
                        {order.status}
                      </span>
                      <span className="font-semibold">{order.total} {t('EGP', 'ج.م')}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                      {expandedId === order.id ? t('Hide details', 'إخفاء التفاصيل') : t('View details', 'عرض التفاصيل')}
                    </Button>
                    {['pending', 'confirmed', 'processing'].includes(order.status) && (
                      <Button variant="destructive" size="sm" onClick={() => cancelOrder(order.id)}>
                        {t('Cancel order', 'إلغاء الطلب')}
                      </Button>
                    )}
                  </div>

                  {expandedId === order.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      {(order.items || []).map((item) => (
                        <div key={item.id} className="flex flex-col gap-1 text-sm min-[380px]:flex-row min-[380px]:justify-between">
                          <div className="min-w-0 break-words">
                            {item.product_name} {item.size ? `(${item.size})` : ''} x {item.quantity}
                          </div>
                          <div className="shrink-0 font-medium">{item.total_price} {t('EGP', 'ج.م')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
