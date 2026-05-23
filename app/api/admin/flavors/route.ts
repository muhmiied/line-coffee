import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const CUSTOMIZE_BASE_ORDER = ['turkish coffee', 'coffee mix', 'cappuccino', 'hot chocolate']
const CUSTOMIZE_BASE_NAMES = ['Turkish Coffee', 'Coffee Mix', 'Cappuccino', 'Hot Chocolate']

type FlavorBaseRow = {
  id: string
  name_en: string
  name_ar: string
  price?: number | null
  type?: string | null
  is_active: boolean
  sort_order: number
  options?: Array<{ sort_order: number; name_en?: string; name_ar?: string }>
}

function normalizeBaseName(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function isCustomizeBase(value: unknown) {
  return CUSTOMIZE_BASE_ORDER.includes(normalizeBaseName(value))
}

function isRemovedFlavor(option: { name_en?: string; name_ar?: string }) {
  const nameEn = normalizeBaseName(option.name_en)
  const nameAr = String(option.name_ar || '')
  return nameEn === 'sahlab' || nameEn === 'salep' || nameAr.includes('سحلب')
}

function normalizeNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
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
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result

  const { data, error } = await admin
    .from('flavor_bases')
    .select(`
      id,
      name_en,
      name_ar,
      price,
      type,
      is_active,
      sort_order,
      created_at,
      updated_at,
      options:flavor_options(
        id,
        base_id,
        name_en,
        name_ar,
        price_delta,
        option_type,
        is_active,
        sort_order,
        created_at,
        updated_at
      )
    `)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ success: false, error: 'Failed to load flavors' }, { status: 500 })

  const sorted = (data || [])
    .filter((base: FlavorBaseRow) => isCustomizeBase(base.name_en))
    .sort((a: FlavorBaseRow, b: FlavorBaseRow) => {
      const aIndex = CUSTOMIZE_BASE_ORDER.indexOf(normalizeBaseName(a.name_en))
      const bIndex = CUSTOMIZE_BASE_ORDER.indexOf(normalizeBaseName(b.name_en))
      return aIndex - bIndex
    })
    .map((base: FlavorBaseRow) => ({
      ...base,
      options: (base.options || [])
        .filter(option => !isRemovedFlavor(option))
        .sort((a, b) => normalizeNumber(a.sort_order) - normalizeNumber(b.sort_order)),
    }))

  return NextResponse.json({ success: true, data: sorted })
}

export async function POST(request: NextRequest) {
  const result = await guard()
  if ('error' in result) return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  const { admin } = result

  const body = await request.json().catch(() => null)
  if (!body?.name_en?.trim() || !body?.name_ar?.trim()) {
    return NextResponse.json({ success: false, error: 'English and Arabic names are required' }, { status: 400 })
  }

  if (!isCustomizeBase(body.name_en)) {
    return NextResponse.json(
      { success: false, error: `Customize Flavor bases are limited to: ${CUSTOMIZE_BASE_NAMES.join(', ')}` },
      { status: 400 },
    )
  }

  const { data, error } = await admin
    .from('flavor_bases')
    .insert({
      name_en: body.name_en.trim(),
      name_ar: body.name_ar.trim(),
      price: normalizeNumber(body.price),
      type: body.type || 'base',
      is_active: body.is_active !== false,
      sort_order: normalizeNumber(body.sort_order),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: 'Failed to save flavor base' }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
