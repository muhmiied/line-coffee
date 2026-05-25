import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'
import { restoreOrderStock } from '@/lib/services'
import { ORDER_STATUSES, canAdminTransition, normalizeOrderStatus } from '@/lib/order-status'

const STATUS_LABELS: Record<string, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  preparing: 'being prepared',
  shipped: 'out for delivery',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

function isMissingNotificationsTable(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || error?.message?.toLowerCase().includes('notifications')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
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

  const body = await request.json()
  const { orderId } = await params

  const updatePayload: Record<string, unknown> = {}
  let nextStatus: string | undefined

  const { data: currentOrder, error: currentError } = await admin
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single()

  if (currentError || !currentOrder) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  if (body.status !== undefined) {
    const status = normalizeOrderStatus(body.status)
    if (!status || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    if (!canAdminTransition(currentOrder.status, status)) {
      return NextResponse.json({ success: false, error: 'Invalid status transition' }, { status: 409 })
    }

    nextStatus = status
    updatePayload.status = status
  }

  if (body.payment_status !== undefined) {
    const allowed = ['pending', 'paid', 'failed', 'refunded']
    const ps = String(body.payment_status)
    if (!allowed.includes(ps)) {
      return NextResponse.json({ success: false, error: 'Invalid payment_status' }, { status: 400 })
    }
    updatePayload.payment_status = ps
  }

  if (body.notes !== undefined) {
    updatePayload.notes = body.notes
  }

  // Handle cancellation reason — append to notes
  if (body.cancellation_reason && nextStatus === 'cancelled') {
    const reason = String(body.cancellation_reason).trim()
    const existingNotes = body.notes || ''
    updatePayload.notes = existingNotes
      ? `${existingNotes}\n\nسبب الإلغاء: ${reason}`
      : `سبب الإلغاء: ${reason}`
  }

  if (nextStatus === 'cancelled' && normalizeOrderStatus(currentOrder.status) !== 'cancelled') {
    await restoreOrderStock(orderId)
    updatePayload.cancelled_at = new Date().toISOString()
    updatePayload.cancellation_initiated_by = 'admin'
    if (body.cancellation_reason) {
      updatePayload.cancellation_reason = String(body.cancellation_reason).trim()
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select('*, items:order_items(product_name, size, quantity, unit_price, total_price, customizations)')
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }

  let notificationCreated = false
  if (nextStatus && data?.user_id) {
    const { error: notificationError } = await admin
      .from('notifications')
      .insert({
        user_id: data.user_id,
        title: 'Order status updated',
        message: `Your order #${data.order_number || orderId} is now ${STATUS_LABELS[nextStatus] || nextStatus}.`,
        type: 'order_status',
        related_order_id: data.id,
      })

    notificationCreated = !notificationError

    if (notificationError && !isMissingNotificationsTable(notificationError)) {
      console.error('Failed to create order notification:', notificationError.message)
    }
  }

  // Return the order with customer phone so the client can send WhatsApp notification
  const customerPhone = data?.customer_phone || data?.shipping_address?.phone || null
  const customerPhoneE164 = customerPhone
    ? customerPhone.replace(/^0/, '20').replace(/[^0-9]/g, '')
    : null

  return NextResponse.json({
    success: true,
    data,
    notification_created: notificationCreated,
    whatsapp: customerPhoneE164
      ? {
          phone: customerPhoneE164,
          orderNumber: data?.order_number,
          newStatus: nextStatus || data?.status,
          cancellationReason: body.cancellation_reason || null,
        }
      : null,
  })
}
