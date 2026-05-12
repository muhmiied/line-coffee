import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  electronic_wallet: 'محفظة إلكترونية',
  instapay: 'إنستاباي',
}

function buildWhatsAppMessage(payload: {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  city?: string
  items: Array<{
    product_name: string
    size?: string
    quantity: number
    unit_price: number
    total_price: number
    customizations?: Record<string, unknown>
  }>
  subtotal: number
  shipping_cost: number
  discountCode?: string
  discountAmount?: number
  total: number
  paymentMethod: string
  notes?: string
}): string {
  const itemsText = payload.items
    .map((item, i) => {
      const size = item.size ? ` - ${item.size}` : ''
      const customs = item.customizations
        ? `\n   ↳ ${JSON.stringify(item.customizations)}`
        : ''
      return (
        `${i + 1}. ${item.product_name}${size}${customs}\n` +
        `   الكمية: ${item.quantity}  |  السعر: ${item.unit_price} ج.م  |  الإجمالي: ${item.total_price} ج.م`
      )
    })
    .join('\n\n')

  const addressLine = [payload.address, payload.city].filter(Boolean).join('، ')
  const paymentLabel = PAYMENT_LABELS[payload.paymentMethod] || payload.paymentMethod

  const lines = [
    '🛒 *طلب جديد - Line Coffee*',
    '─────────────────────────',
    `📦 رقم الطلب: *${payload.orderNumber}*`,
    '',
    '👤 *بيانات العميل*',
    `الاسم: ${payload.customerName}`,
    `الموبايل: ${payload.customerPhone}`,
    payload.customerEmail ? `الإيميل: ${payload.customerEmail}` : null,
    `العنوان: ${addressLine || '-'}`,
    '',
    '🛍️ *المنتجات*',
    itemsText,
    '',
    '💰 *ملخص الطلب*',
    `المجموع الفرعي: ${payload.subtotal} ج.م`,
    payload.shipping_cost > 0
      ? `الشحن: ${payload.shipping_cost} ج.م`
      : 'الشحن: مجاني',
    payload.discountCode && payload.discountAmount
      ? `الخصم (${payload.discountCode}): -${payload.discountAmount} ج.م`
      : null,
    `*الإجمالي النهائي: ${payload.total} ج.م*`,
    '',
    `💳 طريقة الدفع: ${paymentLabel}`,
    payload.notes ? `\n📝 ملاحظات: ${payload.notes}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return lines
}

export async function POST(request: NextRequest) {
  try {
    // Try to get authenticated user (optional — guest checkout is allowed)
    const supabase = await createClient()
    const userId = supabase
      ? (await supabase.auth.getUser()).data.user?.id ?? null
      : null

    // Use service-role client for all DB writes (bypasses RLS, supports guests)
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Database service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const {
      items,
      subtotal,
      shipping_cost,
      total,
      shipping_address,
      payment_method,
      discount_code,
      discount_amount,
      notes,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 })
    }

    if (!shipping_address?.first_name || !shipping_address?.phone) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    const customerName =
      `${shipping_address.first_name || ''} ${shipping_address.last_name || ''}`.trim()
    const fullAddress =
      [shipping_address.address, shipping_address.city].filter(Boolean).join(', ')

    // ── Create order ─────────────────────────────────────────────
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: customerName,
        customer_email: shipping_address.email || null,
        customer_phone: shipping_address.phone || null,
        address: fullAddress,
        items,
        subtotal: subtotal || 0,
        shipping_cost: shipping_cost || 0,
        tax: 0,
        discount_code: discount_code || null,
        discount_amount: discount_amount || 0,
        total: total || subtotal || 0,
        shipping_address,
        billing_address: shipping_address,
        payment_method: payment_method || 'cod',
        payment_status: 'pending',
        status: 'pending',
        notes: notes || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { success: false, error: 'Failed to create order: ' + orderError.message },
        { status: 500 }
      )
    }

    // ── Create order items ────────────────────────────────────────
    const orderItems = items.map(
      (item: {
        product_id: string
        product_name: string
        product_image?: string
        size: string
        quantity: number
        unit_price: number
        total_price: number
        customizations?: Record<string, unknown>
      }) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image || null,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        customizations: item.customizations || null,
      })
    )

    const { error: itemsError } = await admin.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Roll back the order
      await admin.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // ── Deduct stock ──────────────────────────────────────────────
    for (const item of items) {
      if (!item.product_id) continue
      const { data: product } = await admin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single()
      if (product && typeof product.stock_quantity === 'number') {
        const newQty = Math.max(0, product.stock_quantity - item.quantity)
        await admin
          .from('products')
          .update({ stock_quantity: newQty })
          .eq('id', item.product_id)
      }
    }

    // ── Increment discount usage ──────────────────────────────────
    if (discount_code) {
      const { data: disc } = await admin
        .from('discounts')
        .select('uses')
        .eq('code', discount_code)
        .single()
      if (disc) {
        await admin
          .from('discounts')
          .update({ uses: (disc.uses || 0) + 1 })
          .eq('code', discount_code)
      }
    }

    // ── Build WhatsApp URL ────────────────────────────────────────
    const whatsappMessage = buildWhatsAppMessage({
      orderNumber: order.order_number || order.id,
      customerName,
      customerPhone: shipping_address.phone || '-',
      customerEmail: shipping_address.email,
      address: shipping_address.address || '',
      city: shipping_address.city,
      items,
      subtotal: subtotal || 0,
      shipping_cost: shipping_cost || 0,
      discountCode: discount_code || undefined,
      discountAmount: discount_amount || undefined,
      total: order.total,
      paymentMethod: payment_method || 'cod',
      notes: notes || undefined,
    })

    const whatsappUrl = `https://wa.me/${WHATSAPP_ORDER_PHONE_E164}?text=${encodeURIComponent(
      whatsappMessage
    )}`

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        status: order.status,
      },
      whatsapp_url: whatsappUrl,
      message: 'Order created successfully',
    })
  } catch (error) {
    console.error('Checkout API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process checkout',
      },
      { status: 500 }
    )
  }
}
