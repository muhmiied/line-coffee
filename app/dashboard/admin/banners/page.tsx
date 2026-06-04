'use client'

import { ChangeEvent, useEffect, useMemo, useState, type FocusEvent as ReactFocusEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
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

type EditorTab = 'content' | 'image' | 'effects' | 'motion' | 'layout' | 'advanced'
type EditorHistorySnapshot = {
  slides: StudioSlide[]
  selectedId: string | null
  deletedIds: string[]
}

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
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'ar'>(language)
  const [history, setHistory] = useState<EditorHistorySnapshot[]>([])

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
    setPreviewLanguage(language)
    setHistory([])
  }

  const closeEditor = () => {
    setActiveSection(null)
    setSlides([])
    setSelectedId(null)
    setDeletedIds([])
    setHistory([])
  }

  const pushHistory = () => {
    setHistory((prev) => [...prev.slice(-29), { slides, selectedId, deletedIds }])
  }

  const undoLast = () => {
    const snapshot = history[history.length - 1]
    if (!snapshot) return
    setSlides(snapshot.slides)
    setSelectedId(snapshot.selectedId)
    setDeletedIds(snapshot.deletedIds)
    setHistory((prev) => prev.slice(0, -1))
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!activeSection || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
      if ((document.activeElement as HTMLElement | null)?.isContentEditable) return
      event.preventDefault()
      undoLast()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeSection, history])

  const patchSelected = (patch: Partial<StudioSlide>, remember = true) => {
    if (!selectedSlide) return
    if (remember) pushHistory()
    setSlides((prev) => prev.map((slide) => slide.local_id === selectedSlide.local_id ? { ...slide, ...patch } : slide))
  }

  const replaceSelected = (nextSlide: StudioSlide, remember = true) => {
    if (remember) pushHistory()
    setSlides((prev) => prev.map((slide) => slide.local_id === nextSlide.local_id ? nextSlide : slide))
  }

  const addSlide = () => {
    if (!activeSection) return
    const next = makeSlide(activeSection, slides.length)
    pushHistory()
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
    pushHistory()
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
    pushHistory()
    setSlides(next.map((slide, sort_order) => ({ ...slide, sort_order })))
  }

  const removeSlide = () => {
    if (!selectedSlide) return
    pushHistory()
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
      <div className="min-h-screen bg-[#0B0806] p-4 text-white lg:p-5">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={undoLast}
              disabled={history.length === 0}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-[#F5E6D8]/72 transition hover:border-[#D6A373]/35 hover:text-[#F5E6D8] disabled:opacity-35"
              title={t('Undo last change (Ctrl+Z)', 'تراجع عن آخر تعديل (Ctrl+Z)')}
            >
              <RotateCcw className="h-4 w-4" />
              {t('Undo', 'تراجع')}
            </button>
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
        </div>
        <div className="mb-4 flex w-fit rounded-2xl border border-[#D6A373]/14 bg-[#120D09]/80 p-1">
          {[
            { value: 'en', label: 'EN' },
            { value: 'ar', label: 'AR' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPreviewLanguage(item.value as 'en' | 'ar')}
              className={cn('rounded-xl px-4 py-2 text-sm font-bold transition', previewLanguage === item.value ? 'bg-[#D6A373] text-black' : 'text-[#D6B79A]/58 hover:text-[#F5E6D8]')}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          <aside className="order-2 rounded-3xl border border-[#D6A373]/12 bg-[#120D09]/86 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#F5E6D8]">{t('Slides & Media', 'الشرائح والصور')}</p>
                <p className="text-xs text-[#D6B79A]/45">{slides.length} {t('items', 'عنصر')}</p>
              </div>
              <button type="button" onClick={addSlide} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D6A373] text-black" aria-label={t('Add slide', 'إضافة شريحة')}>
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {slides.map((slide, index) => (
                <button
                  key={slide.local_id}
                  type="button"
                  onClick={() => setSelectedId(slide.local_id)}
                  className={cn(
                    'w-[260px] shrink-0 rounded-2xl border p-2 text-start transition',
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

            <div className="mt-4 grid gap-2 sm:grid-cols-5">
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
              <button type="button" onClick={removeSlide} disabled={!selectedSlide} className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300 disabled:opacity-40">
                <Trash2 className="me-1 inline h-3.5 w-3.5" />
                {t('Delete', 'حذف')}
              </button>
            </div>
          </aside>

          <main className="order-1 -mx-2 min-w-0 lg:-mx-3">
            <div className="overflow-hidden rounded-2xl border border-[#D6A373]/14 bg-[#050302] shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
              <HeroLikeMediaPreview
                section={activeSection}
                slide={selectedSlide}
                content={selectedContent}
                layout={selectedLayout}
                effects={selectedFx}
                image={selectedImage}
                overlay={selectedOverlay}
                language={previewLanguage}
                onContentPatch={(patch) => {
                  if (!selectedSlide) return
                  replaceSelected(patchContent(selectedSlide, patch))
                }}
                onStatPatch={(statId, patch) => {
                  if (!selectedSlide) return
                  replaceSelected(patchContent(selectedSlide, { stats: updateStat(stats, statId, patch) }))
                }}
                onFeaturePatch={(featureId, patch) => {
                  if (!selectedSlide) return
                  replaceSelected(patchContent(selectedSlide, { features: updateFeature(features, featureId, patch) }))
                }}
                onBeforeEdit={pushHistory}
                onTextPositionChange={(x, y) => {
                  if (!selectedSlide) return
                  replaceSelected(patchLayout(selectedSlide, { textPosition: { ...(selectedLayout.textPosition || {}), x, y } }), false)
                }}
                onElementPositionChange={(elementId, x, y) => {
                  if (!selectedSlide) return
                  const els = (selectedLayout.elements || {}) as Record<string, { x?: number; y?: number }>
                  const cur = els[elementId] || {}
                  replaceSelected(patchLayout(selectedSlide, { elements: { ...els, [elementId]: { ...cur, x, y } } as Record<string, { x?: number; y?: number }> }), false)
                }}
                onElementToggle={(elementId) => {
                  if (!selectedSlide) return
                  const current = selectedContent.hidden_elements || []
                  const idx = current.indexOf(elementId)
                  const next = idx >= 0 ? current.filter((id) => id !== elementId) : [...current, elementId]
                  replaceSelected(patchContent(selectedSlide, { hidden_elements: next }))
                }}
                onElementWidthChange={(key, width) => {
                  if (!selectedSlide) return
                  replaceSelected(patchContent(selectedSlide, { [key]: width } as Partial<SectionBuilderContent>), false)
                }}
                onElementScaleChange={(key, scale) => {
                  if (!selectedSlide) return
                  replaceSelected(patchContent(selectedSlide, { [key]: scale } as Partial<SectionBuilderContent>), false)
                }}
              />
            </div>
          </main>

          <aside className="order-3 rounded-3xl border border-[#D6A373]/12 bg-[#120D09]/86 p-4">
            <div className="mb-4 grid max-w-3xl grid-cols-5 gap-1 rounded-2xl border border-white/8 bg-black/24 p-1">
              {[
                { id: 'content', icon: Layers, label: t('Text', 'النص') },
                { id: 'image', icon: ImageIcon, label: t('Image', 'الصورة') },
                { id: 'effects', icon: Sparkles, label: t('Effects', 'المؤثرات') },
                { id: 'motion', icon: Sparkles, label: t('Animation', 'الحركة') },
                { id: 'layout', icon: Settings2, label: t('Frame', 'الإطار') },
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
              <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
                {tab === 'content' && (
                  <div className="space-y-3">
                    {/* Element visibility toggles */}
                    <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Show / Hide Elements', 'إظهار / إخفاء العناصر')}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'eyebrow', labelEn: 'Eyebrow', labelAr: 'عنوان صغير' },
                          { id: 'title', labelEn: 'Title', labelAr: 'العنوان' },
                          { id: 'subtitle', labelEn: 'Subtitle', labelAr: 'النص الفرعي' },
                          { id: 'buttons', labelEn: 'Buttons', labelAr: 'الأزرار' },
                          { id: 'stats', labelEn: 'Stats', labelAr: 'الأرقام' },
                        ].map((el) => {
                          const hidden = (selectedContent.hidden_elements || []).includes(el.id)
                          return (
                            <button
                              key={el.id}
                              type="button"
                              onClick={() => {
                                const current = selectedContent.hidden_elements || []
                                const idx = current.indexOf(el.id)
                                const next = idx >= 0 ? current.filter((id) => id !== el.id) : [...current, el.id]
                                replaceSelected(patchContent(selectedSlide, { hidden_elements: next }))
                              }}
                              className={cn('rounded-xl border px-2 py-2 text-xs font-bold transition', hidden ? 'border-red-400/30 bg-red-400/10 text-red-300' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300')}
                            >
                              {hidden ? '× ' : '✓ '}{localText(language, el.labelEn, el.labelAr)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
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
                    <RangeField label="Text X" value={Number(selectedLayout.textPosition?.x || 0)} min={-120} max={120} step={2} onChange={(value) => replaceSelected(patchLayout(selectedSlide, { textPosition: { ...(selectedLayout.textPosition || {}), x: value } }))} suffix="px" />
                    <RangeField label="Text Y" value={Number(selectedLayout.textPosition?.y || 0)} min={-120} max={120} step={2} onChange={(value) => replaceSelected(patchLayout(selectedSlide, { textPosition: { ...(selectedLayout.textPosition || {}), y: value } }))} suffix="px" />
                    <RangeField label="Text Width" value={Number(selectedContent.text_width || 704)} min={360} max={920} step={20} onChange={(value) => replaceSelected(patchContent(selectedSlide, { text_width: value }))} suffix="px" />
                    <RangeField label="Eyebrow Scale" value={Number(selectedContent.eyebrow_scale || 1)} min={0.65} max={1.35} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { eyebrow_scale: value }))} />
                    <RangeField label="Title Scale" value={Number(selectedContent.title_scale || 1)} min={0.65} max={1.45} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { title_scale: value }))} />
                    <RangeField label="Subtitle Scale" value={Number(selectedContent.subtitle_scale || 1)} min={0.65} max={1.3} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { subtitle_scale: value }))} />
                    <RangeField label="Stats Scale" value={Number(selectedContent.stats_scale || 1)} min={0.65} max={1.3} step={0.05} onChange={(value) => replaceSelected(patchContent(selectedSlide, { stats_scale: value }))} />
                  </div>
                )}

                {tab === 'effects' && (
                  <div className="space-y-4">
                    <RangeField label={t('Overlay', 'التعتيم')} value={Number(selectedSlide.overlay_opacity ?? 0.55)} min={0} max={0.9} step={0.05} onChange={(value) => patchSelected({ overlay_opacity: value })} />
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

                {tab === 'motion' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Image Animation', 'حركة الصورة')}</p>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                        {[
                          { value: 'none', label: t('None', 'بدون') },
                          { value: 'fade', label: t('Fade', 'تلاشي') },
                          { value: 'slow_zoom', label: t('Zoom', 'تكبير') },
                          { value: 'pan_left', label: t('Pan Left', 'تحريك يسار') },
                          { value: 'pan_right', label: t('Pan Right', 'تحريك يمين') },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => patchSelected({ animation_type: option.value })}
                            className={cn('rounded-xl border px-3 py-2 text-xs transition', (selectedSlide.animation_type || 'fade') === option.value ? 'border-[#D6A373]/55 bg-[#D6A373]/12 text-[#D6A373]' : 'border-white/8 bg-white/[0.03] text-white/52')}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Text Animation', 'حركة النص')}</p>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {[
                          { value: 'none', label: t('None', 'بدون') },
                          { value: 'fade_up', label: t('Fade Up', 'ظهور لأعلى') },
                          { value: 'slide_in', label: t('Slide In', 'دخول جانبي') },
                          { value: 'soft_zoom', label: t('Soft Zoom', 'تكبير ناعم') },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => replaceSelected(patchContent(selectedSlide, { text_animation: option.value as SectionBuilderContent['text_animation'] }))}
                            className={cn('rounded-xl border px-3 py-2 text-xs transition', (selectedContent.text_animation || 'fade_up') === option.value ? 'border-[#D6A373]/55 bg-[#D6A373]/12 text-[#D6A373]' : 'border-white/8 bg-white/[0.03] text-white/52')}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <RangeField label={t('Animation Duration', 'مدة الحركة')} value={Number(selectedSlide.animation_duration || 6000)} min={1200} max={12000} step={300} onChange={(value) => patchSelected({ animation_duration: value })} suffix="ms" />
                    <RangeField label={t('Text Duration', 'مدة حركة النص')} value={Number(selectedContent.text_animation_duration || 900)} min={300} max={3000} step={100} onChange={(value) => replaceSelected(patchContent(selectedSlide, { text_animation_duration: value }))} suffix="ms" />
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
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={load} disabled={loading} className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/62 transition hover:text-white disabled:opacity-50">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            {t('Refresh', 'تحديث')}
          </button>
        </div>
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

function HeroLikeMediaPreview({
  section,
  slide,
  content,
  layout,
  effects,
  image,
  overlay,
  language,
  onContentPatch,
  onStatPatch,
  onFeaturePatch,
  onBeforeEdit,
  onTextPositionChange,
  onElementPositionChange,
  onElementToggle,
  onElementWidthChange,
  onElementScaleChange,
}: {
  section: WebsiteSectionConfig
  slide: StudioSlide | null
  content: SectionBuilderContent
  layout: SectionBuilderLayout
  effects: VisualEffects
  image: string
  overlay: number
  language: 'en' | 'ar'
  onContentPatch?: (patch: Partial<SectionBuilderContent>) => void
  onStatPatch?: (statId: string, patch: Partial<SectionStatBlock>) => void
  onFeaturePatch?: (featureId: string, patch: Partial<SectionTextBlock>) => void
  onBeforeEdit?: () => void
  onTextPositionChange?: (x: number, y: number) => void
  onElementPositionChange?: (elementId: string, x: number, y: number) => void
  onElementToggle?: (elementId: string) => void
  onElementWidthChange?: (key: keyof SectionBuilderContent, width: number) => void
  onElementScaleChange?: (key: keyof SectionBuilderContent, scale: number) => void
}) {
  const isRtl = language === 'ar'
  const textPosition = layout.textPosition || {}
  const elementPos = (id: string) => {
    const pos = (layout.elements || {})[id]
    return pos ? { x: Number(pos.x || 0), y: Number(pos.y || 0) } : { x: 0, y: 0 }
  }
  const hidden = content.hidden_elements || []
  const isHidden = (id: string) => hidden.includes(id)
  const titleScale = Math.min(1.45, Math.max(0.65, Number(content.title_scale || 1)))
  const subtitleScale = Math.min(1.3, Math.max(0.65, Number(content.subtitle_scale || 1)))
  const bodyScale = Math.min(1.3, Math.max(0.65, Number(content.body_scale || 1)))
  const eyebrowScale = Math.min(1.35, Math.max(0.65, Number(content.eyebrow_scale || 1)))
  const buttonScale = Math.min(1.3, Math.max(0.65, Number(content.button_scale || 1)))
  const secondaryButtonScale = Math.min(1.3, Math.max(0.65, Number(content.secondary_button_scale || 1)))
  const statsScale = Math.min(1.3, Math.max(0.65, Number(content.stats_scale || 1)))
  const activeStats = (content.stats || []).filter((stat) => stat.is_active !== false)
  const activeFeatures = (content.features || []).filter((feature) => feature.is_active !== false)
  const statsAreFeatureCards = activeStats.length === 0
  const previewStats = activeStats.length > 0
    ? activeStats
    : activeFeatures.slice(0, 3).map((feature) => ({
      id: feature.id,
      value: feature.icon || '*',
      label_en: feature.title_en,
      label_ar: feature.title_ar,
    }))
  const sameText = (first?: string | null, second?: string | null) => String(first || '').trim().toLowerCase() === String(second || '').trim().toLowerCase()
  const previewText = (
    key: 'eyebrow' | 'title' | 'subtitle' | 'body' | 'button_text' | 'secondary_button_text',
    fallbackEn = '',
    fallbackAr = '',
  ) => {
    const en = String(content[`${key}_en` as keyof SectionBuilderContent] || '')
    const ar = String(content[`${key}_ar` as keyof SectionBuilderContent] || '')
    if (language === 'ar') return ar && !sameText(ar, en) ? ar : fallbackAr || ar || ''
    return en || fallbackEn || ar || ''
  }
  const statLabel = (stat: SectionStatBlock, index: number) => {
    const arabicDefaults = ['مصادر مختارة', 'عملاء سعداء', 'حبوب أرابيكا']
    if (language === 'ar' && (!stat.label_ar || sameText(stat.label_ar, stat.label_en))) return arabicDefaults[index] || stat.label_ar || stat.label_en
    return localText(language, stat.label_en, stat.label_ar)
  }
  const title = previewText('title', section.defaultTitleEn, section.defaultTitleAr) || localText(language, section.defaultTitleEn, section.defaultTitleAr)
  const subtitle = previewText('subtitle', section.defaultSubtitleEn, section.defaultSubtitleAr) || localText(language, section.defaultSubtitleEn, section.defaultSubtitleAr)
  const body = previewText('body')
  const buttonText = previewText('button_text', section.defaultButtonTextEn || 'Shop Now', section.defaultButtonTextAr || 'تسوق القهوة') || localText(language, section.defaultButtonTextEn, section.defaultButtonTextAr)
  const secondaryButtonText = previewText('secondary_button_text', 'Our Story', 'قصتنا') || localText(language, 'Our Story', 'قصتنا')
  const eyebrowText = previewText('eyebrow', String(content.eyebrow_en || ''), String(content.eyebrow_ar || ''))
  const showEyebrow = Boolean(eyebrowText) && !['line coffee', 'لاين كوفي'].includes(eyebrowText.trim().toLowerCase())
  const filter = buildEffectsFilter(effects)
  const overlayBackground = buildOverlayGradient(effects.gradient_type, effects.overlay_color, overlay)
  const objectPosition = slide ? getMediaObjectPosition(slide) : 'center center'
  const imageAnimation = slide?.animation_type || 'fade'
  const imageAnimationDuration = `${Number(slide?.animation_duration || 6000)}ms`
  const textAnimation = content.text_animation || 'fade_up'
  const textAnimationDuration = `${Number(content.text_animation_duration || 900)}ms`
  const textWidth = Math.min(920, Math.max(360, Number(content.text_width || 560)))
  const fieldName = (base: 'eyebrow' | 'title' | 'subtitle' | 'body' | 'button_text' | 'secondary_button_text') => `${base}_${language}` as keyof SectionBuilderContent
  const imageAnimationName = imageAnimation === 'slow_zoom'
    ? 'mediaStudioImageZoom'
    : imageAnimation === 'pan_left'
      ? 'mediaStudioImagePanLeft'
      : imageAnimation === 'pan_right'
        ? 'mediaStudioImagePanRight'
        : imageAnimation === 'fade'
          ? 'mediaStudioImageFade'
          : undefined
  const textAnimationName = textAnimation === 'fade_up'
    ? 'mediaStudioTextFadeUp'
    : textAnimation === 'slide_in'
      ? (isRtl ? 'mediaStudioTextSlideRight' : 'mediaStudioTextSlideLeft')
      : textAnimation === 'soft_zoom'
        ? 'mediaStudioTextZoom'
        : undefined

  const handleFramePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!onTextPositionChange) return
    event.preventDefault()
    onBeforeEdit?.()
    const startX = event.clientX
    const startY = event.clientY
    const initialX = Number(textPosition.x || 0)
    const initialY = Number(textPosition.y || 0)
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
    const move = (moveEvent: PointerEvent) => {
      onTextPositionChange(
        clamp(initialX + moveEvent.clientX - startX, -220, 220),
        clamp(initialY + moveEvent.clientY - startY, -160, 160),
      )
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const handleElementPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    elementId: string,
    currentX: number,
    currentY: number,
  ) => {
    if (!onElementPositionChange) return
    event.preventDefault()
    event.stopPropagation()
    onBeforeEdit?.()
    const startX = event.clientX
    const startY = event.clientY
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
    const move = (moveEvent: PointerEvent) => {
      onElementPositionChange(
        elementId,
        clamp(currentX + moveEvent.clientX - startX, -300, 300),
        clamp(currentY + moveEvent.clientY - startY, -200, 200),
      )
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const handleWidthPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    key: keyof SectionBuilderContent,
    currentWidth: number,
    minWidth = 220,
    maxWidth = 920,
  ) => {
    if (!onElementWidthChange) return
    event.preventDefault()
    event.stopPropagation()
    onBeforeEdit?.()
    const startX = event.clientX
    const initialWidth = currentWidth
    const clamp = (value: number) => Math.min(maxWidth, Math.max(minWidth, value))
    const move = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX
      onElementWidthChange(key, clamp(initialWidth + (isRtl ? -delta : delta)))
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const handleScalePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, key: keyof SectionBuilderContent, currentScale: number) => {
    if (!onElementScaleChange) return
    event.preventDefault()
    event.stopPropagation()
    onBeforeEdit?.()
    const startX = event.clientX
    const startY = event.clientY
    const initialScale = currentScale
    const clamp = (value: number) => Math.min(1.45, Math.max(0.65, value))
    const move = (moveEvent: PointerEvent) => {
      const delta = ((moveEvent.clientX - startX) + (moveEvent.clientY - startY)) / 260
      onElementScaleChange(key, clamp(initialScale + delta))
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const editable = (
    key: keyof SectionBuilderContent,
    fallback: string,
    patchKey: keyof SectionBuilderContent = key,
  ) => ({
    contentEditable: true,
    suppressContentEditableWarning: true,
    dir: isRtl ? 'rtl' : 'ltr',
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => event.stopPropagation(),
    onBlur: (event: ReactFocusEvent<HTMLElement>) => onContentPatch?.({ [patchKey]: event.currentTarget.textContent || '' } as Partial<SectionBuilderContent>),
    children: String(fallback || content[key] || ''),
  })

  const editableText = (
    id: string,
    node: ReactNode,
    widthKey: keyof SectionBuilderContent,
    scaleKey: keyof SectionBuilderContent,
    width: number,
    scale: number,
    minWidth = 220,
    maxWidth = 920,
    elementId?: string,
  ) => {
    const pos = elementId ? elementPos(elementId) : null
    return (
      <div
        className="group/edit relative w-fit max-w-full"
        style={{
          width,
          transform: `scale(${scale})${pos ? ` translate(${pos.x}px, ${pos.y}px)` : ''}`,
          transformOrigin: isRtl ? 'top right' : 'top left',
        }}
      >
        <div className="rounded-lg pb-1 outline outline-1 outline-transparent transition group-hover/edit:outline-[#D6A373]/55 group-focus-within/edit:outline-[#D6A373]" style={{ width }}>
          {node}
        </div>
        {/* Width resize handle */}
        <button
          type="button"
          aria-label={`${id} width`}
          onPointerDown={(event) => handleWidthPointerDown(event, widthKey, width, minWidth, maxWidth)}
          className={cn('absolute top-1/2 z-20 hidden h-8 w-2 -translate-y-1/2 rounded-full bg-[#D6A373] shadow-[0_0_18px_rgba(214,163,115,0.35)] group-hover/edit:block group-focus-within/edit:block', isRtl ? '-left-4' : '-right-4')}
        />
        {/* Scale handle */}
        <button
          type="button"
          aria-label={`${id} scale`}
          onPointerDown={(event) => handleScalePointerDown(event, scaleKey, scale)}
          className={cn('absolute -bottom-5 z-20 hidden h-5 w-5 rounded-full border-2 border-[#D6A373] bg-[#0B0806] shadow-[0_0_18px_rgba(214,163,115,0.35)] group-hover/edit:block group-focus-within/edit:block', isRtl ? '-left-5' : '-right-5')}
        />
        {/* Per-element drag handle */}
        {elementId && onElementPositionChange && (
          <button
            type="button"
            aria-label={`move ${id}`}
            onPointerDown={(event) => handleElementPointerDown(event, elementId, pos?.x ?? 0, pos?.y ?? 0)}
            className="absolute -top-6 left-1/2 z-20 hidden h-5 w-10 -translate-x-1/2 cursor-grab rounded-full border border-[#D6A373]/55 bg-[#120D09]/90 text-[9px] font-bold text-[#D6A373] group-hover/edit:flex group-focus-within/edit:flex items-center justify-center active:cursor-grabbing"
          >
            ⠿
          </button>
        )}
        {/* Hide button */}
        {elementId && onElementToggle && (
          <button
            type="button"
            aria-label={`hide ${id}`}
            onClick={() => onElementToggle(elementId)}
            className={cn('absolute -top-6 z-20 hidden h-5 w-5 rounded-full text-[10px] font-bold group-hover/edit:flex group-focus-within/edit:flex items-center justify-center', isRtl ? '-left-6' : '-right-6', 'border border-red-400/50 bg-[#120D09]/90 text-red-300')}
          >
            ×
          </button>
        )}
      </div>
    )
  }

  // ── Split-content layout (Our Story, About sections) ──────────────────────
  if (section.sectionType === 'split_content') {
    return (
      <div className="relative overflow-hidden py-14" style={{ background: '#0F0A07' }} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_20%_50%,rgba(182,136,94,0.09)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/20 to-transparent" />
        <div className="relative z-10 grid items-center gap-12 px-8 lg:grid-cols-2 lg:gap-16" style={{ animation: textAnimationName ? `${textAnimationName} ${textAnimationDuration} ease both` : undefined }}>
          {/* Text column */}
          <div className={cn('space-y-5', isRtl ? 'text-right' : 'text-left')}>
            {showEyebrow && !isHidden('eyebrow') && editableText('eyebrow', <p {...editable(fieldName('eyebrow'), eyebrowText)} className="text-xs uppercase tracking-[0.24em] font-bold outline-none" style={{ color: '#D6A373' }} />, 'eyebrow_width', 'eyebrow_scale', Math.min(560, Math.max(180, Number(content.eyebrow_width || 360))), eyebrowScale, 140, 560, 'eyebrow')}
            {!isHidden('title') && editableText('title', <h2 {...editable(fieldName('title'), title)} className="font-serif text-3xl font-bold leading-tight outline-none md:text-5xl" style={{ color: '#F5E6D8' }} />, 'title_width', 'title_scale', Math.min(680, Math.max(280, Number(content.title_width || 520))), titleScale, 260, 680, 'title')}
            {!isHidden('subtitle') && editableText(body ? 'body' : 'subtitle', <p {...editable(body ? fieldName('body') : fieldName('subtitle'), body || subtitle)} className="text-base leading-relaxed outline-none" style={{ color: 'rgba(214,183,154,0.75)' }} />, body ? 'body_width' : 'subtitle_width', body ? 'body_scale' : 'subtitle_scale', Math.min(600, Math.max(240, Number((body ? content.body_width : content.subtitle_width) || 500))), body ? bodyScale : subtitleScale, 200, 620, 'subtitle')}
            {activeFeatures.length > 0 && (
              <div className="space-y-4 pt-1">
                {activeFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(182,136,94,0.1)', border: '1px solid rgba(182,136,94,0.28)' }}>
                      <span style={{ color: '#B6885E', fontSize: 12 }}>○</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        contentEditable suppressContentEditableWarning
                        onPointerDown={(e) => e.stopPropagation()}
                        onBlur={(e) => onFeaturePatch?.(feature.id, { [language === 'ar' ? 'title_ar' : 'title_en']: e.currentTarget.textContent || '' } as Partial<SectionTextBlock>)}
                        className="mb-0.5 text-sm font-semibold outline-none"
                        style={{ color: '#F5E6D8' }}
                      >{localText(language, feature.title_en, feature.title_ar)}</p>
                      <p
                        contentEditable suppressContentEditableWarning
                        onPointerDown={(e) => e.stopPropagation()}
                        onBlur={(e) => onFeaturePatch?.(feature.id, { [language === 'ar' ? 'description_ar' : 'description_en']: e.currentTarget.textContent || '' } as Partial<SectionTextBlock>)}
                        className="text-xs leading-relaxed outline-none"
                        style={{ color: 'rgba(183,155,133,0.7)' }}
                      >{localText(language, feature.description_en, feature.description_ar)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isHidden('buttons') && buttonText && editableText('button', <div {...editable(fieldName('button_text'), buttonText)} className="inline-flex items-center gap-2 rounded-full border border-[#D6A373]/40 px-6 py-3 text-sm font-semibold outline-none" style={{ color: '#D6A373' }} />, 'button_width', 'button_scale', Math.min(280, Math.max(130, Number(content.button_width || 200))), buttonScale, 120, 280)}
          </div>
          {/* Image column */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-[#FFDCC2]/5 blur-2xl" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#FFDCC2]/12 bg-[#120D09]">
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition, filter: filter || undefined }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/75 via-[#0F0A07]/15 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(11,8,6,0.55)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFDCC2]/10 via-transparent to-[#522500]/28 mix-blend-soft-light" />
              {Number(effects.vignette || 0) > 0.05 && <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,${Number(effects.vignette).toFixed(2)}) 100%)` }} />}
              {Number(effects.grain || 0) > 0.05 && <div className="absolute inset-0 mix-blend-screen" style={{ opacity: Number(effects.grain), backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px' }} />}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFDCC2]/30 to-transparent" />
            </div>
            {previewStats.length > 0 && !isHidden('stats') && (
              <div className={cn('absolute -bottom-4 rounded-2xl p-4 shadow-2xl', isRtl ? '-right-3' : '-left-3')} style={{ background: 'rgba(18,13,9,0.92)', border: '1px solid rgba(182,136,94,0.18)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-4">
                  {previewStats.slice(0, 3).map((stat, i) => (
                    <div key={stat.id} className="flex items-center gap-4">
                      <div className="text-center">
                        <p dir="ltr" contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => { const v = e.currentTarget.textContent || ''; statsAreFeatureCards ? onFeaturePatch?.(stat.id, { icon: v }) : onStatPatch?.(stat.id, { value: v }) }} className="font-serif text-xl font-bold outline-none" style={{ color: '#D6A373' }}>{stat.value}</p>
                        <p dir={isRtl ? 'rtl' : 'ltr'} contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => { const v = e.currentTarget.textContent || ''; statsAreFeatureCards ? onFeaturePatch?.(stat.id, { [language === 'ar' ? 'title_ar' : 'title_en']: v } as Partial<SectionTextBlock>) : onStatPatch?.(stat.id, { [language === 'ar' ? 'label_ar' : 'label_en']: v } as Partial<SectionStatBlock>) }} className="mt-0.5 text-[10px] outline-none" style={{ color: 'rgba(183,155,133,0.65)' }}>{statLabel(stat, i)}</p>
                      </div>
                      {i < Math.min(previewStats.length, 3) - 1 && <div className="h-8 w-px" style={{ background: 'rgba(182,136,94,0.2)' }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Card / feature grid layout (Features, Testimonials, Values, Categories) ─
  if (section.sectionType !== 'full_hero' && (section.editorTemplate === 'text_cards' || section.editorTemplate === 'cards' || section.sectionType === 'multi_card_slider' || section.sectionType === 'testimonial_highlight')) {
    return (
      <div className="relative overflow-hidden py-14" style={{ background: '#0B0806' }} dir={isRtl ? 'rtl' : 'ltr'}>
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-8" style={{ objectPosition, filter: filter || undefined }} />
        <div className="absolute inset-0" style={{ background: overlayBackground }} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(214,163,115,0.08),transparent_70%)]" />
        <div className="relative z-10 px-8">
          {/* Section header */}
          <div className={cn('mb-8', isRtl ? 'text-right' : 'text-left')}>
            {showEyebrow && !isHidden('eyebrow') && (
              <p contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('eyebrow')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="mb-3 text-xs uppercase tracking-[0.24em] font-bold outline-none" style={{ color: '#D6A373' }}>{eyebrowText}</p>
            )}
            {!isHidden('title') && (
              <h2 contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('title')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="font-serif text-2xl font-bold md:text-4xl outline-none mb-2" style={{ color: '#F5E6D8' }}>{title}</h2>
            )}
            {!isHidden('subtitle') && subtitle && (
              <p contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('subtitle')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="text-sm leading-relaxed outline-none" style={{ color: 'rgba(214,183,154,0.75)' }}>{subtitle}</p>
            )}
          </div>
          {/* Feature cards */}
          {activeFeatures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {activeFeatures.slice(0, 3).map((feature) => (
                <div key={feature.id} className="rounded-2xl border border-[#D6A373]/14 p-5 shadow-lg" style={{ background: 'rgba(18,13,9,0.82)' }}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(182,136,94,0.1)', border: '1px solid rgba(182,136,94,0.28)' }}>
                    <span style={{ color: '#B6885E', fontSize: 13 }}>★</span>
                  </div>
                  <p contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onFeaturePatch?.(feature.id, { [language === 'ar' ? 'title_ar' : 'title_en']: e.currentTarget.textContent || '' } as Partial<SectionTextBlock>)} className="mb-2 font-serif text-sm font-bold outline-none" style={{ color: '#F5E6D8' }}>{localText(language, feature.title_en, feature.title_ar)}</p>
                  <p contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onFeaturePatch?.(feature.id, { [language === 'ar' ? 'description_ar' : 'description_en']: e.currentTarget.textContent || '' } as Partial<SectionTextBlock>)} className="text-xs leading-relaxed outline-none" style={{ color: 'rgba(214,183,154,0.65)' }}>{localText(language, feature.description_en, feature.description_ar)}</p>
                </div>
              ))}
            </div>
          ) : previewStats.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {previewStats.slice(0, 3).map((stat, i) => (
                <div key={stat.id} className="rounded-2xl border border-[#D6A373]/14 p-5 text-center shadow-lg" style={{ background: 'rgba(18,13,9,0.82)' }}>
                  <p dir="ltr" contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onStatPatch?.(stat.id, { value: e.currentTarget.textContent || '' })} className="font-serif text-3xl font-bold outline-none" style={{ color: '#D6A373' }}>{stat.value}</p>
                  <p contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onStatPatch?.(stat.id, { [language === 'ar' ? 'label_ar' : 'label_en']: e.currentTarget.textContent || '' } as Partial<SectionStatBlock>)} className={cn('mt-1 text-xs outline-none', isRtl ? 'tracking-normal' : 'uppercase tracking-[0.18em]')} style={{ color: 'rgba(245,230,216,0.5)' }}>{statLabel(stat, i)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#D6A373]/12 bg-[#120D09] aspect-video">
              <img src={image} alt="" className="h-full w-full object-cover opacity-80" style={{ objectPosition }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Centered CTA layout (Promo, Contact banners) ──────────────────────────
  if (section.sectionType === 'centered_cta') {
    return (
      <div className="relative overflow-hidden py-24" style={{ background: '#0B0806' }} dir={isRtl ? 'rtl' : 'ltr'}>
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition, filter: filter || undefined, animation: imageAnimationName ? `${imageAnimationName} ${imageAnimationDuration} ease-in-out infinite alternate` : undefined }} />
        <div className="absolute inset-0" style={{ background: overlayBackground }} />
        <div className="absolute inset-0 bg-[#0B0806]/50" />
        {Number(effects.vignette || 0) > 0.05 && <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,${Number(effects.vignette).toFixed(2)}) 100%)` }} />}
        {Number(effects.grain || 0) > 0.05 && <div className="absolute inset-0 mix-blend-screen" style={{ opacity: Number(effects.grain), backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px' }} />}
        <div className="relative z-10 px-8 text-center" style={{ animation: textAnimationName ? `${textAnimationName} ${textAnimationDuration} ease both` : undefined }}>
          {showEyebrow && !isHidden('eyebrow') && (
            <p contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('eyebrow')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="mb-4 text-xs uppercase tracking-[0.24em] font-bold outline-none" style={{ color: '#D6A373' }}>{eyebrowText}</p>
          )}
          {!isHidden('title') && (
            <h2 contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('title')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="mx-auto mb-4 max-w-2xl font-serif text-3xl font-bold outline-none md:text-5xl" style={{ color: '#F5E6D8', textShadow: '0 4px 34px rgba(0,0,0,0.62)' }}>{title}</h2>
          )}
          {!isHidden('subtitle') && subtitle && (
            <p contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('subtitle')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="mx-auto mb-8 max-w-xl text-base leading-relaxed outline-none" style={{ color: 'rgba(214,183,154,0.85)' }}>{subtitle}</p>
          )}
          {!isHidden('buttons') && (buttonText || section.supportsCta) && (
            <div className={cn('flex flex-col items-center gap-4 sm:flex-row sm:justify-center', isRtl ? 'sm:flex-row-reverse' : '')}>
              <div contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('button_text')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="inline-flex min-h-12 min-w-[9.5rem] cursor-pointer items-center justify-center rounded-xl bg-[#D6A373] px-8 py-3 text-base font-bold text-black outline-none">{buttonText || localText(language, 'Shop Now', 'تسوق القهوة')}</div>
              {secondaryButtonText && <div contentEditable suppressContentEditableWarning onPointerDown={(e) => e.stopPropagation()} onBlur={(e) => onContentPatch?.({ [fieldName('secondary_button_text')]: e.currentTarget.textContent || '' } as Partial<SectionBuilderContent>)} className="inline-flex min-h-12 min-w-[9.5rem] cursor-pointer items-center justify-center rounded-xl border border-[#D6A373]/35 px-8 py-3 text-base font-bold outline-none" style={{ color: '#D6A373' }}>{secondaryButtonText}</div>}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Full hero / full-image banner layout (default) ────────────────────────
  return (
    <div className="relative h-[clamp(560px,74vh,760px)] overflow-hidden bg-[#0B0806]" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes mediaStudioImageFade { from { opacity: .72; } to { opacity: 1; } }
        @keyframes mediaStudioImageZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes mediaStudioImagePanLeft { from { transform: scale(1.05) translateX(2%); } to { transform: scale(1.05) translateX(-2%); } }
        @keyframes mediaStudioImagePanRight { from { transform: scale(1.05) translateX(-2%); } to { transform: scale(1.05) translateX(2%); } }
        @keyframes mediaStudioTextFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mediaStudioTextSlideLeft { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes mediaStudioTextSlideRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes mediaStudioTextZoom { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition,
          filter: filter || undefined,
          animation: imageAnimationName ? `${imageAnimationName} ${imageAnimationDuration} ease-in-out infinite alternate` : undefined,
        }}
      />
      <div className="absolute inset-0" style={{ background: overlayBackground }} />
      <div className={cn('absolute inset-0', isRtl ? 'bg-gradient-to-l from-[#0B0806]/94 via-[#0B0806]/52 to-transparent' : 'bg-gradient-to-r from-[#0B0806]/94 via-[#0B0806]/52 to-transparent')} />
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

      <div className={cn('relative z-10 flex h-full items-center px-6 py-10 md:px-12 lg:px-20', isRtl ? 'justify-start text-right' : 'justify-start text-left')}>
        <div
          className={cn('group relative max-w-[min(100%,64rem)] touch-none cursor-grab active:cursor-grabbing', isRtl ? 'text-right' : 'text-left')}
          style={{
            width: textWidth,
            transform: `translate(${Number(textPosition.x || 0)}px, ${Number(textPosition.y || 0)}px)`,
          }}
          title={localText(language, 'Drag to move text frame', 'اسحب لتحريك إطار النص')}
          onPointerDown={handleFramePointerDown}
        >

          <div style={{ animation: textAnimationName ? `${textAnimationName} ${textAnimationDuration} ease both` : undefined }}>
            {showEyebrow && !isHidden('eyebrow')
              ? editableText(
                'eyebrow',
                <p
                  {...editable(fieldName('eyebrow'), eyebrowText)}
                  className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373] outline-none"
                />,
                'eyebrow_width',
                'eyebrow_scale',
                Math.min(620, Math.max(220, Number(content.eyebrow_width || 420))),
                eyebrowScale,
                180,
                620,
                'eyebrow',
              )
              : null}
            {!isHidden('title') && editableText(
              'title',
              <h2
                {...editable(fieldName('title'), title)}
                className="font-serif text-[clamp(2.8rem,5.4vw,5.8rem)] font-extrabold leading-[1.05] text-balance text-[#F5E6D8] outline-none"
                style={{ textShadow: '0 4px 34px rgba(0,0,0,0.62)' }}
              />,
              'title_width',
              'title_scale',
              Math.min(920, Math.max(360, Number(content.title_width || textWidth))),
              titleScale,
              360,
              920,
              'title',
            )}
            {!isHidden('subtitle') && editableText(
              body ? 'body' : 'subtitle',
              <p
                {...editable(body ? fieldName('body') : fieldName('subtitle'), body || subtitle)}
                className="mt-6 text-base leading-relaxed text-[#D6B79A]/86 outline-none md:text-xl"
              />,
              body ? 'body_width' : 'subtitle_width',
              body ? 'body_scale' : 'subtitle_scale',
              Math.min(820, Math.max(300, Number((body ? content.body_width : content.subtitle_width) || 640))),
              body ? bodyScale : subtitleScale,
              260,
              820,
              'subtitle',
            )}
            {(buttonText || section.supportsCta) && !isHidden('buttons') && (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row" dir={isRtl ? 'rtl' : 'ltr'}>
                {editableText(
                  'button',
                  <div
                    {...editable(fieldName('button_text'), buttonText || localText(language, 'Shop Now', 'تسوق القهوة'))}
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[#D6A373] px-8 py-4 text-base font-bold text-black shadow-[0_12px_34px_rgba(214,163,115,0.25)] outline-none"
                  />,
                  'button_width',
                  'button_scale',
                  Math.min(360, Math.max(160, Number(content.button_width || 220))),
                  buttonScale,
                  150,
                  360,
                )}
                {editableText(
                  'secondary-button',
                  <div
                    {...editable(fieldName('secondary_button_text'), secondaryButtonText)}
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-xl border border-[#D6A373]/35 bg-[#120D09]/36 px-8 py-4 text-base font-bold text-[#D6A373] outline-none backdrop-blur"
                  />,
                  'secondary_button_width',
                  'secondary_button_scale',
                  Math.min(360, Math.max(160, Number(content.secondary_button_width || 220))),
                  secondaryButtonScale,
                  150,
                  360,
                )}
              </div>
            )}
            {previewStats.length > 0 && !isHidden('stats') && (
              <div className="mt-12 grid max-w-3xl grid-cols-3 gap-8 border-t border-[#D6A373]/22 pt-7" style={{ transform: `scale(${statsScale})${(() => { const p = elementPos('stats'); return p.x || p.y ? ` translate(${p.x}px,${p.y}px)` : '' })()}`, transformOrigin: isRtl ? 'top right' : 'top left' }}>
                {previewStats.slice(0, 3).map((stat, index) => (
                  <div key={stat.id} className="rounded-lg outline outline-1 outline-transparent transition hover:outline-[#D6A373]/45 focus-within:outline-[#D6A373]/70">
                    <p
                      dir="ltr"
                      contentEditable
                      suppressContentEditableWarning
                      onPointerDown={(event) => event.stopPropagation()}
                      onBlur={(event) => {
                        const value = event.currentTarget.textContent || ''
                        if (statsAreFeatureCards) {
                          onFeaturePatch?.(stat.id, { icon: value })
                        } else {
                          onStatPatch?.(stat.id, { value })
                        }
                      }}
                      className="font-serif text-3xl font-bold text-[#D6A373] outline-none md:text-4xl"
                    >
                      {stat.value}
                    </p>
                    <p
                      dir={isRtl ? 'rtl' : 'ltr'}
                      contentEditable
                      suppressContentEditableWarning
                      onPointerDown={(event) => event.stopPropagation()}
                      onBlur={(event) => {
                        const value = event.currentTarget.textContent || ''
                        if (statsAreFeatureCards) {
                          onFeaturePatch?.(stat.id, { [language === 'ar' ? 'title_ar' : 'title_en']: value } as Partial<SectionTextBlock>)
                        } else {
                          onStatPatch?.(stat.id, { [language === 'ar' ? 'label_ar' : 'label_en']: value } as Partial<SectionStatBlock>)
                        }
                      }}
                      className={cn('mt-1 text-[11px] text-[#F5E6D8]/50 outline-none md:text-xs', isRtl ? 'tracking-normal' : 'uppercase tracking-[0.18em]')}
                    >
                      {statLabel(stat, index)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
