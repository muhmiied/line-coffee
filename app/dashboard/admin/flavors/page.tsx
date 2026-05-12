'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plus, Pencil, Trash2, Eye, EyeOff, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
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
const EMPTY_OPTION = { name_en: '', name_ar: '', is_active: true, sort_order: 0 }

export default function AdminFlavorsPage() {
  const { t } = useLanguage()
  const [bases, setBases] = useState<FlavorBase[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Base form state
  const [editingBaseId, setEditingBaseId] = useState<string | 'new' | null>(null)
  const [baseForm, setBaseForm] = useState(EMPTY_BASE)
  const [savingBase, setSavingBase] = useState(false)

  // Option form state
  const [editingOption, setEditingOption] = useState<{ baseId: string; optionId: string | 'new' } | null>(null)
  const [optionForm, setOptionForm] = useState(EMPTY_OPTION)
  const [savingOption, setSavingOption] = useState(false)

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

  // ── Base actions ──────────────────────────────────────────────
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
      toast.success(isNew ? t('Base added', 'تمت الإضافة') : t('Base updated', 'تم التحديث'))
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
    if (!window.confirm(t('Delete this flavor base and all its options?', 'حذف هذه القاعدة وجميع نكهاتها؟'))) return
    await fetch(`/api/admin/flavors/${id}`, { method: 'DELETE' })
    setBases(p => p.filter(b => b.id !== id))
    toast.success(t('Deleted', 'تم الحذف'))
  }

  const toggleBase = async (base: FlavorBase) => {
    await fetch(`/api/admin/flavors/${base.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !base.is_active }),
    })
    setBases(p => p.map(b => b.id === base.id ? { ...b, is_active: !b.is_active } : b))
  }

  // ── Option actions ────────────────────────────────────────────
  const saveOption = async () => {
    if (!editingOption) return
    if (!optionForm.name_en.trim() || !optionForm.name_ar.trim()) {
      toast.error(t('Both names are required', 'الاسمان مطلوبان'))
      return
    }
    setSavingOption(true)
    try {
      const isNew = editingOption.optionId === 'new'
      const action = isNew ? 'add_option' : 'update_option'
      const res = await fetch(`/api/admin/flavors/${editingOption.baseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          option_id: isNew ? undefined : editingOption.optionId,
          ...optionForm,
        }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error); return }
      toast.success(isNew ? t('Option added', 'تمت الإضافة') : t('Option updated', 'تم التحديث'))
      setEditingOption(null)
      setOptionForm(EMPTY_OPTION)
      load()
    } catch {
      toast.error(t('Save failed', 'فشل الحفظ'))
    } finally {
      setSavingOption(false)
    }
  }

  const deleteOption = async (baseId: string, optionId: string) => {
    if (!window.confirm(t('Delete this option?', 'حذف هذه النكهة؟'))) return
    await fetch(`/api/admin/flavors/${baseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_option', option_id: optionId }),
    })
    setBases(p =>
      p.map(b =>
        b.id === baseId ? { ...b, options: b.options.filter(o => o.id !== optionId) } : b
      )
    )
    toast.success(t('Option deleted', 'تم حذف النكهة'))
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a0a00] flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#522500]" />
            {t('Flavor System', 'نظام النكهات')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'Manage flavor bases (e.g. Cappuccino) and their options (e.g. Vanilla)',
              'أدر القواعد (مثل كابتشينو) ونكهاتها (مثل فانيلا)'
            )}
          </p>
        </div>
        <button
          onClick={() => { setBaseForm(EMPTY_BASE); setEditingBaseId('new') }}
          className="flex items-center gap-2 bg-[#522500] text-[#FFDCC2] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#3d1b00] transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('Add Base', 'إضافة قاعدة')}
        </button>
      </div>

      {/* New / Edit Base Form */}
      {editingBaseId && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e8ddd5] rounded-2xl p-5"
        >
          <h2 className="font-semibold text-[#1a0a00] mb-4">
            {editingBaseId === 'new'
              ? t('Add Flavor Base', 'إضافة قاعدة نكهة')
              : t('Edit Flavor Base', 'تعديل قاعدة نكهة')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                {t('English Name *', 'الاسم بالإنجليزية *')}
              </label>
              <input
                value={baseForm.name_en}
                onChange={e => setBaseForm(p => ({ ...p, name_en: e.target.value }))}
                placeholder="Cappuccino"
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                {t('Arabic Name *', 'الاسم بالعربية *')}
              </label>
              <input
                value={baseForm.name_ar}
                onChange={e => setBaseForm(p => ({ ...p, name_ar: e.target.value }))}
                dir="rtl"
                placeholder="كابتشينو"
                className="w-full border border-[#e8ddd5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="base_active"
                checked={baseForm.is_active}
                onChange={e => setBaseForm(p => ({ ...p, is_active: e.target.checked }))}
                className="h-4 w-4 accent-[#522500]"
              />
              <label htmlFor="base_active" className="text-sm text-gray-700">
                {t('Active', 'نشط')}
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={saveBase}
              disabled={savingBase}
              className="flex items-center gap-2 bg-[#522500] text-[#FFDCC2] px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#3d1b00] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingBase ? t('Saving...', 'جاري...') : t('Save', 'حفظ')}
            </button>
            <button
              onClick={() => { setEditingBaseId(null); setBaseForm(EMPTY_BASE) }}
              className="flex items-center gap-2 border border-[#e8ddd5] px-5 py-2 rounded-xl text-sm text-gray-600 hover:bg-[#faf7f4]"
            >
              <X className="h-4 w-4" /> {t('Cancel', 'إلغاء')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Bases List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-[#522500] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bases.length === 0 ? (
        <div className="bg-white border border-[#e8ddd5] rounded-2xl py-16 text-center">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">{t('No flavor bases yet', 'لا توجد قواعد نكهات')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bases.map((base, i) => (
            <motion.div
              key={base.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-[#e8ddd5] rounded-2xl overflow-hidden"
            >
              {/* Base row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1a0a00] text-sm">{base.name_en}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-600">{base.name_ar}</span>
                    {!base.is_active && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                        {t('Inactive', 'غير نشط')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {base.options?.length || 0} {t('options', 'نكهة')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setOptionForm(EMPTY_OPTION); setEditingOption({ baseId: base.id, optionId: 'new' }); setExpandedId(base.id) }}
                    title={t('Add option', 'إضافة نكهة')}
                    className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-[#e8ddd5] text-[#522500] text-xs font-medium hover:bg-[#faf7f4] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('Add', 'إضافة')}
                  </button>
                  <button onClick={() => toggleBase(base)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e8ddd5] text-gray-400 hover:text-[#522500] hover:border-[#522500]/40 transition-colors">
                    {base.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => { setBaseForm({ name_en: base.name_en, name_ar: base.name_ar, is_active: base.is_active, sort_order: base.sort_order }); setEditingBaseId(base.id) }}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e8ddd5] text-gray-400 hover:text-[#522500] hover:border-[#522500]/40 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteBase(base.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:text-red-600 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === base.id ? null : base.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e8ddd5] text-gray-400 hover:text-[#522500] transition-colors"
                  >
                    {expandedId === base.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Options Panel */}
              {expandedId === base.id && (
                <div className="border-t border-[#f0e8e0] px-5 py-4 bg-[#faf7f4]">
                  {/* Add option form */}
                  {editingOption?.baseId === base.id && (
                    <div className="bg-white border border-[#e8ddd5] rounded-xl p-4 mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-3">
                        {editingOption.optionId === 'new'
                          ? t('Add Flavor Option', 'إضافة نكهة')
                          : t('Edit Flavor Option', 'تعديل نكهة')}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          value={optionForm.name_en}
                          onChange={e => setOptionForm(p => ({ ...p, name_en: e.target.value }))}
                          placeholder={t('English (e.g. Vanilla)', 'الإنجليزية (مثال: Vanilla)')}
                          className="border border-[#e8ddd5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
                        />
                        <input
                          value={optionForm.name_ar}
                          onChange={e => setOptionForm(p => ({ ...p, name_ar: e.target.value }))}
                          dir="rtl"
                          placeholder={t('Arabic (e.g. فانيلا)', 'العربية (مثال: فانيلا)')}
                          className="border border-[#e8ddd5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#522500]/30"
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={saveOption}
                          disabled={savingOption}
                          className="flex items-center gap-1.5 bg-[#522500] text-[#FFDCC2] px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3d1b00] disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingOption ? t('Saving...', 'جاري...') : t('Save', 'حفظ')}
                        </button>
                        <button
                          onClick={() => { setEditingOption(null); setOptionForm(EMPTY_OPTION) }}
                          className="flex items-center gap-1.5 border border-[#e8ddd5] px-4 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-[#faf7f4]"
                        >
                          <X className="h-3.5 w-3.5" /> {t('Cancel', 'إلغاء')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Options list */}
                  {(base.options || []).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">
                      {t('No options yet — add one above', 'لا توجد نكهات — أضف واحدة أعلاه')}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(base.options || []).map(option => (
                        <div
                          key={option.id}
                          className="flex items-center gap-3 bg-white border border-[#e8ddd5] rounded-lg px-4 py-2.5"
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                            <span className="font-medium text-[#1a0a00]">{option.name_en}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600">{option.name_ar}</span>
                            {!option.is_active && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                                {t('Inactive', 'غير نشط')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setOptionForm({ name_en: option.name_en, name_ar: option.name_ar, is_active: option.is_active, sort_order: option.sort_order })
                                setEditingOption({ baseId: base.id, optionId: option.id })
                              }}
                              className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#e8ddd5] text-gray-400 hover:text-[#522500] hover:border-[#522500]/40 transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteOption(base.id, option.id)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:text-red-600 hover:border-red-300 transition-colors"
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
