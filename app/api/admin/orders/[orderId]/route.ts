import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const ALLOWED_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

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

  if (body.status !== undefined) {
    const status = String(body.status)
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }
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
  if (body.cancellation_reason && body.status === 'cancelled') {
    const reason = String(body.cancellation_reason).trim()
    const existingNotes = body.notes || ''
    updatePayload.notes = existingNotes
      ? `${existingNotes}\n\nسبب الإلغاء: ${reason}`
      : `سبب الإلغاء: ${reason}`
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select('*, items:order_items(product_name, size, quantity, unit_price, total_price)')
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Return the order with customer phone so the client can send WhatsApp notification
  const customerPhone = data?.customer_phone || data?.shipping_address?.phone || null
  const customerPhoneE164 = customerPhone
    ? customerPhone.replace(/^0/, '20').replace(/[^0-9]/g, '')
    : null

  return NextResponse.json({
    success: true,
    data,
    whatsapp: customerPhoneE164
      ? {
          phone: customerPhoneE164,
          orderNumber: data?.order_number,
          newStatus: body.status,
          cancellationReason: body.cancellation_reason || null,
        }
      : null,
  })
}
