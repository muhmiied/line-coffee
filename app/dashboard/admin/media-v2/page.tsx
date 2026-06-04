'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Layers,
  Monitor,
  PanelLeft,
  Save,
  SlidersHorizontal,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { BlogEmptyState, BlogHero } from '@/components/pages/blog'
import { AboutHero, AboutJourney, AboutStats, AboutValues, DEFAULT_ABOUT_STATS, type AboutStat } from '@/components/pages/about'
import { ProductsHero } from '@/components/pages/products'
import { FeaturesPills } from '@/components/home/features-pills'
import { HeroSection } from '@/components/home/hero-section'
import { StorySection } from '@/components/home/story-section'
import {
  MEDIA_STUDIO_V2_CONTROL_TABS,
  MEDIA_STUDIO_V2_PAGES,
  getMediaStudioV2InspectorControls,
  getMediaStudioV2Page,
  getMediaStudioV2SectionsByPage,
  type MediaStudioV2PageId,
  type MediaStudioV2Section,
} from '@/lib/media-studio-v2/registry'
import { getSectionBuilderContent, getWebsiteSection, type SectionBuilderContent } from '@/lib/media'
import { cn } from '@/lib/utils'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'
type InspectorTab = (typeof MEDIA_STUDIO_V2_CONTROL_TABS)[number]
type SectionDraftValues = Record<string, string>
type DraftValuesBySection = Record<string, SectionDraftValues>

const previewModes: Array<{ id: PreviewMode; label: string; icon: typeof Monitor }> = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
]

const canvasWidths: Record<PreviewMode, string> = {
  desktop: 'w-full max-w-[1360px]',
  tablet: 'w-[760px]',
  mobile: 'w-[390px]',
}

const renderablePreviewIds = new Set([
  'home_hero',
  'home_story',
  'home_trust_cards',
  'about_hero',
  'about_legacy_stats',
  'about_journey',
  'about_values',
  'products_hero',
  'blog_hero',
  'blog_empty_state',
])

const controlStateLabels = {
  'preview-only': 'Preview only',
  'read-only': 'Read-only',
  'local-draft-only': 'Local draft only',
  'needs-extraction': 'Needs extraction',
} as const

function controlStateClassName(state: keyof typeof controlStateLabels) {
  if (state === 'needs-extraction') return 'border-[#FFDCC2]/16 bg-[#FFDCC2]/8 text-[#FFDCC2]/68'
  if (state === 'local-draft-only') return 'border-[#D6A373]/20 bg-[#D6A373]/10 text-[#FFDCC2]'
  return 'border-white/8 bg-white/[0.035] text-white/42'
}

function getDraftValue(draft: SectionDraftValues, fieldId: string) {
  return Object.prototype.hasOwnProperty.call(draft, fieldId) ? draft[fieldId] : undefined
}

function getSectionBaseContent(section: MediaStudioV2Section) {
  if (!section.currentSectionKey) return null
  const websiteSection = getWebsiteSection(section.currentSectionKey)
  return getSectionBuilderContent(websiteSection, null)
}

function withContentDrafts(content: SectionBuilderContent, draft: SectionDraftValues): SectionBuilderContent {
  const next: SectionBuilderContent = { ...content }

  ;(['eyebrow', 'title', 'subtitle', 'body'] as const).forEach((field) => {
    const value = getDraftValue(draft, field)
    if (value === undefined) return
    next[`${field}_en`] = value
    next[`${field}_ar`] = value
  })

  if (content.features?.length) {
    next.features = content.features.map((feature, index) => {
      const cardNumber = index + 1
      const title = getDraftValue(draft, `card_${cardNumber}_title`)
      const body = getDraftValue(draft, `card_${cardNumber}_body`)

      return {
        ...feature,
        ...(title !== undefined ? { title_en: title, title_ar: title } : {}),
        ...(body !== undefined ? { description_en: body, description_ar: body } : {}),
      }
    })
  }

  return next
}

