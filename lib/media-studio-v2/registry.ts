export type MediaStudioV2PageId = 'home' | 'about' | 'products' | 'blog' | 'contact'

export type MediaStudioV2MappingStatus = 'reusable' | 'needs-extraction' | 'composite'

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
      status: 'needs-extraction',
      component: 'AboutHeroSection',
      sourceFile: 'app/about/page.tsx',
      notes: 'Currently inline in the About page.',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle'],
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
      status: 'needs-extraction',
      component: 'AboutLegacyStats',
      sourceFile: 'app/about/page.tsx',
      notes: 'Currently hardcoded in the page stats array.',
    },
    editableTextFields: ['stats.value', 'stats.label', 'stats.icon'],
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
      status: 'needs-extraction',
      component: 'AboutJourneySection',
      sourceFile: 'app/about/page.tsx',
    },
    editableTextFields: ['eyebrow', 'title', 'body'],
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
      status: 'needs-extraction',
      component: 'AboutValuesSection',
      sourceFile: 'app/about/page.tsx',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle', 'cards.title', 'cards.description'],
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
      status: 'needs-extraction',
      component: 'ProductsHeroSection',
      sourceFile: 'app/products/page.tsx',
    },
    editableTextFields: ['title', 'subtitle'],
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
      status: 'needs-extraction',
      component: 'BlogHeroSection',
      sourceFile: 'app/blog/page.tsx',
    },
    editableTextFields: ['eyebrow', 'title', 'subtitle'],
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
      status: 'needs-extraction',
      component: 'BlogEmptyState',
      sourceFile: 'app/blog/page.tsx',
      notes: 'Only visible when the public posts list is empty.',
    },
    editableTextFields: ['title', 'body', 'icon_label'],
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

export function getMediaStudioV2SectionsByPage(page: MediaStudioV2PageId) {
  return MEDIA_STUDIO_V2_SECTIONS
    .filter((section) => section.page === page)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getMediaStudioV2Page(page: MediaStudioV2PageId) {
  return MEDIA_STUDIO_V2_PAGES.find((item) => item.id === page) ?? MEDIA_STUDIO_V2_PAGES[0]
}
