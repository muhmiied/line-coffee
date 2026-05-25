import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function sanitizeCategoryPatch(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const source = body as Record<string, unknown>
  const patch: Record<string, unknown> = {}

  if (typeof source.name_ar === 'string') patch.name_ar = source.name_ar.trim()
  if (typeof source.name_en === 'string') {
    const nameEn = source.name_en.trim()
    if (nameEn) {
      patch.name_en = nameEn
      patch.slug = slugify(nameEn)
    }
  }
  if (typeof source.image_url === 'string') patch.image_url = source.image_url.trim() || null
  if (source.image_url === null) patch.image_url = null
  if (typeof source.sort_order === 'number' && Number.isFinite(source.sort_order)) patch.sort_order = source.sort_order
  if (typeof source.is_visible === 'boolean') patch.is_visible = source.is_visible

  return patch
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })

  const { categoryId } = await params
  if (!UUID_RE.test(categoryId)) {
    return NextResponse.json({ success: false, error: 'Invalid category id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const patch = sanitizeCategoryPatch(body)
  if (!patch || typeof patch.name_en !== 'string') {
    return NextResponse.json({ success: false, error: 'Valid English category name is required' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('categories')
    .update({ sort_order: 0, ...patch })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })

  const { categoryId } = await params
  if (!UUID_RE.test(categoryId)) {
    return NextResponse.json({ success: false, error: 'Invalid category id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const patch = sanitizeCategoryPatch(body)
  if (!patch || Object.keys(patch).length === 0) {
    return NextResponse.json({ success: false, error: 'No valid category fields' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('categories')
    .update(patch)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })

  const { categoryId } = await params
  if (!UUID_RE.test(categoryId)) {
    return NextResponse.json({ success: false, error: 'Invalid category id' }, { status: 400 })
  }

  const { error } = await admin.from('categories').delete().eq('id', categoryId)

  if (error) return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 400 })
  return NextResponse.json({ success: true })
}
