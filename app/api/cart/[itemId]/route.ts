/**
 * ===========================================
 * CART ITEM API - واجهة عنصر السلة
 * ===========================================
 * 
 * PATCH /api/cart/[itemId] - تحديث كمية عنصر
 * DELETE /api/cart/[itemId] - حذف عنصر
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCartItem, removeFromCart } from '@/lib/services'

// تحديث كمية عنصر
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
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
    
    const { itemId } = await params
    const body = await request.json()
    const { quantity } = body
    
    if (typeof quantity !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Quantity is required' },
        { status: 400 }
      )
    }
    
    const item = await updateCartItem(itemId, user.id, quantity)
    
    return NextResponse.json({
      success: true,
      data: item
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// حذف عنصر
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
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
    
    const { itemId } = await params
    
    await removeFromCart(itemId, user.id)
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}
