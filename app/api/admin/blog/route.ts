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
  const isPublished = Boolean(body.is_published)
  const titleEn = cleanText(body.title_en)
  const titleAr = cleanText(body.title_ar)
  const slug = slugify(cleanText(body.slug) || titleEn)

  return {
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
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  }
}

export async function GET() {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { data, error } = await admin
      .from('blog_posts')
      .select(BLOG_SELECT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Blog table not ready' },
      { status: 404 },
    )
  }
}

export async function POST(request: Request) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const payload = normalizePostPayload(body)

    if (!payload.title_ar || !payload.title_en || !payload.slug) {
      return NextResponse.json({ success: false, error: 'Arabic title, English title, and slug are required' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('blog_posts')
      .insert(payload)
      .select(BLOG_SELECT)
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 })
  }
}
