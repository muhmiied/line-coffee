/**
 * ===========================================
 * ORDERS SERVICE - خدمة الطلبات
 * ===========================================
 * 
 * هذا الملف يحتوي على جميع الدوال التي تتعامل مع الطلبات
 */

import { createClient } from '@/lib/supabase/server'
import type { Order, OrderWithItems, OrderItem, Address } from '@/lib/types/database'
import { getCartItems, clearCart } from './cart.service'

// ==========================================
// GET USER ORDERS - جلب طلبات المستخدم
// ==========================================

export async function getUserOrders(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching orders:', error)
    throw new Error(error.message)
  }
  
  return data as OrderWithItems[]
}

// ==========================================
// GET SINGLE ORDER - جلب طلب واحد
// ==========================================

export async function getOrderById(orderId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .eq('user_id', userId)  // للأمان
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching order:', error)
    throw new Error(error.message)
  }
  
  return data as OrderWithItems
}

// ==========================================
// GET ORDER BY NUMBER - جلب طلب برقم الطلب
// ==========================================

export async function getOrderByNumber(orderNumber: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('order_number', orderNumber)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching order:', error)
    throw new Error(error.message)
  }
  
  return data as OrderWithItems
}

// ==========================================
// CREATE ORDER - إنشاء طلب جديد
// ==========================================

interface CreateOrderData {
  userId: string
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: string
  notes?: string
}

export async function createOrder(data: CreateOrderData) {
  const supabase = await createClient()
  
  // جلب عناصر السلة
  const cartItems = await getCartItems(data.userId)
  
  if (cartItems.length === 0) {
    throw new Error('Cart is empty')
  }
  
  // حساب المجاميع
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product_size?.price || 0
    return sum + (price * item.quantity)
  }, 0)
  
  const shippingCost = subtotal >= 200 ? 0 : 25  // شحن مجاني للطلبات فوق 200
  const tax = subtotal * 0.15  // 15% VAT
  const total = subtotal + shippingCost + tax
  
  // إنشاء الطلب
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
      notes: data.notes
    })
    .select()
    .single()
  
  if (orderError) {
    console.error('Error creating order:', orderError)
    throw new Error(orderError.message)
  }
  
  // إضافة عناصر الطلب
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product.name_en,  // حفظ الاسم
    product_image: item.product.images?.[0] || null,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.product_size?.price || 0,
    total_price: (item.product_size?.price || 0) * item.quantity
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    // محاولة حذف الطلب في حالة الفشل
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error(itemsError.message)
  }
  
  // تفريغ السلة بعد نجاح الطلب
  await clearCart(data.userId)
  
  return order as Order
}

// ==========================================
// CANCEL ORDER - إلغاء الطلب
// ==========================================

export async function cancelOrder(orderId: string, userId: string) {
  const supabase = await createClient()
  
  // التحقق من حالة الطلب أولاً
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()
  
  if (!order) {
    throw new Error('Order not found')
  }
  
  // لا يمكن إلغاء الطلب إذا كان shipped أو delivered
  if (['shipped', 'delivered'].includes(order.status)) {
    throw new Error('Cannot cancel order that has been shipped or delivered')
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error cancelling order:', error)
    throw new Error(error.message)
  }
  
  return data as Order
}
