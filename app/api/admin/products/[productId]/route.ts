import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { productId } = await params
  const body = await request.json()

  const patch: Record<string, unknown> = {}
  if (body.name_ar !== undefined) patch.name_ar = body.name_ar
  if (body.name_en !== undefined) patch.name_en = body.name_en
  if (body.description_ar !== undefined) patch.description_ar = body.description_ar || null
  if (body.description_en !== undefined) patch.description_en = body.description_en || null
  if (body.is_visible !== undefined) patch.is_visible = body.is_visible
  if (body.stock_quantity !== undefined) patch.stock_quantity = Number(body.stock_quantity)
  if ('category_id' in body) patch.category_id = body.category_id
  if (body.images !== undefined) patch.images = body.images

  const { error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', productId)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const priceMap: Record<string, number> = {
    '250g': Number(body.price_250 || 0),
    '500g': Number(body.price_500 || 0),
    '1kg': Number(body.price_1000 || 0),
  }

  for (const [size, price] of Object.entries(priceMap)) {
    if (price <= 0) continue
    const { data: existing } = await supabase
      .from('product_sizes')
      .select('id')
      .eq('product_id', productId)
      .eq('size', size)
      .maybeSingle()

    if (existing?.id) {
      await supabase.from('product_sizes').update({ price }).eq('id', existing.id)
    } else {
      await supabase.from('product_sizes').insert({ product_id: productId, size, price, is_available: true })
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { productId } = await params
  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