function withStatsDrafts(stats: AboutStat[], draft: SectionDraftValues): AboutStat[] {
  return stats.map((stat, index) => {
    const statNumber = index + 1
    const value = getDraftValue(draft, `stat_${statNumber}_value`)
    const label = getDraftValue(draft, `stat_${statNumber}_label`)

    return {
      ...stat,
      ...(value !== undefined ? { valueEn: value, valueAr: value } : {}),
      ...(label !== undefined ? { labelEn: label, labelAr: label } : {}),
    }
  })
}

function getDraftDefaultValue(section: MediaStudioV2Section, fieldId: string) {
  if (section.id === 'blog_empty_state') {
    if (fieldId === 'title') return 'Coffee notes are being prepared'
    if (fieldId === 'body') return 'Guides, Line Coffee updates, and brewing notes will appear here once published.'
  }

  if (section.id === 'about_legacy_stats') {
    const match = fieldId.match(/^stat_(\d+)_(value|label)$/)
    if (!match) return ''

    const stat = DEFAULT_ABOUT_STATS[Number(match[1]) - 1]
    if (!stat) return ''
    return match[2] === 'value' ? stat.valueEn : stat.labelEn
  }

  const content = getSectionBaseContent(section)
  if (!content) return ''

  if (fieldId === 'eyebrow') return content.eyebrow_en || ''
  if (fieldId === 'title') return content.title_en || ''
  if (fieldId === 'subtitle') return content.subtitle_en || ''
  if (fieldId === 'body') return content.body_en || content.subtitle_en || ''

  const cardMatch = fieldId.match(/^card_(\d+)_(title|body)$/)
  if (cardMatch) {
    const card = content.features?.[Number(cardMatch[1]) - 1]
    if (!card) return ''
    return cardMatch[2] === 'title' ? card.title_en : card.description_en || ''
  }

  return ''
}

function getSectionStatus(section: MediaStudioV2Section) {
  if (section.componentMapping.status === 'reusable') {
    return {
      label: 'Ready',
      icon: CheckCircle2,
      className: 'border-[#D6A373]/26 bg-[#D6A373]/10 text-[#FFDCC2]',
    }
  }

  if (section.componentMapping.status === 'needs-extraction') {
    return {
      label: 'Needs extraction',
      icon: Clock,
      className: 'border-[#FFDCC2]/18 bg-[#FFDCC2]/8 text-[#FFDCC2]/78',
    }
  }

  return {
    label: 'Planned',
    icon: Clock,
    className: 'border-white/10 bg-white/[0.04] text-white/55',
  }
}

function StatusBadge({ section }: { section: MediaStudioV2Section }) {
  const status = getSectionStatus(section)
  const Icon = status.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold', status.className)}>
      <Icon className="h-3 w-3" />
      {status.label}
    </span>
  )
}

function SectionFrame({
  section,
  selected,
  onSelect,
  children,
}: {
  section: MediaStudioV2Section
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <div
      id={`media-v2-section-${section.id}`}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        const target = event.target instanceof Element ? event.target : null
        if (target?.closest('a')) event.preventDefault()
        onSelect()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'group relative scroll-mt-6 outline-none transition',
        selected && 'z-10 ring-2 ring-[#D6A373] ring-offset-2 ring-offset-[#080503]',
      )}
    >
      {selected && (
        <div className="pointer-events-none absolute left-3 top-3 z-30 rounded-full border border-[#D6A373]/28 bg-[#080503]/88 px-3 py-1 text-[11px] font-semibold text-[#FFDCC2] shadow-[0_12px_34px_rgba(0,0,0,0.36)] backdrop-blur">
          {section.displayName}
        </div>
      )}
      {children}
    </div>
  )
}

function PlaceholderSection({ section }: { section: MediaStudioV2Section }) {
  const isHero = section.id.includes('hero')
  const isForm = section.id.includes('contact_info')
  const minHeight = isHero ? 'min-h-[430px]' : isForm ? 'min-h-[420px]' : 'min-h-[300px]'

  return (
    <section className={cn('relative flex items-center justify-center overflow-hidden bg-[#0B0806] px-6 py-16', minHeight)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(214,163,115,0.10),transparent_68%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A373]/18 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D6A373]/12 to-transparent" />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#D6A373]/72">Preview wiring coming soon</p>
        <h3 className="font-serif text-3xl font-bold text-[#F5E6D8]">{section.displayName}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#D6B79A]/64">
          This section is reserved in the real page flow. Component extraction and live preview wiring will be connected in a later phase.
        </p>
      </div>
    </section>
  )
}

