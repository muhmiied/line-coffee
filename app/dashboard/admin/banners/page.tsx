'use client'

import { useEffect, useState, useCallback } from 'react'
import { Image as ImageIcon, Plus, Pencil, Trash2, Eye, EyeOff, RefreshCw, X, AlertCircle, MoveUp, MoveDown } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Banner = {
  id: string
  title_ar: string | null
  title_en: string | null
  subtitle_ar: string | null
  subtitle_en: string | null
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

const EMPTY = {
  title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '',
  image_url: '', link_url: '', sort_order: 0, is_active: true,
}

export default function BannersPage() {
  const { t, language } = useLanguage()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [dbError, setDbError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners', { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setBanners(json.data || [])
        setDbError(false)
      } else {
        setDbError(true)
      }
    } catch {
      setDbError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, sort_order: banners.length }); setShowModal(true) }
  const openEdit = (b: Banner) => {
    setEditing(b)
    setForm({ title_ar: b.title_ar || '', title_en: b.title_en || '', subtitle_ar: b.subtitle_ar || '', subtitle_en: b.subtitle_en || '', image_url: b.image_url, link_url: b.link_url || '', sort_order: b.sort_order, is_active: b.is_active })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.image_url.trim()) {
      toast.error(t('Image URL is required', 'رابط الصورة مطلوب'))
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(editing ? t('Banner updated', 'تم تحديث البانر') : t('Banner added', 'تمت إضافة البانر'))
      setShowModal(false)
      load()
    } catch (e: unknown) {
      toast.error((e as Error).message || t('Failed to save', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBanners(p => p.filter(b => b.id !== id))
      toast.success(t('Banner deleted', 'تم حذف البانر'))
    } catch {
      toast.error(t('Failed to delete', 'فشل الحذف'))
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, is_active: !banner.is_active }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      toast.success(!banner.is_active ? t('Banner activated', 'تم تفعيل البانر') : t('Banner deactivated', 'تم تعطيل البانر'))
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    }
  }

  const activeCount = banners.filter(b => b.is_active).length

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Media Manager', 'مدير الوسائط')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{banners.length} {t('media items', 'عنصر وسائط')} · {activeCount} {t('active', 'نشط')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} aria-label={t('Refresh', 'تحديث')}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button type="button" onClick={openAdd}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all">
            <Plus className="h-4 w-4" />
            {t('Add Media', 'إضافة وسائط')}
          </button>
        </div>
      </div>

      {dbError && !loading && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-5">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold text-sm">{t('Database table not found', 'جدول قاعدة البيانات غير موجود')}</p>
            <p className="text-amber-400/70 text-xs mt-1">
              {t('Create a "banners" table in Supabase to enable this feature.', 'أنشئ جدول "banners" في Supabase لتفعيل هذه الميزة.')}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-52 border border-[#c8941a]/5" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <ImageIcon className="h-12 w-12 mb-3 text-[#c8941a]/20" />
          <p className="text-white/30 text-sm">{t('No media yet', 'لا توجد وسائط بعد')}</p>
          <button type="button" onClick={openAdd} className="mt-4 text-[#c8941a] text-sm hover:opacity-70 transition-opacity">
            + {t('Add your first media item', 'أضف أول عنصر وسائط')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(banner => (
            <div key={banner.id} className={`group bg-[#180d04] border rounded-2xl overflow-hidden transition-all ${banner.is_active ? 'border-[#c8941a]/10' : 'border-white/[0.04] opacity-60'}`}>
              <div className="relative h-40 bg-[#0a0500]">
                <img src={banner.image_url} alt={banner.title_ar || banner.title_en || 'Banner'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  {(banner.title_ar || banner.title_en) && (
                    <p className="text-white font-bold text-sm truncate">{language === 'ar' ? banner.title_ar : banner.title_en}</p>
                  )}
                  {(banner.subtitle_ar || banner.subtitle_en) && (
                    <p className="text-white/60 text-xs truncate">{language === 'ar' ? banner.subtitle_ar : banner.subtitle_en}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium backdrop-blur-sm ${banner.is_active ? 'bg-emerald-500/30 text-emerald-300' : 'bg-black/40 text-white/40'}`}>
                    {banner.is_active ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
                  </span>
                </div>
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-0.5 text-[10px] text-white/40">
                  #{banner.sort_order}
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                {banner.link_url ? (
                  <p className="text-white/25 text-[10px] truncate flex-1 mr-2">{banner.link_url}</p>
                ) : (
                  <p className="text-white/15 text-[10px]">{t('No link', 'بدون رابط')}</p>
                )}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => toggleActive(banner)} aria-label={banner.is_active ? t('Deactivate', 'تعطيل') : t('Activate', 'تفعيل')}
                    className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all">
                    {banner.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => openEdit(banner)} aria-label={t('Edit', 'تعديل')}
                    className="h-7 w-7 rounded-lg bg-[#c8941a]/10 border border-[#c8941a]/15 flex items-center justify-center text-[#c8941a] hover:bg-[#c8941a]/20 transition-all">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => del(banner.id)} aria-label={t('Delete', 'حذف')}
                    className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0f0900] border border-[#c8941a]/20 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] sticky top-0 bg-[#0f0900] z-10">
              <h3 className="text-white font-bold text-sm">{editing ? t('Edit Banner', 'تعديل البانر') : t('New Banner', 'بانر جديد')}</h3>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Image URL', 'رابط الصورة')} *</label>
                <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..." className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl opacity-70" />}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Title', 'العنوان بالعربية')}</label>
                  <input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} dir="rtl"
                    placeholder="العنوان" className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('English Title', 'العنوان بالإنجليزية')}</label>
                  <input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))}
                    placeholder="Title" className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Subtitle', 'الوصف بالعربية')}</label>
                  <input value={form.subtitle_ar} onChange={e => setForm(p => ({ ...p, subtitle_ar: e.target.value }))} dir="rtl"
                    placeholder="وصف قصير" className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('English Subtitle', 'الوصف بالإنجليزية')}</label>
                  <input value={form.subtitle_en} onChange={e => setForm(p => ({ ...p, subtitle_en: e.target.value }))}
                    placeholder="Short description" className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Link URL', 'رابط الانتقال')}</label>
                  <input value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))}
                    placeholder="/products" className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
                </div>
                <div>
                  <label htmlFor="banner-sort" className="block text-white/40 text-xs mb-1.5">{t('Sort Order', 'ترتيب العرض')}</label>
                  <input id="banner-sort" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all" min={0} />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative h-5 w-9 rounded-full transition-colors ${form.is_active ? 'bg-[#c8941a]' : 'bg-white/10'}`}
                  onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-white/50 text-sm">{t('Active', 'نشط')}</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors">
                {t('Cancel', 'إلغاء')}
              </button>
              <button type="button" onClick={save} disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all disabled:opacity-50">
                {saving ? t('Saving...', 'جارٍ الحفظ...') : editing ? t('Save Changes', 'حفظ التغييرات') : t('Add Media', 'إضافة وسائط')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
