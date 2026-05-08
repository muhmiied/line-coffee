/**
 * ===========================================
 * CART API - واجهة برمجة السلة
 * ===========================================
 * 
 * GET /api/cart - جلب عناصر السلة
 * POST /api/cart - إضافة للسلة
 * DELETE /api/cart - تفريغ السلة
 * 
 * ملاحظة: تحتاج تسجيل دخول
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCartItems, addToCart, clearCart, getCartTotal } from '@/lib/services'

// جلب عناصر السلة
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
    
    const items = await getCartItems(user.id)
    const totals = await getCartTotal(user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        ...totals
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// إضافة للسلة
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
    const { productId, size, quantity = 1 } = body
    
    if (!productId || !size) {
      return NextResponse.json(
        { success: false, error: 'Product ID and size are required' },
        { status: 400 }
      )
    }
    
    const item = await addToCart({
      userId: user.id,
      productId,
      size,
      quantity
    })
    
    return NextResponse.json({
      success: true,
      data: item,
      message: 'Added to cart'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

// تفريغ السلة
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await clearCart(user.id)
    
    return NextResponse.json({
      success: true,
      message: 'Cart cleared'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
