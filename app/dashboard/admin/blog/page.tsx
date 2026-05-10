'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff, RefreshCw, X, Search, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Post = {
  id: string
  title_ar: string
  title_en: string
  slug: string
  content_ar: string | null
  content_en: string | null
  cover_image: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
}

const EMPTY = {
  title_ar: '', title_en: '', slug: '', content_ar: '', content_en: '', cover_image: '', is_published: false,
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export default function BlogPage() {
  const { t, language } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [filtered, setFiltered] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
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
    const q = search.toLowerCase()
    setFiltered(q ? posts.filter(p => p.title_ar.includes(q) || p.title_en.toLowerCase().includes(q)) : posts)
  }, [search, posts])

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true) }
  const openEdit = (post: Post) => {
    setEditing(post)
    setForm({ title_ar: post.title_ar, title_en: post.title_en, slug: post.slug, content_ar: post.content_ar || '', content_en: post.content_en || '', cover_image: post.cover_image || '', is_published: post.is_published })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.title_ar.trim() || !form.title_en.trim()) {
      toast.error(t('Title in both languages is required', 'العنوان بكلتا اللغتين مطلوب'))
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title_en) }
      const url = editing ? `/api/admin/blog/${editing.id}` : '/api/admin/blog'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(editing ? t('Post updated', 'تم تحديث المقال') : t('Post created', 'تم نشر المقال'))
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
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setPosts(p => p.filter(x => x.id !== id))
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
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p))
      toast.success(!post.is_published ? t('Post published', 'تم نشر المقال') : t('Post unpublished', 'تم إلغاء نشر المقال'))
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    }
  }

  const publishedCount = posts.filter(p => p.is_published).length

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Blog', 'المدونة')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{posts.length} {t('posts', 'مقال')} · {publishedCount} {t('published', 'منشور')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} aria-label={t('Refresh', 'تحديث')}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button type="button" onClick={openAdd}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all">
            <Plus className="h-4 w-4" />
            {t('New Post', 'مقال جديد')}
          </button>
        </div>
      </div>

      {dbError && !loading && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-5">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold text-sm">{t('Database table not found', 'جدول قاعدة البيانات غير موجود')}</p>
            <p className="text-amber-400/70 text-xs mt-1">
              {t('Create a "blog_posts" table in Supabase to enable this feature.', 'أنشئ جدول "blog_posts" في Supabase لتفعيل هذه الميزة.')}
            </p>
          </div>
        </div>
      )}

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('Search posts...', 'بحث في المقالات...')}
          className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-24 border border-[#c8941a]/5" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <FileText className="h-12 w-12 mb-3 text-[#c8941a]/20" />
          <p className="text-white/30 text-sm">{t('No posts yet', 'لا توجد مقالات بعد')}</p>
          <button type="button" onClick={openAdd} className="mt-4 text-[#c8941a] text-sm hover:opacity-70 transition-opacity">
            + {t('Write your first post', 'اكتب أول مقال')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div key={post.id} className={`bg-[#180d04] border rounded-2xl overflow-hidden flex ${post.is_published ? 'border-[#c8941a]/10' : 'border-white/[0.04]'}`}>
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title_ar} className="w-28 h-full object-cover shrink-0 opacity-70" />
              )}
              <div className="flex-1 px-5 py-4 flex items-center gap-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${post.is_published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/25'}`}>
                      {post.is_published ? t('Published', 'منشور') : t('Draft', 'مسودة')}
                    </span>
                    <span className="text-white/15 text-[10px]">/{post.slug}</span>
                  </div>
                  <p className="text-white/80 font-semibold text-sm truncate">
                    {language === 'ar' ? post.title_ar : post.title_en}
                  </p>
                  <p className="text-white/25 text-[10px] mt-0.5">
                    {new Date(post.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => togglePublish(post)} aria-label={post.is_published ? t('Unpublish', 'إلغاء النشر') : t('Publish', 'نشر')}
                    className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all">
                    {post.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => openEdit(post)} aria-label={t('Edit', 'تعديل')}
                    className="h-8 w-8 rounded-lg bg-[#c8941a]/10 border border-[#c8941a]/15 flex items-center justify-center text-[#c8941a] hover:bg-[#c8941a]/20 transition-all">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => del(post.id)} aria-label={t('Delete', 'حذف')}
                    className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all">
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
              <h3 className="text-white font-bold text-sm">{editing ? t('Edit Post', 'تعديل المقال') : t('New Post', 'مقال جديد')}</h3>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Title', 'العنوان بالعربية')} *</label>
                <input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} dir="rtl"
                  placeholder="عنوان المقال بالعربية"
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('English Title', 'العنوان بالإنجليزية')} *</label>
                <input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="Post title in English"
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Slug</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="post-slug-url"
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/50 font-mono placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Cover Image URL', 'رابط صورة الغلاف')}</label>
                <input value={form.cover_image} onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Content', 'المحتوى بالعربية')}</label>
                <textarea value={form.content_ar} onChange={e => setForm(p => ({ ...p, content_ar: e.target.value }))} dir="rtl" rows={4}
                  placeholder="محتوى المقال بالعربية..."
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('English Content', 'المحتوى بالإنجليزية')}</label>
                <textarea value={form.content_en} onChange={e => setForm(p => ({ ...p, content_en: e.target.value }))} rows={4}
                  placeholder="Post content in English..."
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative h-5 w-9 rounded-full transition-colors ${form.is_published ? 'bg-[#c8941a]' : 'bg-white/10'}`}
                  onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-white/50 text-sm">{t('Publish immediately', 'نشر فوراً')}</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors">
                {t('Cancel', 'إلغاء')}
              </button>
              <button type="button" onClick={save} disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all disabled:opacity-50">
                {saving ? t('Saving...', 'جارٍ الحفظ...') : editing ? t('Save Changes', 'حفظ التغييرات') : t('Create Post', 'نشر المقال')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
