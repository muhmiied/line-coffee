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

  const filtered = (data || []).map(base => ({
    ...base,
    options: (base.options || [])
      .filter((o: { is_active: boolean }) => o.is_active !== false)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }))

  return NextResponse.json({ success: true, data: filtered })
}
