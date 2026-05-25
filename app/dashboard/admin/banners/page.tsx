'use client'

import { ChangeEvent, DragEvent, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  Coffee,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Heart,
  Leaf,
  Loader2,
  Monitor,
  Move,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Tablet,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'
import {
  buildEffectsFilter,
  buildOverlayGradient,
  getMediaImageMeta,
  getMediaObjectPosition,
  getMediaOverlayOpacity,
  getMediaSectionKey,
  getSectionBuilderContent,
  getSectionBuilderLayout,
  getVisualEffects,
  getWebsitePages,
  GRAIN_SVG,
  isUploadedImageSmall,
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_MAX_UPLOAD_SIZE,
  MEDIA_USAGE_OPTIONS,
  OBJECT_POSITION_OPTIONS,
  VISUAL_PRESETS,
  WEBSITE_SECTIONS,
  type SectionBuilderContent,
  type SectionBuilderLayout,
  type SiteMediaItem,
  type VisualEffects,
  type VisualPreset,
  type WebsiteSectionConfig,
} from '@/lib/media'
import { cn } from '@/lib/utils'

type EditorSlide = SiteMediaItem & {
  local_id: string
  isNew?: boolean
}

type PendingUpload = {
  file: File
  width: number
  height: number
  previewUrl: string
  warnings: string[]
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
type PreviewLanguage = 'en' | 'ar'

const EMPTY_IMAGE = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80'

function localText(language: PreviewLanguage, en?: string | null, ar?: string | null) {
  return language === 'ar' ? ar || en || '' : en || ar || ''
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function isCategorySection(section: WebsiteSectionConfig) {
  return section.key === 'categories'
}

function slideBelongsToSection(slide: SiteMediaItem, section: WebsiteSectionConfig) {
  if (isCategorySection(section)) {
    return slide.media_type === 'category' || String(slide.usage_area || '').startsWith('category:')
  }

  const key = getMediaSectionKey(slide)
  return key === section.key || slide.usage_area === section.usageArea
}

const HERO_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80',
  'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=1920&q=80',
]

const HERO_FALLBACK_CONTENT: Array<{ en: string; ar: string; subEn: string; subAr: string }> = [
  {
    en: 'Experience Coffee Like Never Before',
    ar: 'اختبر القهوة كما لم تفعل من قبل',
    subEn: 'Discover our carefully sourced single-origin beans and signature blends, roasted to perfection for the ultimate coffee experience.',
    subAr: 'اكتشف حبوبنا من الأصل الواحد المختارة بعناية وخلطاتنا المميزة، المحمصة بإتقان لتجربة القهوة المثالية.',
  },
  {
    en: 'Crafted With Passion & Precision',
    ar: 'مصنوعة بشغف وإتقان',
    subEn: 'From the finest farms to your cup, we bring you exceptional quality with every sip.',
    subAr: 'من أفضل المزارع إلى كوبك، نقدم لك جودة استثنائية مع كل رشفة.',
  },
  {
    en: 'Your Daily Ritual, Elevated',
    ar: 'طقوسك اليومية، بمستوى أعلى',
    subEn: 'Transform your morning routine with our premium Turkish coffee and specialty blends.',
    subAr: 'حوّل روتينك الصباحي مع قهوتنا التركية الفاخرة وخلطاتنا المميزة.',
  },
  {
    en: 'Bold Flavor. Smooth Finish.',
    ar: 'نكهة قوية. نهاية ناعمة.',
    subEn: 'Signature blends crafted for cappuccino, coffee mix, and hot chocolate lovers—classic or flavored.',
    subAr: 'خلطات مميزة لعشاق الكابتشينو والكوفي ميكس والهوت شوكلت—كلاسيك أو نكهات.',
  },
]

function makeHeroInitialSlides(section: WebsiteSectionConfig): EditorSlide[] {
  return HERO_FALLBACK_IMAGES.map((imgUrl, index) => {
    const localId = createLocalId()
    const copy = HERO_FALLBACK_CONTENT[index]!
    return {
      id: localId,
      local_id: localId,
      isNew: true,
      title_en: copy.en,
      title_ar: copy.ar,
      subtitle_en: copy.subEn,
      subtitle_ar: copy.subAr,
      image_url: imgUrl,
      link_url: '/products',
      sort_order: index,
      is_active: true,
      section_key: section.key,
      slide_key: localId,
      section_type: section.sectionType,
      media_type: section.mediaType,
      usage_area: section.usageArea,
      alt_en: copy.en,
      alt_ar: copy.ar,
      is_featured: index === 0,
      button_text_en: 'Shop Now',
      button_text_ar: 'تسوق الآن',
      button_link: '/products',
      mobile_image_url: null,
      overlay_opacity: 0.6,
      object_position: 'center center',
      content: section.defaultContent || {},
      layout: section.defaultLayout || {},
      animation_type: 'fade',
      animation_duration: 6000,
      device_visibility: { desktop: true, tablet: true, mobile: true },
      starts_at: null,
      ends_at: null,
      images: [{ url: imgUrl, object_position: 'center center' }],
    }
  })
}

function makeSlide(section: WebsiteSectionConfig, index: number): EditorSlide {
  const localId = createLocalId()
  const usageArea = isCategorySection(section) ? 'category:turkish-coffee' : section.usageArea

  return {
    id: localId,
    local_id: localId,
    isNew: true,
    title_ar: section.defaultTitleAr,
    title_en: section.defaultTitleEn,
    subtitle_ar: section.defaultSubtitleAr,
    subtitle_en: section.defaultSubtitleEn,
    image_url: section.fallbackImage || EMPTY_IMAGE,
    link_url: section.defaultButtonLink || null,
    sort_order: index,
    is_active: true,
    section_key: section.key,
    slide_key: localId,
    section_type: section.sectionType,
    media_type: section.mediaType,
    usage_area: usageArea,
    alt_en: section.defaultTitleEn,
    alt_ar: section.defaultTitleAr,
    is_featured: index === 0,
    button_text_en: section.defaultButtonTextEn || null,
    button_text_ar: section.defaultButtonTextAr || null,
    button_link: section.defaultButtonLink || null,
    mobile_image_url: null,
    overlay_opacity: 0.55,
    object_position: 'center center',
    content: section.defaultContent || {},
    layout: section.defaultLayout || {},
    animation_type: 'fade',
    animation_duration: 6000,
    device_visibility: { desktop: true, tablet: true, mobile: true },
    starts_at: null,
    ends_at: null,
    images: [{
      url: section.fallbackImage || EMPTY_IMAGE,
      object_position: 'center center',
    }],
  }
}

function normalizeSlide(item: SiteMediaItem): EditorSlide {
  return {
    ...item,
    local_id: item.id,
  }
}

function fileIsAllowed(file: File) {
  return MEDIA_ALLOWED_MIME_TYPES.includes(file.type as (typeof MEDIA_ALLOWED_MIME_TYPES)[number])
}

function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number; previewUrl: string }>((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file)
    const image = new window.Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight, previewUrl })
    image.onerror = () => {
      URL.revokeObjectURL(previewUrl)
      reject(new Error('Could not read image dimensions'))
    }
    image.src = previewUrl
  })
}

function aspectWarning(section: WebsiteSectionConfig, width: number, height: number) {
  const ratio = width / Math.max(1, height)
  const target = section.key === 'categories'
    ? 1000 / 700
    : section.sectionType === 'full_hero'
    ? 1920 / 900
    : section.sectionType === 'split_content'
      ? 1
      : 1600 / 800

  return Math.abs(ratio - target) > 0.45
}

