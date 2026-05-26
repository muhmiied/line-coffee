'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

function StarSelector({
  value,
  onChange,
  dir,
}: {
  value: number
  onChange: (v: number) => void
  dir: 'ltr' | 'rtl'
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className={cn('flex gap-2', dir === 'rtl' && 'flex-row-reverse')} dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${i} star${i !== 1 ? 's' : ''}`}
          className="transition-transform hover:scale-110 active:scale-90"
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors',
              i <= active ? 'fill-[#D6A373] text-[#D6A373]' : 'text-[#B6885E]/30',
            )}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const { t, dir } = useLanguage()
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [contentEn, setContentEn] = useState('')
  const [contentAr, setContentAr] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isRtl = dir === 'rtl'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !contentEn.trim()) return

    setFormState('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          rating,
          content_en: contentEn.trim(),
          content_ar: contentAr.trim() || null,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed')
      setFormState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('Something went wrong', 'حدث خطأ ما'))
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-[#0B0806] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#D6A373]/30 bg-[#D6A373]/10">
            <CheckCircle className="h-8 w-8 text-[#D6A373]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#F5E6D8] mb-3">
            {t('Thank You', 'شكراً لك')}
          </h2>
          <p className="text-[#F5E6D8]/55 text-sm leading-relaxed mb-8">
            {t(
              'Your review has been submitted and is pending approval. We appreciate you sharing your experience.',
              'تم إرسال مراجعتك وهي بانتظار الاعتماد. نقدر لك مشاركة تجربتك.',
            )}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#D6A373]/30 bg-[#D6A373]/10 px-6 py-2.5 text-sm font-semibold text-[#D6A373] transition-all hover:bg-[#D6A373]/20"
          >
            {t('Back to Home', 'العودة للرئيسية')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0806] py-14 md:py-28">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />

      <div className="container relative mx-auto max-w-xl px-4">

        {/* Back link */}
        <Link
          href="/"
          className={cn(
            'mb-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B6885E]/60 transition-colors hover:text-[#D6A373]',
            isRtl && 'flex-row-reverse',
          )}
        >
          <ArrowLeft className={cn('h-3.5 w-3.5', isRtl && 'rotate-180')} />
          {t('Back', 'رجوع')}
        </Link>

        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]">
            {t('Share Your Experience', 'شارك تجربتك')}
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight text-[#F5E6D8] md:text-4xl">
            {t('Write a Review', 'اكتب مراجعتك')}
          </h1>
          <p className="mt-3 text-sm text-[#F5E6D8]/45 leading-relaxed">
            {t(
              'Your feedback helps us refine every roast, package, and delivery.',
              'مراجعتك تساعدنا على تحسين كل تحميصة وتغليف وتجربة توصيل.',
            )}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-[#B6885E]/14 bg-[#120D09]/80 p-7 md:p-9 space-y-7"
          dir={dir}
        >
          {/* Name */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D6A373]/80">
              {t('Your Name', 'اسمك')}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              placeholder={t('Ahmed Al-Rashid', 'أحمد الراشد')}
              className="w-full rounded-xl border border-[#B6885E]/18 bg-[#0B0806]/60 px-4 py-3 text-sm text-[#F5E6D8] placeholder-[#F5E6D8]/20 outline-none transition-all focus:border-[#D6A373]/50 focus:ring-1 focus:ring-[#D6A373]/20"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D6A373]/80">
              {t('Your Rating', 'تقييمك')}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <StarSelector value={rating} onChange={setRating} dir={dir} />
            <p className="mt-2 text-[10px] text-[#F5E6D8]/30">
              {rating === 5
                ? t('Excellent', 'ممتاز')
                : rating === 4
                ? t('Very Good', 'جيد جداً')
                : rating === 3
                ? t('Good', 'جيد')
                : rating === 2
                ? t('Fair', 'مقبول')
                : t('Poor', 'ضعيف')}
            </p>
          </div>

          {/* Comment (EN) */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D6A373]/80">
              {t('Your Review', 'مراجعتك')}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              maxLength={1000}
              required
              rows={4}
              placeholder={t(
                'Tell us about the aroma, taste, delivery, or anything we can improve...',
                'اكتب لنا عن الرائحة أو الطعم أو التوصيل أو أي تفصيلة يمكننا تحسينها...',
              )}
              className="w-full resize-none rounded-xl border border-[#B6885E]/18 bg-[#0B0806]/60 px-4 py-3 text-sm text-[#F5E6D8] placeholder-[#F5E6D8]/20 outline-none transition-all focus:border-[#D6A373]/50 focus:ring-1 focus:ring-[#D6A373]/20"
            />
            <p className="mt-1 text-right text-[10px] text-[#F5E6D8]/20">
              {contentEn.length}/1000
            </p>
          </div>

          {/* Optional Arabic comment */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D6A373]/80">
              {t('Arabic Version', 'النسخة العربية')}
              <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-[#F5E6D8]/30">
                {t('optional', 'اختياري')}
              </span>
            </label>
            <textarea
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              maxLength={1000}
              rows={3}
              dir="rtl"
              placeholder="أضف مراجعتك بالعربية هنا..."
              className="w-full resize-none rounded-xl border border-[#B6885E]/18 bg-[#0B0806]/60 px-4 py-3 text-sm text-[#F5E6D8] placeholder-[#F5E6D8]/20 outline-none transition-all focus:border-[#D6A373]/50 focus:ring-1 focus:ring-[#D6A373]/20"
            />
          </div>

          {/* Error message */}
          {formState === 'error' && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMsg || t('Something went wrong. Please try again.', 'حدث خطأ. حاول مرة أخرى.')}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={formState === 'submitting' || !name.trim() || !contentEn.trim()}
            className="w-full rounded-full bg-[#D6A373] py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-[#1a0e06] transition-all duration-200 hover:bg-[#e0b48a] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(182,136,94,0.35)] active:scale-[0.98] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {formState === 'submitting'
              ? t('Submitting...', 'جاري الإرسال...')
              : t('Submit Review', 'إرسال المراجعة')}
          </button>

          <p className="text-center text-[10px] text-[#F5E6D8]/25 leading-relaxed">
            {t(
              'Reviews are manually reviewed before appearing on the site.',
              'تُراجَع المراجعات يدوياً قبل ظهورها في الموقع.',
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
