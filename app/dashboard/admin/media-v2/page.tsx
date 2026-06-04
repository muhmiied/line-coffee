'use client'

import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  Layers,
  Monitor,
  PanelLeft,
  SlidersHorizontal,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { AboutHero, AboutJourney, AboutStats, AboutValues } from '@/components/pages/about'
import {
  MEDIA_STUDIO_V2_CONTROL_TABS,
  MEDIA_STUDIO_V2_PAGES,
  getMediaStudioV2Page,
  getMediaStudioV2SectionsByPage,
  type MediaStudioV2PageId,
  type MediaStudioV2Section,
} from '@/lib/media-studio-v2/registry'
import { getSectionBuilderContent, getWebsiteSection } from '@/lib/media'
import { cn } from '@/lib/utils'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'

const previewModes: Array<{ id: PreviewMode; label: string; icon: typeof Monitor }> = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
]

const previewWidth: Record<PreviewMode, string> = {
  desktop: 'w-full',
  tablet: 'max-w-[720px]',
  mobile: 'max-w-[390px]',
}

const extractedAboutPreviewIds = new Set(['about_hero', 'about_legacy_stats', 'about_journey', 'about_values'])

const areaLabels = ['Text', 'Media', 'CTA', 'Style', 'Layout', 'Animation'] as const

const inspectorFields = {
  Content: ['Title', 'Subtitle', 'Body', 'Stats/Cards', 'CTA labels'],
  Media: ['Image', 'Mobile image', 'Video', 'Alt text', 'Focus position', 'Crop mode'],
  Style: ['Overlay', 'Brightness', 'Contrast', 'Blur', 'Radius'],
  Layout: ['Alignment', 'Padding', 'Gap', 'Max width', 'Section height'],
  Animation: ['Entrance', 'Parallax/motion', 'Hover', 'Enable/disable'],
} as const