function EditableText({
  fieldKey,
  value,
  placeholder,
  className,
  multiline,
  style,
  onCommit,
}: {
  fieldKey: string
  value: string
  placeholder: string
  className: string
  multiline?: boolean
  style?: React.CSSProperties
  onCommit: (value: string) => void
}) {
  const displayValue = value || placeholder

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!multiline && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <div
      key={fieldKey}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        const nextValue = event.currentTarget.textContent?.trim() || ''
        onCommit(nextValue === placeholder && !value ? '' : nextValue)
      }}
      className={cn(
        'rounded-lg outline-none transition-all focus:bg-black/25 focus:ring-1 focus:ring-[#D6A373]/45',
        !value && 'text-[#F5E6D8]/45',
        className,
      )}
      style={style}
    >
      {displayValue}
    </div>
  )
}

function deviceClass(device: PreviewDevice) {
  if (device === 'mobile') return 'max-w-[390px]'
  if (device === 'tablet') return 'max-w-[760px]'
  return 'max-w-6xl'
}

function contentField(language: PreviewLanguage, key: 'eyebrow' | 'title' | 'subtitle' | 'body' | 'button_text') {
  return `${key}_${language}` as keyof SectionBuilderContent
}

function getContentText(content: SectionBuilderContent, language: PreviewLanguage, key: 'eyebrow' | 'title' | 'subtitle' | 'body' | 'button_text', fallback = '') {
  const primary = content[contentField(language, key)]
  const secondary = content[contentField(language === 'ar' ? 'en' : 'ar', key)]
  return String(primary || secondary || fallback)
}

function patchLayoutElement(layout: SectionBuilderLayout, elementId: string, patch: { x?: number; y?: number; visible?: boolean; align?: 'left' | 'center' | 'right' }) {
  const current = layout.elements?.[elementId] || {}
  return {
    ...layout,
    elements: {
      ...(layout.elements || {}),
      [elementId]: {
        ...current,
        ...patch,
      },
    },
  }
}

const builderIcons = {
  leaf: Leaf,
  award: Award,
  heart: Heart,
  coffee: Coffee,
}

function DraggableElement({
  id,
  layout,
  editable,
  selected,
  className,
  children,
  onSelect,
  onLayoutChange,
}: {
  id: string
  layout: SectionBuilderLayout
  editable: boolean
  selected: boolean
  className?: string
  children: ReactNode
  onSelect: (id: string) => void
  onLayoutChange: (layout: SectionBuilderLayout) => void
}) {
  const position = layout.elements?.[id] || {}
  const x = Number(position.x || 0)
  const y = Number(position.y || 0)

  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!editable) return
    event.preventDefault()
    event.stopPropagation()
    onSelect(id)

    const startX = event.clientX
    const startY = event.clientY
    const originX = x
    const originY = y

    const move = (moveEvent: PointerEvent) => {
      onLayoutChange(patchLayoutElement(layout, id, {
        x: Math.round(originX + moveEvent.clientX - startX),
        y: Math.round(originY + moveEvent.clientY - startY),
      }))
    }

    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  return (
    <div
      className={cn('relative transition-transform', editable && 'rounded-xl', editable && selected && 'ring-1 ring-[#D6A373]/70', className)}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onClick={(event) => {
        if (!editable) return
        event.stopPropagation()
        onSelect(id)
      }}
    >
      {editable && (
        <button
          type="button"
          onPointerDown={startDrag}
          className="absolute -right-3 -top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-[#D6A373]/40 bg-[#0B0806] text-[#D6A373] shadow-lg"
          title="Move"
        >
          <Move className="h-3.5 w-3.5" />
        </button>
      )}
      {children}
    </div>
  )
}

