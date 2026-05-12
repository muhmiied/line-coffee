'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, Plus, Pencil, Trash2, Eye, EyeOff, Save, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

interface Flavor {
  id: string
  name_en: string
  name_ar: string
  is_active: boolean
  sort_order: number
}

const EMPTY: Omit<Flavor, 'id'> = {
  name_en: '',
  name_ar: '',
  is_active: true,
  sort_order: 0,
}

export default function AdminFlavorsPage() {
  const { t } = useLanguage()
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<Omit<Flavor, 'id'>>(EMPTY)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/flavors', { cache: 'no-store' })
      const json = await res.json()
      setFlavors(json.data || [])
    } catch {
      toast.error(t('Failed to load flavors', 'فشل تحميل النكهات'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setForm({ ...EMPTY, sort_order: flavors.length + 1 })
    setEditingId('new')
  }

  const openEdit = (flavor: Flavor) => {
    setForm({ name_en: flavor.name_en, name_ar: flavor.name_ar, is_active: flavor.is_active, sort_order: flavor.sort_order })
    setEditingId(flavor.id)
  }

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim()) {
      toast.error(t('English and Arabic names are required', 'الاسم بالإنجليزية والعربية مطلوب'))
      return
    }
    setSaving(true)
    try {
      const isNew = editingId === 'new'
      const url = isNew ? '/api/admin/flavors' : `/api/admin/flavors/${editingId}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) || 0 }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error || t('Save failed', 'فشل الحفظ')); return }
      toast.success(isNew ? t('Flavor added', 'تمت إضافة النكهة') : t('Flavor updated', 'تم تحديث النكهة'))
      cancelEdit()
      load()
    } catch {
      toast.error(t('Save failed', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (flavor: Flavor) => {
    try {
      await fetch(`/api/admin/flavors/${flavor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !flavor.is_active }),
      })
      setFlavors(prev => prev.map(f => f.id === flavor.id ? { ...f, is_active: !f.is_active } : f))
      toast.success(!flavor.is_active ? t('Flavor activated', 'تم تفعيل النكهة') : t('Flavor hidden', 'تم إخفاء النكهة'))
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    }
  }

  const deleteFlavor = async (id: string) => {
    if (!window.confirm(t('Delete this flavor?', 'حذف هذه النكهة؟'))) return
    try {
      await fetch(`/api/admin/flavors/${id}`, { method: 'DELETE' })
      setFlavors(prev => prev.filter(f => f.id !== id))
      toast.success(t('Flavor deleted', 'تم حذف النكهة'))
    } catch {
      toast.error(t('Delete failed', 'فشل الحذف'))
    }
  }

  const activeCount = flavors.filter(f => f.is_active).length

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#c8941a]" />
            {t('Flavors', 'النكهات')}
          </h2>
          <p className="text-white/30 text-xs mt-0.5">
            {activeCount} {t('active — customers pick up to 3', 'نكهة نشطة — العملاء يختارون حتى 3')}
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
            onClick={openNew}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            {t('Add Flavor', 'إضافة نكهة')}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-5 bg-[#c8941a]/5 border border-[#c8941a]/15 rounded-xl px-4 py-3">
        <p className="text-[#c8941a]/70 text-xs">
          {t(
            'These flavors appear in the "Customize Flavor" section on the store. Customers can choose up to 3 flavors per order.',
            'هذه النكهات تظهر في قسم "كستوم فليفور" في المتجر. العملاء يمكنهم اختيار حتى 3 نكهات لكل طلب.'
          )}
        </p>
      </div>

      {/* Add / Edit Form */}
      {editingId && (
        <div className="mb-6 bg-[#180d04] border border-[#c8941a]/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">
              {editingId === 'new' ? t('Add New Flavor', 'إضافة نكهة جديدة') : t('Edit Flavor', 'تعديل النكهة')}
            </h3>
            <button type="button" onClick={cancelEdit} aria-label={t('Close', 'إغلاق')} className="text-white/30 hover:text-white/60 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-xs mb-1.5">{t('English Name *', 'الاسم بالإنجليزية *')}</label>
              <input
                value={form.name_en}
                onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                placeholder="e.g. Vanilla"
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Name *', 'الاسم بالعربية *')}</label>
              <input
                value={form.name_ar}
                onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                dir="rtl"
                placeholder="مثال: فانيلا"
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5" htmlFor="flavor-sort">{t('Sort Order', 'ترتيب العرض')}</label>
              <input
                id="flavor-sort"
                type="number"
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                min={0}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f0900] border border-[#c8941a]/10 rounded-xl">
              <div>
                <p className="text-white/70 text-sm font-medium">{t('Active', 'نشط')}</p>
                <p className="text-white/25 text-xs mt-0.5">{t('Visible to customers', 'ظاهر للعملاء')}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                aria-label={form.is_active ? t('Deactivate', 'إلغاء التفعيل') : t('Activate', 'تفعيل')}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#c8941a]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? t('Saving...', 'جاري الحفظ...') : t('Save', 'حفظ')}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-5 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              {t('Cancel', 'إلغاء')}
            </button>
          </div>
        </div>
      )}

      {/* Flavors List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#180d04] rounded-xl h-14 border border-[#c8941a]/5" />
          ))}
        </div>
      ) : flavors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-16 w-16 rounded-2xl bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-white/40 text-sm">{t('No flavors yet', 'لا توجد نكهات بعد')}</p>
          <button type="button" onClick={openNew} className="mt-4 text-[#c8941a] text-sm hover:opacity-70 transition-opacity">
            + {t('Add your first flavor', 'أضف أول نكهة')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {flavors.map((flavor) => (
            <div
              key={flavor.id}
              className={`group bg-[#180d04] border rounded-xl px-5 py-3.5 flex items-center gap-4 transition-all ${
                flavor.is_active
                  ? 'border-[#c8941a]/10 hover:border-[#c8941a]/25'
                  : 'border-white/[0.04] opacity-50 hover:opacity-70'
              }`}
            >
              <div className="h-8 w-8 rounded-xl bg-[#0f0900] border border-[#c8941a]/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-[#c8941a]/50" />
              </div>

              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white/80 text-sm">{flavor.name_en}</span>
                <span className="text-white/20">|</span>
                <span className="text-sm text-white/50">{flavor.name_ar}</span>
                {!flavor.is_active && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                    {t('Hidden', 'مخفي')}
                  </span>
                )}
              </div>

              <span className="text-white/20 text-xs font-mono shrink-0">#{flavor.sort_order}</span>

              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => toggleActive(flavor)}
                  aria-label={flavor.is_active ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                >
                  {flavor.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(flavor)}
                  aria-label={t('Edit', 'تعديل')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#c8941a]/10 border border-[#c8941a]/20 text-[#c8941a] hover:bg-[#c8941a]/20 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteFlavor(flavor.id)}
                  aria-label={t('Delete', 'حذف')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
