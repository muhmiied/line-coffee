'use client'

import { useEffect, useState } from 'react'
import { AboutHero, AboutJourney, AboutStats, AboutValues } from '@/components/pages/about'
import { getSectionBuilderContent, getWebsiteSection, type SiteMediaItem } from '@/lib/media'

const aboutTopSectionConfig = getWebsiteSection('about_top')
const aboutStorySectionConfig = getWebsiteSection('about_story')
const aboutValuesSectionConfig = getWebsiteSection('about_values')

export default function AboutPage() {
  const [aboutTopMedia, setAboutTopMedia] = useState<SiteMediaItem | null>(null)
  const [aboutStoryMedia, setAboutStoryMedia] = useState<SiteMediaItem | null>(null)
  const [aboutValuesMedia, setAboutValuesMedia] = useState<SiteMediaItem | null>(null)

  useEffect(() => {
    let mounted = true

    Promise.all([
      fetch('/api/media?section_key=about_top', { cache: 'no-store' }).then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/media?section_key=about_story', { cache: 'no-store' }).then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/media?section_key=about_values', { cache: 'no-store' }).then((res) => res.json()).catch(() => ({ data: [] })),
    ]).then(([topRes, storyRes, valuesRes]) => {
      if (!mounted) return
      if (Array.isArray(topRes?.data) && topRes.data[0]) setAboutTopMedia(topRes.data[0])
      if (Array.isArray(storyRes?.data) && storyRes.data[0]) setAboutStoryMedia(storyRes.data[0])
      if (Array.isArray(valuesRes?.data) && valuesRes.data[0]) setAboutValuesMedia(valuesRes.data[0])
    })

    return () => {
      mounted = false
    }
  }, [])

  const aboutTopContent = getSectionBuilderContent(aboutTopSectionConfig, aboutTopMedia)
  const aboutStoryContent = getSectionBuilderContent(aboutStorySectionConfig, aboutStoryMedia)
  const aboutValuesContent = getSectionBuilderContent(aboutValuesSectionConfig, aboutValuesMedia)

  return (
    <div className="min-h-screen" style={{ background: '#0B0806' }}>
      <AboutHero section={aboutTopSectionConfig} content={aboutTopContent} media={aboutTopMedia} />
      <AboutStats />
      <AboutJourney section={aboutStorySectionConfig} content={aboutStoryContent} media={aboutStoryMedia} />
      <AboutValues section={aboutValuesSectionConfig} content={aboutValuesContent} />
    </div>
  )
}
