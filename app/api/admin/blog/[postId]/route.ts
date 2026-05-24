import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const BLOG_SELECT = [
  'id',
  'title_ar',
  'title_en',
  'slug',
  'content_ar',
  'content_en',
  'excerpt_ar',
  'excerpt_en',
  'cover_image',
  'seo_title_ar',
  'seo_title_en',
  'seo_description_ar',
  'seo_description_en',
  'is_published',
  'published_at',
  'sort_order',
  'created_at',
  'updated_at',
].join(', ')

async function guardAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  return createAdminClient()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function nullableText(value: unknown) {
  const text = cleanText(value)
  return text || null
}

function normalizePostPayload(body: Record<string, unknown>) {
  const titleEn = cleanText(body.title_en)
  const titleAr = cleanText(body.title_ar)
  const slug = slugify(cleanText(body.slug) || titleEn)
  const payload: Record<string, unknown> = {
    title_ar: titleAr,
    title_en: titleEn,
    slug,
    content_ar: nullableText(body.content_ar),
    content_en: nullableText(body.content_en),
    excerpt_ar: nullableText(body.excerpt_ar),
    excerpt_en: nullableText(body.excerpt_en),
    cover_image: nullableText(body.cover_image),
    seo_title_ar: nullableText(body.seo_title_ar),
    seo_title_en: nullableText(body.seo_title_en),
    seo_description_ar: nullableText(body.seo_description_ar),
    seo_description_en: nullableText(body.seo_description_en),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  }

  if ('is_published' in body) payload.is_published = Boolean(body.is_published)

  return payload
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false }, { status: 403 })
  const { postId } = await params
  const body = await request.json()
  const payload = normalizePostPayload(body)

  if (!payload.title_ar || !payload.title_en || !payload.slug) {
    return NextResponse.json({ success: false, error: 'Arabic title, English title, and slug are required' }, { status: 400 })
  }

  const { data: current } = await admin
    .from('blog_posts')
    .select('is_published, published_at')
    .eq('id', postId)
    .maybeSingle()

  if (payload.is_published === true && !current?.published_at) {
    payload.published_at = new Date().toISOString()
  }

  if (payload.is_published === false) {
    payload.published_at = null
  }

  const { data, error } = await admin
    .from('blog_posts')
    .update(payload)
    .eq('id', postId)
    .select(BLOG_SELECT)
    .single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false }, { status: 403 })
  const { postId } = await params
  const { error } = await admin.from('blog_posts').delete().eq('id', postId)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
