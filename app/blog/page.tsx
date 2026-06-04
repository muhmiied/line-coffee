'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, FileText } from 'lucide-react'
import { BlogEmptyState, BlogHero } from '@/components/pages/blog'
import { useLanguage } from '@/lib/context/language'
import { useSectionContent } from '@/lib/hooks/use-section-media'
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
  isFallback?: boolean
}

const FALLBACK_POSTS: Post[] = [
  {
    id: 'fallback-brewing',
    title_ar: 'كيف تحافظ على القهوة طازجة في البيت',
    title_en: 'How to Keep Coffee Fresh at Home',
    slug: '',
    cover_image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=80',
    content_ar: null,
    content_en: null,
    excerpt_ar: 'عادات تخزين بسيطة تحافظ على الرائحة والدفء وجودة القهوة اليومية.',
    excerpt_en: 'Simple storage habits that protect aroma, warmth, and daily coffee quality.',
    published_at: null,
    created_at: '2026-01-10T00:00:00.000Z',
    isFallback: true,
  },
  {
    id: 'fallback-turkish',
    title_ar: 'اختيار بروفايل القهوة التركي المناسب',
    title_en: 'Choosing the Right Turkish Coffee Profile',
    slug: '',
    cover_image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80',
    content_ar: null,
    content_en: null,
    excerpt_ar: 'دليل سريع لدرجة التحميص والقوام وطابع الفنجان المناسب لذوقك.',
    excerpt_en: 'A quick guide to roast depth, texture, and the cup character you prefer.',
    published_at: null,
    created_at: '2026-01-08T00:00:00.000Z',
    isFallback: true,
  },
  {
    id: 'fallback-espresso',
    title_ar: 'توليفات إسبريسو لطقس يومي أدفأ',
    title_en: 'Espresso Blends for a Warmer Daily Ritual',
    slug: '',
    cover_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    content_ar: null,
    content_en: null,
    excerpt_ar: 'معنى التوازن والقوام والحلاوة عند اختيار توليفة الإسبريسو.',
    excerpt_en: 'What balance, body, and sweetness mean when you pick an espresso blend.',
    published_at: null,
    created_at: '2026-01-05T00:00:00.000Z',
    isFallback: true,
  },
]

export default function BlogListPage() {
  const { t, language, dir } = useLanguage()
  const { media: sectionMedia, content: sectionContent } = useSectionContent('blog_page')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog/public', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        const livePosts = Array.isArray(json.data) ? json.data : []
        setPosts(livePosts.length > 0 ? livePosts : FALLBACK_POSTS)
      })
      .catch(() => setPosts(FALLBACK_POSTS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0806]">
      <BlogHero media={sectionMedia} content={sectionContent} />
      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-14 md:py-20">
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
          <BlogEmptyState />
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
                  href={post.slug ? `/blog/${post.slug}` : '/blog'}
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
