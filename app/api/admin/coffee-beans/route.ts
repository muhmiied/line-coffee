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

export async function GET() {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result

  const { data, error } = await admin
    .from('coffee_beans')
    .select(COFFEE_BEAN_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to load coffee beans' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(request: NextRequest) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }
  const { admin } = result

  const body = await request.json().catch(() => null)

  if (!body?.name_en?.trim() || !body?.name_ar?.trim()) {
    return NextResponse.json(
      { success: false, error: 'English and Arabic names are required' },
      { status: 400 },
    )
  }

  const price = normalizeNumber(body.price)
  if (price <= 0) {
    return NextResponse.json(
      { success: false, error: 'Price per kg must be greater than zero' },
      { status: 400 },
    )
  }

  const { data, error } = await admin
    .from('coffee_beans')
    .insert({
      name_en: body.name_en.trim(),
      name_ar: body.name_ar.trim(),
      origin: body.origin?.trim() || null,
      description_en: body.description_en?.trim() || null,
      description_ar: body.description_ar?.trim() || null,
      family: normalizeFamily(body.family),
      price,
      is_active: body.is_active !== false,
      sort_order: normalizeNumber(body.sort_order),
    })
    .select(COFFEE_BEAN_COLUMNS)
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to save coffee bean' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
