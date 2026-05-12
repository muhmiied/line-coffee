import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

async function guard() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Not configured', status: 503 }
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return { error: 'Forbidden', status: 403 }
  const admin = createAdminClient()
  if (!admin) return { error: 'Service role not configured', status: 503 }
  return { admin }
}

// PATCH — update base, or add/update/delete a flavor within it
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await guard()
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result
  const { id } = await params
  const body = await request.json()

  // ── Add a new flavor to this category ──────────────────────────────────
  if (body.action === 'add_flavor') {
    if (!body.name_en?.trim() || !body.name_ar?.trim()) {
      return NextResponse.json({ success: false, error: 'Both names are required' }, { status: 400 })
    }
    const { data, error } = await admin
      .from('flavor_options')
      .insert({ base_id: id, name_en: body.name_en.trim(), name_ar: body.name_ar.trim(), is_active: body.is_active ?? true, sort_order: body.sort_order ?? 0 })
      .select()
      .single()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  // ── Update an existing flavor ──────────────────────────────────────────
  if (body.action === 'update_flavor' && body.flavor_id) {
    const allowed = ['name_en', 'name_ar', 'is_active', 'sort_order']
    const payload: Record<string, unknown> = {}
    for (const key of allowed) { if (key in body) payload[key] = body[key] }
    const { data, error } = await admin
      .from('flavor_options')
      .update(payload)
      .eq('id', body.flavor_id)
      .eq('base_id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  // ── Delete a flavor ────────────────────────────────────────────────────
  if (body.action === 'delete_flavor' && body.flavor_id) {
    const { error } = await admin.from('flavor_options').delete().eq('id', body.flavor_id).eq('base_id', id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ── Update the category (base) itself ─────────────────────────────────
  const allowed = ['name_en', 'name_ar', 'is_active', 'sort_order']
  const payload: Record<string, unknown> = {}
  for (const key of allowed) { if (key in body) payload[key] = body[key] }
  const { data, error } = await admin.from('flavor_bases').update(payload).eq('id', id).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

// DELETE — remove a flavor category (cascades all its flavors)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await guard()
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result
  const { id } = await params
  const { error } = await admin.from('flavor_bases').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
