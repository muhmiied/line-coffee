import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, created_at')
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, total, status')

  const orderMap: Record<string, { count: number; total: number }> = {}
  ;(orders || []).forEach(o => {
    if (!o.user_id) return
    if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, total: 0 }
    orderMap[o.user_id].count++
    orderMap[o.user_id].total += Number(o.total || 0)
  })

  const customers = (profiles || []).map(p => ({
    ...p,
    orderCount: orderMap[p.id]?.count || 0,
    totalSpent: orderMap[p.id]?.total || 0,
  }))

  return NextResponse.json({ success: true, data: customers })
}
