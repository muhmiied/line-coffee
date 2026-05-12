import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 })
  }

  const { data, error } = await admin
    .from('flavor_bases')
    .select('id, name_en, name_ar, sort_order, options:flavor_options(id, name_en, name_ar, sort_order, is_active)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Filter to only active options within each base
  const filtered = (data || []).map(base => ({
    ...base,
    options: (base.options || []).filter(
      (o: { id: unknown; name_en: unknown; name_ar: unknown; sort_order: unknown; is_active: unknown }) =>
        o.is_active !== false
    ),
  }))

  return NextResponse.json({ success: true, data: filtered })
}
