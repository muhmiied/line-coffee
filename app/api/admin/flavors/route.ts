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

// GET — all flavor categories with their flavors
export async function GET() {
  const result = await guard()
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result

  const { data, error } = await admin
    .from('flavor_bases')
    .select('*, options:flavor_options(id, name_en, name_ar, price_delta, option_type, is_active, sort_order)')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const sorted = (data || []).map(base => ({
    ...base,
    options: (base.options || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }))

  return NextResponse.json({ success: true, data: sorted })
}

// POST — create a new flavor category (base)
export async function POST(request: NextRequest) {
  const result = await guard()
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result

  const body = await request.json()
  if (!body.name_en?.trim() || !body.name_ar?.trim()) {
    return NextResponse.json({ success: false, error: 'Both names are required' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('flavor_bases')
    .insert({
      name_en: body.name_en.trim(),
      name_ar: body.name_ar.trim(),
      price: Number(body.price || 0),
      type: body.type || 'base',
      is_active: body.is_active ?? true,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