function SectionPreview({
  section,
  slide,
  language,
  device,
  onPatch,
  onPatchContent,
  onPatchLayout,
  selectedElement,
  onSelectElement,
  onDropFile,
}: {
  section: WebsiteSectionConfig
  slide: EditorSlide
  language: PreviewLanguage
  device: PreviewDevice
  onPatch: (patch: Partial<EditorSlide>) => void
  onPatchContent: (patch: Partial<SectionBuilderContent>) => void
  onPatchLayout: (layout: SectionBuilderLayout) => void
  selectedElement: string | null
  onSelectElement: (id: string) => void
  onDropFile: (file: File) => void
}) {
  const content = getSectionBuilderContent(section, slide)
  const layout = getSectionBuilderLayout(section, slide)
  const image = device === 'mobile' && slide.mobile_image_url ? slide.mobile_image_url : slide.image_url || section.fallbackImage
  const title = getContentText(content, language, 'title', section.defaultTitleEn)
  const eyebrow = getContentText(content, language, 'eyebrow', section.labelEn)
  const subtitle = getContentText(content, language, 'subtitle', section.defaultSubtitleEn)
  const body = getContentText(content, language, 'body', subtitle)
  const buttonText = getContentText(content, language, 'button_text', section.defaultButtonTextEn || 'Shop Now')
  const overlayOpacity = getMediaOverlayOpacity(slide, 0.55)
  const fx = getVisualEffects(slide)
  const hasFx = Object.keys(fx).length > 0
  const imgFilter = buildEffectsFilter(fx)
  const overlayGrad = buildOverlayGradient(fx.gradient_type, fx.overlay_color, overlayOpacity)
  const fxVignette = Number(fx.vignette ?? 0)
  const fxGlow = Number(fx.glow ?? 0)
  const fxGrain = Number(fx.grain ?? 0)
  const features = (content.features || []).filter((feature) => feature.is_active !== false)
  const stats = (content.stats || []).filter((stat) => stat.is_active !== false)

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) onDropFile(file)
  }

  const sharedStyle = {
    objectPosition: getMediaObjectPosition(slide),
  }

  const commitText = (key: 'eyebrow' | 'title' | 'subtitle' | 'body' | 'button_text', value: string) => {
    onPatchContent({ [contentField(language, key)]: value } as Partial<SectionBuilderContent>)

    if (key === 'title') onPatch(language === 'ar' ? { title_ar: value } : { title_en: value })
    if (key === 'subtitle' || key === 'body') onPatch(language === 'ar' ? { subtitle_ar: value } : { subtitle_en: value })
    if (key === 'button_text') onPatch(language === 'ar' ? { button_text_ar: value } : { button_text_en: value })
  }

  const commitFeature = (id: string, field: 'title' | 'description', value: string) => {
    const nextFeatures = (content.features || []).map((feature) => (
      feature.id === id
        ? { ...feature, [`${field}_${language}`]: value }
        : feature
    ))
    onPatchContent({ features: nextFeatures })
  }

  const commitStat = (id: string, field: 'value' | 'label', value: string) => {
    const nextStats = (content.stats || []).map((stat) => {
      if (stat.id !== id) return stat
      return field === 'value' ? { ...stat, value } : { ...stat, [`label_${language}`]: value }
    })
    onPatchContent({ stats: nextStats })
  }

  const storyDirection = language === 'ar' ? 'rtl' : 'ltr'

  // ── Hero template — same cinematic rendering as hero-section.tsx ──────────
  if (section.editorTemplate === 'hero') {
    const heroStats = stats.length > 0 ? stats : []
    const isRtl = language === 'ar'
    const previewTitleScale = typeof content.title_scale === 'number' ? Math.min(1.6, Math.max(0.6, content.title_scale)) : 1
    const previewSubtitleScale = typeof content.subtitle_scale === 'number' ? Math.min(1.4, Math.max(0.6, content.subtitle_scale)) : 1
    return (
      <div
        className={cn('mx-auto overflow-hidden rounded-3xl border border-[#D6A373]/18 shadow-2xl transition-all', deviceClass(device))}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div
          className={cn('relative flex flex-col items-center justify-center overflow-hidden', device === 'mobile' ? 'min-h-[680px] px-4 py-20' : 'min-h-[580px] px-6 py-16')}
          style={{ background: '#0B0806' }}
        >
          {/* Background image with visual effects filter */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ ...sharedStyle, ...(hasFx && imgFilter ? { filter: imgFilter } : {}) }}
          />

          {/* Cinematic grading stack — identical to hero-section.tsx */}
          {hasFx
            ? <div className="absolute inset-0" style={{ background: overlayGrad }} />
            : <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
          }
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0806]/70 via-transparent to-[#120D09]/50 mix-blend-multiply" />
          {fxVignette > 0.05
            ? <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${fxVignette.toFixed(2)}) 100%)` }} />
            : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.75)_100%)]" />
          }
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0B0806] via-[#0B0806]/60 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0806]/80 via-[#0B0806]/30 to-transparent" />
          {fxGlow > 0.05
            ? <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 65%, rgba(182,136,94,${fxGlow.toFixed(2)}) 0%, transparent 70%)` }} />
            : <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_65%,_rgba(182,136,94,0.12)_0%,_transparent_70%)]" />
          }
          {fxGrain > 0.05 && (
            <div className="pointer-events-none absolute inset-0" style={{ opacity: fxGrain, backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '180px 180px', mixBlendMode: 'screen' }} />
          )}
          {/* Horizontal side gradient — matches hero-section.tsx */}
          <div
            className={cn(
              'absolute inset-0',
              isRtl
                ? 'bg-[linear-gradient(270deg,_rgba(11,8,6,0.94)_0%,_rgba(11,8,6,0.72)_34%,_rgba(11,8,6,0.26)_64%,_rgba(11,8,6,0.08)_100%)]'
                : 'bg-[linear-gradient(90deg,_rgba(11,8,6,0.94)_0%,_rgba(11,8,6,0.72)_34%,_rgba(11,8,6,0.26)_64%,_rgba(11,8,6,0.08)_100%)]'
            )}
          />

          {/* Slide position indicator (right side, visual only) */}
          <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
            <div className="h-7 w-1.5 rounded-full bg-[#D6A373]" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
          </div>

          {/* Hero content — same layout as hero-section.tsx */}
          <div className={cn('relative z-10 flex w-full', isRtl ? 'justify-start text-right' : 'justify-start text-left')}>
          <DraggableElement
            id="main-copy"
            layout={layout}
            editable
            selected={selectedElement === 'main-copy'}
            onSelect={onSelectElement}
            onLayoutChange={onPatchLayout}
            className="w-full max-w-[35rem]"
          >
            {/* Headline */}
            <EditableText
              fieldKey={`${slide.local_id}-${language}-hero-title`}
              value={title}
              placeholder={section.defaultTitleEn}
              onCommit={(value) => commitText('title', value)}
              className={cn(
                'font-serif font-extrabold leading-[1.05] text-balance text-[#F5E6D8]',
                device === 'mobile' ? 'text-4xl' : 'text-5xl md:text-6xl',
              )}
              style={{
                textShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 80px rgba(182,136,94,0.15)',
                ...(previewTitleScale !== 1 && { transform: `scale(${previewTitleScale})`, transformOrigin: isRtl ? 'top right' : 'top left', display: 'block' }),
              }}
            />

            {/* Subheadline */}
            <EditableText
              fieldKey={`${slide.local_id}-${language}-hero-subtitle`}
              value={subtitle}
              placeholder={section.defaultSubtitleEn}
              multiline
              onCommit={(value) => commitText('subtitle', value)}
              className="mt-5 max-w-xl text-base leading-relaxed text-[#D6B79A]/85 md:text-lg"
              style={previewSubtitleScale !== 1 ? { transform: `scale(${previewSubtitleScale})`, transformOrigin: isRtl ? 'top right' : 'top left', display: 'block' } : undefined}
            />

            {/* CTA button */}
            <div className={cn('mt-8 flex flex-col gap-3 sm:flex-row', isRtl ? 'items-end justify-end' : 'items-start justify-start')}>
              <div
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold tracking-wide"
                style={{ background: 'linear-gradient(135deg,#B6885E 0%,#D6A373 100%)', color: '#0B0806', boxShadow: '0 4px 24px rgba(182,136,94,0.35)' }}
              >
                <EditableText
                  fieldKey={`${slide.local_id}-${language}-hero-button`}
                  value={buttonText}
                  placeholder={section.defaultButtonTextEn || 'Shop Now'}
                  onCommit={(value) => commitText('button_text', value)}
                  className="text-[#0B0806]"
                />
              </div>
            </div>

            {/* Stats row — bottom, matches hero-section.tsx */}
            {heroStats.length > 0 && (
              <div className={cn('mt-10 grid grid-cols-3 gap-4 border-t border-[#B6885E]/22 pt-6', isRtl && 'direction-rtl')}>
                {heroStats.slice(0, 3).map((stat) => (
                  <div key={stat.id}>
                    <EditableText
                      fieldKey={`${slide.local_id}-${language}-${stat.id}-value`}
                      value={stat.value}
                      placeholder="10+"
                      onCommit={(value) => commitStat(stat.id, 'value', value)}
                      className="font-serif text-2xl font-bold text-[#D6A373]"
                    />
                    <EditableText
                      fieldKey={`${slide.local_id}-${language}-${stat.id}-label`}
                      value={language === 'ar' ? stat.label_ar || stat.label_en : stat.label_en || stat.label_ar}
                      placeholder="Label"
                      onCommit={(value) => commitStat(stat.id, 'label', value)}
                      className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#F5E6D8]/55"
                    />
                  </div>
                ))}
              </div>
            )}
          </DraggableElement>
          </div>
        </div>
      </div>
    )
  }

  if (section.editorTemplate === 'story') {
    return (
      <div
        dir={storyDirection}
        className={cn('mx-auto overflow-hidden rounded-3xl border border-[#D6A373]/14 bg-[#0F0A07] shadow-2xl transition-all', deviceClass(device))}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className={cn('relative overflow-hidden', device === 'mobile' ? 'px-4 py-10' : 'px-8 py-14 lg:px-12')}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_20%_50%,_rgba(182,136,94,0.09)_0%,_transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_50%,_rgba(182,136,94,0.06)_0%,_transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B6885E]/24 to-transparent" />
          <div className={cn('relative z-10 grid items-center gap-10', device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
            <DraggableElement
              id="story-image"
              layout={layout}
              editable
              selected={selectedElement === 'story-image'}
              onSelect={onSelectElement}
              onLayoutChange={onPatchLayout}
              className="mx-auto w-full max-w-md"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-[#FFDCC2]/10 blur-3xl" />
                <div className="premium-image-card group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#FFDCC2]/15 bg-[#120D09] shadow-2xl">
                  <img
                    src={image}
                    alt=""
                    className={cn('absolute inset-0 h-full w-full object-cover', !hasFx && 'brightness-[0.82] contrast-[1.12] saturate-[1.08]')}
                    style={{ ...sharedStyle, ...(hasFx && imgFilter ? { filter: imgFilter } : {}) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/78 via-[#0F0A07]/18 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_34%,_rgba(11,8,6,0.58)_100%)]" />
                </div>
                {stats.length > 0 && (
                  <DraggableElement
                    id="story-stats"
                    layout={layout}
                    editable
                    selected={selectedElement === 'story-stats'}
                    onSelect={onSelectElement}
                    onLayoutChange={onPatchLayout}
                    className="absolute -bottom-4 left-4 rounded-2xl border border-[#D6A373]/18 bg-[#120D09]/92 p-4 shadow-2xl backdrop-blur"
                  >
                    <div className="flex items-center gap-4">
                      {stats.slice(0, 3).map((stat, index) => (
                        <div key={stat.id} className="text-center">
                          <EditableText
                            fieldKey={`${slide.local_id}-${language}-${stat.id}-value`}
                            value={stat.value}
                            placeholder="10+"
                            onCommit={(value) => commitStat(stat.id, 'value', value)}
                            className="font-serif text-xl font-bold text-[#D6A373]"
                          />
                          <EditableText
                            fieldKey={`${slide.local_id}-${language}-${stat.id}-label`}
                            value={language === 'ar' ? stat.label_ar || stat.label_en : stat.label_en || stat.label_ar}
                            placeholder="Label"
                            onCommit={(value) => commitStat(stat.id, 'label', value)}
                            className="mt-0.5 max-w-20 text-[10px] leading-tight text-[#D6B79A]/65"
                          />
                          {index < stats.length - 1 && <div className="hidden" />}
                        </div>
                      ))}
                    </div>
                  </DraggableElement>
                )}
              </div>
            </DraggableElement>

            <DraggableElement
              id="story-copy"
              layout={layout}
              editable
              selected={selectedElement === 'story-copy'}
              onSelect={onSelectElement}
              onLayoutChange={onPatchLayout}
            >
              <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                <EditableText
                  fieldKey={`${slide.local_id}-${language}-eyebrow`}
                  value={eyebrow}
                  placeholder={section.labelEn}
                  onCommit={(value) => commitText('eyebrow', value)}
                  className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#D6A373]"
                />
                <EditableText
                  fieldKey={`${slide.local_id}-${language}-title`}
                  value={title}
                  placeholder={section.defaultTitleEn}
                  onCommit={(value) => commitText('title', value)}
                  className="premium-heading-shimmer font-serif text-3xl font-bold leading-[1.1] text-[#F5E6D8] md:text-5xl"
                />
                <EditableText
                  fieldKey={`${slide.local_id}-${language}-body`}
                  value={body}
                  placeholder={section.defaultSubtitleEn}
                  multiline
                  onCommit={(value) => commitText('body', value)}
                  className="mt-5 text-base leading-relaxed text-[#D6B79A]/75"
                />

                <div className="mt-8 space-y-4">
                  {features.map((feature) => {
                    const Icon = builderIcons[(feature.icon || 'leaf') as keyof typeof builderIcons] || Leaf
                    return (
                      <DraggableElement
                        key={feature.id}
                        id={`feature-${feature.id}`}
                        layout={layout}
                        editable
                        selected={selectedElement === `feature-${feature.id}`}
                        onSelect={onSelectElement}
                        onLayoutChange={onPatchLayout}
                        className="premium-info-card flex gap-4 rounded-2xl border border-[#B6885E]/18 bg-[#120D09]/58 p-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#B6885E]/28 bg-[#B6885E]/10">
                          <Icon className="h-4 w-4 text-[#B6885E]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <EditableText
                            fieldKey={`${slide.local_id}-${language}-${feature.id}-title`}
                            value={language === 'ar' ? feature.title_ar || feature.title_en : feature.title_en || feature.title_ar}
                            placeholder="Feature title"
                            onCommit={(value) => commitFeature(feature.id, 'title', value)}
                            className="font-semibold text-[#F5E6D8]"
                          />
                          <EditableText
                            fieldKey={`${slide.local_id}-${language}-${feature.id}-description`}
                            value={language === 'ar' ? feature.description_ar || feature.description_en || '' : feature.description_en || feature.description_ar || ''}
                            placeholder="Feature description"
                            multiline
                            onCommit={(value) => commitFeature(feature.id, 'description', value)}
                            className="mt-1 text-sm leading-relaxed text-[#B79B85]/70"
                          />
                        </div>
                      </DraggableElement>
                    )
                  })}
                </div>

                {section.supportsCta !== false && (
                  <DraggableElement
                    id="story-cta"
                    layout={layout}
                    editable
                    selected={selectedElement === 'story-cta'}
                    onSelect={onSelectElement}
                    onLayoutChange={onPatchLayout}
                    className="mt-8 inline-flex rounded-full border border-[#D6A373]/30 px-6 py-3"
                  >
                    <EditableText
                      fieldKey={`${slide.local_id}-${language}-button`}
                      value={buttonText}
                      placeholder={section.defaultButtonTextEn || 'Learn More'}
                      onCommit={(value) => commitText('button_text', value)}
                      className="text-sm font-semibold text-[#D6A373]"
                    />
                  </DraggableElement>
                )}
              </div>
            </DraggableElement>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('mx-auto overflow-hidden rounded-3xl border border-[#D6A373]/18 bg-[#120D09] shadow-2xl transition-all', deviceClass(device))}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className={cn('relative flex items-center justify-center overflow-hidden', device === 'mobile' ? 'min-h-[680px]' : 'min-h-[540px]')}>
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ ...sharedStyle, ...(hasFx && imgFilter ? { filter: imgFilter } : {}) }} />
        <div className="absolute inset-0" style={{ background: overlayGrad }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806]/85 via-transparent to-[#0B0806]/40" />
        {fxVignette > 0.05 && <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${fxVignette.toFixed(2)}) 100%)` }} />}
        {fxGlow > 0.05 && <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(182,136,94,${fxGlow.toFixed(2)}) 0%, transparent 70%)` }} />}
        {fxGrain > 0.05 && <div className="pointer-events-none absolute inset-0" style={{ opacity: fxGrain, backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '180px 180px', mixBlendMode: 'screen' }} />}
        <DraggableElement
          id="main-copy"
          layout={layout}
          editable
          selected={selectedElement === 'main-copy'}
          onSelect={onSelectElement}
          onLayoutChange={onPatchLayout}
          className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        >
          <EditableText
            fieldKey={`${slide.local_id}-${language}-generic-eyebrow`}
            value={eyebrow}
            placeholder={section.labelEn}
            onCommit={(value) => commitText('eyebrow', value)}
            className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#D6A373]"
          />
          <EditableText
            fieldKey={`${slide.local_id}-${language}-generic-title`}
            value={title}
            placeholder={section.defaultTitleEn}
            onCommit={(value) => commitText('title', value)}
            className={cn('mx-auto font-serif font-bold leading-[1.05] text-[#F5E6D8]', device === 'mobile' ? 'text-4xl' : 'text-6xl')}
          />
          <EditableText
            fieldKey={`${slide.local_id}-${language}-generic-subtitle`}
            value={subtitle}
            placeholder={section.defaultSubtitleEn}
            multiline
            onCommit={(value) => commitText('subtitle', value)}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#D6B79A]/86"
          />
          {stats.length > 0 && (
            <div className="mt-7 flex flex-wrap justify-center gap-5">
              {stats.slice(0, 4).map((stat) => (
                <div key={stat.id} className="text-center">
                  <EditableText
                    fieldKey={`${slide.local_id}-${language}-${stat.id}-generic-value`}
                    value={stat.value}
                    placeholder="10+"
                    onCommit={(value) => commitStat(stat.id, 'value', value)}
                    className="font-serif text-2xl font-bold text-[#D6A373]"
                  />
                  <EditableText
                    fieldKey={`${slide.local_id}-${language}-${stat.id}-generic-label`}
                    value={language === 'ar' ? stat.label_ar || stat.label_en : stat.label_en || stat.label_ar}
                    placeholder="Label"
                    onCommit={(value) => commitStat(stat.id, 'label', value)}
                    className="text-xs text-[#F5E6D8]/55"
                  />
                </div>
              ))}
            </div>
          )}
          {section.supportsCta && (
            <div className="mt-8 inline-flex rounded-xl bg-[#D6A373] px-7 py-3 text-sm font-bold text-[#0B0806] shadow-[0_14px_40px_rgba(214,163,115,0.25)]">
              <EditableText
                fieldKey={`${slide.local_id}-${language}-generic-button`}
                value={buttonText}
                placeholder={section.defaultButtonTextEn || 'Shop Now'}
                onCommit={(value) => commitText('button_text', value)}
                className="px-1 text-[#0B0806]"
              />
            </div>
          )}
        </DraggableElement>
      </div>
    </div>
  )
}

