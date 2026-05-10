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

export async function GET() {
  const supabase = await guard()
  if (!supabase) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch {
    return NextResponse.json({ success: false, error: 'Table not found' }, { status: 404 })
  }
}

export async function POST(request: Request) {
  const supabase = await guard()
  if (!supabase) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { data, error } = await supabase.from('blog_posts').insert(body).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 })
  }
}
