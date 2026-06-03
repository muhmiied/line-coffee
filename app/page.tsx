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
import { buildPublicSettings, PUBLIC_SETTING_KEYS, DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from '@/lib/config/public-settings'

const FALLBACK_TITLE = 'Line Coffee | Premium Coffee in Egypt | قهوة فاخرة بطابع دافئ'
const FALLBACK_DESC = 'Shop freshly roasted Turkish coffee, espresso blends, flavored coffee, cappuccino, and hot chocolate from Line Coffee in Egypt.'

export async function generateMetadata() {
  try {
    const admin = createAdminClient()
    if (admin) {
      const { data } = await admin
        .from('site_settings')
        .select('key, value')
        .in('key', [...PUBLIC_SETTING_KEYS])
      const settings = buildPublicSettings(data)
      return createPageMetadata({
        title: settings.seo.default_title || FALLBACK_TITLE,
        description: settings.seo.default_description || FALLBACK_DESC,
        path: '/',
      })
    }
  } catch {}
  return createPageMetadata({ title: FALLBACK_TITLE, description: FALLBACK_DESC, path: '/' })
}

function parseJsonSafe<T>(value: unknown, guard: (v: unknown) => v is T): T | null {
  if (guard(value)) return value
  if (typeof value === 'string') {
    try { const p = JSON.parse(value); return guard(p) ? p : null } catch {}
  }
  return null
}

export default async function HomePage() {
  let sectionOrder = DEFAULT_SECTION_ORDER
  let sectionVisibility = DEFAULT_SECTION_VISIBILITY

  try {
    const admin = createAdminClient()
    if (admin) {
      const { data } = await admin
        .from('site_settings')
        .select('key, value')
        .in('key', ['homepage_section_order', 'homepage_section_visibility'])

      const orderRow = data?.find(r => r.key === 'homepage_section_order')
      const visRow = data?.find(r => r.key === 'homepage_section_visibility')

      const parsedOrder = parseJsonSafe(orderRow?.value, (v): v is string[] => Array.isArray(v) && v.every(s => typeof s === 'string'))
      if (parsedOrder && parsedOrder.length > 0) {
        sectionOrder = parsedOrder.filter(k => k in DEFAULT_SECTION_VISIBILITY)
      }

      const parsedVis = parseJsonSafe(visRow?.value, (v): v is Record<string, boolean> => Boolean(v && typeof v === 'object' && !Array.isArray(v)))
      if (parsedVis) {
        sectionVisibility = { ...DEFAULT_SECTION_VISIBILITY, ...Object.fromEntries(Object.entries(parsedVis).map(([k, v]) => [k, Boolean(v)])) }
      }
    }
  } catch {}

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

  return (
    <>
      {sectionOrder
        .filter(key => sectionVisibility[key] !== false && key in SECTION_MAP)
        .map(key => <Fragment key={key}>{SECTION_MAP[key]}</Fragment>)}
    </>
  )
}
