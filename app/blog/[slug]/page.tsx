import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPageMetadata } from '@/lib/seo'
import { BlogPostClient, type BlogPost } from './post-client'

const BLOG_SELECT = 'id, title_ar, title_en, slug, cover_image, content_ar, content_en, excerpt_ar, excerpt_en, published_at, sort_order, created_at'
const BLOG_FALLBACK_SELECT = 'id, title_ar, title_en, slug, cover_image, content_ar, content_en, published_at, created_at'

export const dynamic = 'force-dynamic'

async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const admin = createAdminClient()
  if (!admin) return null

  const { data, error } = await admin
    .from('blog_posts')
    .select(BLOG_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error?.code === '42703') {
    const { data: fallbackData } = await admin
      .from('blog_posts')
      .select(BLOG_FALLBACK_SELECT)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    return fallbackData as BlogPost | null
  }

  if (error || !data) return null

  return data as BlogPost
}

function plainExcerpt(value?: string | null) {
  return value?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 155) || undefined
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) {
    return createPageMetadata({
      title: 'Blog Post | Line Coffee',
      description: 'Line Coffee blog article',
      path: `/blog/${slug}`,
    })
  }

  const title = `${post.title_en || post.title_ar} | Line Coffee`
  const description = plainExcerpt(post.excerpt_en || post.content_en || post.excerpt_ar || post.content_ar) || 'Line Coffee blog article'

  return {
    ...createPageMetadata({
      title,
      description,
      path: `/blog/${slug}`,
      image: post.cover_image,
      type: 'article',
    }),
    authors: [{ name: 'Line Coffee' }],
    title,
    description,
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  return <BlogPostClient initialPost={post} />
}
