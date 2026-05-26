'use client'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getMediaSectionKey,
  getSectionBuilderContent,
  getSectionBuilderLayout,
  getVisualEffects,
  getWebsitePages,
  GRAIN_SVG,
  OBJECT_POSITION_OPTIONS,
  WEBSITE_SECTIONS,
  type SectionBuilderContent,
  type SectionBuilderLayout,
  type SectionStatBlock,
  type SectionTextBlock,
  type SiteMediaItem,
  type VisualEffects,
  type WebsiteSectionConfig,
} from '@/lib/media'
import { cn } from '@/lib/utils'

type StudioSlide = Partial<SiteMediaItem> & {
  local_id: string
  isNew?: boolean
}

type EditorTab = 'content' | 'image' | 'layout' | 'effects' | 'advanced'

const EMPTY_IMAGE = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80'

function localText(language: 'en' | 'ar', en?: string | null, ar?: string | null) {
  return language === 'ar' ? ar || en || '' : en || ar || ''
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `studio-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function isCategorySection(section: WebsiteSectionConfig) {
  return section.key === 'categories'
}

function slideBelongsToSection(slide: Partial<SiteMediaItem>, section: WebsiteSectionConfig) {
  if (isCategorySection(section)) {
    return slide.media_type === 'category' || String(slide.usage_area || '').startsWith('category:')
  }

  const key = getMediaSectionKey({
    section_key: slide.section_key,
    usage_area: slide.usage_area,
  })
  return key === section.key || slide.usage_area === section.usageArea
}

function normalizeSlide(item: SiteMediaItem): StudioSlide {
  return {
    ...item,
    local_id: item.id || createLocalId(),
    isNew: false,
  }
}

function makeSlide(section: WebsiteSectionConfig, index: number): StudioSlide {
  const localId = createLocalId()
  const content = section.defaultContent || {}

  return {
    id: localId,
    local_id: localId,
    isNew: true,
    title_en: content.title_en || section.defaultTitleEn,
    title_ar: content.title_ar || section.defaultTitleAr,
    subtitle_en: content.subtitle_en || section.defaultSubtitleEn,
    subtitle_ar: content.subtitle_ar || section.defaultSubtitleAr,
    image_url: section.fallbackImage || EMPTY_IMAGE,
    link_url: section.defaultButtonLink || null,
    button_link: section.defaultButtonLink || null,
    button_text_en: content.button_text_en || section.defaultButtonTextEn || null,
    button_text_ar: content.button_text_ar || section.defaultButtonTextAr || null,
    sort_order: index,
    is_active: true,
    section_key: section.key,
    slide_key: localId,
    section_type: section.sectionType,
    media_type: section.mediaType,
    usage_area: isCategorySection(section) ? 'category:turkish-coffee' : section.usageArea,
    alt_en: section.defaultTitleEn,
    alt_ar: section.defaultTitleAr,
    is_featured: index === 0,
    mobile_image_url: null,
    overlay_opacity: 0.55,
    object_position: 'center center',
    content,
    layout: section.defaultLayout || {},
    animation_type: 'fade',
    animation_duration: 6000,
    device_visibility: { desktop: true, tablet: true, mobile: true },
    starts_at: null,
    ends_at: null,
    images: [{ url: section.fallbackImage || EMPTY_IMAGE, object_position: 'center center' }],
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function patchContent(slide: StudioSlide, patch: Partial<SectionBuilderContent>) {
  return {
    ...slide,
    content: {
      ...asRecord(slide.content),
      ...patch,
    },
  }
}

function patchEffects(slide: StudioSlide, patch: Partial<VisualEffects>) {
  const content = asRecord(slide.content) as SectionBuilderContent
  return patchContent(slide, {
    visual_effects: {
      ...(content.visual_effects || {}),
      ...patch,
    },
  })
}

function patchLayout(slide: StudioSlide, patch: Partial<SectionBuilderLayout>) {
  return {
    ...slide,
    layout: {
      ...asRecord(slide.layout),
      ...patch,
    },
  }
}

function updateStat(stats: SectionStatBlock[], statId: string, patch: Partial<SectionStatBlock>) {
  return stats.map((stat) => stat.id === statId ? { ...stat, ...patch } : stat)
}

function updateFeature(features: SectionTextBlock[], featureId: string, patch: Partial<SectionTextBlock>) {
  return features.map((feature) => feature.id === featureId ? { ...feature, ...patch } : feature)
}

function updateDeviceVisibility(value: unknown, key: 'desktop' | 'tablet' | 'mobile', checked: boolean) {
  return {
    desktop: true,
    tablet: true,
    mobile: true,
    ...asRecord(value),
    [key]: checked,
  }
}

function newStat(index: number): SectionStatBlock {
  return {
    id: `stat-${Date.now()}-${index}`,
    value: '10+',
    label_en: 'Premium Moments',
    label_ar: 'لحظات فاخرة',
    is_active: true,
  }
}

function newFeature(index: number): SectionTextBlock {
  return {
    id: `feature-${Date.now()}-${index}`,
    icon: 'coffee',
    title_en: 'Premium Detail',
    title_ar: 'تفصيلة فاخرة',
    description_en: 'Describe this visual or content point.',
    description_ar: 'اكتب وصفًا قصيرًا لهذه النقطة.',
    is_active: true,
  }
}

function statusFor(slides: StudioSlide[]) {
  if (slides.length === 0) return { en: 'Fallback', ar: 'احتياطي', className: 'bg-white/8 text-white/50' }
  if (slides.some((slide) => !slide.image_url)) return { en: 'Missing media', ar: 'صورة ناقصة', className: 'bg-red-500/12 text-red-300' }
  if (slides.some((slide) => slide.isNew)) return { en: 'Edited', ar: 'مسودة', className: 'bg-[#D6A373]/14 text-[#D6A373]' }
  if (slides.some((slide) => slide.is_active !== false)) return { en: 'Live', ar: 'مباشر', className: 'bg-emerald-500/12 text-emerald-300' }
  return { en: 'Hidden', ar: 'مخفي', className: 'bg-amber-500/12 text-amber-200' }
}

export default function MediaStudioPage() {
  const { t, language } = useLanguage()
  const [items, setItems] = useState<SiteMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activePageKey, setActivePageKey] = useState('home')
  const [activeSection, setActiveSection] = useState<WebsiteSectionConfig | null>(null)
  const [slides, setSlides] = useState<StudioSlide[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [tab, setTab] = useState<EditorTab>('content')

  const pages = useMemo(() => getWebsitePages(), [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media-studio', { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load media')
      setItems(Array.isArray(json.data) ? json.data : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to load media', 'فشل تحميل الوسائط'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const sectionGroups = useMemo(() => (
    WEBSITE_SECTIONS.map((section) => {
      const sectionSlides = items
        .filter((item) => slideBelongsToSection(item, section))
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .map(normalizeSlide)
      const activeSlides = sectionSlides.filter((slide) => slide.is_active !== false)
      return {
        section,
        slides: sectionSlides,
        activeSlides,
        preview: activeSlides[0] || sectionSlides[0] || null,
      }
    })
  ), [items])

  const visibleGroups = sectionGroups.filter(({ section }) => section.pageKey === activePageKey)
  const selectedSlide = slides.find((slide) => slide.local_id === selectedId) || slides[0] || null
  const selectedContent = activeSection && selectedSlide ? getSectionBuilderContent(activeSection, selectedSlide) : {} as SectionBuilderContent
  const selectedLayout = activeSection && selectedSlide ? getSectionBuilderLayout(activeSection, selectedSlide) : {} as SectionBuilderLayout
  const selectedFx = getVisualEffects(selectedSlide)
  const selectedImage = selectedSlide?.image_url || activeSection?.fallbackImage || EMPTY_IMAGE
  const selectedOverlay = selectedSlide ? getMediaOverlayOpacity(selectedSlide, 0.55) : 0.55

  const openSection = (section: WebsiteSectionConfig) => {
    const sectionSlides = items
      .filter((item) => slideBelongsToSection(item, section))
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map(normalizeSlide)
    const nextSlides = sectionSlides.length > 0 ? sectionSlides : [makeSlide(section, 0)]

    setActiveSection(section)
    setSlides(nextSlides)
    setSelectedId(nextSlides[0]?.local_id || null)
    setDeletedIds([])
    setTab('content')
  }

  const closeEditor = () => {
    setActiveSection(null)
    setSlides([])
    setSelectedId(null)
    setDeletedIds([])
  }

  const patchSelected = (patch: Partial<StudioSlide>) => {
    if (!selectedSlide) return
    setSlides((prev) => prev.map((slide) => slide.local_id === selectedSlide.local_id ? { ...slide, ...patch } : slide))
  }

  const replaceSelected = (nextSlide: StudioSlide) => {
    setSlides((prev) => prev.map((slide) => slide.local_id === nextSlide.local_id ? nextSlide : slide))
  }

  const addSlide = () => {
    if (!activeSection) return
    const next = makeSlide(activeSection, slides.length)
    setSlides((prev) => [...prev, next])
    setSelectedId(next.local_id)
  }

  const duplicateSlide = () => {
    if (!selectedSlide) return
    const localId = createLocalId()
    const copy: StudioSlide = {
      ...selectedSlide,
      id: localId,
      local_id: localId,
      slide_key: localId,
      isNew: true,
      sort_order: slides.length,
      is_featured: false,
    }
    setSlides((prev) => [...prev, copy])
    setSelectedId(localId)
  }

  const moveSlide = (direction: -1 | 1) => {
    if (!selectedSlide) return
    const index = slides.findIndex((slide) => slide.local_id === selectedSlide.local_id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= slides.length) return
    const next = [...slides]
    const [picked] = next.splice(index, 1)
    next.splice(target, 0, picked)
    setSlides(next.map((slide, sort_order) => ({ ...slide, sort_order })))
  }

  const removeSlide = () => {
    if (!selectedSlide) return
    if (!selectedSlide.isNew && selectedSlide.id) setDeletedIds((prev) => [...prev, selectedSlide.id!])
    const next = slides.filter((slide) => slide.local_id !== selectedSlide.local_id)
    setSlides(next)
    setSelectedId(next[0]?.local_id || null)
  }

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!activeSection || !selectedSlide) return
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('usage_area', selectedSlide.usage_area || activeSection.usageArea)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Upload failed')
      patchSelected({
        image_url: json.data.url,
        images: [{ url: json.data.url, path: json.data.path, bucket: json.data.bucket, object_position: getMediaObjectPosition(selectedSlide) }],
      })
      toast.success(t('Image uploaded', 'تم رفع الصورة'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Upload failed', 'فشل رفع الصورة'))
    } finally {
      setUploading(false)
    }
  }

  const buildPayload = (slide: StudioSlide, index: number) => {
    if (!activeSection) return {}
    const content = getSectionBuilderContent(activeSection, slide)
    const layout = getSectionBuilderLayout(activeSection, slide)
    const imageUrl = slide.image_url || activeSection.fallbackImage || EMPTY_IMAGE

    return {
      title_en: content.title_en || slide.title_en || activeSection.defaultTitleEn,
      title_ar: content.title_ar || slide.title_ar || activeSection.defaultTitleAr,
      subtitle_en: content.subtitle_en || slide.subtitle_en || activeSection.defaultSubtitleEn,
      subtitle_ar: content.subtitle_ar || slide.subtitle_ar || activeSection.defaultSubtitleAr,
      image_url: imageUrl,
      fallback_image: activeSection.fallbackImage || EMPTY_IMAGE,
      link_url: content.button_link || slide.link_url || slide.button_link || activeSection.defaultButtonLink || null,
      button_link: content.button_link || slide.button_link || slide.link_url || activeSection.defaultButtonLink || null,
      button_text_en: content.button_text_en || slide.button_text_en || null,
      button_text_ar: content.button_text_ar || slide.button_text_ar || null,
      sort_order: index,
      is_active: slide.is_active !== false,
      section_key: activeSection.key,
      slide_key: slide.slide_key || slide.local_id,
      section_type: activeSection.sectionType,
      media_type: slide.media_type || activeSection.mediaType,
      usage_area: slide.usage_area || activeSection.usageArea,
      alt_en: slide.alt_en || content.title_en || activeSection.defaultTitleEn,
      alt_ar: slide.alt_ar || content.title_ar || activeSection.defaultTitleAr,
      is_featured: index === 0 || Boolean(slide.is_featured),
      mobile_image_url: slide.mobile_image_url || null,
      overlay_opacity: Number(slide.overlay_opacity ?? 0.55),
      object_position: getMediaObjectPosition(slide),
      content,
      layout,
      animation_type: slide.animation_type || 'fade',
      animation_duration: Number(slide.animation_duration || 6000),
      device_visibility: asRecord(slide.device_visibility),
      starts_at: slide.starts_at || null,
      ends_at: slide.ends_at || null,
      images: Array.isArray(slide.images) && slide.images.length > 0
        ? slide.images
        : [{ url: imageUrl, object_position: getMediaObjectPosition(slide) }],
    }
  }

  const saveSection = async () => {
    if (!activeSection) return
    setSaving(true)
    try {
      for (const id of deletedIds) {
        const res = await fetch(`/api/admin/media-studio/${id}`, { method: 'DELETE' })
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Failed to delete media item')
      }

      for (const [index, slide] of slides.entries()) {
        const url = slide.isNew ? '/api/admin/media-studio' : `/api/admin/media-studio/${slide.id}`
        const method = slide.isNew ? 'POST' : 'PUT'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(slide, index)),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Failed to save media item')
      }

      toast.success(t('Media section saved', 'تم حفظ القسم'))
      await load()
      closeEditor()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to save section', 'فشل حفظ القسم'))
    } finally {
      setSaving(false)
    }
  }

  if (activeSection) {
    const stats = selectedContent.stats || []
    const features = selectedContent.features || []
    const sectionStatus = statusFor(slides)

    return (
      <div className="min-h-screen bg-[#0B0806] p-5 text-white">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeEditor}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:text-white"
              aria-label={t('Back', 'رجوع')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]/80">{t('Media Studio', 'استوديو الوسائط')}</p>
              <h1 className="font-serif text-2xl font-bold text-[#F5E6D8]">
                {localText(language, activeSection.labelEn, activeSection.labelAr)}
              </h1>
              <span className={cn('mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]', sectionStatus.className)}>
                {localText(language, sectionStatus.en, sectionStatus.ar)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={saveSection}
            disabled={saving || uploading}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#D6A373] px-4 text-sm font-bold text-black transition hover:bg-[#c8941a] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? t('Saving...', 'جار الحفظ...') : t('Save Section', 'حفظ القسم')}
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <aside className="rounded-3xl border border-[#D6A373]/12 bg-[#120D09]/86 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#F5E6D8]">{t('Slides & Media', 'الشرائح والصور')}</p>
                <p className="text-xs text-[#D6B79A]/45">{slides.length} {t('items', 'عنصر')}</p>
              </div>
              <button type="button" onClick={addSlide} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D6A373] text-black" aria-label={t('Add slide', 'إضافة شريحة')}>
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.local_id}
                  type="button"
                  onClick={() => setSelectedId(slide.local_id)}
                  className={cn(
                    'w-full rounded-2xl border p-2 text-start transition',
                    selectedId === slide.local_id ? 'border-[#D6A373]/55 bg-[#D6A373]/10' : 'border-white/8 bg-white/[0.03] hover:border-[#D6A373]/25',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-black">
                      <img src={slide.image_url || activeSection.fallbackImage} alt="" className="h-full w-full object-cover" style={{ objectPosition: getMediaObjectPosition(slide) }} />
                      {slide.is_active === false && <div className="absolute inset-0 bg-black/65" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#F5E6D8]">
                        {localText(language, slide.title_en, slide.title_ar) || `${t('Slide', 'شريحة')} ${index + 1}`}
                      </p>
                      <p className="mt-1 text-[10px] text-[#D6B79A]/45">#{index + 1}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => patchSelected({ is_active: selectedSlide?.is_active === false })} disabled={!selectedSlide} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 disabled:opacity-40">
                {selectedSlide?.is_active === false ? <Eye className="me-1 inline h-3.5 w-3.5" /> : <EyeOff className="me-1 inline h-3.5 w-3.5" />}
                {selectedSlide?.is_active === false ? t('Show', 'إظهار') : t('Hide', 'إخفاء')}
              </button>
              <button type="button" onClick={duplicateSlide} disabled={!selectedSlide} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 disabled:opacity-40">
                <Copy className="me-1 inline h-3.5 w-3.5" />
                {t('Duplicate', 'نسخ')}
              </button>
              <button type="button" onClick={() => moveSlide(-1)} disabled={!selectedSlide} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 disabled:opacity-40">
                <ArrowUp className="me-1 inline h-3.5 w-3.5" />
                {t('Up', 'أعلى')}
              </button>
              <button type="button" onClick={() => moveSlide(1)} disabled={!selectedSlide} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 disabled:opacity-40">
                <ArrowDown className="me-1 inline h-3.5 w-3.5" />
                {t('Down', 'أسفل')}
              </button>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-[#D6A373]/14 bg-[#050302] shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
              <div className="flex items-center justify-between border-b border-[#D6A373]/10 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D6A373]/70">{t('Live Preview', 'معاينة مباشرة')}</p>
                  <p className="text-[11px] text-[#D6B79A]/45">{t('Preview uses saved section structure and current draft values.', 'المعاينة تستخدم بنية القسم الحالية وقيم المسودة.')}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-300/70" />
              </div>

              <MediaSectionPreview
                section={activeSection}
                slide={selectedSlide}
                content={selectedContent}
                layout={selectedLayout}
                effects={selectedFx}
                image={selectedImage}
                overlay={selectedOverlay}
                language={language}
              />
            </div>
          </main>

          <aside className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-[#D6A373]/12 bg-[#120D09]/86 p-4">
            <div className="mb-4 grid grid-cols-5 gap-1 rounded-2xl border border-white/8 bg-black/24 p-1">
              {[
                { id: 'content', icon: Layers, label: t('Content', 'النصوص') },
                { id: 'image', icon: ImageIcon, label: t('Image', 'الصورة') },
                { id: 'layout', icon: Settings2, label: t('Layout', 'التخطيط') },
                { id: 'effects', icon: Sparkles, label: t('Effects', 'المؤثرات') },
                { id: 'advanced', icon: Settings2, label: t('More', 'المزيد') },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id as EditorTab)}
                    className={cn('flex h-10 items-center justify-center rounded-xl transition', tab === item.id ? 'bg-[#D6A373] text-black' : 'text-white/42 hover:text-white')}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>

            {!selectedSlide ? (
              <div className="rounded-2xl border border-white/8 bg-black/18 p-5 text-sm text-white/45">
                {t('Select or add a slide to edit.', 'اختر أو أضف شريحة للتعديل.')}
              </div>
            ) : (
              <div className="space-y-4">
                {tab === 'content' && (
                  <div className="space-y-3">
                    <TextField label="Eyebrow EN" value={selectedContent.eyebrow_en || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { eyebrow_en: value }))} />
                    <TextField label="Eyebrow AR" value={selectedContent.eyebrow_ar || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { eyebrow_ar: value }))} dir="rtl" />
                    <TextField label="Title EN" value={selectedContent.title_en || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { title_en: value }))} />
                    <TextField label="Title AR" value={selectedContent.title_ar || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { title_ar: value }))} dir="rtl" />
                    <TextArea label="Subtitle EN" value={selectedContent.subtitle_en || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { subtitle_en: value }))} />
                    <TextArea label="Subtitle AR" value={selectedContent.subtitle_ar || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { subtitle_ar: value }))} dir="rtl" />
                    <TextArea label="Body EN" value={selectedContent.body_en || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { body_en: value }))} />
                    <TextArea label="Body AR" value={selectedContent.body_ar || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { body_ar: value }))} dir="rtl" />
                    <TextField label="CTA EN" value={selectedContent.button_text_en || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { button_text_en: value }))} />
                    <TextField label="CTA AR" value={selectedContent.button_text_ar || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { button_text_ar: value }))} dir="rtl" />
                    <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Feature Cards', 'كروت التفاصيل')}</p>
                        <button
                          type="button"
                          onClick={() => replaceSelected(patchContent(selectedSlide, { features: [...features, newFeature(features.length)] }))}
                          className="rounded-lg border border-[#D6A373]/24 px-2 py-1 text-[11px] font-bold text-[#D6A373]"
                        >
                          {t('Add', 'إضافة')}
                        </button>
                      </div>
                      {features.length === 0 ? (
                        <p className="text-xs leading-relaxed text-white/40">{t('No feature cards yet. Add one when this section needs editable cards.', 'لا توجد كروت تفاصيل بعد. أضف كارتًا عندما يحتاج القسم لذلك.')}</p>
                      ) : (
                        <div className="space-y-3">
                          {features.map((feature, index) => (
                            <div key={feature.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                              <div className="mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-white/45">#{index + 1}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => replaceSelected(patchContent(selectedSlide, { features: updateFeature(features, feature.id, { is_active: feature.is_active === false }) }))}
                                    className="text-[11px] font-bold text-[#D6A373]"
                                  >
                                    {feature.is_active === false ? t('Show', 'إظهار') : t('Hide', 'إخفاء')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => replaceSelected(patchContent(selectedSlide, { features: features.filter((item) => item.id !== feature.id) }))}
                                    className="text-[11px] font-bold text-red-300"
                                  >
                                    {t('Remove', 'حذف')}
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <TextField label="Icon" value={feature.icon || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { features: updateFeature(features, feature.id, { icon: value }) }))} placeholder="coffee / leaf / award / heart" />
                                <TextField label="Title EN" value={feature.title_en || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { features: updateFeature(features, feature.id, { title_en: value }) }))} />
                                <TextField label="Title AR" value={feature.title_ar || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { features: updateFeature(features, feature.id, { title_ar: value }) }))} dir="rtl" />
                                <TextArea label="Description EN" value={feature.description_en || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { features: updateFeature(features, feature.id, { description_en: value }) }))} />
                                <TextArea label="Description AR" value={feature.description_ar || ''} onChange={(value) => replaceSelected(patchContent(selectedSlide, { features: updateFeature(features, feature.id, { description_ar: value }) }))} dir="rtl" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Stats', 'الإحصائيات')}</p>
                        <button
                          type="button"
                          onClick={() => replaceSelected(patchContent(selectedSlide, { stats: [...stats, newStat(stats.length)] }))}
                          className="rounded-lg border border-[#D6A373]/24 px-2 py-1 text-[11px] font-bold text-[#D6A373]"
                        >
                          {t('Add', 'إضافة')}
                        </button>
                      </div>
                      {stats.length === 0 ? (
                        <p className="text-xs leading-relaxed text-white/40">{t('No stats yet. Add stats for hero or highlight sections.', 'لا توجد أرقام بعد. أضف أرقامًا للواجهة أو الأقسام البارزة.')}</p>
                      ) : (
                        <div className="space-y-3">
                          {stats.map((stat) => (
                            <div key={stat.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-white/45">{stat.id}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => replaceSelected(patchContent(selectedSlide, { stats: updateStat(stats, stat.id, { is_active: stat.is_active === false }) }))}
                                    className="text-[11px] font-bold text-[#D6A373]"
                                  >
                                    {stat.is_active === false ? t('Show', 'إظهار') : t('Hide', 'إخفاء')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => replaceSelected(patchContent(selectedSlide, { stats: stats.filter((item) => item.id !== stat.id) }))}
                                    className="text-[11px] font-bold text-red-300"
                                  >
                                    {t('Remove', 'حذف')}
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <input value={stat.value} onChange={(e) => replaceSelected(patchContent(selectedSlide, { stats: updateStat(stats, stat.id, { value: e.target.value }) }))} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white outline-none" />
                                <input value={stat.label_en} onChange={(e) => replaceSelected(patchContent(selectedSlide, { stats: updateStat(stats, stat.id, { label_en: e.target.value }) }))} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white outline-none" />
                                <input dir="rtl" value={stat.label_ar} onChange={(e) => replaceSelected(patchContent(selectedSlide, { stats: updateStat(stats, stat.id, { label_ar: e.target.value }) }))} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white outline-none" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'image' && (
                  <div className="space-y-3">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D6A373]/24 bg-[#0B0806]/70 p-6 text-center transition hover:border-[#D6A373]/55">
                      {uploading ? <Loader2 className="mb-2 h-5 w-5 animate-spin text-[#D6A373]" /> : <Upload className="mb-2 h-5 w-5 text-[#D6A373]" />}
                      <span className="text-xs text-[#F5E6D8]/75">{t('Upload or replace image', 'رفع أو استبدال الصورة')}</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadImage} />
                    </label>
                    <TextField label="Image URL" value={selectedSlide.image_url || ''} onChange={(value) => patchSelected({ image_url: value })} />
                    <TextField label="Mobile Image URL" value={selectedSlide.mobile_image_url || ''} onChange={(value) => patchSelected({ mobile_image_url: value })} />
                    <TextField label="Alt EN" value={selectedSlide.alt_en || ''} onChange={(value) => patchSelected({ alt_en: value })} />
                    <TextField label="Alt AR" value={selectedSlide.alt_ar || ''} onChange={(value) => patchSelected({ alt_ar: value })} dir="rtl" />
                    <div className="grid grid-cols-2 gap-2">
                      {OBJECT_POSITION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => patchSelected({ object_position: option.value, images: [{ url: selectedImage, object_position: option.value }] })}
                          className={cn('rounded-xl border px-3 py-2 text-xs transition', getMediaObjectPosition(selectedSlide) === option.value ? 'border-[#D6A373]/55 bg-[#D6A373]/12 text-[#D6A373]' : 'border-white/8 bg-white/[0.03] text-white/52')}
                        >
                          {localText(language, option.labelEn, option.labelAr)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'layout' && (
                  <div className="space-y-4">
                    <RangeField label={t('Overlay', 'التعتيم')} value={Number(selectedSlide.overlay_opacity ?? 0.55)} min={0} max={0.9} step={0.05} onChange={(value) => patchSelected({ overlay_opacity: value })} />
                    <RangeField label={t('Animation Duration', 'مدة الحركة')} value={Number(selectedSlide.animation_duration || 6000)} min={2000} max={12000} step={500} onChange={(value) => patchSelected({ animation_duration: value })} suffix="ms" />
                    <RangeField label="Text X" value={Number(selectedLayout.textPosition?.x || 0)} min={-120} max={120} step={2} onChange={(value) => replaceSelected(patchLayout(selectedSlide, { textPosition: { ...(selectedLayout.textPosition || {}), x: value } }))} suffix="px" />
                    <RangeField label="Text Y" value={Number(selectedLayout.textPosition?.y || 0)} min={-120} max={120} step={2} onChange={(value) => replaceSelected(patchLayout(selectedSlide, { textPosition: { ...(selectedLayout.textPosition || {}), y: value } }))} suffix="px" />
                    <RangeField label="Eyebrow Scale" value={Number(selectedContent.eyebrow_scale || 1)} min={0.75} max={1.2} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { eyebrow_scale: value }))} />
                    <RangeField label="Title Scale" value={Number(selectedContent.title_scale || 1)} min={0.75} max={1.25} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { title_scale: value }))} />
                    <RangeField label="Subtitle Scale" value={Number(selectedContent.subtitle_scale || 1)} min={0.75} max={1.15} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { subtitle_scale: value }))} />
                    <RangeField label="Stats Scale" value={Number(selectedContent.stats_scale || 1)} min={0.75} max={1.2} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { stats_scale: value }))} />
                  </div>
                )}

                {tab === 'effects' && (
                  <div className="space-y-4">
                    <TextField label="Overlay Color" value={selectedFx.overlay_color || ''} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { overlay_color: value }))} placeholder="#0B0806" />
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'solid', label: 'Solid' },
                        { value: 'radial', label: 'Radial' },
                        { value: 'top_bottom', label: 'Top/Bottom' },
                        { value: 'vignette_only', label: 'Vignette' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => replaceSelected(patchEffects(selectedSlide, { gradient_type: option.value as VisualEffects['gradient_type'] }))}
                          className={cn('rounded-xl border px-3 py-2 text-xs transition', (selectedFx.gradient_type || 'solid') === option.value ? 'border-[#D6A373]/55 bg-[#D6A373]/12 text-[#D6A373]' : 'border-white/8 bg-white/[0.03] text-white/52')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <RangeField label="Brightness" value={Number(selectedFx.brightness ?? 1)} min={0.5} max={1.4} step={0.05} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { brightness: value }))} />
                    <RangeField label="Contrast" value={Number(selectedFx.contrast ?? 1)} min={0.5} max={1.5} step={0.05} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { contrast: value }))} />
                    <RangeField label="Saturation" value={Number(selectedFx.saturation ?? 1)} min={0.5} max={1.6} step={0.05} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { saturation: value }))} />
                    <RangeField label="Warmth" value={Number(selectedFx.warmth ?? 0)} min={0} max={0.7} step={0.05} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { warmth: value }))} />
                    <RangeField label="Blur" value={Number(selectedFx.blur ?? 0)} min={0} max={8} step={0.5} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { blur: value }))} suffix="px" />
                    <RangeField label="Glow" value={Number(selectedFx.glow ?? 0)} min={0} max={0.35} step={0.01} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { glow: value }))} />
                    <RangeField label="Vignette" value={Number(selectedFx.vignette ?? 0)} min={0} max={0.9} step={0.05} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { vignette: value }))} />
                    <RangeField label="Grain" value={Number(selectedFx.grain ?? 0)} min={0} max={0.3} step={0.01} onChange={(value) => replaceSelected(patchEffects(selectedSlide, { grain: value }))} />
                  </div>
                )}

                {tab === 'advanced' && (
                  <div className="space-y-3">
                    <TextField label="Button Link" value={selectedContent.button_link || selectedSlide.button_link || selectedSlide.link_url || ''} onChange={(value) => replaceSelected(patchContent({ ...selectedSlide, button_link: value, link_url: value }, { button_link: value }))} />
                    <TextField label="Usage Area" value={selectedSlide.usage_area || ''} onChange={(value) => patchSelected({ usage_area: value })} />
                    <TextField label="Section Key" value={selectedSlide.section_key || ''} onChange={(value) => patchSelected({ section_key: value })} />
                    <TextField label="Start Date" type="datetime-local" value={String(selectedSlide.starts_at || '')} onChange={(value) => patchSelected({ starts_at: value })} />
                    <TextField label="End Date" type="datetime-local" value={String(selectedSlide.ends_at || '')} onChange={(value) => patchSelected({ ends_at: value })} />
                    <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Device Visibility', 'الظهور حسب الجهاز')}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'desktop', label: t('Desktop', 'ديسكتوب') },
                          { key: 'tablet', label: t('Tablet', 'تابلت') },
                          { key: 'mobile', label: t('Mobile', 'موبايل') },
                        ].map((device) => (
                          <label key={device.key} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2 text-xs text-white/62">
                            <input
                              type="checkbox"
                              checked={asRecord(selectedSlide.device_visibility)[device.key] !== false}
                              onChange={(event) => patchSelected({ device_visibility: updateDeviceVisibility(selectedSlide.device_visibility, device.key as 'desktop' | 'tablet' | 'mobile', event.target.checked) })}
                              className="accent-[#D6A373]"
                            />
                            {device.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={removeSlide} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/16">
                      <Trash2 className="h-4 w-4" />
                      {t('Delete Slide', 'حذف الشريحة')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0806] p-6 text-white">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#D6A373]/75">{t('Media Studio', 'استوديو الوسائط')}</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#F5E6D8]">{t('Site Images & Text Control', 'التحكم في صور ونصوص الموقع')}</h1>
          <p className="mt-1 text-sm text-[#D6B79A]/55">{t('Manage every visual section from one clean workspace.', 'تحكم في كل أقسام الموقع المرئية من مساحة عمل واحدة.')}</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/62 transition hover:text-white disabled:opacity-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          {t('Refresh', 'تحديث')}
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-[#D6A373]/10 bg-[#120D09]/70 p-2">
        {pages.map((page) => {
          const active = activePageKey === page.key
          return (
            <button
              key={page.key}
              type="button"
              onClick={() => setActivePageKey(page.key)}
              className={cn('shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition', active ? 'bg-[#D6A373] text-black' : 'text-[#D6B79A]/60 hover:bg-white/[0.04] hover:text-[#F5E6D8]')}
            >
              {localText(language, page.labelEn, page.labelAr)}
              <span className={cn('ms-2 text-xs', active ? 'text-black/55' : 'text-white/30')}>{page.sections.length}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-3xl border border-[#D6A373]/8 bg-[#180d04]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleGroups.map(({ section, slides: sectionSlides, activeSlides, preview }) => {
            const image = preview?.image_url || section.fallbackImage || EMPTY_IMAGE
            const status = statusFor(sectionSlides)
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => openSection(section)}
                className="group relative overflow-hidden rounded-3xl border border-[#D6A373]/12 bg-[#120D09] text-start shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#D6A373]/35 hover:shadow-[0_28px_90px_rgba(214,163,115,0.12)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={image} alt="" className="h-full w-full object-cover opacity-82 transition duration-700 group-hover:scale-105 group-hover:opacity-100" style={{ objectPosition: preview ? getMediaObjectPosition(preview) : 'center center' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120D09] via-[#120D09]/42 to-transparent" />
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D6A373]/78">{localText(language, section.pageLabelEn, section.pageLabelAr)} · {section.sectionType.replaceAll('_', ' ')}</p>
                    <h2 className="mt-3 font-serif text-2xl font-bold text-[#F5E6D8]">{localText(language, section.labelEn, section.labelAr)}</h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#D6B79A]/58">{localText(language, section.descriptionEn, section.descriptionAr)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em]', status.className)}>
                      {localText(language, status.en, status.ar)}
                    </span>
                    <span className="text-xs text-[#D6B79A]/42">{activeSlides.length || sectionSlides.length} {t('items', 'عنصر')}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-sm font-bold text-[#D6A373]">
                    {t('Edit visually', 'تعديل بصري')}
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MediaSectionPreview({
  section,
  slide,
  content,
  layout,
  effects,
  image,
  overlay,
  language,
}: {
  section: WebsiteSectionConfig
  slide: StudioSlide | null
  content: SectionBuilderContent
  layout: SectionBuilderLayout
  effects: VisualEffects
  image: string
  overlay: number
  language: 'en' | 'ar'
}) {
  const isRtl = language === 'ar'
  const activeStats = (content.stats || []).filter((stat) => stat.is_active !== false)
  const activeFeatures = (content.features || []).filter((feature) => feature.is_active !== false)
  const textPosition = layout.textPosition || {}
  const titleScale = Math.min(1.25, Math.max(0.75, Number(content.title_scale || 1)))
  const subtitleScale = Math.min(1.15, Math.max(0.75, Number(content.subtitle_scale || 1)))
  const eyebrowScale = Math.min(1.2, Math.max(0.75, Number(content.eyebrow_scale || 1)))
  const statsScale = Math.min(1.2, Math.max(0.75, Number(content.stats_scale || 1)))
  const transform = `translate(${Number(textPosition.x || 0)}px, ${Number(textPosition.y || 0)}px)`
  const filter = buildEffectsFilter(effects)
  const overlayBackground = buildOverlayGradient(effects.gradient_type, effects.overlay_color, overlay)
  const title = localText(language, content.title_en, content.title_ar) || localText(language, section.defaultTitleEn, section.defaultTitleAr)
  const subtitle = localText(language, content.subtitle_en, content.subtitle_ar) || localText(language, section.defaultSubtitleEn, section.defaultSubtitleAr)
  const body = localText(language, content.body_en, content.body_ar)
  const buttonText = localText(language, content.button_text_en, content.button_text_ar) || localText(language, section.defaultButtonTextEn, section.defaultButtonTextAr)
  const objectPosition = slide ? getMediaObjectPosition(slide) : 'center center'

  const background = (
    <>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition, filter: filter || undefined }}
      />
      <div className="absolute inset-0" style={{ background: overlayBackground }} />
      {Number(effects.vignette || 0) > 0.05 && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,${Number(effects.vignette).toFixed(2)}) 100%)` }} />
      )}
      {Number(effects.glow || 0) > 0.05 && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 20%, rgba(214,163,115,${Number(effects.glow).toFixed(2)}) 0%, transparent 68%)` }} />
      )}
      {Number(effects.grain || 0) > 0.05 && (
        <div className="absolute inset-0 mix-blend-screen" style={{ opacity: Number(effects.grain), backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px' }} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B0806] to-transparent" />
    </>
  )

  const copyBlock = (
    <div
      className={cn('max-w-xl', isRtl ? 'text-right' : 'text-left')}
      style={{ transform }}
    >
      {content.eyebrow_en || content.eyebrow_ar ? (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]" style={{ transform: `scale(${eyebrowScale})`, transformOrigin: isRtl ? 'top right' : 'top left' }}>
          {localText(language, content.eyebrow_en, content.eyebrow_ar)}
        </p>
      ) : null}
      <h2 className="font-serif text-4xl font-bold leading-tight text-[#F5E6D8] md:text-6xl" style={{ transform: `scale(${titleScale})`, transformOrigin: isRtl ? 'top right' : 'top left' }}>
        {title}
      </h2>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-[#D6B79A]/82" style={{ transform: `scale(${subtitleScale})`, transformOrigin: isRtl ? 'top right' : 'top left' }}>
        {body || subtitle}
      </p>
      {(buttonText || section.supportsCta) && (
        <div className="mt-7 inline-flex rounded-xl bg-[#D6A373] px-6 py-3 text-sm font-bold text-black">
          {buttonText || localText(language, 'Shop Now', 'تسوق الآن')}
        </div>
      )}
      {activeStats.length > 0 && (
        <div className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-[#D6A373]/20 pt-5" style={{ transform: `scale(${statsScale})`, transformOrigin: isRtl ? 'top right' : 'top left' }}>
          {activeStats.slice(0, 3).map((stat) => (
            <div key={stat.id}>
              <p dir="ltr" className="font-serif text-2xl font-bold text-[#D6A373]">{stat.value}</p>
              <p className={cn('mt-1 text-[10px] text-[#F5E6D8]/50', isRtl ? 'tracking-normal' : 'uppercase tracking-[0.16em]')}>
                {localText(language, stat.label_en, stat.label_ar)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (section.sectionType === 'split_content') {
    return (
      <div className="relative min-h-[560px] overflow-hidden bg-[#0B0806] p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(214,163,115,0.08),transparent_70%)]" />
        <div className="relative grid min-h-[500px] items-center gap-8 lg:grid-cols-2">
          <div className={cn(isRtl && 'lg:order-2')}>{copyBlock}</div>
          <div className="relative min-h-[340px] overflow-hidden rounded-3xl border border-[#D6A373]/18 bg-black">
            {background}
          </div>
        </div>
      </div>
    )
  }

  if (section.editorTemplate === 'cards' || section.editorTemplate === 'text_cards') {
    return (
      <div className="relative min-h-[560px] overflow-hidden bg-[#0B0806] p-6 md:p-10">
        {background}
        <div className="relative z-10">
          <div className={cn('mb-8 max-w-2xl', isRtl ? 'ms-auto text-right' : 'text-left')}>{copyBlock}</div>
          <div className="grid gap-4 md:grid-cols-3">
            {(activeFeatures.length > 0 ? activeFeatures : activeStats.map((stat) => ({
              id: stat.id,
              title_en: stat.value,
              title_ar: stat.value,
              description_en: stat.label_en,
              description_ar: stat.label_ar,
            }))).slice(0, 3).map((feature) => (
              <div key={feature.id} className="min-h-32 rounded-2xl border border-[#D6A373]/14 bg-[#120D09]/82 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                <p className="font-serif text-xl font-bold text-[#F5E6D8]">{localText(language, feature.title_en, feature.title_ar)}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#D6B79A]/62">{localText(language, feature.description_en, feature.description_ar)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[560px] overflow-hidden bg-[#0B0806]">
      {background}
      <div className={cn('relative z-10 flex min-h-[560px] items-center p-7 md:p-12', isRtl ? 'justify-end text-right' : 'justify-start text-left')}>
        {copyBlock}
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  dir,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  dir?: 'rtl' | 'ltr'
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D6A373]/70">{label}</span>
      <input
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm text-[#F5E6D8] outline-none transition focus:border-[#D6A373]/45"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  dir,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  dir?: 'rtl' | 'ltr'
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D6A373]/70">{label}</span>
      <textarea
        dir={dir}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm leading-relaxed text-[#F5E6D8] outline-none transition focus:border-[#D6A373]/45"
      />
    </label>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-[11px] text-white/48">
        <span>{label}</span>
        <span>{value}{suffix || ''}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#D6A373]"
      />
    </label>
  )
}
