import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const { data: cats } = await supabase
    .from('categories')
    .select('id, name_ar, name_en, image_url, sort_order')
    .order('sort_order', { ascending: true })

  const { data: products } = await supabase.from('products').select('category_id')
  const countMap: Record<string, number> = {}
  ;(products || []).forEach(p => {
    if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1
  })

  const categories = (cats || []).map(c => ({ ...c, productCount: countMap[c.id] || 0 }))
  return NextResponse.json({ success: true, data: categories })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const body = await request.json()
  const { name_ar, name_en, image_url, sort_order } = body

  const slug = slugify(name_en)
  const { data, error } = await supabase
    .from('categories')
    .insert({ slug, name_ar, name_en, image_url: image_url || null, sort_order: sort_order ?? 0, is_visible: true })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}
