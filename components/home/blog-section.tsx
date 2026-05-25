'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

export function BlogSection() {
  const { t, language, dir } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    fetch('/api/blog/public', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json?.data)) setPosts(json.data.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="cinematic-section relative overflow-hidden py-20 md:py-28" style={{ background: '#0F0A07' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]">
              {t('Coffee Journal', 'مجلة القهوة')}
            </p>
            <h2 className="font-serif text-3xl font-bold leading-[1.18] text-[#F5E6D8] md:text-4xl">
              {t('Latest From The Blog', 'أحدث المقالات')}
            </h2>
          </div>
          <Link href="/blog" className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#D6A373] transition-colors hover:text-[#F5E6D8]">
            {t('View all posts', 'عرض كل المقالات')}
            <ArrowRight className={cn('h-4 w-4 transition-transform group-hover:translate-x-1', dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1')} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
                className="group overflow-hidden rounded-2xl border border-[#B6885E]/14 bg-[#120D09]/72 transition-all duration-300 hover:-translate-y-1 hover:border-[#D6A373]/30"
              >
                <div className="relative h-44 bg-[#1A120D]">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-10 w-10 text-[#B6885E]/35" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/70 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-[#D6B79A]/58">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="line-clamp-2 font-serif text-xl font-bold leading-snug text-[#F5E6D8] transition-colors group-hover:text-[#D6A373]">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#D6B79A]/66">
                      {excerpt.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
