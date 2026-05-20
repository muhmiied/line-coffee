import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })

  const { data } = await admin
    .from('testimonials')
    .select('id, customer_name, customer_avatar, content_ar, content_en, rating, is_visible, is_featured, is_approved, created_at')
    .order('created_at', { ascending: false })

  return NextResponse.json({ success: true, data: data || [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })

  const { id, is_visible, is_featured, is_approved } = await request.json()
  const payload: Record<string, unknown> = {}
  if (is_visible !== undefined) payload.is_visible = is_visible
  if (is_featured !== undefined) payload.is_featured = is_featured
  if (is_approved !== undefined) payload.is_approved = is_approved

  const { error } = await admin
    .from('testimonials')
    .update(payload)
    .eq('id', id)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })

  const { id } = await request.json()
  const { error } = await admin.from('testimonials').delete().eq('id', id)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
