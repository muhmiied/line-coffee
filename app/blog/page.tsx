'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, FileText } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

type Post = {
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

export default function BlogListPage() {
  const { t, language, dir } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog/public', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => setPosts(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0806] py-14 md:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center md:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]">
            {t('Coffee Journal', 'مجلة القهوة')}
          </p>
          <h1 className="mb-3 font-serif text-3xl font-bold leading-[1.18] text-[#F5E6D8] md:text-5xl">
            {t('Blog', 'المدونة')}
          </h1>
          <p className="text-lg text-[#D6B79A]/72">
            {t('Coffee stories, brewing guides & more', 'قصص القهوة، أدلة التحضير والمزيد')}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#B6885E]/12 bg-[#120D09]">
                <div className="h-40 bg-[#B6885E]/12 sm:h-48" />
                <div className="space-y-3 p-4 sm:p-6">
                  <div className="h-5 w-3/4 rounded bg-[#B6885E]/12" />
                  <div className="h-4 w-1/2 rounded bg-[#B6885E]/10" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#B6885E]/15 bg-[#B6885E]/8">
              <FileText className="h-9 w-9 text-[#B6885E]/55" />
            </div>
            <h2 className="mb-2 font-serif text-xl font-semibold text-[#F5E6D8]">{t('No posts yet', 'لا توجد مقالات بعد')}</h2>
            <p className="text-[#D6B79A]/60">{t('Check back soon!', 'تابعنا قريباً!')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => {
              const title = language === 'ar' ? post.title_ar : post.title_en
              const excerpt = language === 'ar'
                ? (post.excerpt_ar || post.content_ar)
                : (post.excerpt_en || post.content_en)
              const date = post.published_at || post.created_at

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#B6885E]/14 bg-[#120D09]/72 transition-all duration-300 hover:-translate-y-1 hover:border-[#D6A373]/35 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(182,136,94,0.09)]"
                >
                  <div className="relative h-40 overflow-hidden bg-[#1A120D] sm:h-48">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-12 w-12 text-[#B6885E]/35" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/70 to-transparent" />
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-[#D6B79A]/58">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2 className="mb-2 line-clamp-2 font-serif text-xl font-bold leading-snug text-[#F5E6D8] transition-colors group-hover:text-[#D6A373]">
                      {title}
                    </h2>
                    {excerpt && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-[#D6B79A]/68">
                        {excerpt.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D6A373]">
                      {t('Read more', 'اقرأ المزيد')}
                      <ArrowRight className={cn('h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1', dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0')} />
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
