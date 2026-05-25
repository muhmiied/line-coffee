import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

function getStaticRoutes(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/products'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'monthly', priority: 0.6 },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = getStaticRoutes()
  const admin = createAdminClient()
  if (!admin) return staticRoutes

  const [{ data: products }, { data: posts }] = await Promise.all([
    admin.from('products').select('slug, created_at').eq('is_visible', true),
    admin.from('blog_posts').select('slug, published_at, created_at').eq('is_published', true),
  ]).catch(() => [{ data: [] }, { data: [] }])

  const productRoutes = (products || [])
    .filter((product) => product.slug)
    .map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.created_at ? new Date(product.created_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const blogRoutes = (posts || [])
    .filter((post) => post.slug)
    .map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.published_at || post.created_at ? new Date(post.published_at || post.created_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
