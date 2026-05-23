import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getActiveAnnouncementRules,
  getAnnouncementDisplayItems,
  getPrimaryAnnouncementTiming,
  normalizeAnnouncementRule,
  parseAnnouncementRules,
  type AnnouncementRule,
} from '@/lib/config/announcement-rules'
import { parseFreeShippingActive, parseFreeShippingThreshold } from '@/lib/config/shipping'
import { isAdminEmail } from '@/lib/config/site'

const DEFAULT_ANNOUNCEMENT = {
  text: '🚀 توصيل مجاني على الطلبات فوق 200 ج',
  active: true,
  messages: ['🚀 توصيل مجاني على الطلبات فوق 200 ج'],
  animation: 'fade',
  speed: 4000,
}

// Unwrap one layer of JSON-string double-encoding if present.
// "\"text\"" (JS string) → "text" (JS string), "text" → "text".
function unwrapJsonString(v: string): string {
  if (v.length >= 2 && v[0] === '"' && v[v.length - 1] === '"') {
    try {
      const inner = JSON.parse(v)
      if (typeof inner === 'string') return inner
    } catch {}
  }
  return v
}

// Accepts JSON boolean true, string "true", or double-encoded string "\"true\"".
function parseActive(v: unknown): boolean {
  if (v === true) return true
  if (typeof v !== 'string') return false
  return unwrapJsonString(v).toLowerCase() === 'true'
}

// Accepts a plain string or a double-encoded string; falls back to defaultText.
function parseText(v: unknown, defaultText: string): string {
  if (typeof v !== 'string') return defaultText
  return unwrapJsonString(v) || defaultText
}

function parseMessages(v: unknown, fallbackText: string): string[] {
  if (typeof v !== 'string') return [fallbackText]

  const raw = unwrapJsonString(v).trim()
  if (!raw) return [fallbackText]

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const messages = parsed
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)

      if (messages.length > 0) return messages
    }
  } catch {}

  const messages = raw
    .split(/\|\||\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)

  return messages.length > 0 ? messages : [fallbackText]
}

function parseAnimation(v: unknown): 'fade' | 'marquee' {
  const animation = typeof v === 'string' ? unwrapJsonString(v).toLowerCase() : ''
  return animation === 'marquee' ? 'marquee' : 'fade'
}

function parseSpeed(v: unknown): number {
  if (v === null || v === undefined || v === '') return DEFAULT_ANNOUNCEMENT.speed
  const raw = typeof v === 'string' ? unwrapJsonString(v) : v
  if (raw === '') return DEFAULT_ANNOUNCEMENT.speed
  const value = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(value)) return DEFAULT_ANNOUNCEMENT.speed
  return Math.min(Math.max(Math.round(value), 1500), 30000)
}

