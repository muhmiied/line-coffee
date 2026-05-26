import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const MEDIA_SELECT = 'id,title_ar,title_en,subtitle_ar,subtitle_en,image_url,link_url,sort_order,is_active,media_type,usage_area,alt_en,alt_ar,is_featured,images,section_key,slide_key,section_type,button_text_ar,button_text_en,button_link,mobile_image_url,overlay_opacity,object_position,content,layout,animation_type,animation_duration,device_visibility,starts_at,ends_at,created_at,updated_at'

async function guardAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  return createAdminClient()
}

function textOrNull(value: unknown) {
  const text = String(value || '').trim()
  return text || null
}

function normalizeRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function normalizeImages(value: unknown) {
  return Array.isArray(value) ? value : []
}

function buildMediaPayload(body: Record<string, unknown>) {
  const imageUrl = String(body.image_url || body.fallback_image || '').trim()

  return {
    title_ar: textOrNull(body.title_ar),
    title_en: textOrNull(body.title_en),
    subtitle_ar: textOrNull(body.subtitle_ar),
    subtitle_en: textOrNull(body.subtitle_en),
    image_url: imageUrl,
    link_url: textOrNull(body.link_url),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_active: body.is_active !== false,
    media_type: textOrNull(body.media_type) || 'section',
    usage_area: textOrNull(body.usage_area) || 'section',
    section_key: textOrNull(body.section_key) || textOrNull(body.usage_area) || 'section',
    slide_key: textOrNull(body.slide_key),
    section_type: textOrNull(body.section_type) || 'full_image_banner',
    alt_en: textOrNull(body.alt_en),
    alt_ar: textOrNull(body.alt_ar),
    is_featured: Boolean(body.is_featured),
    button_text_ar: textOrNull(body.button_text_ar),
    button_text_en: textOrNull(body.button_text_en),
    button_link: textOrNull(body.button_link) || textOrNull(body.link_url),
    mobile_image_url: textOrNull(body.mobile_image_url),
    overlay_opacity: Number.isFinite(Number(body.overlay_opacity)) ? Number(body.overlay_opacity) : 0.55,
    object_position: textOrNull(body.object_position) || 'center center',
    content: normalizeRecord(body.content),
    layout: normalizeRecord(body.layout),
    animation_type: textOrNull(body.animation_type) || 'fade',
    animation_duration: Number.isFinite(Number(body.animation_duration)) ? Number(body.animation_duration) : 6000,
    device_visibility: normalizeRecord(body.device_visibility),
    starts_at: textOrNull(body.starts_at),
    ends_at: textOrNull(body.ends_at),
    images: normalizeImages(body.images),
  }
}

export async function GET(request: Request) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { searchParams } = new URL(request.url)
    const sectionKey = searchParams.get('section_key')

    let query = admin
      .from('banners')
      .select(MEDIA_SELECT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (sectionKey) query = query.eq('section_key', sectionKey)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load media studio data' },
      { status: 400 },
    )
  }
}

export async function POST(request: Request) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const payload = buildMediaPayload(body)

    if (!payload.image_url) {
      return NextResponse.json({ success: false, error: 'Image is required' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('banners')
      .insert(payload)
      .select(MEDIA_SELECT)
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create media item' },
      { status: 400 },
    )
  }
}
