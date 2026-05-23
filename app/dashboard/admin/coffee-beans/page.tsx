'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Coffee, Plus, Pencil, Eye, EyeOff, Save, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type BeanFamily = 'arabica' | 'robusta'

interface CoffeeBean {
  id: string
  name_en: string
  name_ar: string
  origin: string | null
  description_en: string | null
  description_ar: string | null
  is_active: boolean
  sort_order: number
  family: BeanFamily | 'other' | null
  price: number | null
}

interface CoffeeBeanForm {
  name_en: string
  name_ar: string
  origin: string
  description_en: string
  description_ar: string
  is_active: boolean
  sort_order: number
  family: BeanFamily
  price: number
}

const EMPTY: CoffeeBeanForm = {
  name_en: '',
  name_ar: '',
  origin: '',
  description_en: '',
  description_ar: '',
  is_active: true,
  sort_order: 0,
  family: 'arabica',
  price: 0,
}

function normalizeFamily(family: CoffeeBean['family']): BeanFamily {
  return family === 'robusta' ? 'robusta' : 'arabica'
}

export default function AdminCoffeeBeansPage() {
  const { t } = useLanguage()
  const [beans, setBeans] = useState<CoffeeBean[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<CoffeeBeanForm>({ ...EMPTY })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coffee-beans', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load coffee beans')
      }
      setBeans(Array.isArray(json.data) ? json.data : [])
    } catch {
      toast.error(t('Failed to load coffee beans', 'فشل تحميل حبوب القهوة'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const sortedBeans = useMemo(
    () => [...beans].sort((a, b) => {
      const orderDiff = Number(a.sort_order || 0) - Number(b.sort_order || 0)
      return orderDiff || a.name_en.localeCompare(b.name_en)
    }),
    [beans],
  )

  const groupedBeans = useMemo(() => ({
    arabica: sortedBeans.filter((bean) => normalizeFamily(bean.family) === 'arabica'),
    robusta: sortedBeans.filter((bean) => normalizeFamily(bean.family) === 'robusta'),
  }), [sortedBeans])

  const formatPrice = (price: number | null) => (
    `${Number(price || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${t('EGP/kg', 'ج/كجم')}`
  )

  const openNew = (family: BeanFamily = 'arabica') => {
    setForm({ ...EMPTY, family, sort_order: beans.length + 1 })
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
      sort_order: Number(bean.sort_order || 0),
      family: normalizeFamily(bean.family),
      price: Number(bean.price || 0),
    })
    setEditingId(bean.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ ...EMPTY })
  }

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim()) {
      toast.error(t('English and Arabic names are required', 'الاسم بالإنجليزية والعربية مطلوب'))
      return
    }

    if (!Number.isFinite(form.price) || form.price <= 0) {
      toast.error(t('Price per kg must be greater than zero', 'سعر الكيلو يجب أن يكون أكبر من صفر'))
      return
    }

    setSaving(true)
    try {
      const isNew = editingId === 'new'
      const url = isNew ? '/api/admin/coffee-beans' : `/api/admin/coffee-beans/${editingId}`
      const payload = {
        name_en: form.name_en.trim(),
        name_ar: form.name_ar.trim(),
        origin: form.origin.trim() || null,
        description_en: form.description_en.trim() || null,
        description_ar: form.description_ar.trim() || null,
        family: form.family,
        price: Number(form.price),
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
      }

      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || t('Save failed', 'فشل الحفظ'))
        return
      }

      toast.success(isNew ? t('Bean added', 'تمت الإضافة') : t('Bean updated', 'تم التحديث'))
      cancelEdit()
      await load()
    } catch {
      toast.error(t('Save failed', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (bean: CoffeeBean) => {
    try {
      const res = await fetch(`/api/admin/coffee-beans/${bean.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !bean.is_active }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Update failed')
      }

      setBeans(prev => prev.map(b => b.id === bean.id ? { ...b, is_active: !b.is_active } : b))
      toast.success(!bean.is_active ? t('Activated', 'تم التفعيل') : t('Deactivated', 'تم الإيقاف'))
    } catch {
      toast.error(t('Update failed', 'فشل التحديث'))
    }
  }

  const renderBeanSection = (
    family: BeanFamily,
    titleEn: string,
    titleAr: string,
    descriptionEn: string,
    descriptionAr: string,
    items: CoffeeBean[],
  ) => {
    const activeCount = items.filter((bean) => bean.is_active).length

    return (
      <section className="rounded-2xl border border-[#c8941a]/10 bg-[#180d04] p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-2xl font-bold text-white">
                {t(titleEn, titleAr)}
              </h3>
              <span className="rounded-full border border-[#c8941a]/20 bg-[#c8941a]/10 px-3 py-1 text-xs font-semibold text-[#e0ad72]">
                {activeCount} {t('active', 'نشط')} / {items.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/40">
              {t(descriptionEn, descriptionAr)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openNew(family)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#c8941a] px-4 text-sm font-semibold text-black transition-all hover:bg-[#b8840f]"
          >
            <Plus className="h-4 w-4" />
            {t('Add Bean', 'إضافة حبة')}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-white/[0.05] bg-[#0f0900] px-4 py-8 text-center text-sm text-white/35">
            {t('No beans in this family yet', 'لا توجد حبوب في هذه المجموعة بعد')}
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {items.map((bean) => (
              <article
                key={bean.id}
                className={`group rounded-xl border bg-[#0f0900] p-4 transition-all ${
                  bean.is_active
                    ? 'border-[#c8941a]/15 hover:border-[#c8941a]/35'
                    : 'border-white/[0.05] opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c8941a]/15 bg-[#c8941a]/5">
                    <Coffee className="h-4 w-4 text-[#c8941a]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-white/85">{bean.name_en}</h4>
                      <span className="text-white/20">|</span>
                      <span className="text-sm text-white/55">{bean.name_ar}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        bean.is_active
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : 'bg-white/5 text-white/35'
                      }`}>
                        {bean.is_active ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-white/45 sm:grid-cols-3">
                      <div>
                        <span className="block text-white/25">{t('Origin', 'المنشأ')}</span>
                        <span className="text-white/65">{bean.origin || t('Not set', 'غير محدد')}</span>
                      </div>
                      <div>
                        <span className="block text-white/25">{t('Price', 'السعر')}</span>
                        <span className="font-semibold text-[#e0ad72]">{formatPrice(bean.price)}</span>
                      </div>
                      <div>
                        <span className="block text-white/25">{t('Sort', 'الترتيب')}</span>
                        <span className="text-white/65">{Number(bean.sort_order || 0)}</span>
                      </div>
                    </div>

                    {(bean.description_en || bean.description_ar) && (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/35">
                        {t(bean.description_en || '', bean.description_ar || bean.description_en || '')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => toggleActive(bean)}
                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 text-xs text-white/45 transition-colors hover:text-white/75"
                  >
                    {bean.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {bean.is_active ? t('Disable', 'إيقاف') : t('Enable', 'تفعيل')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(bean)}
                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#c8941a]/20 bg-[#c8941a]/10 px-3 text-xs font-semibold text-[#c8941a] transition-colors hover:bg-[#c8941a]/20"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t('Edit', 'تعديل')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Coffee className="h-5 w-5 text-[#c8941a]" />
            {t('Make Your Espresso Blend Beans', 'حبوب توليفة الإسبريسو')}
          </h2>
          <p className="mt-0.5 text-xs text-white/35">
            {t('Manage beans for the Make Your Espresso Blend section', 'إدارة حبوب توليفة الإسبريسو')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            aria-label={t('Refresh', 'تحديث')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/40 transition-all hover:text-white/70"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openNew('arabica')}
            className="flex h-9 items-center gap-2 rounded-xl bg-[#c8941a] px-4 text-sm font-semibold text-black transition-all hover:bg-[#b8840f]"
          >
            <Plus className="h-4 w-4" />
            {t('Add Bean', 'إضافة حبة')}
          </button>
        </div>
      </div>

      {editingId && (
        <div className="mb-6 rounded-2xl border border-[#c8941a]/20 bg-[#180d04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {editingId === 'new' ? t('Add New Bean', 'إضافة حبة جديدة') : t('Edit Bean', 'تعديل الحبة')}
            </h3>
            <button type="button" onClick={cancelEdit} aria-label={t('Close', 'إغلاق')} className="text-white/30 transition-colors hover:text-white/60">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{t('English Name *', 'الاسم بالإنجليزية *')}</label>
              <input
                value={form.name_en}
                onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                placeholder="Ethiopian"
                className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Name *', 'الاسم بالعربية *')}</label>
              <input
                value={form.name_ar}
                onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                dir="rtl"
                placeholder="إثيوبي"
                className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{t('Family *', 'العائلة *')}</label>
              <select
                value={form.family}
                onChange={e => setForm(p => ({ ...p, family: e.target.value === 'robusta' ? 'robusta' : 'arabica' }))}
                className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              >
                <option value="arabica">{t('Arabica', 'أرابيكا')}</option>
                <option value="robusta">{t('Robusta', 'روبوستا')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{t('Price per kg *', 'سعر الكيلو *')}</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{t('Origin', 'المنشأ')}</label>
              <input
                value={form.origin}
                onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
                placeholder="Ethiopia"
                className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{t('Sort Order', 'ترتيب العرض')}</label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs text-white/40">{t('Description EN', 'الوصف بالإنجليزية')}</label>
              <textarea
                value={form.description_en}
                onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))}
                rows={2}
                placeholder="Balanced espresso bean with warm notes..."
                className="w-full resize-none rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs text-white/40">{t('Description AR', 'الوصف بالعربية')}</label>
              <textarea
                value={form.description_ar}
                onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))}
                dir="rtl"
                rows={2}
                placeholder="حبة مناسبة لتوليفات الإسبريسو..."
                className="w-full resize-none rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#c8941a]/10 bg-[#0f0900] p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium text-white/70">{t('Active', 'نشط')}</p>
                <p className="mt-0.5 text-xs text-white/25">
                  {t('Visible in Make Your Espresso Blend', 'ظاهر في اصنع توليفة الإسبريسو الخاصة بك')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                aria-label={form.is_active ? t('Deactivate', 'إلغاء التفعيل') : t('Activate', 'تفعيل')}
                className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-[#c8941a]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#c8941a] px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-[#b8840f] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? t('Saving...', 'جاري الحفظ...') : t('Save', 'حفظ')}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl px-5 py-2 text-sm text-white/40 transition-colors hover:text-white/60"
            >
              {t('Cancel', 'إلغاء')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-[#c8941a]/5 bg-[#180d04]" />
          ))}
        </div>
      ) : beans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c8941a]/20 bg-[#c8941a]/10">
            <Coffee className="h-7 w-7 text-[#c8941a]" />
          </div>
          <p className="text-sm text-white/40">{t('No coffee beans added yet', 'لا توجد حبوب قهوة بعد')}</p>
          <button type="button" onClick={() => openNew('arabica')} className="mt-4 text-sm text-[#c8941a] transition-opacity hover:opacity-70">
            + {t('Add your first bean', 'أضف أول حبة')}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {renderBeanSection(
            'arabica',
            'Arabica',
            'أرابيكا',
            'Smooth, aromatic beans for refined espresso blends.',
            'حبوب ناعمة وعطرية لتوليفات إسبريسو متوازنة.',
            groupedBeans.arabica,
          )}
          {renderBeanSection(
            'robusta',
            'Robusta',
            'روبوستا',
            'Bold beans for crema, body, and stronger espresso character.',
            'حبوب قوية للكريما والقوام والطابع الأقوى للإسبريسو.',
            groupedBeans.robusta,
          )}
        </div>
      )}
    </div>
  )
}
