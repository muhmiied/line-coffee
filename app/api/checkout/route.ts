import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

function buildWhatsAppOrderMessage(payload: {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  items: Array<{ product_name: string; size?: string; quantity: number; unit_price: number; total_price: number }>
  total: number
}) {
  const itemsText = payload.items
    .map((item, index) => {
      const size = item.size ? ` - ${item.size}` : ''
      return `${index + 1}) ${item.product_name}${size}\nالكمية: ${item.quantity}\nسعر الوحدة: ${item.unit_price} ج.م\nالإجمالي: ${item.total_price} ج.م`
    })
    .join('\n\n')

  return [
    'طلب جديد من الموقع - Line Coffee',
    `رقم الطلب: ${payload.orderNumber}`,
    `العميل: ${payload.customerName}`,
    `الموبايل: ${payload.customerPhone}`,
    `الإيميل: ${payload.customerEmail || '-'}`,
    `العنوان: ${payload.address}`,
    '',
    'تفاصيل المنتجات:',
    itemsText,
    '',
    `الإجمالي النهائي: ${payload.total} ج.م`,
  ].join('\n')
}

export async function POST(request: NextRequest) {
  try {
    // Try to get the authenticated user (optional — guest checkout allowed)
    const supabase = await createClient()
    const userId = supabase
      ? (await supabase.auth.getUser()).data.user?.id ?? null
      : null

    // Use service role for all DB writes to bypass RLS (supports guest orders)
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
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 })
    }

    if (!shipping_address || !shipping_address.first_name || !shipping_address.phone) {
      return NextResponse.json({ success: false, error: 'Shipping address is required' }, { status: 400 })
    }

    // Create order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: `${shipping_address.first_name || ''} ${shipping_address.last_name || ''}`.trim(),
        customer_email: shipping_address.email || null,
        customer_phone: shipping_address.phone || null,
        address: [shipping_address.address, shipping_address.city].filter(Boolean).join(', '),
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
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: {
      product_id: string
      product_name: string
      product_image?: string
      size: string
      quantity: number
      unit_price: number
      total_price: number
    }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image || null,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    const { error: itemsError } = await admin.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      await admin.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ success: false, error: 'Failed to create order items' }, { status: 500 })
    }

    // Increment discount code usage counter
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

    const customerName = `${shipping_address.first_name || ''} ${shipping_address.last_name || ''}`.trim()
    const customerAddress = [shipping_address.address, shipping_address.city].filter(Boolean).join(', ')

    const whatsappMessage =
      buildWhatsAppOrderMessage({
        orderNumber: order.order_number || order.id,
        customerName,
        customerPhone: shipping_address.phone || '-',
        customerEmail: shipping_address.email,
        address: customerAddress || '-',
        items,
        total: order.total,
      }) + (discount_code ? `\n\nكود الخصم: ${discount_code} (خصم ${discount_amount} ج.م)` : '')

    const whatsappUrl = `https://wa.me/${WHATSAPP_ORDER_PHONE_E164}?text=${encodeURIComponent(whatsappMessage)}`

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
