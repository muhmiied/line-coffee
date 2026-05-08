/**
 * ===========================================
 * ORDERS API - واجهة برمجة الطلبات
 * ===========================================
 * 
 * GET /api/orders - جلب طلبات المستخدم
 * POST /api/orders - إنشاء طلب جديد
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrders, createOrder } from '@/lib/services'

// جلب طلبات المستخدم
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const orders = await getUserOrders(user.id)
    
    return NextResponse.json({
      success: true,
      data: orders
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// إنشاء طلب جديد
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { shippingAddress, billingAddress, paymentMethod, notes } = body
    
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Shipping address and payment method are required' },
        { status: 400 }
      )
    }
    
    const order = await createOrder({
      userId: user.id,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    })
    
    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    )
  }
}
