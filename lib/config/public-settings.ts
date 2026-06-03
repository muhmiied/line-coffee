export const VALID_SECTION_KEYS = ['hero', 'categories', 'features', 'story', 'best_sellers', 'blog', 'testimonials', 'instagram', 'contact'] as const
export type SectionKey = typeof VALID_SECTION_KEYS[number]
export const DEFAULT_SECTION_ORDER: string[] = [...VALID_SECTION_KEYS]
export const DEFAULT_SECTION_VISIBILITY: Record<string, boolean> = Object.fromEntries(VALID_SECTION_KEYS.map(k => [k, true]))

import {
  BRAND_FAVICON_URL,
  BRAND_LOGO_ALT,
  BRAND_LOGO_URL,
  BRAND_SITE_NAME,
  BRAND_TAGLINE,
  CONTACT_ADDRESS_LINE_1,
  CONTACT_ADDRESS_LINE_2,
  CONTACT_CITY,
  CONTACT_COUNTRY,
  CONTACT_EMAIL,
  CONTACT_OPENING_HOURS,
  CONTACT_PHONE,
  FOOTER_BLURB,
  PRIVACY_POLICY_CONTENT,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_KEYWORDS,
  SEO_DEFAULT_TITLE,
  SOCIAL_FACEBOOK_URL,
  SOCIAL_INSTAGRAM_URL,
  SOCIAL_TIKTOK_URL,
  SOCIAL_YOUTUBE_URL,
  TERMS_OF_USE_CONTENT,
  WHATSAPP_ORDER_PHONE_E164,
} from '@/lib/config/site'

export type PublicSiteSettings = {
  brand: {
    site_name: string
    tagline: string
    logo_url: string
    logo_alt: string
    favicon_url: string
  }
  contact: {
    phone: string
    email: string
    address_line_1: string
    address_line_2: string
    city: string
    country: string
    opening_hours: string
  }
  whatsapp: {
    wa_phone: string
  }
  socials: {
    facebook_url: string
    instagram_url: string
    tiktok_url: string
    youtube_url: string
  }
  footer: {
    footer_blurb: string
  }
  seo: {
    default_title: string
    default_description: string
    default_keywords: string
  }
  legal: {
    privacy_policy_content: string
    terms_of_use_content: string
  }
  homepage: {
    section_order: string[]
    section_visibility: Record<string, boolean>
  }
}

export const PUBLIC_SETTINGS_FALLBACK: PublicSiteSettings = {
  brand: {
    site_name: BRAND_SITE_NAME,
    tagline: BRAND_TAGLINE,
    logo_url: BRAND_LOGO_URL,
    logo_alt: BRAND_LOGO_ALT,
    favicon_url: BRAND_FAVICON_URL,
  },
  contact: {
    phone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    address_line_1: CONTACT_ADDRESS_LINE_1,
    address_line_2: CONTACT_ADDRESS_LINE_2,
    city: CONTACT_CITY,
    country: CONTACT_COUNTRY,
    opening_hours: CONTACT_OPENING_HOURS,
  },
  whatsapp: {
    wa_phone: WHATSAPP_ORDER_PHONE_E164,
  },
  socials: {
    facebook_url: SOCIAL_FACEBOOK_URL,
    instagram_url: SOCIAL_INSTAGRAM_URL,
    tiktok_url: SOCIAL_TIKTOK_URL,
    youtube_url: SOCIAL_YOUTUBE_URL,
  },
  footer: {
    footer_blurb: FOOTER_BLURB,
  },
  seo: {
    default_title: SEO_DEFAULT_TITLE,
    default_description: SEO_DEFAULT_DESCRIPTION,
    default_keywords: SEO_DEFAULT_KEYWORDS,
  },
  legal: {
    privacy_policy_content: PRIVACY_POLICY_CONTENT,
    terms_of_use_content: TERMS_OF_USE_CONTENT,
  },
  homepage: {
    section_order: DEFAULT_SECTION_ORDER,
    section_visibility: DEFAULT_SECTION_VISIBILITY,
  },
}

export const PUBLIC_SETTING_KEYS = [
  'brand_site_name',
  'brand_tagline',
  'brand_logo_url',
  'brand_logo_alt',
  'brand_favicon_url',
  'contact_phone',
  'contact_email',
  'contact_address_line_1',
  'contact_address_line_2',
  'contact_city',
  'contact_country',
  'contact_opening_hours',
  'wa_phone',
  'social_facebook_url',
  'social_instagram_url',
  'social_tiktok_url',
  'social_youtube_url',
  'footer_blurb',
  'seo_default_title',
  'seo_default_description',
  'seo_default_keywords',
  'legal_privacy_policy_content',
  'legal_terms_of_use_content',
  'homepage_section_order',
  'homepage_section_visibility',
] as const

