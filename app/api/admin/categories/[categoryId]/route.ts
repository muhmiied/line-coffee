import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const { categoryId } = await params
  const { name_ar, name_en, image_url, sort_order } = await request.json()
  const slug = name_en.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data, error } = await supabase
    .from('categories')
    .update({ slug, name_ar, name_en, image_url: image_url || null, sort_order: sort_order ?? 0 })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
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

  const { categoryId } = await params
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
