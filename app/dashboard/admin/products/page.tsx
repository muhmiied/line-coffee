'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ShoppingBag, Plus, Pencil, Trash2, Search, RefreshCw,
  X, Coffee, Eye, EyeOff, Star, Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Size = { id: string; size: string; price: number; is_available: boolean }
type CategoryRef = { id: string; slug: string; name_ar: string; name_en: string }

type Product = {
  id: string
  slug: string
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  category_id: string | null
  category: CategoryRef | null
  images: string[]
  is_visible: boolean
  is_featured: boolean
  is_best_seller: boolean
  is_new: boolean
  stock_quantity: number
  low_stock_threshold: number
  is_manually_out_of_stock: boolean
  sizes: Size[]
}

type Category = { id: string; slug: string; name_ar: string; name_en: string }

type ProductForm = {
  name_ar: string
  name_en: string
  description_ar: string
  description_en: string
  category_id: string
  image: string
  price_250: string
  price_500: string
  price_1000: string
  stock_quantity: string
  low_stock_threshold: string
  is_manually_out_of_stock: boolean
  is_visible: boolean
  is_featured: boolean
  is_best_seller: boolean
  is_new: boolean
}

const EMPTY_FORM: ProductForm = {
  name_ar: '', name_en: '', description_ar: '', description_en: '',
  category_id: '', image: '',
  price_250: '', price_500: '', price_1000: '',
  stock_quantity: '0',
  low_stock_threshold: '10',
  is_manually_out_of_stock: false,
  is_visible: true, is_featured: false, is_best_seller: false, is_new: false,
}

const TOGGLES: Array<{
  key: 'is_visible' | 'is_featured' | 'is_best_seller' | 'is_new'
  en: string; ar: string; descEn: string; descAr: string
}> = [
  { key: 'is_visible',     en: 'Visible on site', ar: 'ظاهر في الموقع',   descEn: 'Show this product to customers',  descAr: 'يظهر هذا المنتج للعملاء' },
  { key: 'is_featured',    en: 'Featured',         ar: 'منتج مميز',         descEn: 'Show in featured section',        descAr: 'يظهر في قسم المميزين' },
  { key: 'is_best_seller', en: 'Best Seller',      ar: 'الأكثر مبيعاً',    descEn: 'Mark as best seller',             descAr: 'وضع علامة الأكثر مبيعاً' },
  { key: 'is_new',         en: 'New Arrival',      ar: 'وصل حديثاً',       descEn: 'Show as new product',             descAr: 'إظهاره كمنتج جديد' },
]

