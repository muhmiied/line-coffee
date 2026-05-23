import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const BANNER_SELECT = 'id,title_ar,title_en,subtitle_ar,subtitle_en,image_url,link_url,sort_order,is_active,media_type,usage_area,alt_en,alt_ar,is_featured,images,created_at'

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

function normalizeImages(value: unknown) {
  return Array.isArray(value) ? value : []
}

function buildBannerPayload(body: Record<string, unknown>) {
  return {
    title_ar: textOrNull(body.title_ar),
    title_en: textOrNull(body.title_en),
    subtitle_ar: textOrNull(body.subtitle_ar),
    subtitle_en: textOrNull(body.subtitle_en),
    image_url: String(body.image_url || '').trim(),
    link_url: textOrNull(body.link_url),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_active: body.is_active !== false,
    media_type: textOrNull(body.media_type) || 'banner',
    usage_area: textOrNull(body.usage_area) || 'banner',
    alt_en: textOrNull(body.alt_en),
    alt_ar: textOrNull(body.alt_ar),
    is_featured: Boolean(body.is_featured),
    images: normalizeImages(body.images),
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false }, { status: 403 })
  const { bannerId } = await params
  const body = await request.json()
  const payload = buildBannerPayload(body)

  if (!payload.image_url) {
    return NextResponse.json({ success: false, error: 'Image is required' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('banners')
    .update(payload)
    .eq('id', bannerId)
    .select(BANNER_SELECT)
    .single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false }, { status: 403 })
  const { bannerId } = await params
  const { error } = await admin.from('banners').delete().eq('id', bannerId)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