function AboutPreviewSection({ section, draftValues }: { section: MediaStudioV2Section; draftValues: SectionDraftValues }) {
  const aboutTopSection = getWebsiteSection('about_top')
  const aboutStorySection = getWebsiteSection('about_story')
  const aboutValuesSection = getWebsiteSection('about_values')
  const aboutTopContent = withContentDrafts(getSectionBuilderContent(aboutTopSection, null), draftValues)
  const aboutStoryContent = withContentDrafts(getSectionBuilderContent(aboutStorySection, null), draftValues)
  const aboutValuesContent = withContentDrafts(getSectionBuilderContent(aboutValuesSection, null), draftValues)

  if (section.id === 'about_hero') {
    return <AboutHero section={aboutTopSection} content={aboutTopContent} media={null} previewMode />
  }

  if (section.id === 'about_legacy_stats') {
    return <AboutStats stats={withStatsDrafts(DEFAULT_ABOUT_STATS, draftValues)} />
  }

  if (section.id === 'about_journey') {
    return <AboutJourney section={aboutStorySection} content={aboutStoryContent} media={null} />
  }

  if (section.id === 'about_values') {
    return <AboutValues section={aboutValuesSection} content={aboutValuesContent} />
  }

  return <PlaceholderSection section={section} />
}

function HomePreviewSection({ section }: { section: MediaStudioV2Section }) {
  if (section.id === 'home_hero') return <HeroSection />
  if (section.id === 'home_story') return <StorySection />
  if (section.id === 'home_trust_cards') return <FeaturesPills />

  return <PlaceholderSection section={section} />
}

function ProductsPreviewSection({ section, draftValues }: { section: MediaStudioV2Section; draftValues: SectionDraftValues }) {
  if (section.id === 'products_hero') {
    return <ProductsHero media={null} previewMode previewOverrides={{ title: getDraftValue(draftValues, 'title'), subtitle: getDraftValue(draftValues, 'subtitle') }} />
  }

  return <PlaceholderSection section={section} />
}

function BlogPreviewSection({ section, draftValues }: { section: MediaStudioV2Section; draftValues: SectionDraftValues }) {
  const blogSection = getWebsiteSection('blog_page')
  const blogContent = getSectionBuilderContent(blogSection, null)

  if (section.id === 'blog_hero') {
    return (
      <BlogHero
        media={null}
        content={blogContent}
        standalone
        previewOverrides={{
          eyebrow: getDraftValue(draftValues, 'eyebrow'),
          title: getDraftValue(draftValues, 'title'),
          subtitle: getDraftValue(draftValues, 'subtitle'),
        }}
      />
    )
  }

  if (section.id === 'blog_empty_state') {
    return <BlogEmptyState previewOverrides={{ title: getDraftValue(draftValues, 'title'), body: getDraftValue(draftValues, 'body') }} />
  }

  return <PlaceholderSection section={section} />
}

function PreviewSection({ section, draftValues }: { section: MediaStudioV2Section; draftValues: SectionDraftValues }) {
  if (section.page === 'home') return <HomePreviewSection section={section} />
  if (section.page === 'about') return <AboutPreviewSection section={section} draftValues={draftValues} />
  if (section.page === 'products') return <ProductsPreviewSection section={section} draftValues={draftValues} />
  if (section.page === 'blog') return <BlogPreviewSection section={section} draftValues={draftValues} />

  return <PlaceholderSection section={section} />
}

function CanvasSection({
  section,
  selected,
  onSelect,
  draftValues,
}: {
  section: MediaStudioV2Section
  selected: boolean
  onSelect: () => void
  draftValues: SectionDraftValues
}) {
  return (
    <SectionFrame section={section} selected={selected} onSelect={onSelect}>
      {renderablePreviewIds.has(section.id) ? <PreviewSection section={section} draftValues={draftValues} /> : <PlaceholderSection section={section} />}
    </SectionFrame>
  )
}

