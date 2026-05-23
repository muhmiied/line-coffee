import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CUSTOMIZE_BASE_ORDER = ['turkish coffee', 'coffee mix', 'cappuccino', 'hot chocolate']

function normalizeName(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function isCustomizeBase(value: unknown) {
  return CUSTOMIZE_BASE_ORDER.includes(normalizeName(value))
}

function isRemovedFlavor(option: { name_en?: string; name_ar?: string }) {
  const nameEn = normalizeName(option.name_en)
  const nameAr = String(option.name_ar || '')
  return nameEn === 'sahlab' || nameEn === 'salep' || nameAr.includes('سحلب')
}

export async function GET() {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 })
  }

  const { data, error } = await admin
    .from('flavor_bases')
    .select('id, name_en, name_ar, sort_order, options:flavor_options(id, name_en, name_ar, sort_order, price_delta, option_type, is_active)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to load flavors' }, { status: 500 })
  }

  const filtered = (data || [])
    .filter(base => isCustomizeBase(base.name_en))
    .sort((a, b) => CUSTOMIZE_BASE_ORDER.indexOf(normalizeName(a.name_en)) - CUSTOMIZE_BASE_ORDER.indexOf(normalizeName(b.name_en)))
    .map(base => ({
      ...base,
      options: (base.options || [])
        .filter((option: { is_active: boolean; name_en?: string; name_ar?: string }) => option.is_active !== false && !isRemovedFlavor(option))
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
    }))

  return NextResponse.json({ success: true, data: filtered })
}
