import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

export async function GET() {
  // Verify requesting user is admin via session cookie (ANON KEY)
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false }, { status: 403 })

  // Use service role to bypass RLS
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })

  // Get all auth users (includes email, created_at)
  const { data: { users }, error: usersError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (usersError) return NextResponse.json({ success: false, error: usersError.message }, { status: 500 })

  // Get all profiles (first_name, last_name, phone)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, first_name, last_name, phone')

  // Get all orders for per-customer stats
  const { data: orders } = await admin
    .from('orders')
    .select('user_id, total, status')

  const orderMap: Record<string, { count: number; total: number }> = {}
  ;(orders || []).forEach(o => {
    if (!o.user_id) return
    if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, total: 0 }
    orderMap[o.user_id].count++
    orderMap[o.user_id].total += Number(o.total || 0)
  })

  const profileMap: Record<string, { first_name: string | null; last_name: string | null; phone: string | null }> = {}
  ;(profiles || []).forEach(p => {
    profileMap[p.id] = { first_name: p.first_name, last_name: p.last_name, phone: p.phone }
  })

  const customers = (users || []).map(u => ({
    id: u.id,
    email: u.email,
    first_name: profileMap[u.id]?.first_name || null,
    last_name: profileMap[u.id]?.last_name || null,
    phone: profileMap[u.id]?.phone || null,
    created_at: u.created_at,
    orderCount: orderMap[u.id]?.count || 0,
    totalSpent: orderMap[u.id]?.total || 0,
  }))

  return NextResponse.json({ success: true, data: customers })
}
