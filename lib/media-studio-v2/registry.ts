export type MediaStudioV2PageId = 'home' | 'about' | 'products' | 'blog' | 'contact'

export type MediaStudioV2MappingStatus = 'reusable' | 'needs-extraction' | 'composite'
export type MediaStudioV2ControlState = 'preview-only' | 'read-only' | 'local-draft-only' | 'needs-extraction'
export type MediaStudioV2DraftControl = 'text' | 'textarea'

export type MediaStudioV2Page = {
  id: MediaStudioV2PageId
  displayName: string
  route: string
  sortOrder: number
}

export type MediaStudioV2Section = {
  id: string
  page: MediaStudioV2PageId
  displayName: string
  description: string
  currentSectionKey?: string
  componentMapping: {
    status: MediaStudioV2MappingStatus
    component: string
    sourceFile: string
    notes?: string
  }
  editableTextFields: string[]
  localDraftFields?: MediaStudioV2DraftField[]
  editableMediaFields: string[]
  ctaFields: string[]
  styleEffectFields: string[]
  visibility: {
    supported: boolean
    defaultVisible: boolean
  }
  sortOrder: number
  canReorder: boolean
  responsive: {
    modes: Array<'desktop' | 'tablet' | 'mobile'>
    supportsOverrides: boolean
  }
}

export type MediaStudioV2InspectorTab = (typeof MEDIA_STUDIO_V2_CONTROL_TABS)[number]

export type MediaStudioV2DraftField = {
  id: string
  label: string
  control: MediaStudioV2DraftControl
  description?: string
}

export type MediaStudioV2InspectorControl = {
  id: string
  label: string
  description: string
  control: 'text' | 'textarea' | 'media' | 'select' | 'slider' | 'toggle' | 'info'
  state: MediaStudioV2ControlState
  value?: string
}

export const MEDIA_STUDIO_V2_PAGES: MediaStudioV2Page[] = [
  { id: 'home', displayName: 'Homepage', route: '/', sortOrder: 10 },
  { id: 'about', displayName: 'About Page', route: '/about', sortOrder: 20 },
  { id: 'products', displayName: 'Products Page', route: '/products', sortOrder: 30 },
  { id: 'blog', displayName: 'Blog Page', route: '/blog', sortOrder: 40 },
  { id: 'contact', displayName: 'Contact Page', route: '/contact', sortOrder: 50 },
]

