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
import { getCartItems, getStoreCartItems, addToCart, mergeCartItems, clearCart, getCartTotal } from '@/lib/services'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i
const VALID_CART_SIZES = new Set(['250g', '500g', '1kg'])

function isUuid(value: unknown) {
  return typeof value === 'string' && UUID_RE.test(value)
}

function isValidSize(value: unknown) {
  return typeof value === 'string' && VALID_CART_SIZES.has(value)
}

function isPositiveQuantity(value: unknown) {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity > 0
}

async function validateCartProduct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: unknown,
  size: unknown,
  clientItemId?: unknown,
  price?: unknown
) {
  if (!productId || !isValidSize(size)) {
    return 'Valid product ID and size are required'
  }

  if (!isUuid(productId)) {
    const customPrice = Number(price)
    if (!clientItemId || !Number.isFinite(customPrice) || customPrice < 0) {
      return 'Invalid custom cart item'
    }
    return null
  }

  const { data, error } = await supabase
    .from('product_sizes')
    .select('id, is_available')
    .eq('product_id', productId)
    .eq('size', size)
    .maybeSingle()

  if (error) throw error
  if (!data || data.is_available === false) {
    return 'Invalid product or size'
  }

  return null
}

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
    const storeItems = await getStoreCartItems(user.id)
    const totals = await getCartTotal(user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        store_items: storeItems,
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
    const {
      productId,
      clientItemId,
      size,
      quantity = 1,
      name_en,
      name_ar,
      price,
      image,
      customizations,
    } = body
    
    if (!productId || !size) {
      return NextResponse.json(
        { success: false, error: 'Product ID and size are required' },
        { status: 400 }
      )
    }

    if (!isPositiveQuantity(quantity)) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be greater than zero' },
        { status: 400 }
      )
    }

    const validationError = await validateCartProduct(supabase, productId, size, clientItemId, price)
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      )
    }
    
    const item = await addToCart({
      userId: user.id,
      productId,
      clientItemId,
      size,
      quantity,
      name_en,
      name_ar,
      price,
      image,
      customizations,
    })
    const storeItems = await getStoreCartItems(user.id)
    
    return NextResponse.json({
      success: true,
      data: { item, store_items: storeItems },
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

// Merge guest cart into the signed-in user's persistent cart
export async function PUT(request: NextRequest) {
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
    const items = Array.isArray(body?.items) ? body.items : []

    for (const item of items) {
      if (!isPositiveQuantity(item?.quantity)) {
        return NextResponse.json(
          { success: false, error: 'Quantity must be greater than zero' },
          { status: 400 }
        )
      }

      const validationError = await validateCartProduct(
        supabase,
        item?.product_id,
        item?.size,
        item?.id,
        item?.price
      )

      if (validationError) {
        return NextResponse.json(
          { success: false, error: validationError },
          { status: 400 }
        )
      }
    }

    const storeItems = items.length > 0
      ? await mergeCartItems(user.id, items)
      : await getStoreCartItems(user.id)

    return NextResponse.json({
      success: true,
      data: {
        store_items: storeItems,
        subtotal: storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemsCount: storeItems.length,
        totalQuantity: storeItems.reduce((sum, item) => sum + item.quantity, 0),
      },
      message: 'Cart synced',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync cart' },
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
