/**
 * ===========================================
 * CART ITEM API - واجهة عنصر السلة
 * ===========================================
 * 
 * PATCH /api/cart/[itemId] - تحديث كمية عنصر
 * DELETE /api/cart/[itemId] - حذف عنصر
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCustomStockIssue, type CustomStockCartItem } from '@/lib/custom-stock'
import { createClient } from '@/lib/supabase/server'
import { updateCartItem, removeFromCart } from '@/lib/services'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string) {
  return UUID_RE.test(value)
}

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

    if (quantity > 0) {
      const { data: cartRows, error: cartRowsError } = await supabase
        .from('cart_items')
        .select('id, client_item_id, size, quantity, customizations')
        .eq('user_id', user.id)

      if (cartRowsError) throw cartRowsError

      const targetRow = (cartRows || []).find((row) =>
        isUuid(itemId) ? row.id === itemId : row.client_item_id === itemId
      )

      if (targetRow) {
        const storeItems: CustomStockCartItem[] = (cartRows || []).map((row) => ({
          id: row.client_item_id || row.id,
          size: row.size || undefined,
          quantity: Number(row.quantity || 1),
          customizations: row.customizations && typeof row.customizations === 'object'
            ? row.customizations as Record<string, unknown>
            : undefined,
        }))
        const targetItem = storeItems.find((item) => item.id === (targetRow.client_item_id || targetRow.id))

        if (targetItem) {
          const stockIssue = getCustomStockIssue(storeItems, targetItem, quantity)
          if (stockIssue) {
            return NextResponse.json(
              { success: false, error: stockIssue.messageEn },
              { status: 409 }
            )
          }
        }
      }
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