export const MEDIA_STUDIO_V2_SECTIONS: MediaStudioV2Section[] = [
  {
    id: 'home_hero',
    page: 'home',
    displayName: 'Hero Section',
    description: 'Homepage hero slides using the live hero component.',
    currentSectionKey: 'hero',
    componentMapping: {
      status: 'reusable',
      component: 'HeroSection',
      sourceFile: 'components/home/hero-section.tsx',
      notes: 'Uses HeroBackground for live overlay and image treatment.',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle', 'stats'],
    editableMediaFields: ['image', 'mobile_image', 'alt_text', 'focus_position', 'crop_fit'],
    ctaFields: ['primary_text', 'primary_link', 'secondary_text', 'secondary_link'],
    styleEffectFields: ['overlay_opacity', 'brightness', 'contrast', 'vignette', 'grain', 'text_width', 'text_position'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 10,
    canReorder: false,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'home_story',
    page: 'home',
    displayName: 'Our Story',
    description: 'Homepage story block with text, feature cards, CTA, and image.',
    currentSectionKey: 'about_lower',
    componentMapping: {
      status: 'reusable',
      component: 'StorySection',
      sourceFile: 'components/home/story-section.tsx',
    },
    editableTextFields: ['eyebrow', 'title', 'body', 'feature_cards'],
    editableMediaFields: ['image', 'alt_text', 'focus_position', 'overlay_effects'],
    ctaFields: ['button_text', 'button_link'],
    styleEffectFields: ['padding', 'gap', 'image_radius', 'shadow', 'text_alignment'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 20,
    canReorder: true,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'home_trust_cards',
    page: 'home',
    displayName: 'Trust Cards',
    description: 'Homepage trust cards only, mapped to the existing feature pills content.',
    currentSectionKey: 'home_features',
    componentMapping: {
      status: 'reusable',
      component: 'FeaturesPills',
      sourceFile: 'components/home/features-pills.tsx',
    },
    editableTextFields: ['cards.icon', 'cards.title', 'cards.description'],
    editableMediaFields: [],
    ctaFields: [],
    styleEffectFields: ['gap', 'padding', 'text_alignment'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 30,
    canReorder: true,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'about_hero',
    page: 'about',
    displayName: 'About Hero',
    description: 'About page hero image, overlay, heading, and intro.',
    currentSectionKey: 'about_top',
    componentMapping: {
      status: 'reusable',
      component: 'AboutHero',
      sourceFile: 'components/pages/about/about-hero.tsx',
      notes: 'Shared by the public About page and Media Studio V2 preview foundation.',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle'],
    localDraftFields: [
      { id: 'eyebrow', label: 'Eyebrow', control: 'text' },
      { id: 'title', label: 'Title', control: 'text' },
      { id: 'subtitle', label: 'Subtitle', control: 'textarea' },
    ],
    editableMediaFields: ['image', 'alt_text', 'focus_position', 'overlay_opacity'],
    ctaFields: [],
    styleEffectFields: ['section_height', 'padding', 'gradient', 'vignette'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 10,
    canReorder: false,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'about_legacy_stats',
    page: 'about',
    displayName: 'Legacy Stats',
    description: 'Founder and legacy statistics strip.',
    componentMapping: {
      status: 'reusable',
      component: 'AboutStats',
      sourceFile: 'components/pages/about/about-stats.tsx',
      notes: 'Shared by the public About page and Media Studio V2 preview foundation.',
    },
    editableTextFields: ['stats.value', 'stats.label', 'stats.icon'],
    localDraftFields: [
      { id: 'stat_1_value', label: 'Stat 1 Value', control: 'text' },
      { id: 'stat_1_label', label: 'Stat 1 Label', control: 'text' },
      { id: 'stat_2_value', label: 'Stat 2 Value', control: 'text' },
      { id: 'stat_2_label', label: 'Stat 2 Label', control: 'text' },
      { id: 'stat_3_value', label: 'Stat 3 Value', control: 'text' },
      { id: 'stat_3_label', label: 'Stat 3 Label', control: 'text' },
      { id: 'stat_4_value', label: 'Stat 4 Value', control: 'text' },
      { id: 'stat_4_label', label: 'Stat 4 Label', control: 'text' },
    ],
    editableMediaFields: [],
    ctaFields: [],
    styleEffectFields: ['padding', 'gap', 'icon_style'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 20,
    canReorder: true,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'about_journey',
    page: 'about',
    displayName: 'About Journey',
    description: 'About page story text and square image block.',
    currentSectionKey: 'about_story',
    componentMapping: {
      status: 'reusable',
      component: 'AboutJourney',
      sourceFile: 'components/pages/about/about-journey.tsx',
      notes: 'Shared by the public About page and Media Studio V2 preview foundation.',
    },
    editableTextFields: ['eyebrow', 'title', 'body'],
    localDraftFields: [
      { id: 'eyebrow', label: 'Eyebrow', control: 'text' },
      { id: 'title', label: 'Title', control: 'text' },
      { id: 'body', label: 'Body', control: 'textarea' },
    ],
    editableMediaFields: ['image', 'alt_text', 'focus_position'],
    ctaFields: [],
    styleEffectFields: ['padding', 'gap', 'image_radius', 'shadow'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 30,
    canReorder: true,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'about_values',
    page: 'about',
    displayName: 'About Values',
    description: 'About page values heading and cards.',
    currentSectionKey: 'about_values',
    componentMapping: {
      status: 'reusable',
      component: 'AboutValues',
      sourceFile: 'components/pages/about/about-values.tsx',
      notes: 'Shared by the public About page and Media Studio V2 preview foundation.',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle', 'cards.title', 'cards.description'],
    localDraftFields: [
      { id: 'eyebrow', label: 'Eyebrow', control: 'text' },
      { id: 'title', label: 'Title', control: 'text' },
      { id: 'subtitle', label: 'Subtitle', control: 'textarea' },
      { id: 'card_1_title', label: 'Card 1 Title', control: 'text' },
      { id: 'card_1_body', label: 'Card 1 Body', control: 'textarea' },
      { id: 'card_2_title', label: 'Card 2 Title', control: 'text' },
      { id: 'card_2_body', label: 'Card 2 Body', control: 'textarea' },
      { id: 'card_3_title', label: 'Card 3 Title', control: 'text' },
      { id: 'card_3_body', label: 'Card 3 Body', control: 'textarea' },
    ],
    editableMediaFields: [],
    ctaFields: [],
    styleEffectFields: ['padding', 'gap', 'card_shadow', 'text_alignment'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 40,
    canReorder: true,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'products_hero',
    page: 'products',
    displayName: 'Products Hero',
    description: 'Products page hero banner above catalog filters.',
    currentSectionKey: 'products_banner',
    componentMapping: {
      status: 'reusable',
      component: 'ProductsHero',
      sourceFile: 'components/pages/products/products-hero.tsx',
      notes: 'Shared by the public Products page and Media Studio V2 preview foundation.',
    },
    editableTextFields: ['title', 'subtitle'],
    localDraftFields: [
      { id: 'title', label: 'Title', control: 'text' },
      { id: 'subtitle', label: 'Subtitle', control: 'textarea' },
    ],
    editableMediaFields: ['image', 'alt_text', 'focus_position', 'overlay_opacity'],
    ctaFields: [],
    styleEffectFields: ['section_height', 'gradient', 'vignette'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 10,
    canReorder: false,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'blog_hero',
    page: 'blog',
    displayName: 'Blog Hero',
    description: 'Blog journal intro with optional managed background.',
    currentSectionKey: 'blog_page',
    componentMapping: {
      status: 'reusable',
      component: 'BlogHero',
      sourceFile: 'components/pages/blog/blog-hero.tsx',
      notes: 'Shared by the public Blog page and Media Studio V2 preview foundation.',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle'],
    localDraftFields: [
      { id: 'eyebrow', label: 'Eyebrow', control: 'text' },
      { id: 'title', label: 'Title', control: 'text' },
      { id: 'subtitle', label: 'Subtitle', control: 'textarea' },
    ],
    editableMediaFields: ['image', 'alt_text', 'focus_position', 'overlay_effects'],
    ctaFields: [],
    styleEffectFields: ['padding', 'max_width', 'text_alignment'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 10,
    canReorder: false,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'blog_empty_state',
    page: 'blog',
    displayName: 'Blog Empty State / Journal Intro',
    description: 'Empty journal state shown when no public posts exist.',
    currentSectionKey: 'blog_page',
    componentMapping: {
      status: 'reusable',
      component: 'BlogEmptyState',
      sourceFile: 'components/pages/blog/blog-empty-state.tsx',
      notes: 'Public page only shows this state when no posts exist; V2 can preview it directly.',
    },
    editableTextFields: ['title', 'body', 'icon_label'],
    localDraftFields: [
      { id: 'title', label: 'Title', control: 'text' },
      { id: 'body', label: 'Body', control: 'textarea' },
    ],
    editableMediaFields: [],
    ctaFields: [],
    styleEffectFields: ['padding', 'icon_style', 'text_alignment'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 20,
    canReorder: false,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'contact_hero',
    page: 'contact',
    displayName: 'Contact Hero',
    description: 'Contact page intro heading and managed background.',
    currentSectionKey: 'contact_page',
    componentMapping: {
      status: 'needs-extraction',
      component: 'ContactHeroSection',
      sourceFile: 'app/contact/page.tsx',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle', 'body'],
    editableMediaFields: ['image', 'alt_text', 'focus_position', 'overlay_effects'],
    ctaFields: [],
    styleEffectFields: ['padding', 'gradient', 'text_alignment'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 10,
    canReorder: false,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
  {
    id: 'contact_info_form_visual',
    page: 'contact',
    displayName: 'Contact Info/Form Visual',
    description: 'Contact details and form presentation layer.',
    currentSectionKey: 'contact_page',
    componentMapping: {
      status: 'needs-extraction',
      component: 'ContactInfoFormSection',
      sourceFile: 'app/contact/page.tsx',
      notes: 'Form behavior must stay server-validated outside Media Studio.',
    },
    editableTextFields: ['form_title', 'contact_labels'],
    editableMediaFields: [],
    ctaFields: ['submit_text'],
    styleEffectFields: ['gap', 'panel_background', 'border', 'shadow'],
    visibility: { supported: true, defaultVisible: true },
    sortOrder: 20,
    canReorder: false,
    responsive: { modes: ['desktop', 'tablet', 'mobile'], supportsOverrides: true },
  },
]

export const MEDIA_STUDIO_V2_CONTROL_TABS = [
  'Content',
  'Media',
  'Style',
  'Layout',
  'Animation',
  'Advanced',
] as const

const layoutFieldIds = new Set(['alignment', 'padding', 'gap', 'max_width', 'section_height', 'text_alignment', 'text_position'])

const fieldLabels: Record<string, string> = {
  eyebrow: 'Eyebrow',
  title: 'Title',
  subtitle: 'Subtitle',
  body: 'Body',
  stats: 'Stats',
  'stats.value': 'Stat values',
  'stats.label': 'Stat labels',
  'stats.icon': 'Stat icons',
  feature_cards: 'Feature cards',
  'cards.icon': 'Card icons',
  'cards.title': 'Card titles',
  'cards.description': 'Card descriptions',
  image: 'Image',
  mobile_image: 'Mobile image',
  background_media: 'Background media',
  alt_text: 'Alt text',
  focus_position: 'Focus position',
  crop_fit: 'Crop mode',
  overlay_opacity: 'Overlay',
  overlay_effects: 'Overlay effects',
  brightness: 'Brightness',
  contrast: 'Contrast',
  vignette: 'Vignette',
  grain: 'Grain',
  text_width: 'Text width',
  text_position: 'Text position',
  padding: 'Padding',
  gap: 'Gap',
  max_width: 'Max width',
  section_height: 'Section height',
  text_alignment: 'Alignment',
  image_radius: 'Image radius',
  shadow: 'Shadow',
  card_shadow: 'Card shadow',
  icon_style: 'Icon style',
  primary_text: 'Primary button text',
  primary_link: 'Primary button link',
  secondary_text: 'Secondary button text',
  secondary_link: 'Secondary button link',
  button_text: 'Button text',
  button_link: 'Button link',
  submit_text: 'Submit text',
}

function formatControlLabel(field: string) {
  return fieldLabels[field] || field.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getControlState(section: MediaStudioV2Section): MediaStudioV2ControlState {
  return section.componentMapping.status === 'reusable' ? 'preview-only' : 'needs-extraction'
}

function makeControls(section: MediaStudioV2Section, fields: string[], control: MediaStudioV2InspectorControl['control']) {
  const state = getControlState(section)

  return fields.map((field) => ({
    id: field,
    label: formatControlLabel(field),
    description: state === 'preview-only'
      ? 'Read-only preview control. Local draft editing is planned after component parity.'
      : 'Needs component extraction before this control can be wired safely.',
    control,
    state,
  }))
}

export function getMediaStudioV2InspectorControls(section: MediaStudioV2Section, tab: MediaStudioV2InspectorTab): MediaStudioV2InspectorControl[] {
  if (tab === 'Content') {
    if (section.localDraftFields?.length) {
      return section.localDraftFields.map((field) => ({
        id: field.id,
        label: field.label,
        description: field.description || 'Updates the V2 preview locally only. Nothing is saved yet.',
        control: field.control,
        state: 'local-draft-only',
      }))
    }

    return makeControls(section, [...section.editableTextFields, ...section.ctaFields], 'text')
  }

  if (tab === 'Media') {
    return makeControls(section, section.editableMediaFields, 'media')
  }

  if (tab === 'Style') {
    return makeControls(section, section.styleEffectFields.filter((field) => !layoutFieldIds.has(field)), 'slider')
  }

  if (tab === 'Layout') {
    return makeControls(section, section.styleEffectFields.filter((field) => layoutFieldIds.has(field)), 'select')
  }

  if (tab === 'Animation') {
    return makeControls(section, ['entrance', 'motion', 'hover', 'enabled'], 'toggle')
  }

  return [
    {
      id: 'section-key',
      label: 'Section key',
      description: 'Current compatibility key for CMS/media lookup.',
      control: 'info',
      state: 'read-only',
      value: section.currentSectionKey || 'New V2 key pending',
    },
    {
      id: 'component',
      label: 'Component mapping',
      description: section.componentMapping.status,
      control: 'info',
      state: 'read-only',
      value: section.componentMapping.component,
    },
    {
      id: 'source',
      label: 'Component source',
      description: 'Hidden from the default canvas and shown only under Advanced.',
      control: 'info',
      state: 'read-only',
      value: section.componentMapping.sourceFile,
    },
    {
      id: 'fallback',
      label: 'Fallback status',
      description: section.componentMapping.notes || 'Fallback remains active until V2 save/render is connected.',
      control: 'info',
      state: 'read-only',
      value: 'Banners compatibility layer',
    },
  ]
}

export function getMediaStudioV2SectionsByPage(page: MediaStudioV2PageId) {
  return MEDIA_STUDIO_V2_SECTIONS
    .filter((section) => section.page === page)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getMediaStudioV2Page(page: MediaStudioV2PageId) {
  return MEDIA_STUDIO_V2_PAGES.find((item) => item.id === page) ?? MEDIA_STUDIO_V2_PAGES[0]
}
