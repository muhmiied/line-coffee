'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  getSectionBuilderContent,
  getWebsiteSection,
  type SectionBuilderContent,
  type SiteMediaItem,
  type WebsiteSectionConfig,
} from '@/lib/media'

export function useSectionMedia(sectionKey: string) {
  const [items, setItems] = useState<SiteMediaItem[]>([])

  useEffect(() => {
    let mounted = true

    fetch(`/api/media?section_key=${encodeURIComponent(sectionKey)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (mounted && Array.isArray(json?.data)) setItems(json.data)
      })
      .catch(() => {
        if (mounted) setItems([])
      })

    return () => {
      mounted = false
    }
  }, [sectionKey])

  return items
}

export function useSectionContent(sectionKey: string): {
  section: WebsiteSectionConfig
  media: SiteMediaItem | null
  content: SectionBuilderContent
} {
  const section = useMemo(() => getWebsiteSection(sectionKey), [sectionKey])
  const items = useSectionMedia(sectionKey)
  const media = items.find((item) => item.image_url) || items[0] || null
  const content = useMemo(() => getSectionBuilderContent(section, media), [section, media])

  return { section, media, content }
}
