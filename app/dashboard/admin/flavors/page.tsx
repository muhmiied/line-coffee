'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Sparkles, Plus, Pencil, Eye, EyeOff, Save, X, ChevronDown, ChevronUp, RefreshCw, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type FlavorOptionType = 'standard' | 'chunks'

interface FlavorOption {
  id: string
  base_id?: string
  name_en: string
  name_ar: string
  price_delta: number | null
  option_type: FlavorOptionType | string | null
  is_active: boolean
  stock_quantity: number
  low_stock_threshold: number
  is_manually_out_of_stock: boolean
  sort_order: number
}

interface FlavorBase {
  id: string
  name_en: string
  name_ar: string
  price: number | null
  type: string | null
  is_active: boolean
  sort_order: number
  options: FlavorOption[]
}

interface FlavorForm {
  name_en: string
  name_ar: string
  is_active: boolean
  sort_order: number
  price_delta: number
  option_type: FlavorOptionType
  stock_quantity: number
  low_stock_threshold: number
  is_manually_out_of_stock: boolean
}

const EMPTY_FLAVOR: FlavorForm = {
  name_en: '',
  name_ar: '',
  is_active: true,
  sort_order: 0,
  price_delta: 50,
  option_type: 'standard',
  stock_quantity: 100,
  low_stock_threshold: 10,
  is_manually_out_of_stock: false,
}

const FLAVOR_GROUPS = [
  { key: 'original', nameEn: 'Original LINE', nameAr: 'الأساسي', min: 1, max: 1 },
  { key: 'sweets', nameEn: 'sweets LINE', nameAr: 'حلويات', min: 2, max: 8 },
  { key: 'nuts', nameEn: 'Nuts', nameAr: 'مكسرات', min: 9, max: 12 },
  { key: 'fruits', nameEn: 'Fruits', nameAr: 'فواكه', min: 13, max: 24 },
  { key: 'special', nameEn: 'Special Order', nameAr: 'سيبشيل أوردر', min: 25, max: 30 },
  { key: 'extra', nameEn: 'Extra', nameAr: 'إضافي', min: 31, max: Number.POSITIVE_INFINITY },
]

function normalizeOptionType(value: unknown): FlavorOptionType {
  return value === 'chunks' ? 'chunks' : 'standard'
}

function getFlavorGroup(sortOrder: number) {
  return FLAVOR_GROUPS.find((group) => sortOrder >= group.min && sortOrder <= group.max) || FLAVOR_GROUPS[5]
}

function getStockState(option: FlavorOption) {
  if (option.is_manually_out_of_stock || Number(option.stock_quantity || 0) <= 0) return 'out'
  if (Number(option.stock_quantity || 0) <= Number(option.low_stock_threshold ?? 10)) return 'low'
  return 'available'
}

