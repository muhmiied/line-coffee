/**
 * ===========================================
 * CHECKOUT API - واجهة الدفع (للضيوف والمستخدمين)
 * ===========================================
 * 
 * POST /api/checkout - إنشاء طلب جديد (يعمل بدون تسجيل دخول)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // التأكد من وجود Supabase
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service not configured' },
        { status: 503 }
      )
    }
    
    // محاولة جلب المستخدم (اختياري)
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { 
      items, 
      subtotal, 
      shipping_cost, 
      total, 
      shipping_address, 
      payment_method 
    } = body
    
    // التحقق من البيانات المطلوبة
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }
    
    if (!shipping_address || !shipping_address.first_name || !shipping_address.phone) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      )
    }
    
    // إنشاء الطلب
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,  // يمكن أن يكون null للضيوف
        subtotal: subtotal || 0,
        shipping_cost: shipping_cost || 0,
        tax: 0,
        total: total || subtotal || 0,
        shipping_address,
        billing_address: shipping_address,
        payment_method: payment_method || 'cod',
        payment_status: 'pending',
        status: 'pending'
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }
    
    // إضافة عناصر الطلب
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
      total_price: item.total_price
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // حذف الطلب في حالة فشل إضافة العناصر
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        status: order.status
      },
      message: 'Order created successfully'
    })
    
  } catch (error) {
    console.error('Checkout API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process checkout' 
      },
      { status: 500 }
    )
  }
}
