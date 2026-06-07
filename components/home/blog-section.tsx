'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, FileText } from 'lucide-react'
import { useLanguage } from '@/lib/context/language'
import { useSectionContent } from '@/lib/hooks/use-section-media'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getVisualEffects,
  GRAIN_SVG,
} from '@/lib/media'
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

const fallbackPosts: Post[] = [
  {
    id: 'fallback-brewing',
    title_ar: 'Simple Brewing Notes',
    title_en: 'Simple Brewing Notes',
    slug: 'brewing-notes',
    cover_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80',
    content_ar: 'Small coffee notes from Line Coffee for a warmer daily cup.',
    content_en: 'Small coffee notes from Line Coffee for a warmer daily cup.',
    excerpt_ar: 'Small coffee notes from Line Coffee for a warmer daily cup.',
    excerpt_en: 'Small coffee notes from Line Coffee for a warmer daily cup.',
    published_at: null,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-roast',
    title_ar: 'Choosing Your Roast',
    title_en: 'Choosing Your Roast',
    slug: 'choosing-your-roast',
    cover_image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&q=80',
    content_ar: 'A quick guide to matching roast depth with your preferred coffee ritual.',
    content_en: 'A quick guide to matching roast depth with your preferred coffee ritual.',
    excerpt_ar: 'A quick guide to matching roast depth with your preferred coffee ritual.',
    excerpt_en: 'A quick guide to matching roast depth with your preferred coffee ritual.',
    published_at: null,
    created_at: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'fallback-freshness',
    title_ar: 'Keeping Coffee Fresh',
    title_en: 'Keeping Coffee Fresh',
    slug: 'keeping-coffee-fresh',
    cover_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80',
    content_ar: 'How careful storage helps preserve aroma, body, and comfort.',
    content_en: 'How careful storage helps preserve aroma, body, and comfort.',
    excerpt_ar: 'How careful storage helps preserve aroma, body, and comfort.',
    excerpt_en: 'How careful storage helps preserve aroma, body, and comfort.',
    published_at: null,
    created_at: '2025-01-03T00:00:00.000Z',
  },
]

export function BlogSection() {
  const { t, language, dir } = useLanguage()
  const { media: sectionMedia, content: sectionContent } = useSectionContent('home_blog')
  const [posts, setPosts] = useState<Post[]>(fallbackPosts)
  const bgFx = getVisualEffects(sectionMedia)
  const bgFilter = buildEffectsFilter(bgFx)
  const overlayOpacity = sectionMedia ? getMediaOverlayOpacity(sectionMedia, 0.78) : 0.78
  const bgOverlay = buildOverlayGradient(bgFx.gradient_type, bgFx.overlay_color, overlayOpacity)

  useEffect(() => {
    fetch('/api/blog/public', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json?.data)) setPosts(json.data.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  return (
    <section className="cinematic-section relative overflow-hidden py-20 md:py-28" style={{ background: '#0F0A07' }}>
      {sectionMedia?.image_url && (
        <>
          <Image
            src={sectionMedia.image_url}
            alt={sectionMedia.alt_en || sectionContent.title_en || ''}
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
            style={{ objectPosition: getMediaObjectPosition(sectionMedia), filter: bgFilter || undefined }}
            unoptimized
          />
          <div className="absolute inset-0" style={{ background: bgOverlay }} />
          {Number(bgFx.grain || 0) > 0.05 && (
            <div className="absolute inset-0 mix-blend-screen" style={{ opacity: Number(bgFx.grain), backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px' }} />
          )}
        </>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/18 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]">
              {t(sectionContent.eyebrow_en || 'Coffee Journal', sectionContent.eyebrow_ar || 'مجلة القهوة')}
            </p>
            <h2 className="font-serif text-3xl font-bold leading-[1.18] text-[#F5E6D8] md:text-4xl">
              {t(sectionContent.title_en || 'Latest From The Blog', sectionContent.title_ar || 'أحدث المقالات')}
            </h2>
            {(sectionContent.subtitle_en || sectionContent.subtitle_ar) && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D6B79A]/64">
                {t(sectionContent.subtitle_en || '', sectionContent.subtitle_ar || sectionContent.subtitle_en || '')}
              </p>
            )}
          </div>
          <Link href={sectionContent.button_link || '/blog'} className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#D6A373] transition-colors hover:text-[#F5E6D8]">
            {t(sectionContent.button_text_en || 'View all posts', sectionContent.button_text_ar || 'عرض كل المقالات')}
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
            const href = post.id.startsWith('fallback-') ? '/blog' : `/blog/${post.slug}`

            return (
              <Link
                key={post.id}
                href={href}
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
