import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 })
  }

  const { data, error } = await admin
    .from('coffee_beans')
    .select('id, name_en, name_ar, origin, description_en, description_ar, sort_order, stock_quantity, low_stock_threshold, is_manually_out_of_stock')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}