function VisualEffectsPanel({
  slide,
  onPatch,
  onPatchContent,
}: {
  slide: EditorSlide
  onPatch: (patch: Partial<EditorSlide>) => void
  onPatchContent: (patch: Partial<SectionBuilderContent>) => void
}) {
  const fx = getVisualEffects(slide)
  const opacity = Number(slide.overlay_opacity ?? 0.55)

  const patchFx = (patch: Partial<VisualEffects>) => {
    onPatchContent({ visual_effects: { ...fx, ...patch } })
  }

  const applyPreset = (preset: VisualPreset) => {
    onPatch({ overlay_opacity: preset.opacity })
    onPatchContent({ visual_effects: { ...preset.effects } })
  }

  const resetEffects = () => {
    onPatch({ overlay_opacity: 0.55 })
    onPatchContent({ visual_effects: {} })
  }

  const analyzeImage = () => {
    const imgSrc = slide.image_url
    if (!imgSrc) return
    const canvas = document.createElement('canvas')
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const W = 40, H = 40
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) { applyPreset(VISUAL_PRESETS[0]!); return }
      ctx.drawImage(img, 0, 0, W, H)
      try {
        const d = ctx.getImageData(0, 0, W, H).data
        let r = 0, g = 0, b = 0
        const px = W * H
        for (let i = 0; i < d.length; i += 4) { r += d[i]!; g += d[i + 1]!; b += d[i + 2]! }
        r /= px; g /= px; b /= px
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        const warmth = (r - b) / 255
        let preset: VisualPreset
        if (lum > 0.65) preset = VISUAL_PRESETS[0]!
        else if (warmth > 0.12 && lum < 0.45) preset = VISUAL_PRESETS[6]!
        else if (warmth > 0.08) preset = VISUAL_PRESETS[1]!
        else preset = VISUAL_PRESETS[4]!
        applyPreset(preset)
      } catch {
        applyPreset(VISUAL_PRESETS[0]!)
      }
    }
    img.onerror = () => applyPreset(VISUAL_PRESETS[0]!)
    img.src = imgSrc
  }

  const readabilityWarn =
    Number(fx.brightness ?? 1) > 0.90 &&
    opacity < 0.45 &&
    Number(fx.vignette ?? 0) < 0.30

  const sliders: { key: keyof VisualEffects; label: string; min: number; max: number; step: number; defaultVal: number; fmt: (v: number) => string }[] = [
    { key: 'brightness', label: 'Brightness', min: 0.3, max: 1.5, step: 0.02, defaultVal: 1, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'contrast',   label: 'Contrast',   min: 0.5, max: 1.8, step: 0.02, defaultVal: 1, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'saturation', label: 'Saturation', min: 0,   max: 1.6, step: 0.02, defaultVal: 1, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'warmth',     label: 'Warmth',     min: 0,   max: 1,   step: 0.02, defaultVal: 0, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'blur',       label: 'Blur',       min: 0,   max: 6,   step: 0.1,  defaultVal: 0, fmt: (v) => `${v.toFixed(1)}px` },
    { key: 'vignette',   label: 'Vignette',   min: 0,   max: 1,   step: 0.02, defaultVal: 0, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'glow',       label: 'Glow',       min: 0,   max: 0.6, step: 0.01, defaultVal: 0, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'grain',      label: 'Grain',      min: 0,   max: 0.5, step: 0.01, defaultVal: 0, fmt: (v) => `${Math.round(v * 100)}%` },
  ]

  return (
    <div className="space-y-4">
      {/* AI Enhance */}
      <button
        type="button"
        onClick={analyzeImage}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D6A373]/30 bg-[#D6A373]/10 px-3 py-2.5 text-xs font-bold text-[#D6A373] transition hover:bg-[#D6A373]/18"
        title="Analyze image colors and apply the best LINE COFFEE preset"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI Enhance for LINE COFFEE
      </button>

      {/* Presets */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">Presets</p>
        <div className="grid grid-cols-2 gap-1.5">
          {VISUAL_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset)}
              title={preset.nameEn}
              className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2 text-[10px] font-semibold text-white/60 transition hover:border-[#D6A373]/30 hover:text-[#D6A373]"
            >
              {preset.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay opacity */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] text-white/45">Overlay Opacity</span>
          <span className="text-[11px] text-[#D6A373]/80">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={0.85}
          step={0.05}
          value={opacity}
          onChange={(e) => onPatch({ overlay_opacity: Number(e.target.value) })}
          className="w-full accent-[#D6A373]"
          title="Overlay Opacity"
        />
      </div>

      {/* Overlay color */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">Overlay Color</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={fx.overlay_color || '#000000'}
            onChange={(e) => patchFx({ overlay_color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
            title="Overlay Color"
          />
          <span className="text-xs text-white/40">{fx.overlay_color || '#000000'}</span>
        </div>
      </div>

      {/* Gradient type */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">Gradient Type</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(['solid', 'radial', 'top_bottom', 'vignette_only'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => patchFx({ gradient_type: type })}
              title={type}
              className={cn(
                'rounded-xl border px-2 py-2 text-[10px] font-semibold transition',
                fx.gradient_type === type
                  ? 'border-[#D6A373]/55 bg-[#D6A373]/12 text-[#D6A373]'
                  : 'border-white/8 bg-white/[0.03] text-white/50',
              )}
            >
              {type === 'solid' ? 'Solid' : type === 'radial' ? 'Radial' : type === 'top_bottom' ? 'Top→Bottom' : 'Vignette'}
            </button>
          ))}
        </div>
      </div>

      {/* Effect sliders */}
      {sliders.map(({ key, label, min, max, step, defaultVal, fmt }) => {
        const val = Number((fx as Record<string, unknown>)[key] ?? defaultVal)
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] text-white/45">{label}</span>
              <span className="text-[11px] text-[#D6A373]/80">{fmt(val)}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => patchFx({ [key]: Number(e.target.value) })}
              className="w-full accent-[#D6A373]"
              title={label}
            />
          </div>
        )
      })}

      {/* Text readability warning */}
      {readabilityWarn && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2.5 text-[11px] text-amber-200/80">
          Low contrast — text may be hard to read. Lower brightness or raise overlay opacity.
        </div>
      )}

      {/* Reset */}
      <button
        type="button"
        onClick={resetEffects}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-white/45 transition hover:text-white"
        title="Reset all visual effects"
      >
        Reset Effects
      </button>
    </div>
  )
}

