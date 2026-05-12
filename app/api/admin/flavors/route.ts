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

// GET all flavor bases with their options
export async function GET() {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result

  const { data: bases, error } = await admin
    .from('flavor_bases')
    .select('*, options:flavor_options(*)')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: bases || [] })
}

// POST — create a new flavor base
export async function POST(request: NextRequest) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result

  const body = await request.json()

  if (!body.name_en?.trim() || !body.name_ar?.trim()) {
    return NextResponse.json(
      { success: false, error: 'name_en and name_ar are required' },
      { status: 400 },
    )
  }

  const { data, error } = await admin
    .from('flavor_bases')
    .insert({
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

  return NextResponse.json({ success: true, data }, { status: 201 })
}
