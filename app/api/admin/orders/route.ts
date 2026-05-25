import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'
import { normalizeOrderStatus } from '@/lib/order-status'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })
  }

  const { data: orders, error } = await admin
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const normalizedOrders = (orders || []).map((order) => ({
    ...order,
    status: normalizeOrderStatus(order.status) || order.status,
  }))

  const REVENUE_STATUSES = ['confirmed', 'preparing', 'shipped', 'delivered']
  const totalSales = normalizedOrders
    .filter(o => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, order) => sum + Number(order.total || 0), 0)

  return NextResponse.json({
    success: true,
    data: {
      orders: normalizedOrders,
      stats: {
        totalSales,
        totalOrders: normalizedOrders.length,
      },
    },
  })
}