type PublicSettingsRow = {
  key: string
  value: unknown
}

function unwrapJsonString(value: string) {
  if (value.length >= 2 && value[0] === '"' && value[value.length - 1] === '"') {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'string') return parsed
    } catch {}
  }

  return value
}

function readSettingValue(value: unknown) {
  if (typeof value === 'string') return unwrapJsonString(value).trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function fromRows(rows: PublicSettingsRow[] | null | undefined) {
  const values = new Map<string, string>()

  for (const row of rows || []) {
    if (PUBLIC_SETTING_KEYS.includes(row.key as (typeof PUBLIC_SETTING_KEYS)[number])) {
      const value = readSettingValue(row.value)
      if (value) values.set(row.key, value)
    }
  }

  return values
}

function getValue(values: Map<string, string>, key: string, fallback: string) {
  return values.get(key) || fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getPayloadValue(group: unknown, key: string, fallback: string) {
  if (!isRecord(group)) return fallback
  const value = group[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function readHomepageOrder(rows: PublicSettingsRow[] | null | undefined): string[] | null {
  const row = rows?.find(r => r.key === 'homepage_section_order')
  if (!row) return null
  const parse = (v: unknown): string[] | null => {
    if (Array.isArray(v)) {
      const filtered = v.filter((s): s is string => typeof s === 'string' && VALID_SECTION_KEYS.includes(s as SectionKey))
      return filtered.length > 0 ? filtered : null
    }
    if (typeof v === 'string') { try { return parse(JSON.parse(v)) } catch {} }
    return null
  }
  return parse(row.value)
}

function readHomepageVisibility(rows: PublicSettingsRow[] | null | undefined): Record<string, boolean> | null {
  const row = rows?.find(r => r.key === 'homepage_section_visibility')
  if (!row) return null
  const parse = (v: unknown): Record<string, boolean> | null => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const result: Record<string, boolean> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (VALID_SECTION_KEYS.includes(k as SectionKey)) result[k] = Boolean(val)
      }
      return Object.keys(result).length > 0 ? result : null
    }
    if (typeof v === 'string') { try { return parse(JSON.parse(v)) } catch {} }
    return null
  }
  return parse(row.value)
}

export function buildPublicSettings(rows?: PublicSettingsRow[] | null): PublicSiteSettings {
  const values = fromRows(rows)
  const fallback = PUBLIC_SETTINGS_FALLBACK

  return {
    brand: {
      site_name: getValue(values, 'brand_site_name', fallback.brand.site_name),
      tagline: getValue(values, 'brand_tagline', fallback.brand.tagline),
      logo_url: getValue(values, 'brand_logo_url', fallback.brand.logo_url),
      logo_alt: getValue(values, 'brand_logo_alt', fallback.brand.logo_alt),
      favicon_url: getValue(values, 'brand_favicon_url', fallback.brand.favicon_url),
    },
    contact: {
      phone: getValue(values, 'contact_phone', fallback.contact.phone),
      email: getValue(values, 'contact_email', fallback.contact.email),
      address_line_1: getValue(values, 'contact_address_line_1', fallback.contact.address_line_1),
      address_line_2: getValue(values, 'contact_address_line_2', fallback.contact.address_line_2),
      city: getValue(values, 'contact_city', fallback.contact.city),
      country: getValue(values, 'contact_country', fallback.contact.country),
      opening_hours: getValue(values, 'contact_opening_hours', fallback.contact.opening_hours),
    },
    whatsapp: {
      wa_phone: getValue(values, 'wa_phone', fallback.whatsapp.wa_phone).replace(/[^\d]/g, ''),
    },
    socials: {
      facebook_url: getValue(values, 'social_facebook_url', fallback.socials.facebook_url),
      instagram_url: getValue(values, 'social_instagram_url', fallback.socials.instagram_url),
      tiktok_url: getValue(values, 'social_tiktok_url', fallback.socials.tiktok_url),
      youtube_url: getValue(values, 'social_youtube_url', fallback.socials.youtube_url),
    },
    footer: {
      footer_blurb: getValue(values, 'footer_blurb', fallback.footer.footer_blurb),
    },
    seo: {
      default_title: getValue(values, 'seo_default_title', fallback.seo.default_title),
      default_description: getValue(values, 'seo_default_description', fallback.seo.default_description),
      default_keywords: getValue(values, 'seo_default_keywords', fallback.seo.default_keywords),
    },
    legal: {
      privacy_policy_content: getValue(values, 'legal_privacy_policy_content', fallback.legal.privacy_policy_content),
      terms_of_use_content: getValue(values, 'legal_terms_of_use_content', fallback.legal.terms_of_use_content),
    },
    homepage: {
      section_order: readHomepageOrder(rows) ?? fallback.homepage.section_order,
      section_visibility: { ...fallback.homepage.section_visibility, ...(readHomepageVisibility(rows) ?? {}) },
    },
  }
}

export function withPublicSettingsFallback(value: unknown): PublicSiteSettings {
  const fallback = PUBLIC_SETTINGS_FALLBACK

  if (!isRecord(value)) return fallback

  return {
    brand: {
      site_name: getPayloadValue(value.brand, 'site_name', fallback.brand.site_name),
      tagline: getPayloadValue(value.brand, 'tagline', fallback.brand.tagline),
      logo_url: getPayloadValue(value.brand, 'logo_url', fallback.brand.logo_url),
      logo_alt: getPayloadValue(value.brand, 'logo_alt', fallback.brand.logo_alt),
      favicon_url: getPayloadValue(value.brand, 'favicon_url', fallback.brand.favicon_url),
    },
    contact: {
      phone: getPayloadValue(value.contact, 'phone', fallback.contact.phone),
      email: getPayloadValue(value.contact, 'email', fallback.contact.email),
      address_line_1: getPayloadValue(value.contact, 'address_line_1', fallback.contact.address_line_1),
      address_line_2: getPayloadValue(value.contact, 'address_line_2', fallback.contact.address_line_2),
      city: getPayloadValue(value.contact, 'city', fallback.contact.city),
      country: getPayloadValue(value.contact, 'country', fallback.contact.country),
      opening_hours: getPayloadValue(value.contact, 'opening_hours', fallback.contact.opening_hours),
    },
    whatsapp: {
      wa_phone: getPayloadValue(value.whatsapp, 'wa_phone', fallback.whatsapp.wa_phone).replace(/[^\d]/g, ''),
    },
    socials: {
      facebook_url: getPayloadValue(value.socials, 'facebook_url', fallback.socials.facebook_url),
      instagram_url: getPayloadValue(value.socials, 'instagram_url', fallback.socials.instagram_url),
      tiktok_url: getPayloadValue(value.socials, 'tiktok_url', fallback.socials.tiktok_url),
      youtube_url: getPayloadValue(value.socials, 'youtube_url', fallback.socials.youtube_url),
    },
    footer: {
      footer_blurb: getPayloadValue(value.footer, 'footer_blurb', fallback.footer.footer_blurb),
    },
    seo: {
      default_title: getPayloadValue(value.seo, 'default_title', fallback.seo.default_title),
      default_description: getPayloadValue(value.seo, 'default_description', fallback.seo.default_description),
      default_keywords: getPayloadValue(value.seo, 'default_keywords', fallback.seo.default_keywords),
    },
    legal: {
      privacy_policy_content: getPayloadValue(value.legal, 'privacy_policy_content', fallback.legal.privacy_policy_content),
      terms_of_use_content: getPayloadValue(value.legal, 'terms_of_use_content', fallback.legal.terms_of_use_content),
    },
    homepage: {
      section_order: (isRecord(value.homepage) && Array.isArray(value.homepage.section_order))
        ? (value.homepage.section_order as unknown[]).filter((s): s is string => typeof s === 'string' && VALID_SECTION_KEYS.includes(s as SectionKey))
        : fallback.homepage.section_order,
      section_visibility: (isRecord(value.homepage) && isRecord(value.homepage.section_visibility))
        ? { ...fallback.homepage.section_visibility, ...Object.fromEntries(Object.entries(value.homepage.section_visibility as Record<string, unknown>).map(([k, v]) => [k, Boolean(v)])) }
        : fallback.homepage.section_visibility,
    },
  }
}

export function formatPublicAddress(contact: PublicSiteSettings['contact']) {
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ')

  return [contact.address_line_1, contact.address_line_2, cityCountry]
    .filter(Boolean)
    .join(', ')
}

export function formatPhoneHref(phone: string) {
  const clean = phone.replace(/[^\d+]/g, '')
  return clean ? `tel:${clean}` : ''
}
