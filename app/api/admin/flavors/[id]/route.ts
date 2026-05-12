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

// PATCH — update base OR add/update/delete an option
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result
  const { id } = await params

  const body = await request.json()

  // Adding a new option to this base
  if (body.action === 'add_option') {
    if (!body.name_en?.trim() || !body.name_ar?.trim()) {
      return NextResponse.json({ success: false, error: 'name_en and name_ar are required' }, { status: 400 })
    }
    const { data, error } = await admin
      .from('flavor_options')
      .insert({
        base_id: id,
        name_en: body.name_en.trim(),
        name_ar: body.name_ar.trim(),
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  }

  // Update an option
  if (body.action === 'update_option' && body.option_id) {
    const allowed = ['name_en', 'name_ar', 'is_active', 'sort_order']
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) payload[key] = body[key]
    }
    const { data, error } = await admin
      .from('flavor_options')
      .update(payload)
      .eq('id', body.option_id)
      .eq('base_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  }

  // Delete an option
  if (body.action === 'delete_option' && body.option_id) {
    const { error } = await admin
      .from('flavor_options')
      .delete()
      .eq('id', body.option_id)
      .eq('base_id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // Update the base itself
  const allowed = ['name_en', 'name_ar', 'is_active', 'sort_order']
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) payload[key] = body[key]
  }

  const { data, error } = await admin
    .from('flavor_bases')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

// DELETE — remove entire flavor base (cascades options)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result
  const { id } = await params

  const { error } = await admin.from('flavor_bases').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