function formatField(value: string) {
  return value
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function PillList({ title, fields, formatFields = true }: { title: string; fields: string[]; formatFields?: boolean }) {
  return (
    <div className="rounded-lg border border-[#D6A373]/12 bg-black/18 p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D6A373]/70">{title}</p>
      {fields.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {fields.map((field) => (
            <span key={field} className="rounded-md border border-white/8 bg-white/[0.04] px-2 py-1 text-[11px] text-[#F5E6D8]/70">
              {formatFields ? formatField(field) : field}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/32">None</p>
      )}
    </div>
  )
}

function getSectionStatus(section: MediaStudioV2Section) {
  if (section.componentMapping.status === 'reusable') {
    return {
      label: 'Ready',
      icon: CheckCircle2,
      className: 'border-[#D6A373]/25 bg-[#D6A373]/10 text-[#FFDCC2]',
    }
  }

  if (section.componentMapping.status === 'needs-extraction') {
    return {
      label: 'Needs component extraction',
      icon: Clock,
      className: 'border-[#FFDCC2]/18 bg-[#FFDCC2]/8 text-[#FFDCC2]/82',
    }
  }

  return {
    label: 'Coming soon',
    icon: Clock,
    className: 'border-white/10 bg-white/[0.04] text-white/55',
  }
}

function StatusBadge({ section }: { section: MediaStudioV2Section }) {
  const status = getSectionStatus(section)
  const Icon = status.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold', status.className)}>
      <Icon className="h-3.5 w-3.5" />
      {status.label}
    </span>
  )
}

function AreaSummary({ section }: { section: MediaStudioV2Section }) {
  const counts = {
    Text: section.editableTextFields.length,
    Media: section.editableMediaFields.length,
    CTA: section.ctaFields.length,
    Style: section.styleEffectFields.filter((field) => !['padding', 'gap', 'text_alignment', 'max_width', 'section_height'].includes(field)).length,
    Layout: section.styleEffectFields.filter((field) => ['padding', 'gap', 'text_alignment', 'max_width', 'section_height'].includes(field)).length,
    Animation: section.responsive.supportsOverrides ? 1 : 0,
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {areaLabels.map((label) => (
        <div key={label} className="rounded-lg border border-[#D6A373]/12 bg-black/18 p-3">
          <p className="text-sm font-semibold text-[#F5E6D8]/84">{label}</p>
          <p className="mt-1 text-xs text-[#D6B79A]/56">
            {counts[label] > 0 ? `${counts[label]} planned area${counts[label] === 1 ? '' : 's'}` : 'No controls planned'}
          </p>
        </div>
      ))}
    </div>
  )
}

function InspectorPanel({ section, activeTab }: {
  section: MediaStudioV2Section
  activeTab: (typeof MEDIA_STUDIO_V2_CONTROL_TABS)[number]
}) {
  if (activeTab === 'Advanced') {
    return (
      <div className="space-y-3">
        <PillList title="Section key" fields={[section.currentSectionKey || 'New V2 key pending']} formatFields={false} />
        <PillList title="Component mapping" fields={[section.componentMapping.component, section.componentMapping.status]} formatFields={false} />
        <PillList title="Source" fields={[section.componentMapping.sourceFile]} formatFields={false} />
        <PillList title="DB/media source" fields={['banners compatibility layer']} />
        <PillList title="Fallback status" fields={[section.componentMapping.notes || 'Fallback remains active until V2 save/render is connected']} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <PillList title={`${activeTab} placeholders`} fields={[...inspectorFields[activeTab]]} />
      <div className="rounded-lg border border-[#D6A373]/12 bg-black/18 p-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D6A373]/70">
          <Info className="h-3.5 w-3.5" />
          Read-only
        </div>
        <p className="text-xs leading-relaxed text-[#D6B79A]/58">
          These controls are placeholders for the selected section. Editing and saving stay disabled until the real component preview is connected.
        </p>
      </div>
    </div>
  )
}

function AboutComponentPreview({ section }: { section: MediaStudioV2Section }) {
  const aboutTopSection = getWebsiteSection('about_top')
  const aboutStorySection = getWebsiteSection('about_story')
  const aboutValuesSection = getWebsiteSection('about_values')
  const aboutTopContent = getSectionBuilderContent(aboutTopSection, null)
  const aboutStoryContent = getSectionBuilderContent(aboutStorySection, null)
  const aboutValuesContent = getSectionBuilderContent(aboutValuesSection, null)

  if (section.id === 'about_hero') {
    return <AboutHero section={aboutTopSection} content={aboutTopContent} media={null} previewMode />
  }

  if (section.id === 'about_legacy_stats') {
    return <AboutStats />
  }

  if (section.id === 'about_journey') {
    return <AboutJourney section={aboutStorySection} content={aboutStoryContent} media={null} />
  }

  if (section.id === 'about_values') {
    return <AboutValues section={aboutValuesSection} content={aboutValuesContent} />
  }

  return null
}

export default function MediaStudioV2Page() {
  const [activePageId, setActivePageId] = useState<MediaStudioV2PageId>('home')
  const [activeSectionId, setActiveSectionId] = useState('home_hero')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [activeTab, setActiveTab] = useState<(typeof MEDIA_STUDIO_V2_CONTROL_TABS)[number]>('Content')

  const sections = useMemo(() => getMediaStudioV2SectionsByPage(activePageId), [activePageId])
  const activePage = getMediaStudioV2Page(activePageId)
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0]
  const componentPreview = activeSection && extractedAboutPreviewIds.has(activeSection.id)
    ? <AboutComponentPreview section={activeSection} />
    : null

  const selectPage = (pageId: MediaStudioV2PageId) => {
    const nextSections = getMediaStudioV2SectionsByPage(pageId)
    setActivePageId(pageId)
    setActiveSectionId(nextSections[0]?.id || '')
  }

  return (
    <div className="min-h-screen bg-transparent p-4 text-[#F5E6D8] sm:p-5" dir="ltr">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D6A373]/70">Media Studio V2</p>
          <h1 className="font-serif text-2xl font-bold text-[#F5E6D8]">Visual Editor Foundation</h1>
        </div>
        <span className="rounded-md border border-[#D6A373]/18 bg-[#D6A373]/8 px-3 py-1.5 text-xs font-semibold text-[#FFDCC2]">
          Read-only foundation
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)_320px]">
        <aside className="rounded-lg border border-[#D6A373]/12 bg-[#120D09]/82 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FFDCC2]">
            <PanelLeft className="h-4 w-4 text-[#D6A373]" />
            Pages
          </div>

          <div className="space-y-1">
            {MEDIA_STUDIO_V2_PAGES.map((page) => {
              const active = page.id === activePageId
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => selectPage(page.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition',
                    active
                      ? 'border-[#D6A373]/28 bg-[#D6A373]/12 text-[#FFDCC2]'
                      : 'border-transparent text-white/48 hover:border-white/8 hover:bg-white/[0.035] hover:text-white/78',
                  )}
                >
                  <span>{page.displayName}</span>
                  <span className="text-[11px] text-white/30">{page.route}</span>
                </button>
              )
            })}
          </div>

          <div className="my-4 h-px bg-[#D6A373]/12" />

          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FFDCC2]">
            <Layers className="h-4 w-4 text-[#D6A373]" />
            Section Tree
          </div>

          <div className="space-y-2">
            {sections.map((section) => {
              const active = section.id === activeSection.id
              const status = getSectionStatus(section)
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition',
                    active
                      ? 'border-[#D6A373]/30 bg-[#D6A373]/10'
                      : 'border-white/6 bg-black/14 hover:border-[#D6A373]/18',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-white/22" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#F5E6D8]/88">
                      {section.displayName}
                    </span>
                    {section.visibility.defaultVisible ? (
                      <Eye className="h-3.5 w-3.5 text-[#D6A373]/80" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-white/30" />
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-white/34">{status.label}</p>
                </button>
              )
            })}
          </div>
        </aside>

        <main className="min-w-0 rounded-lg border border-[#D6A373]/12 bg-[#0B0806]/72 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white/38">{activePage.displayName}</p>
              <h2 className="font-serif text-xl font-bold text-[#F5E6D8]">{activeSection.displayName}</h2>
            </div>
            <div className="flex rounded-lg border border-white/8 bg-black/20 p-1">
              {previewModes.map((mode) => {
                const Icon = mode.icon
                const active = mode.id === previewMode
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPreviewMode(mode.id)}
                    aria-label={mode.label}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md transition',
                      active ? 'bg-[#D6A373] text-[#0B0806]' : 'text-white/42 hover:text-white/80',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex min-h-[520px] items-start justify-center overflow-auto rounded-lg border border-white/8 bg-[#080503] p-3">
            <div className={cn('min-h-[490px] rounded-lg border border-[#D6A373]/16 bg-[#120D09] transition-all', previewWidth[previewMode])}>
              <div className="border-b border-[#D6A373]/12 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge section={activeSection} />
                  <span className="rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-white/48">
                    Read-only foundation
                  </span>
                </div>
                <p className="text-xs text-white/38">{activePage.displayName}</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-[#F5E6D8]">{activeSection.displayName}</h3>
                <p className="max-w-2xl text-sm leading-relaxed text-[#D6B79A]/72">{activeSection.description}</p>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D6A373]/70">Editable areas summary</p>
                  <AreaSummary section={activeSection} />
                </div>

                {componentPreview ? (
                  <div className="overflow-hidden rounded-lg border border-[#D6A373]/16 bg-[#0B0806]">
                    <div className="border-b border-[#D6A373]/12 bg-black/24 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D6A373]/72">
                      Component preview foundation
                    </div>
                    {componentPreview}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#D6A373]/20 bg-[#0B0806]/70 p-5">
                    <div className="mx-auto max-w-xl text-center">
                      <p className="font-serif text-xl font-bold text-[#F5E6D8]">Preview canvas placeholder</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#D6B79A]/62">
                        Extracted About sections now render with shared components. Other page previews will be connected in the next phase.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <aside className="rounded-lg border border-[#D6A373]/12 bg-[#120D09]/82 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FFDCC2]">
            <SlidersHorizontal className="h-4 w-4 text-[#D6A373]" />
            Inspector
          </div>

          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-white/8 bg-black/20 p-1">
            {MEDIA_STUDIO_V2_CONTROL_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-xs font-semibold transition',
                  activeTab === tab ? 'bg-[#D6A373] text-[#0B0806]' : 'text-white/42 hover:text-white/78',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <InspectorPanel section={activeSection} activeTab={activeTab} />
        </aside>
      </div>
    </div>
  )
}