export default function BannersPage() {
  const { t, language } = useLanguage()
  const [items, setItems] = useState<SiteMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<WebsiteSectionConfig | null>(null)
  const [slides, setSlides] = useState<EditorSlide[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>('main-copy')
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [previewLanguage, setPreviewLanguage] = useState<PreviewLanguage>(language)
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [activePageKey, setActivePageKey] = useState('home')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)
  const [dbError, setDbError] = useState(false)
  const [livePreviewKey, setLivePreviewKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners', { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load media')
      setItems(json.data || [])
      setDbError(false)
    } catch {
      setItems([])
      setDbError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setPreviewLanguage(language)
  }, [language])

  const websitePages = useMemo(() => getWebsitePages(), [])

  const sectionGroups = useMemo(() => {
    return WEBSITE_SECTIONS.map((section) => {
      const sectionSlides = items
        .filter((item) => slideBelongsToSection(item, section))
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      const activeSlides = sectionSlides.filter((item) => item.is_active)
      return {
        section,
        slides: sectionSlides,
        activeSlides,
        preview: activeSlides[0] || sectionSlides[0] || null,
      }
    })
  }, [items])

  const filteredSectionGroups = useMemo(() => {
    return sectionGroups.filter(({ section }) => section.pageKey === activePageKey)
  }, [activePageKey, sectionGroups])

  const selectedSlide = slides.find((slide) => slide.local_id === selectedId) || slides[0]

  const openSection = (section: WebsiteSectionConfig) => {
    const sectionSlides = items
      .filter((item) => slideBelongsToSection(item, section))
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map(normalizeSlide)

    const initialSlides = sectionSlides.length > 0
      ? sectionSlides
      : section.editorTemplate === 'hero'
        ? makeHeroInitialSlides(section)
        : [makeSlide(section, 0)]
    setActiveSection(section)
    setSlides(initialSlides)
    setSelectedId(initialSlides[0]?.local_id || null)
    setSelectedElementId(section.editorTemplate === 'story' ? 'story-copy' : 'main-copy')
    setDeletedIds([])
    setPendingUpload(null)
    setDevice('desktop')
  }

  const closeEditor = () => {
    setActiveSection(null)
    setSlides([])
    setSelectedId(null)
    setSelectedElementId(null)
    setDeletedIds([])
    setPendingUpload(null)
  }

  const patchSelected = (patch: Partial<EditorSlide>) => {
    if (!selectedSlide) return
    setSlides((prev) => prev.map((slide) => (
      slide.local_id === selectedSlide.local_id ? { ...slide, ...patch } : slide
    )))
  }

  const patchSelectedContent = (patch: Partial<SectionBuilderContent>) => {
    if (!activeSection || !selectedSlide) return
    const current = getSectionBuilderContent(activeSection, selectedSlide)
    patchSelected({ content: { ...current, ...patch } })
  }

  const patchSelectedLayout = (layout: SectionBuilderLayout) => {
    patchSelected({ layout })
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
    const duplicate: EditorSlide = {
      ...selectedSlide,
      id: localId,
      local_id: localId,
      slide_key: localId,
      isNew: true,
      sort_order: slides.length,
      title_en: selectedSlide.title_en ? `${selectedSlide.title_en} Copy` : selectedSlide.title_en,
    }
    setSlides((prev) => [...prev, duplicate])
    setSelectedId(localId)
  }

  const removeSlide = (localId: string) => {
    const target = slides.find((slide) => slide.local_id === localId)
    if (!target) return

    if (!target.isNew) {
      setDeletedIds((prev) => [...prev, target.id])
    }

    setSlides((prev) => {
      const next = prev.filter((slide) => slide.local_id !== localId)
      if (selectedId === localId) setSelectedId(next[0]?.local_id || null)
      return next
    })
  }

  const moveSlide = (localId: string, direction: -1 | 1) => {
    setSlides((prev) => {
      const index = prev.findIndex((slide) => slide.local_id === localId)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      const [slide] = next.splice(index, 1)
      next.splice(nextIndex, 0, slide)
      return next.map((item, sortOrder) => ({ ...item, sort_order: sortOrder }))
    })
  }

  const validateAndPrepareFile = async (file: File) => {
    if (!activeSection) return

    if (!fileIsAllowed(file)) {
      toast.error(t('Only JPG, PNG, and WebP images are allowed', 'Only JPG, PNG, and WebP images are allowed'))
      return
    }

    if (file.size > MEDIA_MAX_UPLOAD_SIZE) {
      toast.error(t('Image is too large. Maximum size is 8MB', 'Image is too large. Maximum size is 8MB'))
      return
    }

    try {
      const dimensions = await readImageDimensions(file)
      const warnings: string[] = []
      if (isUploadedImageSmall(activeSection.usageArea, dimensions.width, dimensions.height)) {
        warnings.push(t('This image is small and may not fill the section properly', 'This image is small and may not fill the section properly'))
      }
      if (aspectWarning(activeSection, dimensions.width, dimensions.height)) {
        warnings.push(t('Aspect ratio may crop differently in this section', 'Aspect ratio may crop differently in this section'))
      }

      const upload = { file, ...dimensions, warnings }
      if (warnings.length > 0) {
        setPendingUpload(upload)
        return
      }

      await uploadImage(upload)
    } catch {
      toast.error(t('Could not read image dimensions', 'Could not read image dimensions'))
    }
  }

  const uploadImage = async (upload: PendingUpload) => {
    if (!activeSection || !selectedSlide) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', upload.file)
      body.append('usage_area', selectedSlide.usage_area || activeSection.usageArea)

      const res = await fetch('/api/admin/media/upload', { method: 'POST', body })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Upload failed')

      patchSelected({
        image_url: json.data.url,
        object_position: selectedSlide.object_position || 'center center',
        images: [{
          url: json.data.url,
          path: json.data.path,
          bucket: json.data.bucket,
          width: upload.width,
          height: upload.height,
          object_position: selectedSlide.object_position || 'center center',
          uploaded_at: new Date().toISOString(),
        }],
      })
      setPendingUpload(null)
      toast.success(t('Image uploaded', 'Image uploaded'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Upload failed', 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const saveSection = async () => {
    if (!activeSection) return
    setSaving(true)

    try {
      for (const id of deletedIds) {
        await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      }

      for (const [index, slide] of slides.entries()) {
        const imageMeta = getMediaImageMeta(slide)
        const imageUrl = slide.image_url || activeSection.fallbackImage
        const payload = {
          title_ar: slide.title_ar || '',
          title_en: slide.title_en || '',
          subtitle_ar: slide.subtitle_ar || '',
          subtitle_en: slide.subtitle_en || '',
          image_url: imageUrl,
          mobile_image_url: slide.mobile_image_url || null,
          link_url: slide.link_url || slide.button_link || null,
          button_link: slide.button_link || slide.link_url || null,
          button_text_ar: slide.button_text_ar || null,
          button_text_en: slide.button_text_en || null,
          sort_order: index,
          is_active: slide.is_active,
          section_key: activeSection.key,
          slide_key: slide.slide_key || slide.local_id,
          section_type: activeSection.sectionType,
          media_type: slide.media_type || activeSection.mediaType,
          usage_area: slide.usage_area || activeSection.usageArea,
          alt_ar: slide.alt_ar || slide.title_ar || '',
          alt_en: slide.alt_en || slide.title_en || '',
          is_featured: index === 0 || Boolean(slide.is_featured),
          overlay_opacity: Number(slide.overlay_opacity ?? 0.55),
          object_position: getMediaObjectPosition(slide),
          content: slide.content && typeof slide.content === 'object' ? slide.content : getSectionBuilderContent(activeSection, slide),
          layout: slide.layout && typeof slide.layout === 'object' ? slide.layout : getSectionBuilderLayout(activeSection, slide),
          animation_type: slide.animation_type || 'fade',
          animation_duration: Number(slide.animation_duration || 6000),
          device_visibility: slide.device_visibility && typeof slide.device_visibility === 'object'
            ? slide.device_visibility
            : { desktop: true, tablet: true, mobile: true },
          starts_at: slide.starts_at || null,
          ends_at: slide.ends_at || null,
          images: [{
            ...(imageMeta || {}),
            url: imageUrl,
            object_position: getMediaObjectPosition(slide),
          }],
        }

        const url = slide.isNew ? '/api/admin/banners' : `/api/admin/banners/${slide.id}`
        const method = slide.isNew ? 'POST' : 'PUT'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Failed to save section')
      }

      toast.success(t('Section saved', 'Section saved'))
      await load()
      setLivePreviewKey((k) => k + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to save section', 'Failed to save section'))
    } finally {
      setSaving(false)
    }
  }

  const selectedLayout = activeSection && selectedSlide ? getSectionBuilderLayout(activeSection, selectedSlide) : {}
  const selectedElementPosition = selectedElementId ? selectedLayout.elements?.[selectedElementId] || {} : {}
  const selectedContent = activeSection && selectedSlide ? getSectionBuilderContent(activeSection, selectedSlide) : {} as SectionBuilderContent

  if (activeSection) {
    return (
      <div className="min-h-screen bg-[#0f0900] p-5 text-white">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeEditor}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#D6A373]/80">{t('Website Section Editor', 'Website Section Editor')}</p>
              <h2 className="font-serif text-2xl font-bold text-[#F5E6D8]">{localText(previewLanguage, activeSection.labelEn, activeSection.labelAr)}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-white/10 bg-[#180d04] p-1">
              {(['en', 'ar'] as PreviewLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPreviewLanguage(lang)}
                  className={cn('rounded-lg px-3 py-1.5 text-xs font-bold transition', previewLanguage === lang ? 'bg-[#D6A373] text-black' : 'text-white/45 hover:text-white')}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex rounded-xl border border-white/10 bg-[#180d04] p-1">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Phone },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDevice(item.id as PreviewDevice)}
                    className={cn('flex h-8 w-9 items-center justify-center rounded-lg transition', device === item.id ? 'bg-[#D6A373] text-black' : 'text-white/45 hover:text-white')}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={saveSection}
              disabled={saving || uploading}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#D6A373] px-4 text-sm font-bold text-black transition hover:bg-[#c8941a] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? t('Saving...', 'Saving...') : t('Save Section', 'Save Section')}
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[260px_1fr_260px]">
          <aside className="rounded-3xl border border-[#D6A373]/12 bg-[#120D09]/85 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#F5E6D8]">{t('Slides', 'Slides')}</p>
                <p className="text-xs text-[#D6B79A]/45">{slides.length} {t('items', 'items')}</p>
              </div>
              <button type="button" onClick={addSlide} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D6A373] text-black">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.local_id}
                  type="button"
                  onClick={() => setSelectedId(slide.local_id)}
                  className={cn('group w-full overflow-hidden rounded-2xl border p-2 text-left transition', selectedId === slide.local_id ? 'border-[#D6A373]/55 bg-[#D6A373]/10' : 'border-white/8 bg-white/[0.03] hover:border-[#D6A373]/24')}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 shrink-0 text-white/20" />
                    <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-black">
                      <img src={slide.image_url || activeSection.fallbackImage} alt="" className="h-full w-full object-cover" style={{ objectPosition: getMediaObjectPosition(slide) }} />
                      {!slide.is_active && <div className="absolute inset-0 bg-black/65" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#F5E6D8]">{localText(previewLanguage, slide.title_en, slide.title_ar) || `${t('Slide', 'Slide')} ${index + 1}`}</p>
                      <p className="text-[10px] text-[#D6B79A]/45">#{index + 1}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0">
            {pendingUpload && (
              <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-100">{pendingUpload.width}x{pendingUpload.height}</p>
                    <div className="mt-1 space-y-1 text-xs text-amber-100/70">
                      {pendingUpload.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => uploadImage(pendingUpload)} disabled={uploading} className="rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-bold text-black disabled:opacity-50">
                        {uploading ? t('Uploading...', 'Uploading...') : t('Continue anyway', 'Continue anyway')}
                      </button>
                      <button type="button" onClick={() => setPendingUpload(null)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55">
                        {t('Cancel / choose another image', 'Cancel / choose another image')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSlide && (
              <SectionPreview
                section={activeSection}
                slide={selectedSlide}
                language={previewLanguage}
                device={device}
                onPatch={patchSelected}
                onPatchContent={patchSelectedContent}
                onPatchLayout={patchSelectedLayout}
                selectedElement={selectedElementId}
                onSelectElement={setSelectedElementId}
                onDropFile={validateAndPrepareFile}
              />
            )}
          </main>

          <aside className="space-y-4 overflow-y-auto max-h-[calc(100vh-9rem)] rounded-3xl border border-[#D6A373]/12 bg-[#120D09]/85 p-4">
            {selectedSlide && (
              <>
                <div>
                  <p className="mb-3 text-sm font-bold text-[#F5E6D8]">{t('Slide Controls', 'Slide Controls')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => patchSelected({ is_active: !selectedSlide.is_active })}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                      {selectedSlide.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {selectedSlide.is_active ? t('Hide', 'Hide') : t('Show', 'Show')}
                    </button>
                    <button type="button" onClick={duplicateSlide}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                      <Copy className="h-3.5 w-3.5" />
                      {t('Duplicate', 'Duplicate')}
                    </button>
                    <button type="button" onClick={() => moveSlide(selectedSlide.local_id, -1)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                      <ArrowUp className="h-3.5 w-3.5" />
                      {t('Up', 'Up')}
                    </button>
                    <button type="button" onClick={() => moveSlide(selectedSlide.local_id, 1)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                      <ArrowDown className="h-3.5 w-3.5" />
                      {t('Down', 'Down')}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Slide Animation', 'Slide Animation')}</p>
                  <select
                    value={selectedSlide.animation_type || 'fade'}
                    onChange={(event) => patchSelected({ animation_type: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75 outline-none focus:border-[#D6A373]/45"
                  >
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="none">None</option>
                  </select>
                  <label className="mb-2 mt-3 block text-[11px] text-white/45">
                    {t('Duration', 'Duration')}: {Number(selectedSlide.animation_duration || 6000)}ms
                  </label>
                  <input
                    type="range"
                    min={2000}
                    max={12000}
                    step={500}
                    value={Number(selectedSlide.animation_duration || 6000)}
                    onChange={(event) => patchSelected({ animation_duration: Number(event.target.value) })}
                    className="w-full accent-[#D6A373]"
                  />
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Replace Image', 'Replace Image')}</p>
                  <label
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D6A373]/24 bg-[#0B0806]/65 p-5 text-center transition hover:border-[#D6A373]/55"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      const file = event.dataTransfer.files?.[0]
                      if (file) validateAndPrepareFile(file)
                    }}
                  >
                    {uploading ? <Loader2 className="mb-2 h-5 w-5 animate-spin text-[#D6A373]" /> : <Upload className="mb-2 h-5 w-5 text-[#D6A373]" />}
                    <span className="text-xs text-[#F5E6D8]/80">{t('Drag image here or choose file', 'Drag image here or choose file')}</span>
                    <span className="mt-1 text-[10px] text-[#D6B79A]/38">JPG, PNG, WebP · 8MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      if (file) validateAndPrepareFile(file)
                    }} />
                  </label>
                </div>

                {activeSection.key === 'categories' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Target Category Card', 'Target Category Card')}</label>
                    <select
                      value={selectedSlide.usage_area || 'category:turkish-coffee'}
                      onChange={(event) => patchSelected({ usage_area: event.target.value, media_type: 'category' })}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75 outline-none focus:border-[#D6A373]/45"
                    >
                      {MEDIA_USAGE_OPTIONS.filter((option) => option.mediaType === 'category').map((option) => (
                        <option key={option.value} value={option.value}>
                          {localText(previewLanguage, option.labelEn, option.labelAr)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Image Position', 'Image Position')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {OBJECT_POSITION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => patchSelected({
                          object_position: option.value,
                          images: [{
                            ...(getMediaImageMeta(selectedSlide) || {}),
                            url: selectedSlide.image_url,
                            object_position: option.value,
                          }],
                        })}
                        className={cn('rounded-xl border px-3 py-2 text-xs transition', getMediaObjectPosition(selectedSlide) === option.value ? 'border-[#D6A373]/55 bg-[#D6A373]/12 text-[#D6A373]' : 'border-white/8 bg-white/[0.03] text-white/50')}
                      >
                        {localText(previewLanguage, option.labelEn, option.labelAr)}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedElementId && (
                  <div className="rounded-2xl border border-white/8 bg-black/18 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Position & Scale', 'Position & Scale')}</p>
                      <span className="rounded-full bg-[#D6A373]/10 px-2 py-1 text-[10px] text-[#D6A373]">{selectedElementId}</span>
                    </div>

                    <label className="mb-2 block text-[11px] text-white/45">X: {Number(selectedElementPosition.x || 0)}px</label>
                    <input type="range" min={-180} max={180} step={2}
                      value={Number(selectedElementPosition.x || 0)}
                      onChange={(event) => patchSelectedLayout(patchLayoutElement(selectedLayout, selectedElementId, { x: Number(event.target.value) }))}
                      className="w-full accent-[#D6A373]" title="X position"
                    />
                    <label className="mb-2 mt-3 block text-[11px] text-white/45">Y: {Number(selectedElementPosition.y || 0)}px</label>
                    <input type="range" min={-180} max={180} step={2}
                      value={Number(selectedElementPosition.y || 0)}
                      onChange={(event) => patchSelectedLayout(patchLayoutElement(selectedLayout, selectedElementId, { y: Number(event.target.value) }))}
                      className="w-full accent-[#D6A373]" title="Y position"
                    />

                    {activeSection.editorTemplate === 'hero' && selectedElementId === 'main-copy' && (
                      <>
                        <div className="my-3 h-px bg-white/8" />
                        <label className="mb-2 block text-[11px] text-white/45">{t('Title Scale', 'Title Scale')}: {(selectedContent.title_scale ?? 1).toFixed(2)}×</label>
                        <input type="range" min={0.6} max={1.6} step={0.05}
                          value={selectedContent.title_scale ?? 1}
                          onChange={(e) => patchSelectedContent({ title_scale: Number(e.target.value) })}
                          className="w-full accent-[#D6A373]" title="Title scale"
                        />
                        <label className="mb-2 mt-3 block text-[11px] text-white/45">{t('Subtitle Scale', 'Subtitle Scale')}: {(selectedContent.subtitle_scale ?? 1).toFixed(2)}×</label>
                        <input type="range" min={0.6} max={1.4} step={0.05}
                          value={selectedContent.subtitle_scale ?? 1}
                          onChange={(e) => patchSelectedContent({ subtitle_scale: Number(e.target.value) })}
                          className="w-full accent-[#D6A373]" title="Subtitle scale"
                        />
                        <label className="mb-2 mt-3 block text-[11px] text-white/45">{t('Stats Scale', 'Stats Scale')}: {(selectedContent.stats_scale ?? 1).toFixed(2)}×</label>
                        <input type="range" min={0.6} max={1.4} step={0.05}
                          value={selectedContent.stats_scale ?? 1}
                          onChange={(e) => patchSelectedContent({ stats_scale: Number(e.target.value) })}
                          className="w-full accent-[#D6A373]" title="Stats scale"
                        />
                      </>
                    )}

                    <button type="button"
                      onClick={() => {
                        patchSelectedLayout(patchLayoutElement(selectedLayout, selectedElementId, { x: 0, y: 0 }))
                        if (activeSection.editorTemplate === 'hero' && selectedElementId === 'main-copy') {
                          patchSelectedContent({ title_scale: 1, subtitle_scale: 1, stats_scale: 1 })
                        }
                      }}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-white/55 transition hover:text-white"
                    >
                      {t('Reset', 'Reset')}
                    </button>
                  </div>
                )}

                <details className="rounded-2xl border border-white/8 bg-black/18 p-3 group" open>
                  <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80 select-none">
                    {t('Visual Effects', 'Visual Effects')}
                  </summary>
                  <div className="mt-3">
                  <VisualEffectsPanel
                    slide={selectedSlide}
                    onPatch={patchSelected}
                    onPatchContent={patchSelectedContent}
                  />
                  </div>
                </details>

                {activeSection.supportsCta && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#D6A373]/80">{t('Button Link', 'Button Link')}</label>
                    <input
                      value={selectedSlide.button_link || selectedSlide.link_url || ''}
                      onChange={(event) => patchSelected({ button_link: event.target.value, link_url: event.target.value })}
                      placeholder="/products"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75 outline-none focus:border-[#D6A373]/45"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeSlide(selectedSlide.local_id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/15"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('Remove Slide', 'Remove Slide')}
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0900] p-6 text-white">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#D6A373]/75">{t('Website Content Builder', 'Website Content Builder')}</p>
          <h2 className="mt-1 font-serif text-3xl font-bold text-[#F5E6D8]">{t('Section Media Editor', 'Section Media Editor')}</h2>
          <p className="mt-1 text-sm text-[#D6B79A]/50">{t('Open a website section and edit its live visual content.', 'Open a website section and edit its live visual content.')}</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/55 transition hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          {t('Refresh', 'Refresh')}
        </button>
      </div>

      {dbError && !loading && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <p className="text-sm font-bold text-amber-100">{t('Media schema needs setup', 'Media schema needs setup')}</p>
            <p className="mt-1 text-xs text-amber-100/70">
              {t('Run the latest section media migration, then refresh this page.', 'Run the latest section media migration, then refresh this page.')}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-[#D6A373]/10 bg-[#120D09]/70 p-2">
        {websitePages.map((page) => {
          const isActive = activePageKey === page.key
          return (
            <button
              key={page.key}
              type="button"
              onClick={() => setActivePageKey(page.key)}
              className={cn(
                'shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition',
                isActive ? 'bg-[#D6A373] text-black' : 'text-[#D6B79A]/55 hover:bg-white/[0.04] hover:text-[#F5E6D8]'
              )}
            >
              {localText(language, page.labelEn, page.labelAr)}
              <span className={cn('ms-2 text-xs', isActive ? 'text-black/55' : 'text-white/30')}>{page.sections.length}</span>
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
          {filteredSectionGroups.map(({ section, slides: sectionSlides, activeSlides, preview }) => (
            <button
              key={section.key}
              type="button"
              onClick={() => openSection(section)}
              className="group relative overflow-hidden rounded-3xl border border-[#D6A373]/12 bg-[#120D09] text-left shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#D6A373]/35 hover:shadow-[0_28px_90px_rgba(214,163,115,0.12)]"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={preview?.image_url || section.fallbackImage}
                  alt=""
                  className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                  style={{ objectPosition: preview ? getMediaObjectPosition(preview) : 'center center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0806] via-[#0B0806]/24 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="mb-2 inline-flex rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#D6A373] backdrop-blur">
                    {localText(language, section.pageLabelEn, section.pageLabelAr)} · {section.sectionType.replace(/_/g, ' ')}
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-[#F5E6D8]">{localText(language, section.labelEn, section.labelAr)}</h3>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <p className="line-clamp-2 text-sm leading-relaxed text-[#D6B79A]/56">{localText(language, section.descriptionEn, section.descriptionAr)}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#D6B79A]/42">{sectionSlides.length} {t('slides/images', 'slides/images')}</span>
                  <span className={cn('rounded-full px-2 py-1 font-bold', activeSlides.length > 0 ? 'bg-emerald-500/12 text-emerald-300' : 'bg-white/5 text-white/35')}>
                    {activeSlides.length > 0 ? t('Live', 'Live') : t('Fallback', 'Fallback')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(sectionSlides.length > 0 ? sectionSlides : [{ id: 'fallback', image_url: section.fallbackImage } as SiteMediaItem]).slice(0, 5).map((slide, index) => (
                    <div key={slide.id || index} className="h-9 w-11 overflow-hidden rounded-lg border border-white/8 bg-black">
                      <img src={slide.image_url || section.fallbackImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {sectionSlides.length > 5 && <span className="text-xs text-white/35">+{sectionSlides.length - 5}</span>}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-[#D6A373]">
                  <Pencil className="h-4 w-4" />
                  {t('Edit section visually', 'Edit section visually')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
