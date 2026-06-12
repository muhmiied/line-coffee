'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Eye, EyeOff, FileText, Image as ImageIcon, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Post = {
  id: string
  title_ar: string
  title_en: string
  slug: string
  content_ar: string | null
  content_en: string | null
  excerpt_ar: string | null
  excerpt_en: string | null
  cover_image: string | null
  is_published: boolean
  published_at: string | null
  sort_order: number
  created_at: string
}

type BlogForm = {
  title_ar: string
  title_en: string
  slug: string
  content_ar: string
  content_en: string
  excerpt_ar: string
  excerpt_en: string
  cover_image: string
  is_published: boolean
  sort_order: number
}

const EMPTY: BlogForm = {
  title_ar: '',
  title_en: '',
  slug: '',
  content_ar: '',
  content_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  cover_image: '',
  is_published: false,
  sort_order: 0,
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function BlogPage() {
  const { t, language } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [filtered, setFiltered] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState<BlogForm>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dbError, setDbError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog', { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setPosts(json.data || [])
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

  useEffect(() => {
    const q = search.toLowerCase().trim()
    setFiltered(
      q
        ? posts.filter((post) =>
          post.title_ar.includes(q)
          || post.title_en.toLowerCase().includes(q)
          || (post.excerpt_ar || '').includes(q)
          || (post.excerpt_en || '').toLowerCase().includes(q),
        )
        : posts,
    )
  }, [search, posts])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: posts.length + 1 })
    setShowModal(true)
  }

  const openEdit = (post: Post) => {
    setEditing(post)
    setForm({
      title_ar: post.title_ar,
      title_en: post.title_en,
      slug: post.slug,
      content_ar: post.content_ar || '',
      content_en: post.content_en || '',
      excerpt_ar: post.excerpt_ar || '',
      excerpt_en: post.excerpt_en || '',
      cover_image: post.cover_image || '',
      is_published: post.is_published,
      sort_order: post.sort_order || 0,
    })
    setShowModal(true)
  }

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('Please choose an image file', 'اختر ملف صورة فقط'))
      return
    }

    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('usage_area', 'blog')

      const res = await fetch('/api/admin/media/upload', { method: 'POST', body })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Upload failed')

      setForm((prev) => ({ ...prev, cover_image: json.data.url }))
      toast.success(t('Cover image uploaded', 'تم رفع صورة الغلاف'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Upload failed', 'فشل رفع الصورة'))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.title_ar.trim() || !form.title_en.trim()) {
      toast.error(t('Title in both languages is required', 'العنوان باللغتين مطلوب'))
      return
    }

    const payload = { ...form, slug: form.slug || slugify(form.title_en) }
    if (!payload.slug) {
      toast.error(t('Slug is required', 'الرابط المختصر مطلوب'))
      return
    }

    setSaving(true)
    try {
      const url = editing ? `/api/admin/blog/${editing.id}` : '/api/admin/blog'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      toast.success(editing ? t('Post updated', 'تم تحديث المقال') : t('Post created', 'تم إنشاء المقال'))
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
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setPosts((prev) => prev.filter((post) => post.id !== id))
      toast.success(t('Post deleted', 'تم حذف المقال'))
    } catch {
      toast.error(t('Failed to delete', 'فشل الحذف'))
    }
  }

  const togglePublish = async (post: Post) => {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, is_published: !post.is_published }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setPosts((prev) => prev.map((item) => (item.id === post.id ? json.data : item)))
      toast.success(!post.is_published ? t('Post published', 'تم نشر المقال') : t('Post unpublished', 'تم إلغاء نشر المقال'))
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    }
  }

  const publishedCount = posts.filter((post) => post.is_published).length

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{t('Blog', 'المدونة')}</h2>
          <p className="mt-0.5 text-xs text-white/30">
            {posts.length} {t('posts', 'مقال')} · {publishedCount} {t('published', 'منشور')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} aria-label={t('Refresh', 'تحديث')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/40 transition-all hover:text-white/70">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button type="button" onClick={openAdd}
            className="flex h-9 items-center gap-2 rounded-xl bg-[#c8941a] px-4 text-sm font-semibold text-black transition-all hover:bg-[#b8840f]">
            <Plus className="h-4 w-4" />
            {t('New Post', 'مقال جديد')}
          </button>
        </div>
      </div>

      {dbError && !loading && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-400">{t('Blog schema is not ready', 'جدول المدونة غير جاهز')}</p>
            <p className="mt-1 text-xs text-amber-400/70">
              {t('Run the latest migrations in supabase/migrations in your Supabase SQL Editor, then refresh this page.', 'شغّل أحدث الـ migrations الموجودة في supabase/migrations في Supabase SQL Editor ثم حدّث الصفحة.')}
            </p>
          </div>
        </div>
      )}

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
        <input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder={t('Search posts...', 'بحث في المقالات...')}
          className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] py-2.5 pl-10 pr-4 text-sm text-white/70 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-[#c8941a]/5 bg-[#180d04]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <FileText className="mb-3 h-12 w-12 text-[#c8941a]/20" />
          <p className="text-sm text-white/30">{t('No posts yet', 'لا توجد مقالات بعد')}</p>
          <button type="button" onClick={openAdd} className="mt-4 text-sm text-[#c8941a] transition-opacity hover:opacity-70">
            + {t('Write your first post', 'اكتب أول مقال')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className={`flex overflow-hidden rounded-2xl border bg-[#180d04] ${post.is_published ? 'border-[#c8941a]/10' : 'border-white/[0.04]'}`}>
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title_ar} className="h-auto w-28 shrink-0 object-cover opacity-70" />
              ) : (
                <div className="flex w-28 shrink-0 items-center justify-center bg-white/[0.03]">
                  <ImageIcon className="h-5 w-5 text-white/20" />
                </div>
              )}
              <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${post.is_published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/25'}`}>
                      {post.is_published ? t('Published', 'منشور') : t('Draft', 'مسودة')}
                    </span>
                    <span className="text-[10px] text-white/15">/{post.slug}</span>
                    <span className="text-[10px] text-white/15">#{post.sort_order || 0}</span>
                  </div>
                  <p className="truncate text-sm font-semibold text-white/80">
                    {language === 'ar' ? post.title_ar : post.title_en}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/25">
                    {new Date(post.published_at || post.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" onClick={() => togglePublish(post)} aria-label={post.is_published ? t('Unpublish', 'إلغاء النشر') : t('Publish', 'نشر')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-white/30 transition-all hover:text-white/60">
                    {post.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => openEdit(post)} aria-label={t('Edit', 'تعديل')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c8941a]/15 bg-[#c8941a]/10 text-[#c8941a] transition-all hover:bg-[#c8941a]/20">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => del(post.id)} aria-label={t('Delete', 'حذف')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400/60 transition-all hover:text-red-400">
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
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#c8941a]/20 bg-[#0f0900] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.05] bg-[#0f0900] px-6 py-4">
              <h3 className="text-sm font-bold text-white">{editing ? t('Edit Post', 'تعديل المقال') : t('New Post', 'مقال جديد')}</h3>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setShowModal(false)} className="text-white/30 transition-colors hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Title', 'العنوان بالعربية')} *</label>
                  <input value={form.title_ar} onChange={(event) => setForm((prev) => ({ ...prev, title_ar: event.target.value }))} dir="rtl"
                    placeholder="عنوان المقال بالعربية"
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('English Title', 'العنوان بالإنجليزية')} *</label>
                  <input value={form.title_en} onChange={(event) => setForm((prev) => ({ ...prev, title_en: event.target.value, slug: slugify(event.target.value) }))}
                    placeholder="Post title in English"
                    className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/40">Slug</label>
                    <input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
                      placeholder="post-slug-url"
                      className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 font-mono text-sm text-white/50 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/40">{t('Sort', 'الترتيب')}</label>
                    <input type="number" value={form.sort_order} onChange={(event) => setForm((prev) => ({ ...prev, sort_order: Number(event.target.value) || 0 }))}
                      className="w-full rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/70 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Excerpt', 'الملخص بالعربية')}</label>
                  <textarea value={form.excerpt_ar} onChange={(event) => setForm((prev) => ({ ...prev, excerpt_ar: event.target.value }))} dir="rtl" rows={3}
                    placeholder="ملخص قصير يظهر في قائمة المقالات..."
                    className="w-full resize-none rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('English Excerpt', 'الملخص بالإنجليزية')}</label>
                  <textarea value={form.excerpt_en} onChange={(event) => setForm((prev) => ({ ...prev, excerpt_en: event.target.value }))} rows={3}
                    placeholder="Short summary for the blog list..."
                    className="w-full resize-none rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">{t('Cover Image', 'صورة الغلاف')}</label>
                  <div className="overflow-hidden rounded-2xl border border-[#c8941a]/10 bg-[#180d04]">
                    <div className="flex h-44 items-center justify-center bg-black/20">
                      {form.cover_image ? (
                        <img src={form.cover_image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-white/20" />
                      )}
                    </div>
                    <div className="space-y-3 p-3">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#c8941a]/25 bg-[#c8941a]/5 px-4 py-3 text-sm font-semibold text-[#c8941a] transition-all hover:bg-[#c8941a]/10">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploading ? t('Uploading...', 'جاري الرفع...') : t('Upload cover image', 'رفع صورة الغلاف')}
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) uploadCover(file)
                            event.target.value = ''
                          }} />
                      </label>
                      <input value={form.cover_image} onChange={(event) => setForm((prev) => ({ ...prev, cover_image: event.target.value }))}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-[#c8941a]/10 bg-black/15 px-4 py-2.5 text-sm text-white/70 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
                      <p className="text-[10px] leading-relaxed text-white/25">
                        {t('Upload is preferred. URL remains available as a fallback.', 'الرفع هو الأفضل. رابط الصورة متاح كخيار احتياطي.')}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <div className={`relative h-5 w-9 rounded-full transition-colors ${form.is_published ? 'bg-[#c8941a]' : 'bg-white/10'}`}
                    onClick={() => setForm((prev) => ({ ...prev, is_published: !prev.is_published }))}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-white/50">{t('Publish immediately', 'نشر فوراً')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 px-6 pb-6">
              <div>
                <label className="mb-1.5 block text-xs text-white/40">{t('Arabic Content', 'المحتوى بالعربية')}</label>
                <textarea value={form.content_ar} onChange={(event) => setForm((prev) => ({ ...prev, content_ar: event.target.value }))} dir="rtl" rows={7}
                  placeholder="محتوى المقال بالعربية..."
                  className="w-full resize-none rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/40">{t('English Content', 'المحتوى بالإنجليزية')}</label>
                <textarea value={form.content_en} onChange={(event) => setForm((prev) => ({ ...prev, content_en: event.target.value }))} rows={7}
                  placeholder="Post content in English..."
                  className="w-full resize-none rounded-xl border border-[#c8941a]/10 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 transition-all focus:border-[#c8941a]/30 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/[0.05] px-6 py-4">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-sm text-white/40 transition-colors hover:text-white/60">
                {t('Cancel', 'إلغاء')}
              </button>
              <button type="button" onClick={save} disabled={saving || uploading}
                className="rounded-xl bg-[#c8941a] px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-[#b8840f] disabled:opacity-50">
                {saving ? t('Saving...', 'جاري الحفظ...') : editing ? t('Save Changes', 'حفظ التغييرات') : t('Create Post', 'إنشاء المقال')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
