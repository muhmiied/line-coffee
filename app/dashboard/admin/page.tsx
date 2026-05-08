'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/lib/context/language'
import { useAuth } from '@/lib/context/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ADMIN_EMAIL } from '@/lib/config/site'
import { toast } from 'sonner'

type AdminOrder = {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  shipping_address?: { first_name?: string; last_name?: string; phone?: string }
}

type AdminProduct = {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string | null
  description_en?: string | null
  is_visible: boolean
  sizes?: Array<{ size: string; price: number }>
}

export default function AdminDashboardPage() {
  const { t, language } = useLanguage()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)
  const [annText, setAnnText] = useState('')
  const [annActive, setAnnActive] = useState(true)
  const [annSaving, setAnnSaving] = useState(false)

  const [newProduct, setNewProduct] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price_250: '',
    price_500: '',
    price_1000: '',
  })

  useEffect(() => {
    if (!authLoading && user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, router])

  const loadAll = async () => {
    setLoading(true)
    const [ordersRes, productsRes, annRes] = await Promise.all([
      fetch('/api/admin/orders', { cache: 'no-store' }),
      fetch('/api/admin/products', { cache: 'no-store' }),
      fetch('/api/settings/announcement', { cache: 'no-store' }),
    ])
    const ordersData = await ordersRes.json()
    const productsData = await productsRes.json()
    const annData = await annRes.json()
    setOrders(ordersData?.data?.orders || [])
    setTotalSales(ordersData?.data?.stats?.totalSales || 0)
    setProducts(productsData?.data || [])
    setAnnText(annData?.text || '')
    setAnnActive(annData?.active ?? true)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  const saveAnnouncement = async () => {
    setAnnSaving(true)
    try {
      const res = await fetch('/api/settings/announcement', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: annText, active: annActive }),
      })
      if (res.ok) {
        toast.success(t('Announcement saved!', 'تم حفظ الإعلان!'))
      } else {
        toast.error(t('Failed to save', 'فشل الحفظ'))
      }
    } catch {
      toast.error(t('Failed to save', 'فشل الحفظ'))
    } finally {
      setAnnSaving(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await loadAll()
  }

  const updateProduct = async (product: AdminProduct, patch: Partial<AdminProduct> & { price_250?: number; price_500?: number; price_1000?: number }) => {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_ar: patch.name_ar ?? product.name_ar,
        name_en: patch.name_en ?? product.name_en,
        description_ar: patch.description_ar ?? product.description_ar,
        description_en: patch.description_en ?? product.description_en,
        is_visible: patch.is_visible ?? product.is_visible,
        price_250: patch.price_250 ?? product.sizes?.find((s) => s.size === '250g')?.price ?? 0,
        price_500: patch.price_500 ?? product.sizes?.find((s) => s.size === '500g')?.price ?? 0,
        price_1000: patch.price_1000 ?? product.sizes?.find((s) => s.size === '1kg')?.price ?? 0,
      }),
    })
    await loadAll()
  }

  const removeProduct = async (productId: string) => {
    await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
    await loadAll()
  }

  const createProduct = async () => {
    if (!newProduct.name_ar || !newProduct.name_en) return
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduct,
        price_250: Number(newProduct.price_250 || 0),
        price_500: Number(newProduct.price_500 || 0),
        price_1000: Number(newProduct.price_1000 || 0),
      }),
    })
    setNewProduct({
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price_250: '',
      price_500: '',
      price_1000: '',
    })
    await loadAll()
  }

  const totalOrders = useMemo(() => orders.length, [orders.length])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">{t('Loading admin dashboard...', 'جاري تحميل لوحة الإدارة...')}</div>
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">{t('Admin Dashboard', 'لوحة تحكم الأدمن')}</h1>
          <p className="text-muted-foreground mt-2">
            {t(`Full access for ${ADMIN_EMAIL}`, `صلاحيات كاملة للحساب ${ADMIN_EMAIL}`)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-muted-foreground text-sm">{t('Total Sales', 'إجمالي المبيعات')}</p>
            <p className="text-2xl font-bold text-primary">{totalSales.toFixed(2)} {t('EGP', 'ج.م')}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-muted-foreground text-sm">{t('Total Orders', 'عدد الطلبات')}</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
        </div>

        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">{t('Announcement Bar', 'شريط الإعلانات')}</h2>
          <p className="text-xs text-muted-foreground mb-3">
            {t(
              'Requires "site_settings" table in Supabase (key text PK, value text).',
              'يتطلب جدول "site_settings" في Supabase (key text PK, value text).'
            )}
          </p>
          <div className="space-y-3">
            <Input
              value={annText}
              onChange={(e) => setAnnText(e.target.value)}
              placeholder={t('Announcement text...', 'نص الإعلان...')}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={annActive}
                onChange={(e) => setAnnActive(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">{t('Active', 'مفعّل')}</span>
            </label>
            <Button onClick={saveAnnouncement} disabled={annSaving}>
              {annSaving ? t('Saving...', 'جاري الحفظ...') : t('Save Announcement', 'حفظ الإعلان')}
            </Button>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">{t('Orders Management', 'إدارة الطلبات')}</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-lg p-3 flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="font-semibold">#{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} - {order.total} {t('EGP', 'ج.م')}
                  </p>
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">{t('Add Product', 'إضافة منتج')}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder={t('Arabic name', 'الاسم بالعربي')} value={newProduct.name_ar} onChange={(e) => setNewProduct((prev) => ({ ...prev, name_ar: e.target.value }))} />
            <Input placeholder={t('English name', 'الاسم بالإنجليزي')} value={newProduct.name_en} onChange={(e) => setNewProduct((prev) => ({ ...prev, name_en: e.target.value }))} />
            <Input placeholder="250g" value={newProduct.price_250} onChange={(e) => setNewProduct((prev) => ({ ...prev, price_250: e.target.value }))} />
            <Input placeholder="500g" value={newProduct.price_500} onChange={(e) => setNewProduct((prev) => ({ ...prev, price_500: e.target.value }))} />
            <Input placeholder="1kg" value={newProduct.price_1000} onChange={(e) => setNewProduct((prev) => ({ ...prev, price_1000: e.target.value }))} />
            <Button onClick={createProduct}>{t('Add Product', 'إضافة المنتج')}</Button>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">{t('Products Management', 'إدارة المنتجات')}</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <Input defaultValue={product.name_ar} onBlur={(e) => updateProduct(product, { name_ar: e.target.value })} />
                  <Input defaultValue={product.name_en} onBlur={(e) => updateProduct(product, { name_en: e.target.value })} />
                  <Textarea defaultValue={product.description_ar || ''} onBlur={(e) => updateProduct(product, { description_ar: e.target.value })} />
                  <Textarea defaultValue={product.description_en || ''} onBlur={(e) => updateProduct(product, { description_en: e.target.value })} />
                </div>
                <div className="grid md:grid-cols-4 gap-3">
                  <Input
                    placeholder="250g"
                    defaultValue={product.sizes?.find((s) => s.size === '250g')?.price ?? ''}
                    onBlur={(e) => updateProduct(product, { price_250: Number(e.target.value || 0) })}
                  />
                  <Input
                    placeholder="500g"
                    defaultValue={product.sizes?.find((s) => s.size === '500g')?.price ?? ''}
                    onBlur={(e) => updateProduct(product, { price_500: Number(e.target.value || 0) })}
                  />
                  <Input
                    placeholder="1kg"
                    defaultValue={product.sizes?.find((s) => s.size === '1kg')?.price ?? ''}
                    onBlur={(e) => updateProduct(product, { price_1000: Number(e.target.value || 0) })}
                  />
                  <Button variant="destructive" onClick={() => removeProduct(product.id)}>
                    {t('Delete', 'حذف')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

