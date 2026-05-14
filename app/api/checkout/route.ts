import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  electronic_wallet: 'محفظة إلكترونية',
  instapay: 'إنستاباي',
}

const FREE_SHIPPING_THRESHOLD = 200
const STANDARD_SHIPPING_COST = 25

type CheckoutItemInput = {
  product_id?: unknown
  product_name?: unknown
  product_image?: unknown
  size?: unknown
  quantity?: unknown
  unit_price?: unknown
  customizations?: unknown
}

type SanitizedCheckoutItem = {
  product_id: string | null
  product_name: string
  product_image: string | null
  size: string
  quantity: number
  unit_price: number
  total_price: number
  customizations?: Record<string, unknown>
}

type CatalogProduct = {
  id: string
  name_en: string | null
  name_ar: string | null
  images: string[] | null
  is_visible: boolean | null
  sizes: Array<{
    size: string
    price: number | string
    is_available: boolean | null
  }> | null
}

type DiscountRow = {
  code: string
  type: 'percentage' | 'fixed'
  value: number | string
  min_order: number | string | null
  max_uses: number | null
  uses: number | null
  expires_at: string | null
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function toQuantity(value: unknown): number | null {
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null
  return quantity
}

function toMoney(value: unknown): number | null {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return null
  return Math.round(amount * 100) / 100
}

function toCleanString(value: unknown, fallback: string, maxLength = 180): string {
  if (typeof value !== 'string') return fallback
  const clean = value.trim()
  return (clean || fallback).slice(0, maxLength)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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
    // Checkout is account-bound so carts and orders cannot leak between users.
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service not configured' },
        { status: 503 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please login to complete your order' },
        { status: 401 }
      )
    }

    const userId = user.id

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
      shipping_address,
      payment_method,
      discount_code,
      notes,
    } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 })
    }

    if (!shipping_address?.first_name || !shipping_address?.phone) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    const inputItems = items as CheckoutItemInput[]
    const realProductIds = Array.from(new Set(inputItems.map((item) => item.product_id).filter(isUuid)))
    const catalogProducts = new Map<string, CatalogProduct>()

    if (realProductIds.length > 0) {
      const { data: products, error: productsError } = await admin
        .from('products')
        .select('id, name_en, name_ar, images, is_visible, sizes:product_sizes(size, price, is_available)')
        .in('id', realProductIds)

      if (productsError) {
        return NextResponse.json(
          { success: false, error: 'Failed to validate cart products' },
          { status: 500 }
        )
      }

      for (const product of (products || []) as CatalogProduct[]) {
        catalogProducts.set(product.id, product)
      }
    }

    const sanitizedItems: SanitizedCheckoutItem[] = []

    for (const item of inputItems) {
      const quantity = toQuantity(item.quantity)
      if (!quantity) {
        return NextResponse.json({ success: false, error: 'Invalid item quantity' }, { status: 400 })
      }

      const size = toCleanString(item.size, 'default', 40)
      const originalProductId = typeof item.product_id === 'string' ? item.product_id : null
      const baseCustomizations = isRecord(item.customizations) ? item.customizations : undefined

      if (isUuid(originalProductId)) {
        const product = catalogProducts.get(originalProductId)
        if (!product || product.is_visible === false) {
          return NextResponse.json({ success: false, error: 'A product in your cart is unavailable' }, { status: 400 })
        }

        const selectedSize = product.sizes?.find(
          (productSize) => productSize.size === size && productSize.is_available !== false
        )

        if (!selectedSize) {
          return NextResponse.json({ success: false, error: 'A selected product size is unavailable' }, { status: 400 })
        }

        const unitPrice = toMoney(selectedSize.price)
        if (unitPrice === null) {
          return NextResponse.json({ success: false, error: 'A product has invalid pricing' }, { status: 400 })
        }

        sanitizedItems.push({
          product_id: originalProductId,
          product_name: toCleanString(item.product_name, product.name_ar || product.name_en || 'Line Coffee product'),
          product_image: typeof item.product_image === 'string' ? item.product_image : product.images?.[0] || null,
          size,
          quantity,
          unit_price: unitPrice,
          total_price: Math.round(unitPrice * quantity * 100) / 100,
          customizations: baseCustomizations,
        })
        continue
      }

      const customPrice = toMoney(item.unit_price)
      if (customPrice === null || customPrice <= 0 || customPrice > 100000) {
        return NextResponse.json({ success: false, error: 'Invalid custom item price' }, { status: 400 })
      }

      sanitizedItems.push({
        product_id: null,
        product_name: toCleanString(item.product_name, 'Line Coffee custom item'),
        product_image: typeof item.product_image === 'string' ? item.product_image : null,
        size,
        quantity,
        unit_price: customPrice,
        total_price: Math.round(customPrice * quantity * 100) / 100,
        customizations: {
          ...(baseCustomizations || {}),
          original_product_id: originalProductId,
        },
      })
    }

    const computedSubtotal = sanitizedItems.reduce((sum, item) => sum + item.total_price, 0)
    const computedShippingCost = computedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
    let appliedDiscountCode: string | null = null
    let computedDiscountAmount = 0

    if (typeof discount_code === 'string' && discount_code.trim()) {
      const requestedCode = discount_code.trim().toUpperCase()
      const { data: discount, error: discountError } = await admin
        .from('discounts')
        .select('code, type, value, min_order, max_uses, uses, expires_at')
        .eq('code', requestedCode)
        .eq('is_active', true)
        .maybeSingle()

      if (discountError || !discount) {
        return NextResponse.json({ success: false, error: 'Invalid or expired discount code' }, { status: 400 })
      }

      const validDiscount = discount as DiscountRow
      const minOrder = toMoney(validDiscount.min_order) || 0
      const discountValue = toMoney(validDiscount.value)

      if (validDiscount.expires_at && new Date(validDiscount.expires_at) < new Date()) {
        return NextResponse.json({ success: false, error: 'This discount code has expired' }, { status: 400 })
      }

      if (validDiscount.max_uses !== null && (validDiscount.uses || 0) >= validDiscount.max_uses) {
        return NextResponse.json({ success: false, error: 'This discount code has reached its usage limit' }, { status: 400 })
      }

      if (computedSubtotal < minOrder) {
        return NextResponse.json({ success: false, error: 'Minimum order amount was not met' }, { status: 400 })
      }

      if (discountValue === null) {
        return NextResponse.json({ success: false, error: 'Invalid discount value' }, { status: 400 })
      }

      appliedDiscountCode = validDiscount.code
      computedDiscountAmount = validDiscount.type === 'percentage'
        ? Math.round((computedSubtotal * discountValue) / 100)
        : Math.min(discountValue, computedSubtotal)
    }

    const computedTotal = Math.max(
      0,
      Math.round((computedSubtotal + computedShippingCost - computedDiscountAmount) * 100) / 100
    )

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
        items: sanitizedItems,
        subtotal: computedSubtotal,
        shipping_cost: computedShippingCost,
        tax: 0,
        discount_code: appliedDiscountCode,
        discount_amount: computedDiscountAmount,
        total: computedTotal,
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
    const orderItems = sanitizedItems.map(
      (item) => ({
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
    for (const item of sanitizedItems) {
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
    if (appliedDiscountCode) {
      const { data: disc } = await admin
        .from('discounts')
        .select('uses')
        .eq('code', appliedDiscountCode)
        .single()
      if (disc) {
        await admin
          .from('discounts')
          .update({ uses: (disc.uses || 0) + 1 })
          .eq('code', appliedDiscountCode)
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
      items: sanitizedItems,
      subtotal: computedSubtotal,
      shipping_cost: computedShippingCost,
      discountCode: appliedDiscountCode || undefined,
      discountAmount: computedDiscountAmount || undefined,
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
