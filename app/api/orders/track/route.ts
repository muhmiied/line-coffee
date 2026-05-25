import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ORDER_TIMELINE_STATUSES, normalizeOrderStatus } from '@/lib/order-status'

const STATUS_STEPS = [...ORDER_TIMELINE_STATUSES]

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('order_number')?.trim()

  if (!orderNumber) {
    return NextResponse.json({ success: false, error: 'order_number is required' }, { status: 400 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Service not configured' }, { status: 503 })
  }

  const { data, error } = await admin
    .from('orders')
    .select('id, order_number, status, total, subtotal, shipping_cost, created_at, updated_at, notes, items:order_items(product_name, size, quantity, unit_price, total_price, customizations)')
    .eq('order_number', orderNumber)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  const status = normalizeOrderStatus(data.status) || data.status
  const isCancelled = status === 'cancelled'
  const currentStep = isCancelled ? -1 : (STATUS_STEPS as readonly string[]).indexOf(status)

  return NextResponse.json({
    success: true,
    data: {
      order_number: data.order_number,
      status,
      total: data.total,
      subtotal: data.subtotal,
      shipping_cost: data.shipping_cost,
      created_at: data.created_at,
      updated_at: data.updated_at,
      notes: data.notes,
      items: data.items || [],
      is_cancelled: isCancelled,
      current_step: currentStep,
      steps: STATUS_STEPS,
    },
  })
}