function InspectorPanel({ section, activeTab, draftValues, onDraftChange, onSelectElement }: {
  section: MediaStudioV2Section
  activeTab: InspectorTab
  draftValues: SectionDraftValues
  onDraftChange: (fieldId: string, value: string) => void
  onSelectElement: (fieldId: string) => void
}) {
  const controls = getMediaStudioV2InspectorControls(section, activeTab)

  return (
    <div className="space-y-3">
      {controls.length > 0 ? controls.map((control) => (
        <div key={control.id} className="rounded-lg border border-[#D6A373]/12 bg-black/18 p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[#F5E6D8]/84">{control.label}</p>
            <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', controlStateClassName(control.state))}>
              {controlStateLabels[control.state]}
            </span>
          </div>
          {control.value && (
            <p className="mb-2 break-words rounded-md border border-white/8 bg-white/[0.035] px-2 py-1 text-[11px] text-[#F5E6D8]/62">
              {control.value}
            </p>
          )}
          {activeTab === 'Content' && control.state === 'local-draft-only' ? (
            <div className="space-y-2">
              {control.control === 'textarea' ? (
                <textarea
                  aria-label={control.label}
                  value={getDraftValue(draftValues, control.id) ?? getDraftDefaultValue(section, control.id)}
                  onChange={(event) => onDraftChange(control.id, event.target.value)}
                  onFocus={() => onSelectElement(control.id)}
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-lg border border-[#D6A373]/14 bg-[#080503]/80 px-3 py-2 text-sm leading-relaxed text-[#F5E6D8] outline-none transition placeholder:text-white/24 focus:border-[#D6A373]/45"
                />
              ) : (
                <input
                  aria-label={control.label}
                  value={getDraftValue(draftValues, control.id) ?? getDraftDefaultValue(section, control.id)}
                  onChange={(event) => onDraftChange(control.id, event.target.value)}
                  onFocus={() => onSelectElement(control.id)}
                  className="h-9 w-full rounded-lg border border-[#D6A373]/14 bg-[#080503]/80 px-3 text-sm text-[#F5E6D8] outline-none transition placeholder:text-white/24 focus:border-[#D6A373]/45"
                />
              )}
              <p className="text-xs leading-relaxed text-[#D6B79A]/55">{control.description}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-[#D6B79A]/55">{control.description}</p>
              {activeTab === 'Content' && (
                <input
                  disabled
                  value="Coming soon"
                  className="h-9 w-full rounded-lg border border-white/8 bg-white/[0.025] px-3 text-sm text-white/28"
                />
              )}
            </div>
          )}
        </div>
      )) : (
        <div className="rounded-lg border border-[#D6A373]/12 bg-black/18 p-3">
          <p className="text-sm font-semibold text-[#F5E6D8]/84">No controls planned</p>
          <p className="mt-1 text-xs leading-relaxed text-[#D6B79A]/55">
            This tab has no schema fields for the selected section yet.
          </p>
        </div>
      )}
      <div className="rounded-lg border border-[#D6A373]/12 bg-[#D6A373]/7 p-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D6A373]/78">
          <Info className="h-3.5 w-3.5" />
          Read-only
        </div>
        <p className="text-xs leading-relaxed text-[#D6B79A]/58">
          Content inputs update this preview locally only. Uploads, drag/drop, database writes, and saving are intentionally disabled.
        </p>
      </div>
    </div>
  )
}

export default function MediaStudioV2Page() {
  const [selectedPageId, setSelectedPageId] = useState<MediaStudioV2PageId>('home')
  const [selectedSectionId, setSelectedSectionId] = useState('home_hero')
  const [selectedElementId, setSelectedElementId] = useState<string | null>('home_hero:section')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTab>('Content')
  const [draftValues, setDraftValues] = useState<DraftValuesBySection>({})

  const sections = useMemo(() => getMediaStudioV2SectionsByPage(selectedPageId), [selectedPageId])
  const selectedPage = getMediaStudioV2Page(selectedPageId)
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0]
  const selectedDraftValues = selectedSection ? draftValues[selectedSection.id] || {} : {}
  const hasSelectedDraftValues = Object.keys(selectedDraftValues).length > 0

  useEffect(() => {
    const frame = document.getElementById(`media-v2-section-${selectedSectionId}`)
    frame?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedPageId, selectedSectionId])

  const selectPage = (pageId: MediaStudioV2PageId) => {
    const nextSections = getMediaStudioV2SectionsByPage(pageId)
    const nextSectionId = nextSections[0]?.id || ''

    setSelectedPageId(pageId)
    setSelectedSectionId(nextSectionId)
    setSelectedElementId(nextSectionId ? `${nextSectionId}:section` : null)
  }

  const selectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setSelectedElementId(`${sectionId}:section`)
  }

  const updateDraftValue = (sectionId: string, fieldId: string, value: string) => {
    setDraftValues((current) => ({
      ...current,
      [sectionId]: {
        ...(current[sectionId] || {}),
        [fieldId]: value,
      },
    }))
    setSelectedElementId(`${sectionId}:${fieldId}`)
  }

  const resetSelectedDraft = () => {
    if (!selectedSection) return
    setDraftValues((current) => {
      const next = { ...current }
      delete next[selectedSection.id]
      return next
    })
    setSelectedElementId(`${selectedSection.id}:section`)
  }

  const editorState = {
    selectedPageId,
    selectedSectionId,
    selectedElementId,
    previewMode,
    activeInspectorTab,
    draftValues,
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-transparent text-[#F5E6D8]" dir="ltr" data-editor-state={JSON.stringify(editorState)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6A373]/12 bg-[#080503]/74 px-3 py-3 backdrop-blur-xl sm:px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D6A373]/68">Media Studio V2</p>
          <h1 className="truncate font-serif text-xl font-bold text-[#F5E6D8]">Visual CMS</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#D6A373]/18 bg-[#D6A373]/8 px-3 py-1.5 text-xs font-semibold text-[#FFDCC2]">
            Read-only foundation
          </span>

          <div className="flex rounded-lg border border-white/8 bg-black/20 p-1">
            {previewModes.map((mode) => {
              const Icon = mode.icon
              const active = mode.id === previewMode
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setPreviewMode(mode.id)}
                  className={cn(
                    'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition',
                    active ? 'bg-[#D6A373] text-[#0B0806]' : 'text-white/46 hover:text-white/82',
                  )}
                  aria-label={`${mode.label} preview`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              )
            })}
          </div>

          <Link
            href="/dashboard/admin/banners"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-white/55 transition hover:text-[#F5E6D8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Legacy
          </Link>
          <Link
            href={selectedPage.route}
            target="_blank"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-white/55 transition hover:text-[#F5E6D8]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview website
          </Link>
          <button
            type="button"
            disabled
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#D6A373]/16 bg-[#D6A373]/8 px-3 text-xs font-semibold text-[#FFDCC2]/45"
          >
            <Save className="h-3.5 w-3.5" />
            Save soon
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-[230px_minmax(0,1fr)_280px]">
        <aside className="min-h-0 rounded-lg border border-[#D6A373]/12 bg-[#120D09]/82 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FFDCC2]">
            <PanelLeft className="h-4 w-4 text-[#D6A373]" />
            Pages
          </div>

          <div className="space-y-1">
            {MEDIA_STUDIO_V2_PAGES.map((page) => {
              const active = page.id === selectedPageId
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => selectPage(page.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition',
                    active
                      ? 'border-[#D6A373]/28 bg-[#D6A373]/12 text-[#FFDCC2]'
                      : 'border-transparent text-white/50 hover:border-white/8 hover:bg-white/[0.035] hover:text-white/82',
                  )}
                >
                  <span>{page.displayName}</span>
                  <span className="text-[10px] text-white/28">{page.route}</span>
                </button>
              )
            })}
          </div>

          <div className="my-4 h-px bg-[#D6A373]/12" />

          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FFDCC2]">
            <Layers className="h-4 w-4 text-[#D6A373]" />
            Sections
          </div>

          <div className="max-h-[calc(100dvh-20rem)] space-y-2 overflow-y-auto pr-1">
            {sections.map((section) => {
              const active = section.id === selectedSection?.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section.id)}
                  className={cn(
                    'w-full rounded-lg border p-2.5 text-left transition',
                    active
                      ? 'border-[#D6A373]/35 bg-[#D6A373]/11'
                      : 'border-white/6 bg-black/14 hover:border-[#D6A373]/18',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {section.visibility.defaultVisible ? (
                      <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D6A373]/76" />
                    ) : (
                      <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#F5E6D8]/88">{section.displayName}</p>
                      <div className="mt-1">
                        <StatusBadge section={section} />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <main className="min-h-0 min-w-0 rounded-lg border border-[#D6A373]/12 bg-[#080503]/82 shadow-[0_22px_80px_rgba(0,0,0,0.30)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#D6A373]/10 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D6A373]/62">Canvas</p>
              <p className="truncate text-sm font-semibold text-[#F5E6D8]/84">{selectedPage.displayName} preview</p>
            </div>
            {selectedSection && <StatusBadge section={selectedSection} />}
          </div>

          <div className="h-[calc(100dvh-12.5rem)] overflow-auto bg-[#050302] p-4">
            <div className="mx-auto min-w-0 transition-all duration-300">
              <div className={cn('mx-auto overflow-hidden rounded-lg border border-[#D6A373]/14 bg-[#0B0806] shadow-[0_28px_110px_rgba(0,0,0,0.46)]', canvasWidths[previewMode])}>
                <div className="flex items-center justify-between border-b border-[#D6A373]/10 bg-[#0B0806] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D6A373]/55" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D6A373]/28" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
                  </div>
                  <p className="text-[11px] text-white/34">{selectedPage.route}</p>
                </div>

                <div className="max-h-[calc(100dvh-17rem)] overflow-y-auto overflow-x-hidden bg-[#0B0806]">
                  {sections.map((section) => (
                    <CanvasSection
                      key={section.id}
                      section={section}
                      selected={section.id === selectedSection?.id}
                      onSelect={() => selectSection(section.id)}
                      draftValues={draftValues[section.id] || {}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="min-h-0 rounded-lg border border-[#D6A373]/12 bg-[#120D09]/82 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FFDCC2]">
            <SlidersHorizontal className="h-4 w-4 text-[#D6A373]" />
            Inspector
          </div>

          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-white/8 bg-black/20 p-1">
            {MEDIA_STUDIO_V2_CONTROL_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveInspectorTab(tab)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-xs font-semibold transition',
                  activeInspectorTab === tab ? 'bg-[#D6A373] text-[#0B0806]' : 'text-white/42 hover:text-white/78',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedSection ? (
            <div className="max-h-[calc(100dvh-17rem)] overflow-y-auto pr-1">
              <div className="mb-3 rounded-lg border border-[#D6A373]/12 bg-black/18 p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-xs text-white/35">{selectedPage.displayName}</p>
                  {selectedSection.localDraftFields?.length ? (
                    <span className="rounded-full border border-[#D6A373]/18 bg-[#D6A373]/8 px-2 py-0.5 text-[10px] font-semibold text-[#FFDCC2]">
                      Local draft only - not saved yet
                    </span>
                  ) : null}
                </div>
                <h2 className="font-serif text-lg font-bold text-[#F5E6D8]">{selectedSection.displayName}</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#D6B79A]/56">{selectedSection.description}</p>
                <div className="mt-3 rounded-md border border-white/8 bg-white/[0.03] px-2 py-1.5 text-[11px] text-white/42">
                  Selected: <span className="text-[#FFDCC2]/72">{selectedElementId || 'section'}</span>
                </div>
                <button
                  type="button"
                  onClick={resetSelectedDraft}
                  disabled={!hasSelectedDraftValues}
                  className="mt-3 h-8 w-full rounded-lg border border-[#D6A373]/14 bg-[#D6A373]/8 text-xs font-semibold text-[#FFDCC2]/70 transition hover:border-[#D6A373]/28 hover:text-[#FFDCC2] disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/[0.025] disabled:text-white/24"
                >
                  Reset local draft
                </button>
              </div>
              <InspectorPanel
                section={selectedSection}
                activeTab={activeInspectorTab}
                draftValues={selectedDraftValues}
                onDraftChange={(fieldId, value) => updateDraftValue(selectedSection.id, fieldId, value)}
                onSelectElement={(fieldId) => setSelectedElementId(`${selectedSection.id}:${fieldId}`)}
              />
            </div>
          ) : (
            <p className="text-sm text-white/38">Select a section to inspect it.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
