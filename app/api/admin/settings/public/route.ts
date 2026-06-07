import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'
import { buildPublicSettings, VALID_SECTION_KEYS } from '@/lib/config/public-settings'

const WHITELIST = new Set([
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
  'social_facebook_url',
  'social_instagram_url',
  'social_tiktok_url',
  'social_youtube_url',
  'footer_blurb',
  'seo_default_title',
  'seo_default_description',
  'seo_default_keywords',
  'homepage_section_order',
  'homepage_section_visibility',
])

async function guard() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Database service not configured', status: 503 }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return { error: 'Forbidden', status: 403 }

  const admin = createAdminClient()
  if (!admin) return { error: 'Service role not configured', status: 503 }

  return { admin }
}

export async function GET() {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }

  const { data, error } = await result.admin
    .from('site_settings')
    .select('key, value')
    .in('key', [...WHITELIST])

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const settings = buildPublicSettings(data)
  const { whatsapp: _wa, legal: _legal, ...publicGroups } = settings

  return NextResponse.json({ success: true, data: publicGroups })
}

export async function PATCH(request: NextRequest) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const rows: Array<{ key: string; value: string }> = []
  for (const [key, value] of Object.entries(body)) {
    if (!WHITELIST.has(key)) continue
    if (key === 'homepage_section_order') {
      if (Array.isArray(value)) {
        const filtered = value.filter((s): s is string => typeof s === 'string' && VALID_SECTION_KEYS.includes(s as typeof VALID_SECTION_KEYS[number]))
        rows.push({ key, value: JSON.stringify(filtered) })
      }
    } else if (key === 'homepage_section_visibility') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const filtered: Record<string, boolean> = {}
        for (const [sk, sv] of Object.entries(value as Record<string, unknown>)) {
          if (VALID_SECTION_KEYS.includes(sk as typeof VALID_SECTION_KEYS[number])) filtered[sk] = sv === false ? false : true
        }
        rows.push({ key, value: JSON.stringify(filtered) })
      }
    } else if (typeof value === 'string') {
      rows.push({ key, value: value.trim() })
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await result.admin
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const { data: updated } = await result.admin
    .from('site_settings')
    .select('key, value')
    .in('key', [...WHITELIST])

  const settings = buildPublicSettings(updated)
  const { whatsapp: _wa2, legal: _legal2, ...publicGroups } = settings

  return NextResponse.json({ success: true, data: publicGroups })
}
