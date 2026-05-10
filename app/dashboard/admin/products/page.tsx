'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Plus, Pencil, Trash2, Eye, EyeOff,
  AlertTriangle, Search, RefreshCw, X, Check,
} from 'lucide-react'
import { toast } from 'sonner'

type Size = { id?: string; size: string; price: number; is_available: boolean }
type Product = {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string | null
  description_en?: string | null
  is_visible: boolean
  stock_quantity: number
  sizes?: Size[]
  category_id?: string | null
  images?: string[]
}

const EMPTY_FORM = {
  name_ar: '', name_en: '',
  description_ar: '', description_en: '',
  price_250: '', price_500: '', price_1000: '',
  stock_quantity: '50',
  image_url: '',
  is_visible: true,
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium border border-red-200">نفد المخزون</span>
  if (qty < 10)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium border border-orange-200">مخزون منخفض ({qty})</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium border border-green-200">{qty} متوفر</span>
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStock, setFilterStock] = useState<'all' | 'out' | 'low' | 'ok'>('all')

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  // Inline stock edit
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [stockVal, setStockVal] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' })
      const data = await res.json()
      setProducts(data?.data || [])
    } catch {
      toast.error('فشل تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let list = [...products]
    if (filterStock === 'out') list = list.filter((p) => p.stock_quantity === 0)
    else if (filterStock === 'low') list = list.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 10)
    else if (filterStock === 'ok') list = list.filter((p) => p.stock_quantity >= 10)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name_ar?.includes(q) || p.name_en?.toLowerCase().includes(q))
    }
    setFiltered(list)
  }, [products, search, filterStock])

  const openAdd = () => {
    setEditingProduct(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setForm({
      name_ar: p.name_ar || '',
      name_en: p.name_en || '',
      description_ar: p.description_ar || '',
      description_en: p.description_en || '',
      price_250: String(p.sizes?.find((s) => s.size === '250g')?.price || ''),
      price_500: String(p.sizes?.find((s) => s.size === '500g')?.price || ''),
      price_1000: String(p.sizes?.find((s) => s.size === '1kg')?.price || ''),
      stock_quantity: String(p.stock_quantity ?? 0),
      image_url: p.images?.[0] || '',
      is_visible: p.is_visible,
    })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      toast.error('الاسم بالعربي والإنجليزي مطلوب')
      return
    }
    setSaving(true)
    try {
      const body = {
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim(),
        description_ar: form.description_ar.trim() || null,
        description_en: form.description_en.trim() || null,
        price_250: Number(form.price_250 || 0),
        price_500: Number(form.price_500 || 0),
        price_1000: Number(form.price_1000 || 0),
        stock_quantity: Number(form.stock_quantity || 0),
        images: form.image_url.trim() ? [form.image_url.trim()] : [],
        is_visible: form.is_visible,
      }

      let res: Response
      if (editingProduct) {
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (res.ok) {
        toast.success(editingProduct ? 'تم تعديل المنتج' : 'تم إضافة المنتج')
        setShowModal(false)
        await load()
      } else {
        const err = await res.json()
        toast.error(err?.error || 'فشل الحفظ')
      }
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف المنتج')
        await load()
      } else {
        toast.error('فشل الحذف')
      }
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const toggleVisibility = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ar: p.name_ar, name_en: p.name_en,
          description_ar: p.description_ar, description_en: p.description_en,
          is_visible: !p.is_visible,
          stock_quantity: p.stock_quantity,
          price_250: p.sizes?.find((s) => s.size === '250g')?.price || 0,
          price_500: p.sizes?.find((s) => s.size === '500g')?.price || 0,
          price_1000: p.sizes?.find((s) => s.size === '1kg')?.price || 0,
        }),
      })
      if (res.ok) {
        setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_visible: !p.is_visible } : x))
        toast.success(p.is_visible ? 'تم إخفاء المنتج' : 'تم إظهار المنتج')
      }
    } catch { toast.error('فشل التحديث') }
  }

  const saveStock = async (p: Product) => {
    const qty = Number(stockVal)
    if (isNaN(qty) || qty < 0) { toast.error('كمية غير صالحة'); return }
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ar: p.name_ar, name_en: p.name_en,
          description_ar: p.description_ar, description_en: p.description_en,
          is_visible: p.is_visible,
          stock_quantity: qty,
          price_250: p.sizes?.find((s) => s.size === '250g')?.price || 0,
          price_500: p.sizes?.find((s) => s.size === '500g')?.price || 0,
          price_1000: p.sizes?.find((s) => s.size === '1kg')?.price || 0,
        }),
      })
      if (res.ok) {
        setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, stock_quantity: qty } : x))
        setEditingStock(null)
        toast.success('تم تحديث المخزون')
      } else toast.error('فشل التحديث')
    } catch { toast.error('فشل التحديث') }
  }

  const outCount = products.filter((p) => p.stock_quantity === 0).length
  const lowCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 10).length

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a0a00] flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#522500]" /> المنتجات والمخزون
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} منتج · <span className="text-red-600">{outCount} نفد</span> · <span className="text-orange-600">{lowCount} منخفض</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 text-sm text-[#522500] bg-white border border-[#e8ddd5] px-4 py-2 rounded-xl hover:bg-[#faf7f4] transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 text-sm bg-[#522500] text-[#FFDCC2] px-4 py-2 rounded-xl hover:bg-[#3d1a00] transition-colors font-medium">
            <Plus className="h-4 w-4" /> إضافة منتج
          </button>
        </div>
      </div>

      {/* Alert for out of stock */}
      {outCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span><strong>{outCount}</strong> منتج نفد من المخزون — سيظهر للعملاء كـ "نفد المخزون"</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المنتجات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e8ddd5] rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
          />
        </div>
        {(['all', 'out', 'low', 'ok'] as const).map((f) => (
          <button key={f} onClick={() => setFilterStock(f)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${filterStock === f ? 'bg-[#522500] text-[#FFDCC2] border-[#522500]' : 'bg-white text-gray-600 border-[#e8ddd5]'}`}>
            {f === 'all' ? 'الكل' : f === 'out' ? 'نفد المخزون' : f === 'low' ? 'مخزون منخفض' : 'متوفر'}
          </button>
        ))}
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-[#522500] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8ddd5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0e8e0] bg-[#faf7f4]">
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs">المنتج</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-gray-600 text-xs">السعر (250g)</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-gray-600 text-xs">المخزون</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-gray-600 text-xs">الحالة</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-gray-600 text-xs">الظهور</th>
                  <th className="px-4 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8e0]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-[#faf7f4] transition-colors">
                    {/* Name + Image */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#f5f0eb] border border-[#e8ddd5] overflow-hidden shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name_ar} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#c8b89a]">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a0a00]">{p.name_ar}</p>
                          <p className="text-xs text-gray-400">{p.name_en}</p>
                        </div>
                      </div>
                    </td>
                    {/* Price */}
                    <td className="px-4 py-4 text-[#522500] font-semibold">
                      {p.sizes?.find((s) => s.size === '250g')?.price
                        ? `${p.sizes?.find((s) => s.size === '250g')?.price} ج.م`
                        : '—'}
                    </td>
                    {/* Stock inline edit */}
                    <td className="px-4 py-4">
                      {editingStock === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={stockVal}
                            onChange={(e) => setStockVal(e.target.value)}
                            className="w-20 border border-[#e8ddd5] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') saveStock(p); if (e.key === 'Escape') setEditingStock(null) }}
                          />
                          <button onClick={() => saveStock(p)} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditingStock(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingStock(p.id); setStockVal(String(p.stock_quantity)) }}
                          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <StockBadge qty={p.stock_quantity} />
                          <Pencil className="h-3 w-3 text-gray-300" />
                        </button>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      {p.stock_quantity === 0
                        ? <span className="text-xs text-red-600 font-medium">Sold Out</span>
                        : <span className="text-xs text-green-600 font-medium">In Stock</span>}
                    </td>
                    {/* Visibility */}
                    <td className="px-4 py-4">
                      <button onClick={() => toggleVisibility(p)} title={p.is_visible ? 'إخفاء' : 'إظهار'}
                        className={`p-1.5 rounded-lg transition-colors ${p.is_visible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                        {p.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-[#522500] hover:bg-[#FFDCC2]/30 rounded-lg transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteProduct(p.id, p.name_ar)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ddd5]">
                  <h2 className="font-bold text-[#1a0a00]">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">الاسم بالعربي *</label>
                      <input value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                        className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30" placeholder="مثال: قهوة تركية" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">الاسم بالإنجليزي *</label>
                      <input value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                        className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30" placeholder="Turkish Coffee" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">وصف بالعربي</label>
                      <textarea value={form.description_ar} onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
                        rows={2} className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30 resize-none" placeholder="وصف المنتج..." />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">وصف بالإنجليزي</label>
                      <textarea value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
                        rows={2} className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30 resize-none" placeholder="Product description..." />
                    </div>
                  </div>

                  {/* Prices */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">الأسعار (ج.م)</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ label: '250g', key: 'price_250' }, { label: '500g', key: 'price_500' }, { label: '1 كجم', key: 'price_1000' }].map(({ label, key }) => (
                        <div key={key}>
                          <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                          <input type="number" min={0}
                            value={form[key as keyof typeof form] as string}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30" placeholder="0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">رابط صورة المنتج</label>
                    <div className="flex gap-3 items-start">
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                        className="flex-1 border border-[#e8ddd5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
                        placeholder="https://..."
                      />
                      {form.image_url && (
                        <div className="h-10 w-10 rounded-lg border border-[#e8ddd5] overflow-hidden shrink-0">
                          <img src={form.image_url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">الكمية في المخزون</label>
                    <input type="number" min={0}
                      value={form.stock_quantity}
                      onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                      className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30" />
                    <p className="text-xs text-gray-400 mt-1">إذا كانت الكمية 0 سيظهر المنتج كـ "نفد المخزون" في الموقع</p>
                  </div>

                  {/* Visibility */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.is_visible}
                      onChange={(e) => setForm((f) => ({ ...f, is_visible: e.target.checked }))}
                      className="w-4 h-4 accent-[#522500]" />
                    <span className="text-sm font-medium text-gray-700">ظاهر في الموقع</span>
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-[#e8ddd5]">
                  <button onClick={save} disabled={saving}
                    className="flex-1 bg-[#522500] text-[#FFDCC2] py-2.5 rounded-xl font-medium text-sm hover:bg-[#3d1a00] transition-colors disabled:opacity-60">
                    {saving ? 'جاري الحفظ...' : (editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج')}
                  </button>
                  <button onClick={() => setShowModal(false)}
                    className="px-5 bg-[#f5f0eb] text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-[#e8ddd5] transition-colors">
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
