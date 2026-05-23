'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CreditCard, MapPin, Package, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'
import { Button } from '@/components/ui/button'

type ShippingAddress = {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  location_link?: string | null
}

type OrderItem = {
  id: string
  product_name: string
  size: string | null
  quantity: number
  unit_price?: number | null
  total_price?: number | null
}

type Order = {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal?: number | null
  shipping_cost?: number | null
  discount_amount?: number | null
  discount_code?: string | null
  total: number
  payment_method?: string | null
  payment_status?: string | null
  notes?: string | null
  address?: string | null
  customer_name?: string | null
  customer_phone?: string | null
  shipping_address?: ShippingAddress | null
  created_at: string
  cancelled_at?: string | null
  cancellation_initiated_by?: 'customer' | 'admin' | null
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

function formatCurrency(value: number | null | undefined, currencyLabel: string) {
  const amount = Number(value || 0)
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)} ${currencyLabel}`
}

function getPaymentLabel(method: string | null | undefined, t: (en: string, ar: string) => string) {
  switch (method) {
    case 'cod':
      return t('Cash on Delivery', 'الدفع عند الاستلام')
    case 'electronic_wallet':
      return t('Electronic Wallet', 'محفظة إلكترونية')
    case 'instapay':
      return t('InstaPay', 'إنستاباي')
    default:
      return method || t('Not specified', 'غير محدد')
  }
}

function getStatusLabel(status: string, t: (en: string, ar: string) => string) {
  switch (status) {
    case 'pending':
      return t('Pending', 'قيد الانتظار')
    case 'confirmed':
      return t('Confirmed', 'تم التأكيد')
    case 'processing':
      return t('Processing', 'قيد التجهيز')
    case 'shipped':
      return t('Shipped', 'تم الشحن')
    case 'delivered':
      return t('Delivered', 'تم التسليم')
    case 'cancelled':
      return t('Cancelled', 'ملغي')
    default:
      return status
  }
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  )
}

export default function DashboardOrdersPage() {
  const { t, language, dir } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const currencyLabel = t('EGP', 'ج.م')

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
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    })
    const json = await response.json()

    if (!response.ok || !json.success) {
      toast.error(json?.error || t('Failed to cancel order', 'فشل إلغاء الطلب'))
      return
    }

    toast.success(t('Order cancelled', 'تم إلغاء الطلب'))
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
              {orders.map((order) => {
                const shipping = order.shipping_address
                const orderDate = new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')
                const items = order.items || []
                const addressParts = [
                  shipping?.address || order.address,
                  shipping?.city,
                  shipping?.postal_code,
                ].filter(Boolean)
                const contactParts = [
                  shipping?.phone || order.customer_phone,
                  shipping?.email,
                ].filter(Boolean)
                const customerName = order.customer_name || [shipping?.first_name, shipping?.last_name].filter(Boolean).join(' ')
                const hoursSinceOrder = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60)
                const statusAllowsCancel = ['pending', 'confirmed', 'processing'].includes(order.status)
                const canCancel = statusAllowsCancel && hoursSinceOrder <= 24
                const cancellationExpired = statusAllowsCancel && hoursSinceOrder > 24

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{orderDate}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || 'bg-secondary text-foreground'}`}>
                          {getStatusLabel(order.status, t)}
                        </span>
                        <span className="font-semibold">{formatCurrency(order.total, currencyLabel)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                        {expandedId === order.id ? t('Hide details', 'إخفاء التفاصيل') : t('View details', 'عرض التفاصيل')}
                      </Button>
                      {canCancel && (
                        <Button variant="destructive" size="sm" onClick={() => cancelOrder(order.id)}>
                          {t('Cancel order', 'إلغاء الطلب')}
                        </Button>
                      )}
                    </div>

                    {cancellationExpired && (
                      <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                        {t('Online cancellation is available for 24 hours only. Please contact support for help.', 'الإلغاء من الحساب متاح خلال 24 ساعة فقط. يرجى التواصل مع الدعم للمساعدة.')}
                      </p>
                    )}

                    {expandedId === order.id && (
                      <div className="mt-5 space-y-5 border-t border-border pt-5">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <DetailCard label={t('Order number', 'رقم الطلب')} value={order.order_number} />
                          <DetailCard label={t('Date', 'التاريخ')} value={orderDate} />
                          <DetailCard label={t('Status', 'الحالة')} value={getStatusLabel(order.status, t)} />
                          <DetailCard label={t('Payment', 'الدفع')} value={getPaymentLabel(order.payment_method, t)} />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <section className="rounded-xl border border-border bg-background/35 p-4">
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                              <MapPin className="h-4 w-4 text-primary" />
                              {t('Delivery details', 'تفاصيل التوصيل')}
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {customerName && <p className="text-foreground">{customerName}</p>}
                              {addressParts.length > 0 ? <p>{addressParts.join(', ')}</p> : <p>{t('No address saved', 'لا يوجد عنوان محفوظ')}</p>}
                              {contactParts.length > 0 && <p>{contactParts.join(' | ')}</p>}
                              {shipping?.whatsapp && <p>{t('WhatsApp:', 'واتساب:')} {shipping.whatsapp}</p>}
                              {shipping?.location_link && (
                                <a
                                  href={shipping.location_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block break-all text-primary hover:underline"
                                >
                                  {t('Open location link', 'فتح رابط الموقع')}
                                </a>
                              )}
                            </div>
                          </section>

                          <section className="rounded-xl border border-border bg-background/35 p-4">
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                              <CreditCard className="h-4 w-4 text-primary" />
                              {t('Payment summary', 'ملخص الدفع')}
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">{t('Subtotal', 'المجموع الفرعي')}</span>
                                <span>{formatCurrency(order.subtotal, currencyLabel)}</span>
                              </div>
                              <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">{t('Shipping', 'الشحن')}</span>
                                <span>
                                  {Number(order.shipping_cost || 0) > 0
                                    ? formatCurrency(order.shipping_cost, currencyLabel)
                                    : t('Free Delivery', 'توصيل مجاني')}
                                </span>
                              </div>
                              {Number(order.discount_amount || 0) > 0 && (
                                <div className="flex justify-between gap-3 text-green-600">
                                  <span>{order.discount_code || t('Discount', 'خصم')}</span>
                                  <span>-{formatCurrency(order.discount_amount, currencyLabel)}</span>
                                </div>
                              )}
                              <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
                                <span>{t('Total', 'الإجمالي')}</span>
                                <span className="text-primary">{formatCurrency(order.total, currencyLabel)}</span>
                              </div>
                              {order.payment_status && (
                                <p className="pt-1 text-xs text-muted-foreground">
                                  {t('Payment status:', 'حالة الدفع:')} {order.payment_status}
                                </p>
                              )}
                            </div>
                          </section>
                        </div>

                        <section className="rounded-xl border border-border bg-background/35 p-4">
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <ReceiptText className="h-4 w-4 text-primary" />
                            {t('Products', 'المنتجات')}
                          </h3>
                          {items.length > 0 ? (
                            <div className="space-y-3">
                              {items.map((item) => {
                                const lineTotal = Number(item.total_price || 0)
                                const unitPrice = Number(item.unit_price || (item.quantity ? lineTotal / item.quantity : 0))

                                return (
                                  <div key={item.id} className="rounded-lg border border-border bg-card/70 p-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        <p className="break-words text-sm font-medium">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {t('Weight/variant:', 'الوزن/النوع:')} {item.size || '-'}
                                        </p>
                                      </div>
                                      <p className="shrink-0 text-sm font-semibold text-primary">
                                        {formatCurrency(lineTotal, currencyLabel)}
                                      </p>
                                    </div>
                                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                                      <span>{t('Qty', 'الكمية')}: {item.quantity}</span>
                                      <span>{t('Unit', 'الوحدة')}: {formatCurrency(unitPrice, currencyLabel)}</span>
                                      <span>{t('Line', 'الإجمالي')}: {formatCurrency(lineTotal, currencyLabel)}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">{t('No product details available', 'لا توجد تفاصيل منتجات متاحة')}</p>
                          )}
                        </section>

                        {order.notes && (
                          <section className="rounded-xl border border-border bg-background/35 p-4">
                            <h3 className="mb-2 text-sm font-semibold">{t('Customer notes', 'ملاحظات العميل')}</h3>
                            <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{order.notes}</p>
                          </section>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
