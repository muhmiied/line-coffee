'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/context/language'
import { ArrowLeft, ArrowRight, Calendar, FileText } from 'lucide-react'

type Post = {
  id: string
  title_ar: string
  title_en: string
  slug: string
  cover_image: string | null
  content_ar: string | null
  content_en: string | null
  published_at: string | null
  created_at: string
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, language, dir } = useLanguage()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch('/api/blog/public')
      .then(r => r.json())
      .then(json => {
        const found = (json.data || []).find((p: Post) => p.slug === slug)
        if (found) setPost(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#f0e8e0] rounded w-3/4" />
            <div className="h-64 bg-[#f0e8e0] rounded-2xl" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-[#f0e8e0] rounded" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-[#c8941a]/30" />
          <h1 className="text-2xl font-bold text-[#1a0a00] mb-2">{t('Post not found', 'المقال غير موجود')}</h1>
          <Link href="/blog" className="text-[#c8941a] hover:underline">{t('← Back to Blog', '→ العودة للمدونة')}</Link>
        </div>
      </div>
    )
  }

  const title = language === 'ar' ? post.title_ar : post.title_en
  const content = language === 'ar' ? post.content_ar : post.content_en
  const date = post.published_at || post.created_at

  return (
    <div className="min-h-screen bg-[#faf7f2] py-16" dir={dir}>
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[#7a5c3a] hover:text-[#c8941a] text-sm mb-8 transition-colors">
          {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {t('Back to Blog', 'العودة للمدونة')}
        </Link>

        {/* Cover image */}
        {post.cover_image && (
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image src={post.cover_image} alt={title} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 text-[#a07850] text-sm mb-4">
            <Calendar className="h-4 w-4" />
            {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1a0a00] leading-tight">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-[#4a3020] leading-relaxed">
          {content ? (
            content.split('\n').map((para, i) =>
              para.trim() ? <p key={i} className="mb-4">{para}</p> : <br key={i} />
            )
          ) : (
            <p className="text-[#a07850] italic">{t('No content available.', 'لا يوجد محتوى.')}</p>
          )}
        </div>

        {/* Footer nav */}
        <div className="border-t border-[#e8ddd5] mt-12 pt-8">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[#c8941a] hover:underline font-medium">
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t('All Posts', 'كل المقالات')}
          </Link>
        </div>
      </div>
    </div>
  )
}
