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
  { params }: { params: Promise<{ postId: string }> }
) {
  const supabase = await guard()
  if (!supabase) return NextResponse.json({ success: false }, { status: 403 })
  const { postId } = await params
  const body = await request.json()
  const { data, error } = await supabase.from('blog_posts').update(body).eq('id', postId).select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const supabase = await guard()
  if (!supabase) return NextResponse.json({ success: false }, { status: 403 })
  const { postId } = await params
  const { error } = await supabase.from('blog_posts').delete().eq('id', postId)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