export default function AdminFlavorsPage() {
  const { t } = useLanguage()
  const [bases, setBases] = useState<FlavorBase[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingFlavor, setEditingFlavor] = useState<{ baseId: string; flavorId: string | 'new' } | null>(null)
  const [flavorForm, setFlavorForm] = useState<FlavorForm>({ ...EMPTY_FLAVOR })
  const [savingFlavor, setSavingFlavor] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/flavors', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load flavors')
      }
      const nextBases = Array.isArray(json.data) ? json.data : []
      setBases(nextBases)
      setExpandedId((current) => current || nextBases[0]?.id || null)
    } catch {
      toast.error(t('Failed to load flavors', 'فشل تحميل النكهات'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const totalFlavors = bases.reduce((sum, base) => sum + (base.options?.length || 0), 0)
  const activeFlavors = bases.reduce((sum, base) => sum + (base.options?.filter(option => option.is_active)?.length || 0), 0)

  const groupedByBase = useMemo(() => {
    return bases.reduce<Record<string, Array<{ group: typeof FLAVOR_GROUPS[number]; options: FlavorOption[] }>>>((acc, base) => {
      acc[base.id] = FLAVOR_GROUPS
        .map((group) => ({
          group,
          options: [...(base.options || [])]
            .filter((option) => {
              const sortOrder = Number(option.sort_order || 0)
              return getFlavorGroup(sortOrder).key === group.key
            })
            .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)),
        }))
        .filter((entry) => entry.options.length > 0 || entry.group.key !== 'extra')
      return acc
    }, {})
  }, [bases])

  const openNewFlavor = (base: FlavorBase) => {
    setFlavorForm({
      ...EMPTY_FLAVOR,
      sort_order: (base.options?.length || 0) + 1,
    })
    setEditingFlavor({ baseId: base.id, flavorId: 'new' })
    setExpandedId(base.id)
  }

  const openEditFlavor = (baseId: string, flavor: FlavorOption) => {
    setFlavorForm({
      name_en: flavor.name_en,
      name_ar: flavor.name_ar,
      is_active: flavor.is_active,
      sort_order: Number(flavor.sort_order || 0),
      price_delta: Number(flavor.price_delta || (normalizeOptionType(flavor.option_type) === 'chunks' ? 70 : 50)),
      option_type: normalizeOptionType(flavor.option_type),
      stock_quantity: Number(flavor.stock_quantity ?? 100),
      low_stock_threshold: Number(flavor.low_stock_threshold ?? 10),
      is_manually_out_of_stock: flavor.is_manually_out_of_stock === true,
    })
    setEditingFlavor({ baseId, flavorId: flavor.id })
    setExpandedId(baseId)
  }

  const closeFlavorForm = () => {
    setEditingFlavor(null)
    setFlavorForm({ ...EMPTY_FLAVOR })
  }

  const saveFlavor = async () => {
    if (!editingFlavor) return

    if (!flavorForm.name_en.trim() || !flavorForm.name_ar.trim()) {
      toast.error(t('English and Arabic names are required', 'الاسم بالإنجليزية والعربية مطلوب'))
      return
    }

    if (!Number.isFinite(flavorForm.price_delta) || flavorForm.price_delta < 0) {
      toast.error(t('Price delta must be zero or greater', 'إضافة السعر يجب أن تكون صفر أو أكثر'))
      return
    }

    setSavingFlavor(true)
    try {
      const isNew = editingFlavor.flavorId === 'new'
      const payload = {
        action: isNew ? 'add_flavor' : 'update_flavor',
        flavor_id: isNew ? undefined : editingFlavor.flavorId,
        name_en: flavorForm.name_en.trim(),
        name_ar: flavorForm.name_ar.trim(),
        price_delta: Number(flavorForm.price_delta),
        option_type: flavorForm.option_type,
        is_active: flavorForm.is_active,
        stock_quantity: Math.max(0, Math.floor(Number(flavorForm.stock_quantity) || 0)),
        low_stock_threshold: Math.max(0, Math.floor(Number(flavorForm.low_stock_threshold) || 0)),
        is_manually_out_of_stock: flavorForm.is_manually_out_of_stock,
        sort_order: Number(flavorForm.sort_order) || 0,
      }

      const res = await fetch(`/api/admin/flavors/${editingFlavor.baseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || t('Save failed', 'فشل الحفظ'))
        return
      }

      toast.success(isNew ? t('Flavor added', 'تمت إضافة النكهة') : t('Flavor updated', 'تم تحديث النكهة'))
      closeFlavorForm()
      await load()
    } catch {
      toast.error(t('Save failed', 'فشل الحفظ'))
    } finally {
      setSavingFlavor(false)
    }
  }

  const toggleBase = async (base: FlavorBase) => {
    try {
      const res = await fetch(`/api/admin/flavors/${base.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !base.is_active }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed')

      setBases(prev => prev.map(item => item.id === base.id ? { ...item, is_active: !item.is_active } : item))
      toast.success(!base.is_active ? t('Base activated', 'تم تفعيل القاعدة') : t('Base hidden', 'تم إخفاء القاعدة'))
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    }
  }

  const toggleFlavor = async (baseId: string, flavor: FlavorOption) => {
    try {
      const res = await fetch(`/api/admin/flavors/${baseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_flavor', flavor_id: flavor.id, is_active: !flavor.is_active }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed')

      setBases(prev => prev.map(base => base.id === baseId
        ? { ...base, options: base.options.map(option => option.id === flavor.id ? { ...option, is_active: !option.is_active } : option) }
        : base
      ))
      toast.success(!flavor.is_active ? t('Flavor activated', 'تم تفعيل النكهة') : t('Flavor hidden', 'تم إخفاء النكهة'))
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles className="h-5 w-5 text-[#c8941a]" />
            {t('Flavor Manager', 'إدارة نكهات التخصيص')}
          </h2>
          <p className="mt-0.5 text-xs text-white/35">
            {t('Manage flavors for Customize Flavor', 'إدارة نكهات التخصيص')} · {bases.length}/4 {t('bases', 'قواعد')} · {activeFlavors}/{totalFlavors} {t('flavors active', 'نكهة نشطة')}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label={t('Refresh', 'تحديث')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/40 transition-all hover:text-white/70"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-[#c8941a]/5 bg-[#180d04]" />
          ))}
        </div>
      ) : bases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c8941a]/20 bg-[#c8941a]/10">
            <Sparkles className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-sm text-white/40">{t('No Customize Flavor bases found', 'لا توجد قواعد تخصيص النكهات')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bases.map((base) => {
            const isExpanded = expandedId === base.id
            const activeCount = base.options?.filter(option => option.is_active).length || 0
            const totalCount = base.options?.length || 0

            return (
              <section
                key={base.id}
                className={`overflow-hidden rounded-2xl border bg-[#180d04] transition-all ${
                  base.is_active ? 'border-[#c8941a]/10' : 'border-white/[0.04] opacity-65'
                }`}
              >
                <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#c8941a]/20 bg-[#c8941a]/10">
                      <Tag className="h-3.5 w-3.5 text-[#c8941a]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white/85">{base.name_en}</h3>
                        <span className="text-white/20">|</span>
                        <span className="text-sm text-white/55">{base.name_ar}</span>
                        {!base.is_active && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/35">
                            {t('Hidden', 'مخفي')}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-white/30">
                        {activeCount} / {totalCount} {t('flavors active', 'نكهة نشطة')} · {Number(base.price || 0).toLocaleString('en-US')} {t('EGP/kg base', 'ج/كجم للقاعدة')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openNewFlavor(base)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#c8941a]/20 bg-[#c8941a]/10 px-3 text-xs font-medium text-[#c8941a] transition-colors hover:bg-[#c8941a]/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('Add Flavor', 'إضافة نكهة')}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBase(base)}
                      aria-label={base.is_active ? t('Hide base', 'إخفاء القاعدة') : t('Show base', 'إظهار القاعدة')}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 text-xs text-white/40 transition-colors hover:text-white/70"
                    >
                      {base.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {base.is_active ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : base.id)}
                      aria-label={isExpanded ? t('Collapse', 'طي') : t('Expand', 'توسيع')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-white/35 transition-colors hover:text-white/65"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#c8941a]/10 bg-[#0f0900] px-5 py-4">
                    {editingFlavor?.baseId === base.id && (
                      <div className="mb-5 rounded-xl border border-[#c8941a]/20 bg-[#180d04] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold text-white/55">
                            {editingFlavor.flavorId === 'new' ? t('Add Flavor', 'إضافة نكهة') : t('Edit Flavor', 'تعديل النكهة')}
                          </p>
                          <button type="button" onClick={closeFlavorForm} className="text-white/30 transition-colors hover:text-white/60">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs text-white/40">{t('English Name *', 'الاسم بالإنجليزية *')}</label>
                            <input
                              value={flavorForm.name_en}
                              onChange={e => setFlavorForm(prev => ({ ...prev, name_en: e.target.value }))}
                              placeholder="Chocolate"
                              className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Name *', 'الاسم بالعربية *')}</label>
                            <input
                              value={flavorForm.name_ar}
                              onChange={e => setFlavorForm(prev => ({ ...prev, name_ar: e.target.value }))}
                              dir="rtl"
                              placeholder="شوكولاتة"
                              className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-white/40">{t('Option Type', 'نوع الإضافة')}</label>
                            <select
                              value={flavorForm.option_type}
                              onChange={e => {
                                const optionType = normalizeOptionType(e.target.value)
                                setFlavorForm(prev => ({
                                  ...prev,
                                  option_type: optionType,
                                  price_delta: optionType === 'chunks' ? 70 : 50,
                                }))
                              }}
                              className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
                            >
                              <option value="standard">{t('Standard', 'عادية')}</option>
                              <option value="chunks">{t('Chunks', 'قطع')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-white/40">{t('Price Delta', 'إضافة السعر')}</label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={flavorForm.price_delta}
                              onChange={e => setFlavorForm(prev => ({ ...prev, price_delta: Number(e.target.value) }))}
                              className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-white/40">{t('Sort Order', 'ترتيب العرض')}</label>
                            <input
                              type="number"
                              min={0}
                              value={flavorForm.sort_order}
                              onChange={e => setFlavorForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                              className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
                            />
                            <p className="mt-1 text-[11px] text-white/25">
                              {t('Groups are derived from sort order.', 'المجموعات تُحدد من ترتيب العرض.')}
                            </p>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-white/40">{t('Stock Quantity', 'كمية المخزون')}</label>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={flavorForm.stock_quantity}
                              onChange={e => setFlavorForm(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                              className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-white/40">{t('Low Stock Threshold', 'حد المخزون المنخفض')}</label>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={flavorForm.low_stock_threshold}
                              onChange={e => setFlavorForm(prev => ({ ...prev, low_stock_threshold: Number(e.target.value) }))}
                              className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-red-500/15 bg-red-500/5 px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-red-200">{t('Force out of stock', 'إيقاف المخزون يدوياً')}</p>
                              <p className="text-xs text-red-200/45">{t('Hide from customers even if active.', 'إخفاء من العملاء حتى لو نشطة.')}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFlavorForm(prev => ({ ...prev, is_manually_out_of_stock: !prev.is_manually_out_of_stock }))}
                              className={`relative h-6 w-11 rounded-full transition-colors ${flavorForm.is_manually_out_of_stock ? 'bg-red-600' : 'bg-white/10'}`}
                            >
                              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${flavorForm.is_manually_out_of_stock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-white/70">{t('Active', 'نشط')}</p>
                              <p className="text-xs text-white/25">{t('Visible to customers', 'ظاهر للعملاء')}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFlavorForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                              className={`relative h-6 w-11 rounded-full transition-colors ${flavorForm.is_active ? 'bg-[#c8941a]' : 'bg-white/10'}`}
                            >
                              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${flavorForm.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={saveFlavor}
                            disabled={savingFlavor}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8941a] px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#b8840f] disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {savingFlavor ? t('Saving...', 'جاري...') : t('Save', 'حفظ')}
                          </button>
                          <button
                            type="button"
                            onClick={closeFlavorForm}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 text-xs text-white/45 transition-colors hover:text-white/70"
                          >
                            <X className="h-3.5 w-3.5" />
                            {t('Cancel', 'إلغاء')}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-5">
                      {(groupedByBase[base.id] || []).map(({ group, options }) => (
                        <div key={group.key}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h4 className="font-serif text-lg font-bold text-white/85">
                              {t(group.nameEn, group.nameAr)}
                            </h4>
                            <span className="rounded-full border border-[#c8941a]/15 bg-[#c8941a]/8 px-2.5 py-1 text-[11px] text-[#e0ad72]">
                              {options.filter(option => option.is_active).length}/{options.length}
                            </span>
                          </div>
                          <div className="grid gap-2 lg:grid-cols-2">
                            {options.map((flavor) => {
                              const stockState = getStockState(flavor)

                              return (
                              <article
                                key={flavor.id}
                                className={`group rounded-xl border bg-[#180d04] px-4 py-3 transition-all ${
                                  flavor.is_active ? 'border-[#c8941a]/10' : 'border-white/[0.04] opacity-55'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#c8941a]/15 bg-[#c8941a]/5 text-xs font-bold text-[#c8941a]">
                                    {Number(flavor.sort_order || 0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-white/75">{flavor.name_en}</p>
                                      <span className="text-white/20">|</span>
                                      <p className="text-sm text-white/50">{flavor.name_ar}</p>
                                      {!flavor.is_active && (
                                        <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30">
                                          {t('Hidden', 'مخفي')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/38">
                                      <span className="rounded-full bg-white/[0.04] px-2 py-0.5">
                                        {normalizeOptionType(flavor.option_type) === 'chunks' ? t('Chunks', 'قطع') : t('Standard', 'عادية')}
                                      </span>
                                      <span className="rounded-full bg-white/[0.04] px-2 py-0.5">
                                        +{Number(flavor.price_delta || 0)} {t('EGP/kg', 'ج/كجم')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/38">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                                    stockState === 'out'
                                      ? 'bg-red-500/10 text-red-300'
                                      : stockState === 'low'
                                        ? 'bg-amber-500/10 text-amber-300'
                                        : 'bg-emerald-500/10 text-emerald-300'
                                  }`}>
                                    {stockState !== 'available' && <AlertTriangle className="h-3 w-3" />}
                                    {stockState === 'out' ? t('Sold out', 'غير متاح') : stockState === 'low' ? t('Low stock', 'مخزون منخفض') : t('In stock', 'متاح')}
                                  </span>
                                  <span className="rounded-full bg-white/[0.04] px-2 py-0.5">
                                    {t('Stock', 'المخزون')}: {Number(flavor.stock_quantity || 0)} / {Number(flavor.low_stock_threshold ?? 10)}
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 sm:justify-end">
                                  <button
                                    type="button"
                                    onClick={() => toggleFlavor(base.id, flavor)}
                                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 text-xs text-white/40 transition-colors hover:text-white/70"
                                  >
                                    {flavor.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {flavor.is_active ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditFlavor(base.id, flavor)}
                                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#c8941a]/20 bg-[#c8941a]/10 px-2.5 text-xs font-semibold text-[#c8941a] transition-colors hover:bg-[#c8941a]/20"
                                  >
                                    <Pencil className="h-3 w-3" />
                                    {t('Edit', 'تعديل')}
                                  </button>
                                </div>
                              </article>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
