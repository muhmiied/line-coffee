/**
 * ===========================================
 * ORDER DETAIL API - واجهة تفاصيل الطلب
 * ===========================================
 * 
 * GET /api/orders/[orderId] - جلب طلب واحد
 * PATCH /api/orders/[orderId] - إلغاء الطلب
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrderById, cancelOrder } from '@/lib/services'

// جلب طلب واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { orderId } = await params
    const order = await getOrderById(orderId, user.id)
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: order
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// إلغاء الطلب
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { orderId } = await params
    const body = await request.json()
    const { action } = body
    
    if (action === 'cancel') {
      const order = await cancelOrder(orderId, user.id)
      return NextResponse.json({
        success: true,
        data: order,
        message: 'Order cancelled'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('API Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update order'
    const status = message === 'Order not found' ? 404 : 400
    return NextResponse.json(
      { success: false, error: message },
      { status }
    )
  }
}
