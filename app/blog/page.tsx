'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/context/language'
import { FileText, Calendar } from 'lucide-react'

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

export default function BlogListPage() {
  const { t, language } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog/public')
      .then(r => r.json())
      .then(json => setPosts(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen py-16 bg-[#faf7f2]">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a0a00] mb-3">
            {t('Blog', 'المدونة')}
          </h1>
          <p className="text-[#7a5c3a] text-lg">
            {t('Coffee stories, brewing guides & more', 'قصص القهوة، أدلة التحضير والمزيد')}
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden border border-[#e8ddd5]">
                <div className="h-48 bg-[#f0e8e0]" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-[#f0e8e0] rounded w-3/4" />
                  <div className="h-4 bg-[#f0e8e0] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="h-16 w-16 mx-auto mb-4 text-[#c8941a]/30" />
            <h2 className="text-xl font-semibold text-[#7a5c3a] mb-2">{t('No posts yet', 'لا توجد مقالات بعد')}</h2>
            <p className="text-[#a07850]">{t('Check back soon!', 'تابعنا قريباً!')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map(post => {
              const title = language === 'ar' ? post.title_ar : post.title_en
              const excerpt = language === 'ar' ? post.content_ar : post.content_en
              const date = post.published_at || post.created_at
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#e8ddd5] hover:border-[#c8941a]/40 hover:shadow-lg transition-all duration-300"
                >
                  {/* Cover image */}
                  <div className="relative h-48 bg-[#f5ede4] overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-[#c8941a]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-[#a07850] text-xs mb-3">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2 className="font-serif text-xl font-bold text-[#1a0a00] mb-2 group-hover:text-[#522500] transition-colors line-clamp-2">
                      {title}
                    </h2>
                    {excerpt && (
                      <p className="text-[#7a5c3a] text-sm leading-relaxed line-clamp-3">
                        {excerpt.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                    <p className="text-[#c8941a] text-sm font-semibold mt-4 group-hover:underline">
                      {t('Read more →', 'اقرأ المزيد ←')}
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
