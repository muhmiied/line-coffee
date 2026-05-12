'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Coffee, Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react'
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

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim()) {
      toast.error(t('English and Arabic names are required', 'الاسم بالإنجليزية والعربية مطلوب'))
      return
    }
    setSaving(true)
    try {
      const isNew = editingId === 'new'
      const url = isNew ? '/api/admin/coffee-beans' : `/api/admin/coffee-beans/${editingId}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sort_order: Number(form.sort_order) || 0,
        }),
      })
      const json = await res.json()

      if (!json.success) {
        toast.error(json.error || t('Save failed', 'فشل الحفظ'))
        return
      }

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
      setBeans(prev =>
        prev.map(b => (b.id === bean.id ? { ...b, is_active: !b.is_active } : b))
      )
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
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a0a00] flex items-center gap-2">
            <Coffee className="h-6 w-6 text-[#522500]" />
            {t('Coffee Beans', 'أنواع حبوب القهوة')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'Manage bean types available in the Customize Blend section',
              'أدر أنواع الحبوب المتاحة في قسم "اصنع توليفتك"'
            )}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#522500] text-[#FFDCC2] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#3d1b00] transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('Add Bean', 'إضافة نوع')}
        </button>
      </div>

      {/* Form */}
      {editingId && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e8ddd5] rounded-2xl p-6"
        >
          <h2 className="font-semibold text-[#1a0a00] mb-4">
            {editingId === 'new'
              ? t('Add New Bean', 'إضافة نوع جديد')
              : t('Edit Bean', 'تعديل النوع')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('English Name *', 'الاسم بالإنجليزية *')}
              </label>
              <input
                value={form.name_en}
                onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
                placeholder="Ethiopian"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('Arabic Name *', 'الاسم بالعربية *')}
              </label>
              <input
                value={form.name_ar}
                onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                dir="rtl"
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
                placeholder="إثيوبي"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('Origin (optional)', 'المنشأ (اختياري)')}
              </label>
              <input
                value={form.origin || ''}
                onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
                placeholder="Ethiopia"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('Sort Order', 'ترتيب العرض')}
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('Description EN (optional)', 'الوصف بالإنجليزية (اختياري)')}
              </label>
              <textarea
                value={form.description_en || ''}
                onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))}
                rows={2}
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('Description AR (optional)', 'الوصف بالعربية (اختياري)')}
              </label>
              <textarea
                value={form.description_ar || ''}
                onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))}
                dir="rtl"
                rows={2}
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30 resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="h-4 w-4 accent-[#522500]"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                {t('Active (visible to customers)', 'نشط (ظاهر للعملاء)')}
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#522500] text-[#FFDCC2] px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#3d1b00] disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? t('Saving...', 'جاري الحفظ...') : t('Save', 'حفظ')}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 border border-[#e8ddd5] px-5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#faf7f4] transition-colors"
            >
              <X className="h-4 w-4" />
              {t('Cancel', 'إلغاء')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Beans List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-[#522500] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : beans.length === 0 ? (
        <div className="bg-white border border-[#e8ddd5] rounded-2xl py-16 text-center">
          <Coffee className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">
            {t('No coffee beans added yet', 'لا توجد أنواع قهوة بعد')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {beans.map((bean, i) => (
            <motion.div
              key={bean.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4 ${
                bean.is_active ? 'border-[#e8ddd5]' : 'border-gray-200 opacity-60'
              }`}
            >
              <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1a0a00] text-sm">{bean.name_en}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600">{bean.name_ar}</span>
                  {!bean.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      {t('Inactive', 'غير نشط')}
                    </span>
                  )}
                </div>
                {bean.origin && (
                  <p className="text-xs text-gray-400 mt-0.5">📍 {bean.origin}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(bean)}
                  title={bean.is_active ? t('Deactivate', 'إلغاء التفعيل') : t('Activate', 'تفعيل')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e8ddd5] text-gray-400 hover:text-[#522500] hover:border-[#522500]/40 transition-colors"
                >
                  {bean.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => openEdit(bean)}
                  title={t('Edit', 'تعديل')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e8ddd5] text-gray-400 hover:text-[#522500] hover:border-[#522500]/40 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteBean(bean.id)}
                  title={t('Delete', 'حذف')}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:text-red-600 hover:border-red-300 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
