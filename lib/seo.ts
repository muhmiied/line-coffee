import type { Metadata } from 'next'

function normalizeSiteUrl(value: string) {
  try {
    return new URL(value).origin
  } catch {
    return 'https://linecoffee.com'
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || 'https://linecoffee.com')
}

export const SITE_URL = getSiteUrl()

export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&h=630&fit=crop&q=80'

export function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return new URL(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`, getSiteUrl()).toString()
}

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
}: {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'article'
}): Metadata {
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Line Coffee',
      locale: 'ar_EG',
      alternateLocale: 'en_US',
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Line Coffee',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}
