'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Calendar, FileText } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'

export type BlogPost = {
  id: string
  title_ar: string
  title_en: string
  slug: string
  cover_image: string | null
  content_ar: string | null
  content_en: string | null
  excerpt_ar?: string | null
  excerpt_en?: string | null
  published_at: string | null
  created_at: string
}

type Props = {
  initialPost: BlogPost | null
}

export function BlogPostClient({ initialPost }: Props) {
  const { t, language, dir } = useLanguage()

  if (!initialPost) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0806] px-4">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-[#B6885E]/30" />
          <h1 className="mb-2 text-2xl font-bold text-[#F5E6D8]">{t('Post not found', 'المقال غير موجود')}</h1>
          <Link href="/blog" className="text-[#D6A373] hover:underline">{t('Back to Blog', 'العودة للمدونة')}</Link>
        </div>
      </div>
    )
  }

  const title = language === 'ar' ? initialPost.title_ar : initialPost.title_en
  const content = language === 'ar'
    ? (initialPost.content_ar || initialPost.content_en)
    : (initialPost.content_en || initialPost.content_ar)
  const date = initialPost.published_at || initialPost.created_at

  return (
    <div className="min-h-screen bg-[#0B0806] py-20 md:py-24" dir={dir}>
      <article className="container mx-auto max-w-3xl px-4">
        <Link href="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-[#D6B79A]/72 transition-colors hover:text-[#D6A373]">
          {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {t('Back to Blog', 'العودة للمدونة')}
        </Link>

        {initialPost.cover_image && (
          <div className="relative mb-8 h-72 overflow-hidden rounded-2xl border border-[#B6885E]/14 md:h-96">
            <Image
              src={initialPost.cover_image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/72 to-transparent" />
          </div>
        )}

        <header className="mb-8">
          <div className="mb-4 flex items-center gap-1.5 text-sm text-[#D6B79A]/58">
            <Calendar className="h-4 w-4" />
            {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="font-serif text-3xl font-bold leading-[1.16] text-[#F5E6D8] md:text-5xl">
            {title}
          </h1>
        </header>

        <div className="rounded-2xl border border-[#B6885E]/14 bg-[#120D09]/58 p-5 text-[#F5E6D8]/84 md:p-7">
          {content ? (
            content.split('\n').map((para, i) =>
              para.trim() ? <p key={i} className="mb-5 text-base leading-8 text-[#F5E6D8]/84">{para}</p> : <br key={i} />
            )
          ) : (
            <p className="italic text-[#D6B79A]/70">{t('No content available.', 'لا يوجد محتوى.')}</p>
          )}
        </div>

        <div className="mt-10 border-t border-[#B6885E]/14 pt-8">
          <Link href="/blog" className="inline-flex items-center gap-1.5 font-medium text-[#D6A373] hover:underline">
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t('All Posts', 'كل المقالات')}
          </Link>
        </div>
      </article>
    </div>
  )
}
