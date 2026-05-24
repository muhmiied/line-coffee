'use client'

import { useEffect, useState, useCallback } from 'react'
import { BadgeCheck, Star, Eye, EyeOff, Trash2, RefreshCw, Search, MessageSquare, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Review = {
  id: string
  customer_name: string
  content_ar: string | null
  content_en: string | null
  rating: number
  is_visible: boolean
  is_featured: boolean
  is_approved: boolean
  customer_avatar?: string | null
  created_at: string
}

type FilterTab = 'all' | 'pending' | 'visible' | 'hidden'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= rating ? 'text-[#c8941a] fill-[#c8941a]' : 'text-white/15'}`} />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const { t, language } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filtered, setFiltered] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', { cache: 'no-store' })
      const json = await res.json()
      setReviews(json.data || [])
    } catch {
      toast.error(t('Failed to load reviews', 'فشل تحميل المراجعات'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let list = [...reviews]
    if (activeTab === 'pending') list = list.filter(r => r.is_approved === false)
    else if (activeTab === 'visible') list = list.filter(r => r.is_visible && r.is_approved)
    else if (activeTab === 'hidden') list = list.filter(r => !r.is_visible)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.customer_name.toLowerCase().includes(q) ||
        (r.content_ar || '').includes(q) ||
        (r.content_en || '').toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [reviews, search, activeTab])

  const patchReview = async (review: Review, payload: Partial<Pick<Review, 'is_visible' | 'is_featured' | 'is_approved'>>) => {
    setToggling(review.id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, ...payload }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, ...payload } : r))
      if (payload.is_approved !== undefined) {
        toast.success(payload.is_approved ? t('Review approved', 'تم اعتماد المراجعة') : t('Approval removed', 'تم إلغاء الاعتماد'))
      } else if (payload.is_visible !== undefined) {
        toast.success(payload.is_visible ? t('Review shown', 'تم إظهار المراجعة') : t('Review hidden', 'تم إخفاء المراجعة'))
      } else {
        toast.success(t('Review updated', 'تم تحديث المراجعة'))
      }
    } catch {
      toast.error(t('Failed to update', 'فشل التحديث'))
    } finally {
      setToggling(null)
    }
  }

  const del = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setReviews(prev => prev.filter(r => r.id !== id))
      toast.success(t('Review deleted', 'تم حذف المراجعة'))
    } catch {
      toast.error(t('Failed to delete', 'فشل الحذف'))
    } finally {
      setDeleting(null)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'
  const visibleCount = reviews.filter(r => r.is_visible && r.is_approved).length
  const pendingCount = reviews.filter(r => r.is_approved === false).length

  const tabs: { key: FilterTab; labelEn: string; labelAr: string }[] = [
    { key: 'all', labelEn: 'All', labelAr: 'الكل' },
    { key: 'pending', labelEn: 'Pending', labelAr: 'بانتظار الاعتماد' },
    { key: 'visible', labelEn: 'Visible', labelAr: 'ظاهرة' },
    { key: 'hidden', labelEn: 'Hidden', labelAr: 'مخفية' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Reviews', 'المراجعات')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{reviews.length} {t('total reviews', 'مراجعة إجمالاً')}</p>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label={t('Refresh', 'تحديث')}
          className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-[#c8941a] fill-[#c8941a]" />
            <span className="text-white/40 text-xs">{t('Avg Rating', 'متوسط التقييم')}</span>
          </div>
          <p className="text-white font-bold text-2xl">{loading ? '—' : avgRating}</p>
        </div>
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-emerald-400" />
            <span className="text-white/40 text-xs">{t('Visible', 'ظاهرة')}</span>
          </div>
          <p className="text-white font-bold text-2xl">{loading ? '—' : visibleCount}</p>
        </div>
        <div className="bg-[#180d04] border border-amber-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-white/40 text-xs">{t('Pending', 'بانتظار الاعتماد')}</span>
          </div>
          <p className={`font-bold text-2xl ${pendingCount > 0 ? 'text-amber-400' : 'text-white'}`}>
            {loading ? '—' : pendingCount}
          </p>
        </div>
        <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-white/30" />
            <span className="text-white/40 text-xs">{t('Total', 'إجمالي')}</span>
          </div>
          <p className="text-white font-bold text-2xl">{loading ? '—' : reviews.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('Search reviews...', 'بحث في المراجعات...')}
            className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#180d04] border border-[#c8941a]/10 rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#c8941a]/20 text-[#c8941a] border border-[#c8941a]/20'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {t(tab.labelEn, tab.labelAr)}
              {tab.key === 'pending' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-44 border border-[#c8941a]/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <MessageSquare className="h-10 w-10 mb-3 text-white/10" />
          <p className="text-white/30 text-sm">
            {activeTab === 'pending'
              ? t('No pending reviews', 'لا توجد مراجعات بانتظار الاعتماد')
              : t('No reviews found', 'لا توجد مراجعات')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(review => (
            <div
              key={review.id}
              className={`bg-[#180d04] border rounded-2xl p-5 transition-all ${
                review.is_approved === false
                  ? 'border-amber-500/20 bg-amber-500/[0.03]'
                  : review.is_visible
                  ? 'border-[#c8941a]/10'
                  : 'border-white/[0.04] opacity-60'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-white/80 font-semibold text-sm truncate">{review.customer_name}</p>
                  <p className="text-white/25 text-[10px] mt-0.5">
                    {new Date(review.created_at).toLocaleDateString(
                      language === 'ar' ? 'ar-EG' : 'en-US',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Toggle visibility */}
                  <button
                    type="button"
                    onClick={() => patchReview(review, { is_visible: !review.is_visible })}
                    disabled={toggling === review.id}
                    aria-label={review.is_visible ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
                    className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all disabled:opacity-40"
                  >
                    {review.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  {/* Approve / unapprove */}
                  <button
                    type="button"
                    onClick={() => patchReview(review, { is_approved: !review.is_approved })}
                    disabled={toggling === review.id}
                    aria-label={review.is_approved ? t('Unapprove', 'إلغاء الاعتماد') : t('Approve', 'اعتماد')}
                    className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40 ${
                      review.is_approved
                        ? 'bg-emerald-500/12 border-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                    }`}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                  </button>
                  {/* Feature / unfeature */}
                  <button
                    type="button"
                    onClick={() => patchReview(review, { is_featured: !review.is_featured })}
                    disabled={toggling === review.id}
                    aria-label={review.is_featured ? t('Unfeature', 'إلغاء التمييز') : t('Feature', 'تمييز')}
                    className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40 ${
                      review.is_featured
                        ? 'bg-[#c8941a]/15 border-[#c8941a]/25 text-[#c8941a]'
                        : 'bg-white/[0.04] border-white/[0.06] text-white/30 hover:text-white/60'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => del(review.id)}
                    disabled={deleting === review.id}
                    aria-label={t('Delete', 'حذف')}
                    className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Stars */}
              <Stars rating={review.rating} />

              {/* Content */}
              <p className="text-white/50 text-xs leading-relaxed mt-3 line-clamp-3">
                {review.content_ar || review.content_en || '—'}
              </p>

              {/* Status badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {review.is_approved === false ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    <Clock className="h-2.5 w-2.5" />
                    {t('Pending Approval', 'بانتظار الاعتماد')}
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    review.is_visible
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/5 text-white/25 border border-white/10'
                  }`}>
                    {review.is_visible ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                    {review.is_visible ? t('Visible', 'ظاهر') : t('Hidden', 'مخفي')}
                  </span>
                )}
                {review.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#c8941a]/20 bg-[#c8941a]/15 px-2 py-0.5 text-[10px] font-medium text-[#c8941a]">
                    <Star className="h-2.5 w-2.5" />
                    {t('Featured', 'مميز')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
