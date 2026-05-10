import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

async function guard() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  return supabase
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  const supabase = await guard()
  if (!supabase) return NextResponse.json({ success: false }, { status: 403 })
  const { bannerId } = await params
  const body = await request.json()
  const { data, error } = await supabase.from('banners').update(body).eq('id', bannerId).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  const supabase = await guard()
  if (!supabase) return NextResponse.json({ success: false }, { status: 403 })
  const { bannerId } = await params
  const { error } = await supabase.from('banners').delete().eq('id', bannerId)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
