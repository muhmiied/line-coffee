import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

type BeanFamily = 'arabica' | 'robusta'

const COFFEE_BEAN_COLUMNS = `
  id,
  name_en,
  name_ar,
  origin,
  description_en,
  description_ar,
  is_active,
  stock_quantity,
  low_stock_threshold,
  is_manually_out_of_stock,
  sort_order,
  family,
  price,
  created_at,
  updated_at
`

function normalizeFamily(value: unknown): BeanFamily {
  return value === 'robusta' ? 'robusta' : 'arabica'
}

function normalizeNumber(value: unknown): number {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
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
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
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

  if ('origin' in body) payload.origin = String(body.origin || '').trim() || null
  if ('description_en' in body) payload.description_en = String(body.description_en || '').trim() || null
  if ('description_ar' in body) payload.description_ar = String(body.description_ar || '').trim() || null
  if ('family' in body) payload.family = normalizeFamily(body.family)
  if ('is_active' in body) payload.is_active = body.is_active === true
  if ('stock_quantity' in body) payload.stock_quantity = Math.max(0, Math.floor(normalizeNumber(body.stock_quantity)))
  if ('low_stock_threshold' in body) payload.low_stock_threshold = Math.max(0, Math.floor(normalizeNumber(body.low_stock_threshold)))
  if ('is_manually_out_of_stock' in body) payload.is_manually_out_of_stock = body.is_manually_out_of_stock === true
  if ('sort_order' in body) payload.sort_order = normalizeNumber(body.sort_order)
  if ('price' in body) {
    const price = normalizeNumber(body.price)
    if (price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price per kg must be greater than zero' },
        { status: 400 },
      )
    }
    payload.price = price
  }

  const { data, error } = await admin
    .from('coffee_beans')
    .update(payload)
    .eq('id', id)
    .select(COFFEE_BEAN_COLUMNS)
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to update coffee bean' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result
  const { id } = await params

  const { data, error } = await admin
    .from('coffee_beans')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COFFEE_BEAN_COLUMNS)
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to disable coffee bean' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
