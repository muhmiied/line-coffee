import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturesPills } from '@/components/home/features-pills'
import { StorySection } from '@/components/home/story-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { BlogSection } from '@/components/home/blog-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { InstagramSection } from '@/components/home/instagram-section'
import { ContactSection } from '@/components/home/contact-section'
import { createPageMetadata } from '@/lib/seo'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildPublicSettings, PUBLIC_SETTING_KEYS, type PublicSiteSettings } from '@/lib/config/public-settings'

const FALLBACK_TITLE = 'Line Coffee | Premium Coffee in Egypt | قهوة فاخرة بطابع دافئ'
const FALLBACK_DESC = 'Shop freshly roasted Turkish coffee, espresso blends, flavored coffee, cappuccino, and hot chocolate from Line Coffee in Egypt.'
const HOME_SECTION_ORDER = ['hero', 'categories', 'features', 'story', 'best_sellers', 'blog', 'testimonials', 'instagram', 'contact'] as const
type HomeSectionKey = (typeof HOME_SECTION_ORDER)[number]

async function getPublicSettings() {
  try {
    const admin = createAdminClient()
    if (!admin) return buildPublicSettings()

    const { data, error } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', [...PUBLIC_SETTING_KEYS])

    if (error) return buildPublicSettings()
    return buildPublicSettings(data)
  } catch {
    return buildPublicSettings()
  }
}

function isHomeSectionKey(key: string): key is HomeSectionKey {
  return HOME_SECTION_ORDER.includes(key as HomeSectionKey)
}

function getHomepageRenderOrder(settings: PublicSiteSettings) {
  const ordered: HomeSectionKey[] = []

  settings.homepage.section_order.forEach((key) => {
    if (isHomeSectionKey(key) && !ordered.includes(key)) ordered.push(key)
  })

  HOME_SECTION_ORDER.forEach((key) => {
    if (!ordered.includes(key)) ordered.push(key)
  })

  return ordered.filter((key) => settings.homepage.section_visibility[key] !== false)
}

export async function generateMetadata() {
  const settings = await getPublicSettings()
  return createPageMetadata({
    title: settings.seo.default_title || FALLBACK_TITLE,
    description: settings.seo.default_description || FALLBACK_DESC,
    path: '/',
  })
}

export default async function HomePage() {
  const SECTION_MAP: Record<string, ReactNode> = {
    hero: <HeroSection />,
    categories: <CategoriesSection />,
    features: <FeaturesPills />,
    story: <StorySection />,
    best_sellers: <BestSellersSection />,
    blog: <BlogSection />,
    testimonials: <TestimonialsSection />,
    instagram: <InstagramSection />,
    contact: <ContactSection />,
  }
  const settings = await getPublicSettings()

  return (
    <>
      {getHomepageRenderOrder(settings)
        .filter(key => key in SECTION_MAP)
        .map(key => <Fragment key={key}>{SECTION_MAP[key]}</Fragment>)}
    </>
  )
}
