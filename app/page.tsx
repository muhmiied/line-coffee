import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturesPills } from '@/components/home/features-pills'
import { StorySection } from '@/components/home/story-section'
import { createPageMetadata } from '@/lib/seo'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildPublicSettings, PUBLIC_SETTING_KEYS } from '@/lib/config/public-settings'

const FALLBACK_TITLE = 'Line Coffee | Premium Coffee in Egypt | قهوة فاخرة بطابع دافئ'
const FALLBACK_DESC = 'Shop freshly roasted Turkish coffee, espresso blends, flavored coffee, cappuccino, and hot chocolate from Line Coffee in Egypt.'
const HOME_SECTION_ORDER = ['hero', 'features', 'story']

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

export default async function HomePage() {
  const SECTION_MAP: Record<string, ReactNode> = {
    hero: <HeroSection />,
    features: <FeaturesPills />,
    story: <StorySection />,
  }

  return (
    <>
      {HOME_SECTION_ORDER
        .filter(key => key in SECTION_MAP)
        .map(key => <Fragment key={key}>{SECTION_MAP[key]}</Fragment>)}
    </>
  )
}
