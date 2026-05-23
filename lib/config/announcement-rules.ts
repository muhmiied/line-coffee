export type AnnouncementRuleType =
  | 'text'
  | 'free_shipping'
  | 'discount'
  | 'product_promo'
  | 'custom_link'

export type AnnouncementAnimation = 'fade' | 'marquee'

export interface AnnouncementRule {
  id: string
  type: AnnouncementRuleType
  active: boolean
  text_ar: string
  text_en: string
  animation: AnnouncementAnimation
  duration: number
  starts_at: string | null
  ends_at: string | null
  minimum_order?: number
  discount_code?: string
  link_url?: string
  button_text_ar?: string
  button_text_en?: string
  applies_to?: 'all'
  shipping_discount_percent?: number
  auto_apply?: boolean
}

export interface AnnouncementDisplayItem {
  id: string
  text_ar: string
  text_en: string
  link_url?: string
  button_text_ar?: string
  button_text_en?: string
}

const RULE_TYPES: AnnouncementRuleType[] = [
  'text',
  'free_shipping',
  'discount',
  'product_promo',
  'custom_link',
]

function unwrapJsonString(value: string): string {
  const trimmed = value.trim()

  if (trimmed.length >= 2 && trimmed[0] === '"' && trimmed[trimmed.length - 1] === '"') {
    try {
      const parsed = JSON.parse(trimmed)
      if (typeof parsed === 'string') return parsed
    } catch {}
  }

  return trimmed
}

function cleanString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function cleanDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : value
}

function parseDuration(value: unknown): number {
  const duration = Number(value)
  if (!Number.isFinite(duration) || duration <= 0) return 4000
  return Math.min(Math.max(Math.round(duration), 1500), 30000)
}

function parsePositiveNumber(value: unknown): number | undefined {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return undefined
  return Math.round(amount * 100) / 100
}

function parseRuleType(value: unknown): AnnouncementRuleType {
  return RULE_TYPES.includes(value as AnnouncementRuleType)
    ? (value as AnnouncementRuleType)
    : 'text'
}

function parseAnimation(value: unknown): AnnouncementAnimation {
  return value === 'marquee' ? 'marquee' : 'fade'
}

export function buildDefaultFreeShippingText(minimumOrder: number, language: 'ar' | 'en') {
  return language === 'ar'
    ? `🚀 توصيل مجاني على الطلبات فوق ${minimumOrder} ج`
    : `🚀 Free shipping on orders over ${minimumOrder} EGP`
}

export function normalizeAnnouncementRule(value: unknown, index = 0): AnnouncementRule | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const input = value as Record<string, unknown>
  const type = parseRuleType(input.type)
  const minimumOrder = parsePositiveNumber(input.minimum_order)
  const id = cleanString(input.id, 80) || `${type}-${Date.now()}-${index}`
  const duration = parseDuration(input.duration)
  const textAr = cleanString(input.text_ar)
  const textEn = cleanString(input.text_en)

  const rule: AnnouncementRule = {
    id,
    type,
    active: input.active !== false,
    text_ar: textAr,
    text_en: textEn,
    animation: parseAnimation(input.animation),
    duration,
    starts_at: cleanDate(input.starts_at),
    ends_at: cleanDate(input.ends_at),
  }

  if (type === 'free_shipping') {
    const safeMinimumOrder = minimumOrder || 200
    rule.minimum_order = safeMinimumOrder
    rule.applies_to = 'all'
    rule.shipping_discount_percent = 100
    rule.auto_apply = true

    if (!rule.text_ar) rule.text_ar = buildDefaultFreeShippingText(safeMinimumOrder, 'ar')
    if (!rule.text_en) rule.text_en = buildDefaultFreeShippingText(safeMinimumOrder, 'en')
  }

  if (type === 'discount') {
    rule.discount_code = cleanString(input.discount_code, 80).toUpperCase()
  }

  if (type === 'product_promo' || type === 'custom_link') {
    rule.link_url = cleanString(input.link_url, 300)
    rule.button_text_ar = cleanString(input.button_text_ar, 80)
    rule.button_text_en = cleanString(input.button_text_en, 80)
  }

  if (!rule.text_ar && !rule.text_en) return null

  return rule
}

export function parseAnnouncementRules(value: unknown): AnnouncementRule[] {
  if (typeof value !== 'string') return []

  const raw = unwrapJsonString(value)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item, index) => normalizeAnnouncementRule(item, index))
      .filter((item): item is AnnouncementRule => item !== null)
  } catch {
    return []
  }
}

export function isAnnouncementRuleInDateWindow(
  rule: Pick<AnnouncementRule, 'starts_at' | 'ends_at'>,
  now = new Date()
): boolean {
  if (rule.starts_at && new Date(rule.starts_at) > now) return false
  if (rule.ends_at && new Date(rule.ends_at) < now) return false
  return true
}

export function getActiveAnnouncementRules(rules: AnnouncementRule[], now = new Date()) {
  return rules.filter((rule) => rule.active && isAnnouncementRuleInDateWindow(rule, now))
}

export function getAnnouncementDisplayItems(rules: AnnouncementRule[]): AnnouncementDisplayItem[] {
  return rules
    .map((rule) => ({
      id: rule.id,
      text_ar: rule.text_ar || rule.text_en,
      text_en: rule.text_en || rule.text_ar,
      link_url: rule.link_url || undefined,
      button_text_ar: rule.button_text_ar || undefined,
      button_text_en: rule.button_text_en || undefined,
    }))
    .filter((item) => item.text_ar || item.text_en)
}

export function getPrimaryAnnouncementTiming(rules: AnnouncementRule[]) {
  const first = rules[0]

  return {
    animation: first?.animation || 'fade',
    speed: first?.duration || 4000,
  }
}