export async function GET() {
  try {
    const admin = createAdminClient()
    if (!admin) return NextResponse.json(DEFAULT_ANNOUNCEMENT)

    const { data, error } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'announcement_text',
        'announcement_active',
        'announcement_messages',
        'announcement_animation',
        'announcement_speed',
        'announcement_rules',
        'free_shipping_threshold',
        'free_shipping_active',
      ])

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT)
    }

    const get = (k: string) => data.find(r => r.key === k)?.value ?? null

    const activeRaw = get('announcement_active')
    const text = parseText(get('announcement_text'), DEFAULT_ANNOUNCEMENT.text)
    const hasRulesConfig = get('announcement_rules') !== null
    const rules = parseAnnouncementRules(get('announcement_rules'))
    const activeRules = getActiveAnnouncementRules(rules)
    const items = getAnnouncementDisplayItems(activeRules)
    const timing = items.length > 0
      ? getPrimaryAnnouncementTiming(activeRules)
      : {
          animation: parseAnimation(get('announcement_animation')),
          speed: parseSpeed(get('announcement_speed')),
        }
    const legacyMessages = hasRulesConfig ? [] : parseMessages(get('announcement_messages'), text)
    const messagesAr = items.length > 0 ? items.map((item) => item.text_ar) : legacyMessages
    const messagesEn = items.length > 0 ? items.map((item) => item.text_en) : legacyMessages
    const baseActive = activeRaw !== null ? parseActive(activeRaw) : DEFAULT_ANNOUNCEMENT.active

    return NextResponse.json({
      text: messagesAr[0] || text,
      // null means the key is absent → fall back to the default (true).
      // Only call parseActive when the row actually exists.
      active: baseActive && (!hasRulesConfig || items.length > 0),
      messages: messagesAr,
      messages_ar: messagesAr,
      messages_en: messagesEn,
      items,
      rules,
      animation: timing.animation,
      speed: timing.speed,
      free_shipping_threshold: parseFreeShippingThreshold(get('free_shipping_threshold')),
      free_shipping_active: parseFreeShippingActive(get('free_shipping_active')),
    })
  } catch {
    return NextResponse.json(DEFAULT_ANNOUNCEMENT)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'DB not configured' }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminEmail(user?.email)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })
    }

    const body = await request.json()
    const rows: Array<{ key: string; value: string }> = []

    if (typeof body.text === 'string') rows.push({ key: 'announcement_text', value: body.text })
    if (typeof body.active === 'boolean') rows.push({ key: 'announcement_active', value: String(body.active) })
    if (Array.isArray(body.rules)) {
      const rules: AnnouncementRule[] = []

      for (let index = 0; index < body.rules.length; index += 1) {
        const rawRule = body.rules[index]
        if (!rawRule || typeof rawRule !== 'object' || Array.isArray(rawRule)) continue

        const input = rawRule as Record<string, unknown>
        if (input.type === 'free_shipping' && Number(input.minimum_order) <= 0) {
          return NextResponse.json(
            { success: false, error: 'Free shipping minimum order must be positive' },
            { status: 400 }
          )
        }

        const rule = normalizeAnnouncementRule(rawRule, index)
        if (rule) rules.push(rule)
      }

      const activeRules = getActiveAnnouncementRules(rules)
      const items = getAnnouncementDisplayItems(activeRules)
      const timing = getPrimaryAnnouncementTiming(activeRules)
      const freeShippingRule =
        rules.find((rule) => rule.type === 'free_shipping' && rule.active) ||
        rules.find((rule) => rule.type === 'free_shipping')

      rows.push({ key: 'announcement_rules', value: JSON.stringify(rules) })
      rows.push({ key: 'announcement_messages', value: JSON.stringify(items.map((item) => item.text_ar)) })
      rows.push({ key: 'announcement_text', value: items[0]?.text_ar || '' })
      rows.push({ key: 'announcement_animation', value: timing.animation })
      rows.push({ key: 'announcement_speed', value: String(timing.speed) })

      if (freeShippingRule?.minimum_order) {
        rows.push({ key: 'free_shipping_threshold', value: String(freeShippingRule.minimum_order) })
        rows.push({ key: 'free_shipping_active', value: String(freeShippingRule.active) })
        rows.push({ key: 'free_shipping_starts_at', value: freeShippingRule.starts_at || '' })
        rows.push({ key: 'free_shipping_ends_at', value: freeShippingRule.ends_at || '' })
      } else {
        rows.push({ key: 'free_shipping_active', value: 'false' })
      }
    }
    if (Array.isArray(body.messages)) {
      const messages = body.messages
        .filter((item: unknown): item is string => typeof item === 'string')
        .map((item: string) => item.trim())
        .filter(Boolean)

      rows.push({ key: 'announcement_messages', value: JSON.stringify(messages) })
    } else if (typeof body.messages === 'string') {
      rows.push({ key: 'announcement_messages', value: body.messages })
    }
    if (body.animation === 'fade' || body.animation === 'marquee') {
      rows.push({ key: 'announcement_animation', value: body.animation })
    }
    if (typeof body.speed === 'number' || typeof body.speed === 'string') {
      rows.push({ key: 'announcement_speed', value: String(parseSpeed(body.speed)) })
    }

    if (rows.length > 0) {
      const { error } = await admin
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
