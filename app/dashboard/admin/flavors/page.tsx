'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, Plus, Pencil, Trash2, Eye, EyeOff, Save, X, ChevronDown, ChevronUp, RefreshCw, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

interface FlavorOption {
  id: string
  name_en: string
  name_ar: string
  is_active: boolean
  sort_order: number
}

interface FlavorBase {
  id: string
  name_en: string
  name_ar: string
  is_active: boolean
  sort_order: number
  options: FlavorOption[]
}

const EMPTY_BASE = { name_en: '', name_ar: '', is_active: true, sort_order: 0 }
const EMPTY_FLAVOR = { name_en: '', name_ar: '', is_active: true, sort_order: 0 }

export default function AdminFlavorsPage() {
  const { t } = useLanguage()
  const [bases, setBases] = useState<FlavorBase[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Category (base) editing
  const [editingBaseId, setEditingBaseId] = useState<string | 'new' | null>(null)
  const [baseForm, setBaseForm] = useState(EMPTY_BASE)
  const [savingBase, setSavingBase] = useState(false)

  // Individual flavor editing
  const [editingFlavor, setEditingFlavor] = useState<{ baseId: string; flavorId: string | 'new' } | null>(null)
  const [flavorForm, setFlavorForm] = useState(EMPTY_FLAVOR)
  const [savingFlavor, setSavingFlavor] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/flavors', { cache: 'no-store' })
      const json = await res.json()
      setBases(json.data || [])
    } catch {
      toast.error(t('Failed to load flavors', 'فشل تحميل النكهات'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  // ── Category actions ─────────────────────────────────────────────────────────
  const saveBase = async () => {
    if (!baseForm.name_en.trim() || !baseForm.name_ar.trim()) {
      toast.error(t('Both names are required', 'الاسمان مطلوبان'))
      return
    }
    setSavingBase(true)
    try {
      const isNew = editingBaseId === 'new'
      const url = isNew ? '/api/admin/flavors' : `/api/admin/flavors/${editingBaseId}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseForm),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error); return }
      toast.success(isNew ? t('Category added', 'تمت إضافة الفئة') : t('Category updated', 'تم تحديث الفئة'))
      setEditingBaseId(null)
      setBaseForm(EMPTY_BASE)
      load()
    } catch {
      toast.error(t('Save failed', 'فشل الحفظ'))
    } finally {
      setSavingBase(false)
    }
  }

  const deleteBase = async (id: string) => {
    if (!window.confirm(t('Delete this category and all its flavors?', 'حذف هذه الفئة وجميع نكهاتها؟'))) return
    try {
      await fetch(`/api/admin/flavors/${id}`, { method: 'DELETE' })
      setBases(p => p.filter(b => b.id !== id))
      toast.success(t('Category deleted', 'تم حذف الفئة'))
    } catch {
      toast.error(t('Delete failed', 'فشل الحذف'))
    }
  }

  const toggleBase = async (base: FlavorBase) => {
    try {
      await fetch(`/api/admin/flavors/${base.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !base.is_active }),
      })
      setBases(p => p.map(b => b.id === base.id ? { ...b, is_active: !b.is_active } : b))
      toast.success(!base.is_active ? t('Category activated', 'تم التفعيل') : t('Category hidden', 'تم الإخفاء'))
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    }
  }

  // ── Flavor actions ────────────────────────────────────────────────────────────
  const saveFlavor = async () => {
    if (!editingFlavor) return
    if (!flavorForm.name_en.trim() || !flavorForm.name_ar.trim()) {
      toast.error(t('Both names are required', 'الاسمان مطلوبان'))
      return
    }
    setSavingFlavor(true)
    try {
      const isNew = editingFlavor.flavorId === 'new'
      const res = await fetch(`/api/admin/flavors/${editingFlavor.baseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'add_flavor' : 'update_flavor',
          flavor_id: isNew ? undefined : editingFlavor.flavorId,
          ...flavorForm,
        }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error); return }
      toast.success(isNew ? t('Flavor added', 'تمت إضافة النكهة') : t('Flavor updated', 'تم تحديث النكهة'))
      setEditingFlavor(null)
      setFlavorForm(EMPTY_FLAVOR)
      load()
    } catch {
      toast.error(t('Save failed', 'فشل الحفظ'))
    } finally {
      setSavingFlavor(false)
    }
  }

  const deleteFlavor = async (baseId: string, flavorId: string) => {
    if (!window.confirm(t('Delete this flavor?', 'حذف هذه النكهة؟'))) return
    try {
      await fetch(`/api/admin/flavors/${baseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_flavor', flavor_id: flavorId }),
      })
      setBases(p => p.map(b => b.id === baseId ? { ...b, options: b.options.filter(o => o.id !== flavorId) } : b))
      toast.success(t('Flavor deleted', 'تم حذف النكهة'))
    } catch {
      toast.error(t('Delete failed', 'فشل الحذف'))
    }
  }

  const toggleFlavor = async (baseId: string, flavor: FlavorOption) => {
    try {
      await fetch(`/api/admin/flavors/${baseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_flavor', flavor_id: flavor.id, is_active: !flavor.is_active }),
      })
      setBases(p => p.map(b => b.id === baseId
        ? { ...b, options: b.options.map(o => o.id === flavor.id ? { ...o, is_active: !o.is_active } : o) }
        : b
      ))
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    }
  }

  const totalFlavors = bases.reduce((sum, b) => sum + (b.options?.length || 0), 0)
  const activeFlavors = bases.reduce((sum, b) => sum + (b.options?.filter(o => o.is_active)?.length || 0), 0)

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#c8941a]" />
            {t('Flavor Manager', 'إدارة النكهات')}
          </h2>
          <p className="text-white/30 text-xs mt-0.5">
            {bases.length} {t('categories', 'فئة')} · {activeFlavors}/{totalFlavors} {t('flavors active', 'نكهة نشطة')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            aria-label={t('Refresh', 'تحديث')}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setBaseForm({ ...EMPTY_BASE, sort_order: bases.length + 1 }); setEditingBaseId('new') }}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            {t('Add Category', 'إضافة فئة')}
          </button>
        </div>
      </div>

      {/* New / Edit Category Form */}
      {editingBaseId && (
        <div className="mb-6 bg-[#180d04] border border-[#c8941a]/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">
              {editingBaseId === 'new' ? t('New Flavor Category', 'فئة نكهة جديدة') : t('Edit Category', 'تعديل الفئة')}
            </h3>
            <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => { setEditingBaseId(null); setBaseForm(EMPTY_BASE) }} className="text-white/30 hover:text-white/60 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-xs mb-1.5">{t('English Name *', 'الاسم بالإنجليزية *')}</label>
              <input
                value={baseForm.name_en}
                onChange={e => setBaseForm(p => ({ ...p, name_en: e.target.value }))}
                placeholder="e.g. Fruit Flavors"
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Name *', 'الاسم بالعربية *')}</label>
              <input
                value={baseForm.name_ar}
                onChange={e => setBaseForm(p => ({ ...p, name_ar: e.target.value }))}
                dir="rtl"
                placeholder="مثال: نكهات الفواكه"
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              onClick={saveBase}
              disabled={savingBase}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingBase ? t('Saving...', 'جاري...') : t('Save', 'حفظ')}
            </button>
            <button type="button" onClick={() => { setEditingBaseId(null); setBaseForm(EMPTY_BASE) }} className="px-5 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors">
              {t('Cancel', 'إلغاء')}
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-16 border border-[#c8941a]/5" />
          ))}
        </div>
      ) : bases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-16 w-16 rounded-2xl bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-white/40 text-sm">{t('No flavor categories yet', 'لا توجد فئات نكهات بعد')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bases.map((base) => {
            const isExpanded = expandedId === base.id
            const activeCount = base.options?.filter(o => o.is_active).length || 0
            const totalCount = base.options?.length || 0

            return (
              <div
                key={base.id}
                className={`bg-[#180d04] border rounded-2xl overflow-hidden transition-all ${
                  base.is_active ? 'border-[#c8941a]/10' : 'border-white/[0.04] opacity-60'
                }`}
              >
                {/* Category header row */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="h-8 w-8 rounded-xl bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center shrink-0">
                    <Tag className="h-3.5 w-3.5 text-[#c8941a]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white/80 text-sm">{base.name_en}</span>
                      <span className="text-white/20">|</span>
                      <span className="text-sm text-white/50">{base.name_ar}</span>
                      {!base.is_active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                          {t('Hidden', 'مخفي')}
                        </span>
                      )}
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">
                      {activeCount} / {totalCount} {t('flavors active', 'نكهة نشطة')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setFlavorForm({ ...EMPTY_FLAVOR, sort_order: totalCount + 1 })
                        setEditingFlavor({ baseId: base.id, flavorId: 'new' })
                        setExpandedId(base.id)
                      }}
                      aria-label={t('Add flavor', 'إضافة نكهة')}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#c8941a]/10 border border-[#c8941a]/20 text-[#c8941a] text-xs font-medium hover:bg-[#c8941a]/20 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('Add', 'إضافة')}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBase(base)}
                      aria-label={base.is_active ? t('Hide category', 'إخفاء الفئة') : t('Show category', 'إظهار الفئة')}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                    >
                      {base.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBaseForm({ name_en: base.name_en, name_ar: base.name_ar, is_active: base.is_active, sort_order: base.sort_order }); setEditingBaseId(base.id) }}
                      aria-label={t('Edit category', 'تعديل الفئة')}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-[#c8941a] hover:border-[#c8941a]/20 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBase(base.id)}
                      aria-label={t('Delete category', 'حذف الفئة')}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : base.id)}
                      aria-label={isExpanded ? t('Collapse', 'طيّ') : t('Expand', 'توسيع')}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded flavors panel */}
                {isExpanded && (
                  <div className="border-t border-[#c8941a]/10 px-5 py-4 bg-[#0f0900]">

                    {/* Add / Edit flavor form */}
                    {editingFlavor?.baseId === base.id && (
                      <div className="bg-[#180d04] border border-[#c8941a]/20 rounded-xl p-4 mb-4">
                        <p className="text-white/50 text-xs font-semibold mb-3">
                          {editingFlavor.flavorId === 'new' ? t('Add Flavor', 'إضافة نكهة') : t('Edit Flavor', 'تعديل النكهة')}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            value={flavorForm.name_en}
                            onChange={e => setFlavorForm(p => ({ ...p, name_en: e.target.value }))}
                            placeholder={t('English (e.g. Vanilla)', 'الإنجليزية (مثال: Vanilla)')}
                            className="bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                          />
                          <input
                            value={flavorForm.name_ar}
                            onChange={e => setFlavorForm(p => ({ ...p, name_ar: e.target.value }))}
                            dir="rtl"
                            placeholder={t('Arabic (e.g. فانيلا)', 'العربية (مثال: فانيلا)')}
                            className="bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={saveFlavor}
                            disabled={savingFlavor}
                            className="flex items-center gap-1.5 bg-[#c8941a] hover:bg-[#b8840f] text-black px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {savingFlavor ? t('Saving...', 'جاري...') : t('Save', 'حفظ')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingFlavor(null); setFlavorForm(EMPTY_FLAVOR) }}
                            className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-4 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            {t('Cancel', 'إلغاء')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Flavors list */}
                    {(base.options || []).length === 0 ? (
                      <p className="text-white/25 text-xs text-center py-4">
                        {t('No flavors yet — click Add above', 'لا توجد نكهات — اضغط إضافة بالأعلى')}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(base.options || []).map(flavor => (
                          <div
                            key={flavor.id}
                            className={`group flex items-center gap-3 bg-[#180d04] border rounded-xl px-4 py-2.5 transition-all ${
                              flavor.is_active ? 'border-[#c8941a]/10' : 'border-white/[0.04] opacity-50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="font-medium text-white/70">{flavor.name_en}</span>
                                <span className="text-white/20">|</span>
                                <span className="text-white/50">{flavor.name_ar}</span>
                                {!flavor.is_active && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                                    {t('Hidden', 'مخفي')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => toggleFlavor(base.id, flavor)}
                                aria-label={flavor.is_active ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                              >
                                {flavor.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFlavorForm({ name_en: flavor.name_en, name_ar: flavor.name_ar, is_active: flavor.is_active, sort_order: flavor.sort_order })
                                  setEditingFlavor({ baseId: base.id, flavorId: flavor.id })
                                }}
                                aria-label={t('Edit', 'تعديل')}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-[#c8941a]/10 border border-[#c8941a]/20 text-[#c8941a] hover:bg-[#c8941a]/20 transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteFlavor(base.id, flavor.id)}
                                aria-label={t('Delete', 'حذف')}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
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