export default function ProductsPage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [visFilter, setVisFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products', { cache: 'no-store' }),
        fetch('/api/admin/categories', { cache: 'no-store' }),
      ])
      const prodJson = await prodRes.json()
      const catJson = await catRes.json()
      setProducts(prodJson.data || [])
      setCategories(catJson.data || [])
    } catch {
      toast.error(t('Failed to load products', 'فشل تحميل المنتجات'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let result = products
    const q = search.toLowerCase()
    if (q) result = result.filter(p => p.name_ar.includes(q) || p.name_en.toLowerCase().includes(q))
    if (catFilter) result = result.filter(p => p.category_id === catFilter)
    if (visFilter === 'visible') result = result.filter(p => p.is_visible)
    if (visFilter === 'hidden') result = result.filter(p => !p.is_visible)
    setFiltered(result)
  }, [search, catFilter, visFilter, products])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name_ar: p.name_ar,
      name_en: p.name_en,
      description_ar: p.description_ar || '',
      description_en: p.description_en || '',
      category_id: p.category_id || '',
      image: p.images?.[0] || '',
      price_250: String(p.sizes.find(s => s.size === '250g')?.price ?? ''),
      price_500: String(p.sizes.find(s => s.size === '500g')?.price ?? ''),
      price_1000: String(p.sizes.find(s => s.size === '1kg')?.price ?? ''),
      stock_quantity: String(p.stock_quantity),
      low_stock_threshold: String(p.low_stock_threshold ?? 10),
      is_manually_out_of_stock: p.is_manually_out_of_stock ?? false,
      is_visible: p.is_visible,
      is_featured: p.is_featured,
      is_best_seller: p.is_best_seller,
      is_new: p.is_new,
    })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      toast.error(t('Name in both languages is required', 'الاسم بكلتا اللغتين مطلوب'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim(),
        description_ar: form.description_ar.trim() || null,
        description_en: form.description_en.trim() || null,
        category_id: form.category_id || null,
        images: form.image.trim() ? [form.image.trim()] : [],
        price_250: form.price_250 ? Number(form.price_250) : 0,
        price_500: form.price_500 ? Number(form.price_500) : 0,
        price_1000: form.price_1000 ? Number(form.price_1000) : 0,
        stock_quantity: Number(form.stock_quantity || 0),
        low_stock_threshold: Number(form.low_stock_threshold || 10),
        is_manually_out_of_stock: form.is_manually_out_of_stock,
        is_visible: form.is_visible,
        is_featured: form.is_featured,
        is_best_seller: form.is_best_seller,
        is_new: form.is_new,
      }
      const res = await fetch(
        editing ? `/api/admin/products/${editing.id}` : '/api/admin/products',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(editing ? t('Product updated', 'تم تحديث المنتج') : t('Product added', 'تمت إضافة المنتج'))
      setShowModal(false)
      load()
    } catch (e: unknown) {
      toast.error((e as Error).message || t('Failed to save', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const toggleVisible = async (p: Product) => {
    setToggling(p.id + '_v')
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !p.is_visible }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_visible: !x.is_visible } : x))
      toast.success(!p.is_visible ? t('Product visible', 'المنتج مرئي الآن') : t('Product hidden', 'تم إخفاء المنتج'))
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    } finally {
      setToggling(null)
    }
  }

  const toggleFeatured = async (p: Product) => {
    setToggling(p.id + '_f')
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !p.is_featured }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_featured: !x.is_featured } : x))
      toast.success(!p.is_featured ? t('Marked as featured', 'تم وضع علامة مميز') : t('Removed from featured', 'تمت إزالة المميز'))
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    } finally {
      setToggling(null)
    }
  }

  const del = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(t('Product deleted', 'تم حذف المنتج'))
      setProducts(p => p.filter(x => x.id !== id))
    } catch (e: unknown) {
      toast.error((e as Error).message || t('Failed to delete', 'فشل الحذف'))
    } finally {
      setDeleting(null)
    }
  }

  const minPrice = (sizes: Size[]) =>
    sizes?.length ? Math.min(...sizes.map(s => s.price)) : null

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Products', 'المنتجات')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{products.length} {t('products total', 'منتج إجمالاً')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => load()}
            aria-label={t('Refresh', 'تحديث')}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            {t('Add Product', 'إضافة منتج')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('Search products...', 'بحث في المنتجات...')}
            className="w-56 bg-[#180d04] border border-[#c8941a]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          aria-label={t('Filter by category', 'تصفية حسب الفئة')}
          className="bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2.5 text-sm text-white/60 focus:outline-none focus:border-[#c8941a]/30 transition-all"
        >
          <option value="">{t('All categories', 'جميع الفئات')}</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name_ar}</option>
          ))}
        </select>
        <div className="flex bg-[#180d04] border border-[#c8941a]/10 rounded-xl overflow-hidden">
          {(['all', 'visible', 'hidden'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setVisFilter(v)}
              className={`px-3 py-2.5 text-sm transition-all ${visFilter === v ? 'bg-[#c8941a]/20 text-[#c8941a]' : 'text-white/35 hover:text-white/60'}`}
            >
              {v === 'all' ? t('All', 'الكل') : v === 'visible' ? t('Visible', 'مرئي') : t('Hidden', 'مخفي')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-56 border border-[#c8941a]/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-16 w-16 rounded-2xl bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center mb-4">
            <ShoppingBag className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-white/40 text-sm">{t('No products found', 'لا توجد منتجات')}</p>
          <button type="button" onClick={openAdd} className="mt-4 text-[#c8941a] text-sm hover:opacity-70 transition-opacity">
            + {t('Add your first product', 'أضف أول منتج')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(product => {
            const price = minPrice(product.sizes)
            return (
              <div
                key={product.id}
                className={`group bg-[#180d04] border rounded-2xl overflow-hidden transition-all ${
                  product.is_visible
                    ? 'border-[#c8941a]/10 hover:border-[#c8941a]/30'
                    : 'border-white/[0.04] opacity-60 hover:opacity-80'
                }`}
              >
                {/* Image */}
                <div className="relative h-36 bg-[#0f0900]">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name_ar}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Coffee className="h-8 w-8 text-[#c8941a]/20" />
                    </div>
                  )}

                  {/* Status badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!product.is_visible && (
                      <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                        <EyeOff className="h-2.5 w-2.5 text-white/40" />
                        <span className="text-[9px] text-white/40">{t('Hidden', 'مخفي')}</span>
                      </div>
                    )}
                    {product.is_featured && (
                      <div className="flex items-center gap-1 bg-[#c8941a]/85 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                        <Star className="h-2.5 w-2.5 text-black" />
                        <span className="text-[9px] text-black font-semibold">{t('Featured', 'مميز')}</span>
                      </div>
                    )}
                    {product.is_new && (
                      <div className="bg-emerald-500/75 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                        <span className="text-[9px] text-white font-semibold">{t('New', 'جديد')}</span>
                      </div>
                    )}
                    {product.is_best_seller && (
                      <div className="bg-blue-500/70 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                        <span className="text-[9px] text-white font-semibold">{t('Best Seller', 'الأكثر مبيعاً')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      aria-label={t('Edit', 'تعديل')}
                      className="h-8 w-8 rounded-lg bg-[#c8941a] flex items-center justify-center hover:bg-[#b8840f] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-black" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisible(product)}
                      disabled={toggling === product.id + '_v'}
                      aria-label={product.is_visible ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
                      className="h-8 w-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-40"
                    >
                      {toggling === product.id + '_v' ? (
                        <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : product.is_visible ? (
                        <EyeOff className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-white" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFeatured(product)}
                      disabled={toggling === product.id + '_f'}
                      aria-label={product.is_featured ? t('Unfeature', 'إزالة التمييز') : t('Feature', 'تمييز')}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-40 ${
                        product.is_featured
                          ? 'bg-[#c8941a]/30 border-[#c8941a]/50 hover:bg-[#c8941a]/50'
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {toggling === product.id + '_f' ? (
                        <div className="h-3.5 w-3.5 border border-[#c8941a] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Star className={`h-3.5 w-3.5 ${product.is_featured ? 'text-[#c8941a]' : 'text-white'}`} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => del(product.id)}
                      disabled={deleting === product.id}
                      aria-label={t('Delete', 'حذف')}
                      className="h-8 w-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/40 transition-colors disabled:opacity-40"
                    >
                      {deleting === product.id ? (
                        <div className="h-3.5 w-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="px-3 py-2.5">
                  <p className="text-white/80 text-sm font-semibold truncate">{t(product.name_en, product.name_ar)}</p>
                  <p className="text-white/35 text-[11px] truncate">{t(product.name_ar, product.name_en)}</p>
                  {product.category && (
                    <p className="text-[#c8941a]/40 text-[9px] font-mono truncate mt-0.5">{t(product.category.name_en, product.category.name_ar)}</p>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    {price !== null ? (
                      <p className="text-[#c8941a] text-xs font-semibold">
                        {t('from', 'من')} {price} {t('EGP', 'ج.م')}
                      </p>
                    ) : (
                      <p className="text-white/20 text-xs">{t('No price', 'بدون سعر')}</p>
                    )}
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-white/20" />
                      <span className={`text-[10px] font-semibold ${
                        product.is_manually_out_of_stock || product.stock_quantity <= 0
                          ? 'text-red-400/80'
                          : product.stock_quantity <= (product.low_stock_threshold ?? 10)
                            ? 'text-yellow-400/80'
                            : 'text-white/25'
                      }`}>
                        {product.is_manually_out_of_stock
                          ? t('OOS', 'نفد')
                          : product.stock_quantity
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0f0900] border border-[#c8941a]/20 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] shrink-0">
              <h3 className="text-white font-bold text-sm">
                {editing ? t('Edit Product', 'تعديل المنتج') : t('New Product', 'منتج جديد')}
              </h3>
              <button
                type="button"
                aria-label={t('Close', 'إغلاق')}
                onClick={() => setShowModal(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Names */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Name', 'الاسم بالعربية')} *</label>
                  <input
                    value={form.name_ar}
                    onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                    dir="rtl"
                    placeholder="قهوة تركية"
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('English Name', 'الاسم بالإنجليزية')} *</label>
                  <input
                    value={form.name_en}
                    onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                    placeholder="Turkish Coffee"
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Description', 'الوصف بالعربية')}</label>
                  <textarea
                    value={form.description_ar}
                    onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))}
                    rows={2}
                    dir="rtl"
                    placeholder={t('Optional', 'اختياري')}
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('English Description', 'الوصف بالإنجليزية')}</label>
                  <textarea
                    value={form.description_en}
                    onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))}
                    rows={2}
                    placeholder={t('Optional', 'اختياري')}
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Category', 'الفئة')}</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                  aria-label={t('Category', 'الفئة')}
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                >
                  <option value="">{t('Uncategorized', 'بدون فئة')}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Stock Quantity', 'الكمية المتوفرة')}</label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={e => setForm(p => ({ ...p, stock_quantity: e.target.value }))}
                    min={0}
                    placeholder="0"
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Low Stock Alert At', 'تنبيه عند الكمية')}</label>
                  <input
                    type="number"
                    value={form.low_stock_threshold}
                    onChange={e => setForm(p => ({ ...p, low_stock_threshold: e.target.value }))}
                    min={1}
                    placeholder="10"
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  />
                </div>
              </div>

              {/* Manual out-of-stock */}
              <div className="flex items-center justify-between p-3 bg-[#180d04] border border-[#c8941a]/10 rounded-xl">
                <div>
                  <p className="text-white/70 text-sm font-medium">{t('Force Out of Stock', 'إيقاف البيع يدوياً')}</p>
                  <p className="text-white/25 text-xs mt-0.5">{t('Override stock — prevent all purchases', 'تعطيل الشراء بغض النظر عن الكمية')}</p>
                </div>
                <button
                  type="button"
                  aria-label={t('Force Out of Stock', 'إيقاف البيع يدوياً')}
                  onClick={() => setForm(p => ({ ...p, is_manually_out_of_stock: !p.is_manually_out_of_stock }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_manually_out_of_stock ? 'bg-red-600' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_manually_out_of_stock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Image URL', 'رابط الصورة')}</label>
                <div className="flex gap-3 items-center">
                  <input
                    value={form.image}
                    onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  />
                  {form.image && (
                    <div className="h-10 w-10 rounded-lg border border-[#c8941a]/20 overflow-hidden shrink-0">
                      <img
                        src={form.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Prices */}
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Prices (EGP)', 'الأسعار (ج.م)')}</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {([
                    { label: '250g', field: 'price_250' },
                    { label: '500g', field: 'price_500' },
                    { label: '1 kg',  field: 'price_1000' },
                  ] as const).map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-white/25 text-[10px] mb-1">{label}</label>
                      <input
                        type="number"
                        value={form[field]}
                        onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        min={0}
                        placeholder="0"
                        className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                {TOGGLES.map(({ key, en, ar, descEn, descAr }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-[#180d04] border border-[#c8941a]/10 rounded-xl">
                    <div>
                      <p className="text-white/70 text-sm font-medium">{t(en, ar)}</p>
                      <p className="text-white/25 text-xs mt-0.5">{t(descEn, descAr)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={t(en, ar)}
                      onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form[key] ? 'bg-[#c8941a]' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05] shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all disabled:opacity-50"
              >
                {saving
                  ? t('Saving...', 'جارٍ الحفظ...')
                  : editing
                  ? t('Save Changes', 'حفظ التغييرات')
                  : t('Add Product', 'إضافة المنتج')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
