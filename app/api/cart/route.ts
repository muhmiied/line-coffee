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
import { getCustomStockIssue, type CustomStockCartItem } from '@/lib/custom-stock'
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
    
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }
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
    } = body as Record<string, any>
    
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

    const clientId = String(clientItemId || productId)
    const existingStoreItems = await getStoreCartItems(user.id)
    const targetQuantity = Number(existingStoreItems.find((item) => item.id === clientId)?.quantity || 0) + Number(quantity || 1)
    const stockIssue = getCustomStockIssue(
      existingStoreItems,
      {
        id: clientId,
        size: String(size),
        quantity,
        customizations: customizations && typeof customizations === 'object'
          ? customizations as Record<string, unknown>
          : undefined,
      },
      targetQuantity,
    )

    if (stockIssue) {
      return NextResponse.json(
        { success: false, error: stockIssue.messageEn },
        { status: 409 }
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

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }
    const input = body as Record<string, unknown>
    const items = Array.isArray(input.items) ? input.items as Parameters<typeof mergeCartItems>[1] : []

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

    const customStockItems: CustomStockCartItem[] = items.map((item: Record<string, unknown>) => ({
      id: String(item?.id || item?.product_id || ''),
      size: typeof item?.size === 'string' ? item.size : undefined,
      quantity: Number(item?.quantity || 1),
      customizations: item?.customizations && typeof item.customizations === 'object'
        ? item.customizations as Record<string, unknown>
        : undefined,
    }))
    for (const item of customStockItems) {
      const stockIssue = getCustomStockIssue(customStockItems, item, item.quantity)
      if (stockIssue) {
        return NextResponse.json(
          { success: false, error: stockIssue.messageEn },
          { status: 409 }
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
