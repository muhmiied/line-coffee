'use client'

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Check, Crop, Eye, EyeOff, Image as ImageIcon, Link as LinkIcon, Loader2, Pencil, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'
import {
  getMediaImageMeta,
  getMediaObjectPosition,
  getMediaUsageOption,
  isUploadedImageSmall,
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_MAX_UPLOAD_SIZE,
  MEDIA_USAGE_OPTIONS,
  OBJECT_POSITION_OPTIONS,
  type SiteMediaItem,
} from '@/lib/media'

type Banner = SiteMediaItem

type FormState = {
  title_ar: string
  title_en: string
  subtitle_ar: string
  subtitle_en: string
  image_url: string
  link_url: string
  sort_order: number
  is_active: boolean
  media_type: string
  usage_area: string
  alt_ar: string
  alt_en: string
  is_featured: boolean
  object_position: string
  image_width: number
  image_height: number
  storage_path: string
  storage_bucket: string
}

type PendingUpload = {
  file: File
  width: number
  height: number
  previewUrl: string
}

const EMPTY: FormState = {
  title_ar: '',
  title_en: '',
  subtitle_ar: '',
  subtitle_en: '',
  image_url: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
  media_type: 'banner',
  usage_area: 'banner',
  alt_ar: '',
  alt_en: '',
  is_featured: false,
  object_position: 'center center',
  image_width: 0,
  image_height: 0,
  storage_path: '',
  storage_bucket: '',
}

function localText(language: 'en' | 'ar', en?: string | null, ar?: string | null) {
  return language === 'ar' ? ar || en || '' : en || ar || ''
}

function fileIsAllowed(file: File) {
  return MEDIA_ALLOWED_MIME_TYPES.includes(file.type as (typeof MEDIA_ALLOWED_MIME_TYPES)[number])
}

function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number; previewUrl: string }>((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file)
    const image = new window.Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight, previewUrl })
    image.onerror = () => {
      URL.revokeObjectURL(previewUrl)
      reject(new Error('Could not read image dimensions'))
    }
    image.src = previewUrl
  })
}

