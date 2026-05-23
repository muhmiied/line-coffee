import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  STANDARD_SHIPPING_COST,
  calculateShippingCost,
  isDateWindowActive,
  parseFreeShippingActive,
  parseFreeShippingThreshold,
} from '@/lib/config/shipping'
import type { Address, Order, OrderWithItems } from '@/lib/types/database'
import { clearCart, getCartItems } from './cart.service'

async function getFreeShippingRule(): Promise<{ threshold: number; active: boolean }> {
  const admin = createAdminClient()
  if (!admin) return { threshold: parseFreeShippingThreshold(null), active: true }

  const { data, error } = await admin
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'free_shipping_threshold',
      'free_shipping_active',
      'free_shipping_starts_at',
      'free_shipping_ends_at',
    ])

  if (error) return { threshold: parseFreeShippingThreshold(null), active: true }

  const get = (key: string) => data?.find((row) => row.key === key)?.value ?? null
  return {
    threshold: parseFreeShippingThreshold(get('free_shipping_threshold')),
    active: parseFreeShippingActive(get('free_shipping_active')) &&
      isDateWindowActive(get('free_shipping_starts_at'), get('free_shipping_ends_at')),
  }
}

export async function getUserOrders(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    throw new Error(error.message)
  }

  return data as OrderWithItems[]
}

export async function getOrderById(orderId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching order:', error)
    throw new Error(error.message)
  }

  return data as OrderWithItems
}

export async function getOrderByNumber(orderNumber: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('order_number', orderNumber)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching order:', error)
    throw new Error(error.message)
  }

  return data as OrderWithItems
}

interface CreateOrderData {
  userId: string
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: string
  notes?: string
}

export async function createOrder(data: CreateOrderData) {
  const supabase = await createClient()
  const cartItems = await getCartItems(data.userId)

  if (cartItems.length === 0) throw new Error('Cart is empty')

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.unit_price ?? item.product_size?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  const freeShippingRule = await getFreeShippingRule()
  const shippingCost = calculateShippingCost(
    subtotal,
    freeShippingRule.threshold,
    STANDARD_SHIPPING_COST,
    freeShippingRule.active
  )
  const tax = subtotal * 0.15
  const total = subtotal + shippingCost + tax

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: data.userId,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      total,
      shipping_address: data.shippingAddress,
      billing_address: data.billingAddress || data.shippingAddress,
      payment_method: data.paymentMethod,
      notes: data.notes,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    throw new Error(orderError.message)
  }

  const orderItems = cartItems.map((item) => {
    const unitPrice = item.unit_price ?? item.product_size?.price ?? 0

    return {
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name_en || item.product?.name_en || 'Custom Coffee',
      product_image: item.image || item.product?.images?.[0] || null,
      size: item.size,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: unitPrice * item.quantity,
      customizations: item.customizations ?? null,
    }
  })

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error(itemsError.message)
  }

  await clearCart(data.userId)

  return order as Order
}

export async function restoreOrderStock(orderId: string) {
  const admin = createAdminClient()
  if (!admin) return

  const { data: order } = await admin
    .from('orders')
    .select('stock_restored_at')
    .eq('id', orderId)
    .maybeSingle()

  if (order?.stock_restored_at) return

  const { data: items, error } = await admin
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId)

  if (error) {
    console.error('Error fetching order items for stock restore:', error.message)
    return
  }

  for (const item of items || []) {
    if (!item.product_id || !item.quantity) continue

    const { data: product } = await admin
      .from('products')
      .select('stock_quantity')
      .eq('id', item.product_id)
      .maybeSingle()

    if (!product) continue

    await admin
      .from('products')
      .update({ stock_quantity: Number(product.stock_quantity || 0) + Number(item.quantity || 0) })
      .eq('id', item.product_id)
  }

  await admin
    .from('orders')
    .update({ stock_restored_at: new Date().toISOString() })
    .eq('id', orderId)
}

export async function cancelOrder(orderId: string, userId: string) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('status, created_at, stock_restored_at')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (!order) throw new Error('Order not found')

  if (order.status === 'cancelled') return order as Order

  const createdAt = new Date(order.created_at).getTime()
  const hoursSinceOrder = (Date.now() - createdAt) / (1000 * 60 * 60)

  if (hoursSinceOrder > 24) {
    throw new Error('Cancellation window expired. Please contact support.')
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    throw new Error('This order can no longer be cancelled online. Please contact support.')
  }

  await restoreOrderStock(orderId)

  const db = admin || supabase
  const { data, error } = await db
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_initiated_by: 'customer',
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error cancelling order:', error)
    throw new Error(error.message)
  }

  return data as Order
}
