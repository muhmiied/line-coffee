'use client'

import { useCallback, useEffect, useState } from 'react'
import { Coffee, Plus, Pencil, Trash2, Eye, EyeOff, Save, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

interface CoffeeBean {
  id: string
  name_en: string
  name_ar: string
  origin: string | null
  description_en: string | null
  description_ar: string | null
  is_active: boolean
  sort_order: number
}

const EMPTY: Omit<CoffeeBean, 'id'> = {
  name_en: '',
  name_ar: '',
  origin: '',
  description_en: '',
  description_ar: '',
  is_active: true,
  sort_order: 0,
}

export default function AdminCoffeeBeansPage() {
  const { t } = useLanguage()
  const [beans, setBeans] = useState<CoffeeBean[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<Omit<CoffeeBean, 'id'>>(EMPTY)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coffee-beans', { cache: 'no-store' })
      const json = await res.json()
      setBeans(json.data || [])
    } catch {
      toast.error(t('Failed to load coffee beans', 'فشل تحميل أنواع القهوة'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setForm({ ...EMPTY, sort_order: beans.length + 1 })
    setEditingId('new')
  }

  const openEdit = (bean: CoffeeBean) => {
    setForm({
      name_en: bean.name_en,
      name_ar: bean.name_ar,
      origin: bean.origin || '',
      description_en: bean.description_en || '',
      description_ar: bean.description_ar || '',
      is_active: bean.is_active,
      sort_order: bean.sort_order,
    })
    setEditingId(bean.id)
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
      const url = isNew ? '/api/admin/coffee-beans' : `/api/admin/coffee-beans/${editingId}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) || 0 }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error || t('Save failed', 'فشل الحفظ')); return }
      toast.success(isNew ? t('Bean added', 'تمت الإضافة') : t('Bean updated', 'تم التحديث'))
      cancelEdit()
      load()
    } catch {
      toast.error(t('Save failed', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (bean: CoffeeBean) => {
    try {
      await fetch(`/api/admin/coffee-beans/${bean.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !bean.is_active }),
      })
      setBeans(prev => prev.map(b => b.id === bean.id ? { ...b, is_active: !b.is_active } : b))
      toast.success(!bean.is_active ? t('Activated', 'تم التفعيل') : t('Deactivated', 'تم الإلغاء'))
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    }
  }

  const deleteBean = async (id: string) => {
    if (!window.confirm(t('Delete this bean?', 'حذف هذا النوع؟'))) return
    try {
      await fetch(`/api/admin/coffee-beans/${id}`, { method: 'DELETE' })
      setBeans(prev => prev.filter(b => b.id !== id))
      toast.success(t('Bean deleted', 'تم الحذف'))
    } catch {
      toast.error(t('Delete failed', 'فشل الحذف'))
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Coffee className="h-5 w-5 text-[#c8941a]" />
            {t('Coffee Beans', 'أنواع حبوب القهوة')}
          </h2>
          <p className="text-white/30 text-xs mt-0.5">
            {t('Manage bean types for the Customize Blend section', 'أدر أنواع الحبوب في قسم "اصنع توليفتك"')}
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
            {t('Add Bean', 'إضافة نوع')}
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {editingId && (
        <div className="mb-6 bg-[#180d04] border border-[#c8941a]/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">
              {editingId === 'new' ? t('Add New Bean', 'إضافة نوع جديد') : t('Edit Bean', 'تعديل النوع')}
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
                placeholder="Ethiopian"
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Name *', 'الاسم بالعربية *')}</label>
              <input
                value={form.name_ar}
                onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                dir="rtl"
                placeholder="إثيوبي"
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">{t('Origin (optional)', 'المنشأ (اختياري)')}</label>
              <input
                value={form.origin || ''}
                onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
                placeholder="Ethiopia"
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5" htmlFor="bean-sort">{t('Sort Order', 'ترتيب العرض')}</label>
              <input
                id="bean-sort"
                type="number"
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all"
                min={0}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-white/40 text-xs mb-1.5">{t('Description EN (optional)', 'الوصف بالإنجليزية (اختياري)')}</label>
              <textarea
                value={form.description_en || ''}
                onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))}
                rows={2}
                placeholder="e.g. Fruity, floral notes..."
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-white/40 text-xs mb-1.5">{t('Description AR (optional)', 'الوصف بالعربية (اختياري)')}</label>
              <textarea
                value={form.description_ar || ''}
                onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))}
                dir="rtl"
                rows={2}
                placeholder="مثال: نكهات فاكهية وزهرية..."
                className="w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between p-3 bg-[#0f0900] border border-[#c8941a]/10 rounded-xl">
              <div>
                <p className="text-white/70 text-sm font-medium">{t('Active', 'نشط')}</p>
                <p className="text-white/25 text-xs mt-0.5">{t('Visible in Customize Blend', 'ظاهر في قسم التوليفة')}</p>
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

      {/* Beans List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#180d04] rounded-xl h-16 border border-[#c8941a]/5" />
          ))}
        </div>
      ) : beans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-16 w-16 rounded-2xl bg-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center mb-4">
            <Coffee className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-white/40 text-sm">{t('No coffee beans added yet', 'لا توجد أنواع قهوة بعد')}</p>
          <button type="button" onClick={openNew} className="mt-4 text-[#c8941a] text-sm hover:opacity-70 transition-opacity">
            + {t('Add your first bean', 'أضف أول نوع')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {beans.map((bean) => (
            <div
              key={bean.id}
              className={`group bg-[#180d04] border rounded-xl px-5 py-4 flex items-center gap-4 transition-all ${
                bean.is_active ? 'border-[#c8941a]/10 hover:border-[#c8941a]/25' : 'border-white/[0.04] opacity-50 hover:opacity-70'
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-[#0f0900] border border-[#c8941a]/15 flex items-center justify-center shrink-0">
                <Coffee className="h-4 w-4 text-[#c8941a]/50" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white/80 text-sm">{bean.name_en}</span>
                  <span className="text-white/20">|</span>
                  <span className="text-sm text-white/50">{bean.name_ar}</span>
                  {!bean.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                      {t('Inactive', 'غير نشط')}
                    </span>
                  )}
                </div>
                {bean.origin && (
                  <p className="text-xs text-white/30 mt-0.5">📍 {bean.origin}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => toggleActive(bean)}
                  aria-label={bean.is_active ? t('Deactivate', 'إلغاء') : t('Activate', 'تفعيل')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                >
                  {bean.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(bean)}
                  aria-label={t('Edit', 'تعديل')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#c8941a]/10 border border-[#c8941a]/20 text-[#c8941a] hover:bg-[#c8941a]/20 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteBean(bean.id)}
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
