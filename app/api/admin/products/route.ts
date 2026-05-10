import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ\s-]/g, '')
    .replace(/\s+/g, '-')
}

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })
  }

  const { data, error } = await admin
    .from('products')
    .select('*, sizes:product_sizes(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })
  }

  const body = await request.json()
  const nameAr = String(body.name_ar || '').trim()
  const nameEn = String(body.name_en || '').trim()
  const categoryId = String(body.category_id || '').trim() || null

  if (!nameAr || !nameEn) {
    return NextResponse.json({ success: false, error: 'name_ar and name_en are required' }, { status: 400 })
  }

  const slug = body.slug ? String(body.slug) : slugify(nameEn)

  const { data: product, error } = await admin
    .from('products')
    .insert({
      slug,
      name_ar: nameAr,
      name_en: nameEn,
      description_ar: body.description_ar || null,
      description_en: body.description_en || null,
      category_id: categoryId,
      images: body.images || [],
      is_visible: body.is_visible ?? true,
      stock_quantity: Number(body.stock_quantity || 0),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const sizeRows = [
    { size: '250g', price: Number(body.price_250 || 0) },
    { size: '500g', price: Number(body.price_500 || 0) },
    { size: '1kg', price: Number(body.price_1000 || 0) },
  ].filter((size) => size.price > 0)

  if (sizeRows.length > 0) {
    const { error: sizesError } = await admin.from('product_sizes').insert(
      sizeRows.map((size) => ({
        product_id: product.id,
        size: size.size,
        price: size.price,
        is_available: true,
      })),
    )
    if (sizesError) {
      return NextResponse.json({ success: false, error: sizesError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, data: product })
}
