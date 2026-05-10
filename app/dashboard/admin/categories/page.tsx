'use client'

import { useEffect, useState, useCallback } from 'react'
import { Tag, Plus, Pencil, Trash2, Search, RefreshCw, X, Coffee, Package, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Category = {
  id: string
  name_ar: string
  name_en: string
  image_url: string | null
  sort_order: number
  productCount: number
}

type ProductItem = {
  id: string
  name_ar: string
  name_en: string
  category_id: string | null
  images?: string[]
}

const EMPTY: Omit<Category, 'id' | 'productCount'> = {
  name_ar: '', name_en: '', image_url: '', sort_order: 0,
}

export default function CategoriesPage() {
  const { t } = useLanguage()
  const [cats, setCats] = useState<Category[]>([])
  const [filtered, setFiltered] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Product management state
  const [manageCat, setManageCat] = useState<Category | null>(null)
  const [allProducts, setAllProducts] = useState<ProductItem[]>([])
  const [manageLoading, setManageLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [addSearch, setAddSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store' })
      const json = await res.json()
      setCats(json.data || [])
    } catch {
      toast.error(t('Failed to load categories', 'فشل تحميل الفئات'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? cats.filter(c => c.name_ar.includes(q) || c.name_en.toLowerCase().includes(q)) : cats)
  }, [search, cats])

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true) }
  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name_ar: cat.name_ar, name_en: cat.name_en, image_url: cat.image_url || '', sort_order: cat.sort_order })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      toast.error(t('Name in both languages is required', 'الاسم بكلتا اللغتين مطلوب'))
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(editing ? t('Category updated', 'تم تحديث الفئة') : t('Category added', 'تمت إضافة الفئة'))
      setShowModal(false)
      load()
    } catch (e: unknown) {
      toast.error((e as Error).message || t('Failed to save', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(t('Category deleted', 'تم حذف الفئة'))
      setCats(p => p.filter(c => c.id !== id))
    } catch (e: unknown) {
      toast.error((e as Error).message || t('Failed to delete', 'فشل الحذف'))
    } finally {
      setDeleting(null)
    }
  }

  const openManage = async (cat: Category) => {
    setManageCat(cat)
    setAddSearch('')
    setManageLoading(true)
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' })
      const data = await res.json()
      setAllProducts(data?.data || [])
    } catch {
      toast.error(t('Failed to load products', 'فشل تحميل المنتجات'))
    } finally {
      setManageLoading(false)
    }
  }

  const assignCategory = async (productId: string, catId: string | null) => {
    setActionLoading(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: catId }),
      })
      if (!res.ok) throw new Error()
      setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, category_id: catId } : p))
      // Update productCount in cats
      setCats(prev => prev.map(c => {
        if (c.id === catId) return { ...c, productCount: c.productCount + 1 }
        const wasIn = allProducts.find(p => p.id === productId)?.category_id === c.id
        if (wasIn) return { ...c, productCount: Math.max(0, c.productCount - 1) }
        return c
      }))
      toast.success(catId ? t('Added to category', 'تمت الإضافة للفئة') : t('Removed from category', 'تمت الإزالة من الفئة'))
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    } finally {
      setActionLoading(null)
    }
  }

  const inCat = manageCat ? allProducts.filter(p => p.category_id === manageCat.id) : []
  const available = manageCat
    ? allProducts.filter(p => p.category_id !== manageCat.id && (
        addSearch.trim() === '' ||
        p.name_ar.includes(addSearch) ||
        p.name_en.toLowerCase().includes(addSearch.toLowerCase())
      ))
    : []

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Categories', 'الفئات')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{cats.length} {t('categories total', 'فئة إجمالاً')}</p>
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
            {t('Add Category', 'إضافة فئة')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('Search categories...', 'بحث في الفئات...')}
          className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-52 border border-[#c8941a]/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-16 w-16 rounded-2xl bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center mb-4">
            <Tag className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-white/40 text-sm">{t('No categories found', 'لا توجد فئات')}</p>
          <button type="button" onClick={openAdd} className="mt-4 text-[#c8941a] text-sm hover:opacity-70 transition-opacity">
            + {t('Add your first category', 'أضف أول فئة')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(cat => (
            <div key={cat.id} className="group bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden hover:border-[#c8941a]/30 transition-all">
              {/* Image */}
              <div className="relative h-36 bg-[#0f0900]">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name_ar} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Coffee className="h-8 w-8 text-[#c8941a]/20" />
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    aria-label={t('Edit', 'تعديل')}
                    className="h-8 w-8 rounded-lg bg-[#c8941a] flex items-center justify-center hover:bg-[#b8840f] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-black" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openManage(cat)}
                    aria-label={t('Manage Products', 'إدارة المنتجات')}
                    className="h-8 w-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Package className="h-3.5 w-3.5 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => del(cat.id)}
                    disabled={deleting === cat.id}
                    aria-label={t('Delete', 'حذف')}
                    className="h-8 w-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
                {/* Sort badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5 text-[10px] text-white/50">
                  #{cat.sort_order}
                </div>
              </div>
              {/* Info */}
              <div className="px-3 py-2.5">
                <p className="text-white/80 text-sm font-semibold truncate">{cat.name_ar}</p>
                <p className="text-white/35 text-[11px] truncate">{cat.name_en}</p>
                <button
                  type="button"
                  onClick={() => openManage(cat)}
                  className="text-[#c8941a]/60 hover:text-[#c8941a] text-[10px] mt-1 transition-colors"
                >
                  {cat.productCount} {t('products — manage', 'منتج — إدارة')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit/Add Category Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[#0f0900] border border-[#c8941a]/20 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <h3 className="text-white font-bold text-sm">
                {editing ? t('Edit Category', 'تعديل الفئة') : t('New Category', 'فئة جديدة')}
              </h3>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Name', 'الاسم بالعربية')} *</label>
                <input
                  value={form.name_ar}
                  onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  placeholder="مثال: قهوة تركية"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('English Name', 'الاسم بالإنجليزية')} *</label>
                <input
                  value={form.name_en}
                  onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  placeholder="e.g. Turkish Coffee"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Image URL', 'رابط الصورة')}</label>
                <div className="flex gap-3 items-center">
                  <input
                    value={form.image_url || ''}
                    onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                    className="flex-1 bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                    placeholder="https://..."
                  />
                  {form.image_url && (
                    <div className="h-10 w-10 rounded-lg border border-[#c8941a]/20 overflow-hidden shrink-0">
                      <img src={form.image_url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5" htmlFor="cat-sort">{t('Sort Order', 'ترتيب العرض')}</label>
                <input
                  id="cat-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                  min={0}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
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
                {saving ? t('Saving...', 'جارٍ الحفظ...') : editing ? t('Save Changes', 'حفظ التغييرات') : t('Add Category', 'إضافة الفئة')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Products Modal ── */}
      {manageCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setManageCat(null)} />
          <div className="relative w-full max-w-lg bg-[#0f0900] border border-[#c8941a]/20 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] shrink-0">
              <div>
                <h3 className="text-white font-bold text-sm">{t('Manage Products', 'إدارة منتجات الفئة')}</h3>
                <p className="text-white/30 text-xs mt-0.5">{manageCat.name_ar}</p>
              </div>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setManageCat(null)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {manageLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 border-2 border-[#c8941a] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Products currently in this category */}
                  <div>
                    <p className="text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                      {t('In this category', 'منتجات هذه الفئة')} ({inCat.length})
                    </p>
                    {inCat.length === 0 ? (
                      <p className="text-white/20 text-xs py-3 text-center border border-dashed border-white/10 rounded-xl">
                        {t('No products in this category yet', 'لا توجد منتجات في هذه الفئة')}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {inCat.map(p => (
                          <div key={p.id} className="flex items-center gap-3 bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-3 py-2.5">
                            <div className="h-8 w-8 rounded-lg bg-[#0f0900] border border-white/5 overflow-hidden shrink-0">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.name_ar} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Coffee className="h-3.5 w-3.5 text-[#c8941a]/30" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/80 text-xs font-medium truncate">{p.name_ar}</p>
                              <p className="text-white/30 text-[10px] truncate">{p.name_en}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => assignCategory(p.id, null)}
                              disabled={actionLoading === p.id}
                              aria-label={t('Remove from category', 'إزالة من الفئة')}
                              className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-colors shrink-0 disabled:opacity-40"
                            >
                              {actionLoading === p.id ? (
                                <div className="h-3 w-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <X className="h-3 w-3 text-red-400" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add products */}
                  <div>
                    <p className="text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                      {t('Add products', 'إضافة منتجات')}
                    </p>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                      <input
                        value={addSearch}
                        onChange={e => setAddSearch(e.target.value)}
                        placeholder={t('Search products...', 'بحث في المنتجات...')}
                        className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {available.length === 0 ? (
                        <p className="text-white/20 text-xs py-3 text-center">
                          {addSearch ? t('No products found', 'لا توجد نتائج') : t('All products are already in this category', 'جميع المنتجات في هذه الفئة')}
                        </p>
                      ) : available.map(p => (
                        <div key={p.id} className="flex items-center gap-3 bg-[#180d04] border border-white/[0.04] rounded-xl px-3 py-2.5 hover:border-[#c8941a]/20 transition-all">
                          <div className="h-8 w-8 rounded-lg bg-[#0f0900] border border-white/5 overflow-hidden shrink-0">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name_ar} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Coffee className="h-3.5 w-3.5 text-[#c8941a]/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-xs font-medium truncate">{p.name_ar}</p>
                            <p className="text-white/25 text-[10px] truncate">
                              {p.category_id
                                ? `${t('Currently in', 'في فئة')} ${cats.find(c => c.id === p.category_id)?.name_ar || '...'}`
                                : t('Uncategorized', 'بدون فئة')}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => assignCategory(p.id, manageCat.id)}
                            disabled={actionLoading === p.id}
                            aria-label={t('Add to category', 'إضافة للفئة')}
                            className="h-7 w-7 rounded-lg bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center hover:bg-[#c8941a]/30 transition-colors shrink-0 disabled:opacity-40"
                          >
                            {actionLoading === p.id ? (
                              <div className="h-3 w-3 border border-[#c8941a] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 text-[#c8941a]" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
