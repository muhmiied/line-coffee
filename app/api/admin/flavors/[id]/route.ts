import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

type FlavorOptionType = 'standard' | 'chunks'

function normalizeOptionType(value: unknown): FlavorOptionType {
  return value === 'chunks' ? 'chunks' : 'standard'
}

function normalizeNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isRemovedFlavor(nameEn: unknown, nameAr: unknown) {
  const normalizedName = String(nameEn || '').trim().toLowerCase()
  const arabicName = String(nameAr || '')
  return normalizedName === 'sahlab' || normalizedName === 'salep' || arabicName.includes('سحلب')
}

async function guard() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Not configured', status: 503 }
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return { error: 'Forbidden', status: 403 }
  const admin = createAdminClient()
  if (!admin) return { error: 'Service role not configured', status: 503 }
  return { admin }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await guard()
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result
  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  if (body.action === 'add_flavor') {
    const nameEn = String(body.name_en || '').trim()
    const nameAr = String(body.name_ar || '').trim()
    if (!nameEn || !nameAr) {
      return NextResponse.json({ success: false, error: 'English and Arabic names are required' }, { status: 400 })
    }
    if (isRemovedFlavor(nameEn, nameAr)) {
      return NextResponse.json({ success: false, error: 'This flavor is not part of the final Customize Flavor list' }, { status: 400 })
    }

    const priceDelta = normalizeNumber(body.price_delta ?? body.price ?? 50)
    if (priceDelta < 0) {
      return NextResponse.json({ success: false, error: 'Price delta must be zero or greater' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('flavor_options')
      .insert({
        base_id: id,
        name_en: nameEn,
        name_ar: nameAr,
        price_delta: priceDelta,
        option_type: normalizeOptionType(body.option_type),
        is_active: body.is_active !== false,
        stock_quantity: Math.max(0, Math.floor(normalizeNumber(body.stock_quantity ?? 100))),
        low_stock_threshold: Math.max(0, Math.floor(normalizeNumber(body.low_stock_threshold ?? 10))),
        is_manually_out_of_stock: Boolean(body.is_manually_out_of_stock ?? false),
        sort_order: normalizeNumber(body.sort_order),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: 'Failed to save flavor' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  if (body.action === 'update_flavor' && body.flavor_id) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if ('name_en' in body) {
      const name = String(body.name_en || '').trim()
      if (!name) return NextResponse.json({ success: false, error: 'English name is required' }, { status: 400 })
      payload.name_en = name
    }

    if ('name_ar' in body) {
      const name = String(body.name_ar || '').trim()
      if (!name) return NextResponse.json({ success: false, error: 'Arabic name is required' }, { status: 400 })
      payload.name_ar = name
    }

    if (isRemovedFlavor(payload.name_en ?? body.name_en, payload.name_ar ?? body.name_ar)) {
      return NextResponse.json({ success: false, error: 'This flavor is not part of the final Customize Flavor list' }, { status: 400 })
    }

    if ('price_delta' in body) {
      const priceDelta = normalizeNumber(body.price_delta)
      if (priceDelta < 0) {
        return NextResponse.json({ success: false, error: 'Price delta must be zero or greater' }, { status: 400 })
      }
      payload.price_delta = priceDelta
    }

    if ('option_type' in body) payload.option_type = normalizeOptionType(body.option_type)
    if ('is_active' in body) payload.is_active = body.is_active === true
    if ('stock_quantity' in body) payload.stock_quantity = Math.max(0, Math.floor(normalizeNumber(body.stock_quantity)))
    if ('low_stock_threshold' in body) payload.low_stock_threshold = Math.max(0, Math.floor(normalizeNumber(body.low_stock_threshold)))
    if ('is_manually_out_of_stock' in body) payload.is_manually_out_of_stock = body.is_manually_out_of_stock === true
    if ('sort_order' in body) payload.sort_order = normalizeNumber(body.sort_order)

    const { data, error } = await admin
      .from('flavor_options')
      .update(payload)
      .eq('id', body.flavor_id)
      .eq('base_id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: 'Failed to update flavor' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  if (body.action === 'delete_flavor' && body.flavor_id) {
    const { data, error } = await admin
      .from('flavor_options')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', body.flavor_id)
      .eq('base_id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: 'Failed to hide flavor' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if ('name_en' in body) {
    const name = String(body.name_en || '').trim()
    if (!name) return NextResponse.json({ success: false, error: 'English name is required' }, { status: 400 })
    payload.name_en = name
  }
  if ('name_ar' in body) {
    const name = String(body.name_ar || '').trim()
    if (!name) return NextResponse.json({ success: false, error: 'Arabic name is required' }, { status: 400 })
    payload.name_ar = name
  }
  if ('price' in body) payload.price = normalizeNumber(body.price)
  if ('type' in body) payload.type = String(body.type || 'base')
  if ('is_active' in body) payload.is_active = body.is_active === true
  if ('sort_order' in body) payload.sort_order = normalizeNumber(body.sort_order)

  const { data, error } = await admin
    .from('flavor_bases')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: 'Failed to update flavor base' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await guard()
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result
  const { id } = await params

  const { data, error } = await admin
    .from('flavor_bases')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: 'Failed to hide flavor base' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