export default function BannersPage() {
  const { t, language } = useLanguage()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState<FormState>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)
  const [dbError, setDbError] = useState(false)

  const selectedUsage = useMemo(() => getMediaUsageOption(form.usage_area), [form.usage_area])
  const activeCount = banners.filter((banner) => banner.is_active).length

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

  const openAdd = () => {
    setEditing(null)
    setPendingUpload(null)
    setForm({ ...EMPTY, sort_order: banners.length })
    setShowModal(true)
  }

  const openEdit = (banner: Banner) => {
    const meta = getMediaImageMeta(banner)
    setEditing(banner)
    setPendingUpload(null)
    setForm({
      title_ar: banner.title_ar || '',
      title_en: banner.title_en || '',
      subtitle_ar: banner.subtitle_ar || '',
      subtitle_en: banner.subtitle_en || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      sort_order: banner.sort_order,
      is_active: banner.is_active,
      media_type: banner.media_type || getMediaUsageOption(banner.usage_area).mediaType,
      usage_area: banner.usage_area || 'banner',
      alt_ar: banner.alt_ar || '',
      alt_en: banner.alt_en || '',
      is_featured: Boolean(banner.is_featured),
      object_position: getMediaObjectPosition(banner),
      image_width: Number(meta?.width || 0),
      image_height: Number(meta?.height || 0),
      storage_path: String(meta?.path || ''),
      storage_bucket: String(meta?.bucket || ''),
    })
    setShowModal(true)
  }

  const uploadImage = async (upload: PendingUpload) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', upload.file)
      body.append('usage_area', form.usage_area)

      const res = await fetch('/api/admin/media/upload', { method: 'POST', body })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Upload failed')

      setForm((prev) => ({
        ...prev,
        image_url: json.data.url,
        image_width: upload.width,
        image_height: upload.height,
        storage_path: json.data.path,
        storage_bucket: json.data.bucket,
      }))
      setPendingUpload(null)
      toast.success(t('Image uploaded', 'تم رفع الصورة'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Upload failed', 'فشل رفع الصورة'))
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!fileIsAllowed(file)) {
      toast.error(t('Only JPG, PNG, and WebP images are allowed', 'مسموح فقط بصور JPG وPNG وWebP'))
      return
    }

    if (file.size > MEDIA_MAX_UPLOAD_SIZE) {
      toast.error(t('Image is too large. Maximum size is 8MB', 'الصورة كبيرة جدًا. الحد الأقصى 8 ميجابايت'))
      return
    }

    try {
      const dimensions = await readImageDimensions(file)
      const upload = { file, ...dimensions }
      if (isUploadedImageSmall(form.usage_area, dimensions.width, dimensions.height)) {
        setPendingUpload(upload)
        return
      }
      await uploadImage(upload)
    } catch {
      toast.error(t('Could not read image dimensions', 'تعذر قراءة أبعاد الصورة'))
    }
  }

  const changeUsageArea = (usageArea: string) => {
    const usage = getMediaUsageOption(usageArea)
    setForm((prev) => ({
      ...prev,
      usage_area: usage.value,
      media_type: usage.mediaType,
    }))
  }

  const save = async () => {
    if (!form.image_url.trim()) {
      toast.error(t('Upload an image or add an image URL', 'ارفع صورة أو أضف رابط صورة'))
      return
    }

    setSaving(true)
    try {
      const imageMeta = {
        url: form.image_url.trim(),
        width: form.image_width || undefined,
        height: form.image_height || undefined,
        object_position: form.object_position,
        path: form.storage_path || undefined,
        bucket: form.storage_bucket || undefined,
      }

      const payload = {
        title_ar: form.title_ar,
        title_en: form.title_en,
        subtitle_ar: form.subtitle_ar,
        subtitle_en: form.subtitle_en,
        image_url: form.image_url.trim(),
        link_url: form.link_url,
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
        media_type: form.media_type,
        usage_area: form.usage_area,
        alt_ar: form.alt_ar,
        alt_en: form.alt_en,
        is_featured: form.is_featured,
        images: [imageMeta],
      }

      const url = editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to save')

      toast.success(editing ? t('Media updated', 'تم تحديث الوسائط') : t('Media added', 'تمت إضافة الوسائط'))
      setShowModal(false)
      load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to save', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBanners((prev) => prev.filter((banner) => banner.id !== id))
      toast.success(t('Media deleted', 'تم حذف الوسائط'))
    } catch {
      toast.error(t('Failed to delete', 'فشل الحذف'))
    }
  }

  const toggleActive = async (banner: Banner) => {
    const meta = getMediaImageMeta(banner)
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...banner,
          is_active: !banner.is_active,
          images: Array.isArray(banner.images) ? banner.images : [{
            url: banner.image_url,
            object_position: meta?.object_position || 'center center',
          }],
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBanners((prev) => prev.map((item) => item.id === banner.id ? { ...item, is_active: !item.is_active } : item))
      toast.success(!banner.is_active ? t('Media activated', 'تم تفعيل الوسائط') : t('Media deactivated', 'تم تعطيل الوسائط'))
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{t('Media Manager', 'مدير الوسائط')}</h2>
          <p className="mt-0.5 text-xs text-white/30">
            {banners.length} {t('media items', 'عنصر وسائط')} · {activeCount} {t('active', 'نشط')}
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
            onClick={openAdd}
            className="flex h-9 items-center gap-2 rounded-xl bg-[#c8941a] px-4 text-sm font-semibold text-black transition-all hover:bg-[#b8840f]"
          >
            <Plus className="h-4 w-4" />
            {t('Add Media', 'إضافة وسائط')}
          </button>
        </div>
      </div>

      {dbError && !loading && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-400">{t('Database table not found', 'جدول قاعدة البيانات غير موجود')}</p>
            <p className="mt-1 text-xs text-amber-400/70">
              {t('Create or migrate the banners table to enable this feature.', 'أنشئ أو حدّث جدول banners لتفعيل هذه الميزة.')}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-2xl border border-[#c8941a]/5 bg-[#180d04]" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <ImageIcon className="mb-3 h-12 w-12 text-[#c8941a]/20" />
          <p className="text-sm text-white/30">{t('No media yet', 'لا توجد وسائط بعد')}</p>
          <button type="button" onClick={openAdd} className="mt-4 text-sm text-[#c8941a] transition-opacity hover:opacity-70">
            + {t('Add your first media item', 'أضف أول عنصر وسائط')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => {
            const usage = getMediaUsageOption(banner.usage_area)
            const title = localText(language, banner.title_en, banner.title_ar)
            const subtitle = localText(language, banner.subtitle_en, banner.subtitle_ar)

            return (
              <div key={banner.id} className={`group overflow-hidden rounded-2xl border bg-[#180d04] transition-all ${banner.is_active ? 'border-[#c8941a]/10' : 'border-white/[0.04] opacity-60'}`}>
                <div className="relative h-44 bg-[#0a0500]">
                  <img
                    src={banner.image_url}
                    alt={localText(language, banner.alt_en, banner.alt_ar) || title || 'Media'}
                    className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                    style={{ objectPosition: getMediaObjectPosition(banner) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="mb-1 inline-flex rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-[#FFDCC2]/70 backdrop-blur-sm">
                      {localText(language, usage.labelEn, usage.labelAr)}
                    </p>
                    {title && <p className="truncate text-sm font-bold text-white">{title}</p>}
                    {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
                  </div>
                  <div className="absolute right-2 top-2">
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm ${banner.is_active ? 'bg-emerald-500/30 text-emerald-300' : 'bg-black/40 text-white/40'}`}>
                      {banner.is_active ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
                    </span>
                  </div>
                  <div className="absolute left-2 top-2 rounded-lg bg-black/50 px-2 py-0.5 text-[10px] text-white/40 backdrop-blur-sm">
                    #{banner.sort_order}
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  {banner.link_url ? (
                    <p className="mr-2 flex-1 truncate text-[10px] text-white/25">{banner.link_url}</p>
                  ) : (
                    <p className="text-[10px] text-white/15">{t('No link', 'بدون رابط')}</p>
                  )}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => toggleActive(banner)} aria-label={banner.is_active ? t('Deactivate', 'تعطيل') : t('Activate', 'تفعيل')}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-white/30 transition-all hover:text-white/60">
                      {banner.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => openEdit(banner)} aria-label={t('Edit', 'تعديل')}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#c8941a]/15 bg-[#c8941a]/10 text-[#c8941a] transition-all hover:bg-[#c8941a]/20">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => del(banner.id)} aria-label={t('Delete', 'حذف')}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400/60 transition-all hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#c8941a]/20 bg-[#0f0900] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.05] bg-[#0f0900] px-6 py-4">
              <h3 className="text-sm font-bold text-white">{editing ? t('Edit Media', 'تعديل الوسائط') : t('New Media', 'وسائط جديدة')}</h3>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setShowModal(false)} className="text-white/30 transition-colors hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-[#c8941a]/10 bg-[#180d04]/80 p-4">
                <label className="mb-1.5 block text-xs text-white/40">{t('Website section', 'قسم الموقع')}</label>
                <select
                  value={form.usage_area}
                  onChange={(event) => changeUsageArea(event.target.value)}
                  className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 outline-none transition-all focus:border-[#c8941a]/30"
                >
                  {MEDIA_USAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {localText(language, option.labelEn, option.labelAr)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-[#FFDCC2]/45">
                  {localText(language, selectedUsage.recommendationEn, selectedUsage.recommendationAr)}
                </p>
                <div className="mt-2 grid gap-1 text-[11px] text-white/28 sm:grid-cols-2">
                  <span>{t('Hero desktop: minimum 1920x900', 'الهيرو ديسكتوب: الحد الأدنى 1920x900')}</span>
                  <span>{t('Hero mobile: minimum 900x1200 if separate mobile image is supported', 'الهيرو موبايل: الحد الأدنى 900x1200 عند دعم صورة منفصلة')}</span>
                  <span>{t('Product/category cards: minimum 1000x700', 'كروت المنتجات/الفئات: الحد الأدنى 1000x700')}</span>
                  <span>{t('Section banners: minimum 1600x800', 'بانرات الأقسام: الحد الأدنى 1600x800')}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#c8941a]/10 bg-[#180d04]/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white/80">{t('Image upload', 'رفع الصورة')}</p>
                    <p className="text-xs text-white/35">{t('JPG, PNG, or WebP. Max 8MB.', 'JPG أو PNG أو WebP. الحد الأقصى 8MB.')}</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#c8941a] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#b8840f]">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? t('Uploading...', 'جاري الرفع...') : t('Choose image', 'اختر صورة')}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={uploading} />
                  </label>
                </div>

                {pendingUpload && (
                  <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-200">
                          {t('This image is small and may not fill the section properly', 'الصورة صغيرة وقد لا تملأ المساحة بشكل جيد')}
                        </p>
                        <p className="mt-1 text-xs text-amber-200/65">
                          {pendingUpload.width}x{pendingUpload.height} · {localText(language, selectedUsage.recommendationEn, selectedUsage.recommendationAr)}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => uploadImage(pendingUpload)} disabled={uploading}
                            className="rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50">
                            {t('Continue anyway', 'المتابعة رغم ذلك')}
                          </button>
                          <button type="button" onClick={() => setPendingUpload(null)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/55">
                            {t('Cancel / choose another image', 'إلغاء / اختيار صورة أخرى')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(form.image_url || pendingUpload?.previewUrl) && (
                  <div className="overflow-hidden rounded-xl border border-[#c8941a]/10 bg-[#0f0900]">
                    <img
                      src={pendingUpload?.previewUrl || form.image_url}
                      alt="preview"
                      className="h-48 w-full object-cover"
                      style={{ objectPosition: form.object_position }}
                    />
                  </div>
                )}

                <details className="mt-3">
                  <summary className="flex cursor-pointer items-center gap-2 text-xs text-white/35 transition-colors hover:text-white/55">
                    <LinkIcon className="h-3.5 w-3.5" />
                    {t('Advanced: use image URL instead', 'متقدم: استخدم رابط صورة بدلًا من الرفع')}
                  </summary>
                  <input
                    value={form.image_url}
                    onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 outline-none transition-all placeholder:text-white/20 focus:border-[#c8941a]/30"
                  />
                </details>
              </div>

              <div className="rounded-2xl border border-[#c8941a]/10 bg-[#180d04]/80 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Crop className="h-4 w-4 text-[#c8941a]" />
                  {t('Image position / crop', 'موضع الصورة / القص')}
                </div>
                <select
                  value={form.object_position}
                  onChange={(event) => setForm((prev) => ({ ...prev, object_position: event.target.value }))}
                  className="w-full rounded-xl border border-[#c8941a]/10 bg-[#0f0900] px-4 py-2.5 text-sm text-white/80 outline-none transition-all focus:border-[#c8941a]/30"
                >
                  {OBJECT_POSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {localText(language, option.labelEn, option.labelAr)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-white/30">
                  {t('This controls how the image fills each section without distorting it.', 'هذا يتحكم في طريقة ملء الصورة للمساحة بدون تشويه.')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Title', 'العنوان بالعربية')}</label>
                  <input value={form.title_ar} onChange={(event) => setForm((prev) => ({ ...prev, title_ar: event.target.value }))} dir="rtl"
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all placeholder:text-white/20 focus:border-[#c8941a]/30" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('English Title', 'العنوان بالإنجليزية')}</label>
                  <input value={form.title_en} onChange={(event) => setForm((prev) => ({ ...prev, title_en: event.target.value }))}
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all placeholder:text-white/20 focus:border-[#c8941a]/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Subtitle', 'الوصف بالعربية')}</label>
                  <input value={form.subtitle_ar} onChange={(event) => setForm((prev) => ({ ...prev, subtitle_ar: event.target.value }))} dir="rtl"
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all placeholder:text-white/20 focus:border-[#c8941a]/30" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('English Subtitle', 'الوصف بالإنجليزية')}</label>
                  <input value={form.subtitle_en} onChange={(event) => setForm((prev) => ({ ...prev, subtitle_en: event.target.value }))}
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all placeholder:text-white/20 focus:border-[#c8941a]/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Alt Text', 'النص البديل بالعربية')}</label>
                  <input value={form.alt_ar} onChange={(event) => setForm((prev) => ({ ...prev, alt_ar: event.target.value }))} dir="rtl"
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all focus:border-[#c8941a]/30" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('English Alt Text', 'النص البديل بالإنجليزية')}</label>
                  <input value={form.alt_en} onChange={(event) => setForm((prev) => ({ ...prev, alt_en: event.target.value }))}
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all focus:border-[#c8941a]/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Link URL', 'رابط الانتقال')}</label>
                  <input value={form.link_url} onChange={(event) => setForm((prev) => ({ ...prev, link_url: event.target.value }))}
                    placeholder="/products" className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all placeholder:text-white/20 focus:border-[#c8941a]/30" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Sort Order', 'ترتيب العرض')}</label>
                  <input type="number" value={form.sort_order} onChange={(event) => setForm((prev) => ({ ...prev, sort_order: Number(event.target.value) }))}
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 outline-none transition-all focus:border-[#c8941a]/30" min={0} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <label className="flex cursor-pointer items-center gap-3">
                  <span
                    className={`relative h-5 w-9 rounded-full transition-colors ${form.is_active ? 'bg-[#c8941a]' : 'bg-white/10'}`}
                    onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </span>
                  <span className="text-sm text-white/50">{t('Active', 'نشط')}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${form.is_featured ? 'border-[#c8941a] bg-[#c8941a] text-black' : 'border-white/10 bg-white/5 text-transparent'}`}
                    onClick={() => setForm((prev) => ({ ...prev, is_featured: !prev.is_featured }))}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-white/50">{t('Featured', 'مميز')}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/[0.05] px-6 py-4">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-sm text-white/40 transition-colors hover:text-white/60">
                {t('Cancel', 'إلغاء')}
              </button>
              <button type="button" onClick={save} disabled={saving || uploading}
                className="rounded-xl bg-[#c8941a] px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-[#b8840f] disabled:opacity-50">
                {saving ? t('Saving...', 'جاري الحفظ...') : editing ? t('Save Changes', 'حفظ التغييرات') : t('Add Media', 'إضافة وسائط')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
