/**
 * ===========================================
 * WISHLIST API - واجهة برمجة المفضلة
 * ===========================================
 * 
 * GET /api/wishlist - جلب المفضلة
 * POST /api/wishlist - إضافة/حذف من المفضلة (toggle)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  getStoreWishlist,
  toggleWishlist,
  mergeWishlistItems,
  getWishlistCount,
  removeFromWishlist,
} from '@/lib/services'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i

function isUuid(value: unknown) {
  return typeof value === 'string' && UUID_RE.test(value)
}

async function validateWishlistProduct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: unknown
) {
  if (!isUuid(productId)) {
    return 'Valid product ID is required'
  }

  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .maybeSingle()

  if (error) throw error
  if (!data) return 'Invalid product'

  return null
}

// جلب المفضلة
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
    
    const items = await getWishlist(user.id)
    const storeItems = await getStoreWishlist(user.id)
    const count = await getWishlistCount(user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        store_items: storeItems,
        count
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// إضافة/حذف من المفضلة
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
    const { productId, action } = body
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const validationError = action === 'remove'
      ? (!isUuid(productId) ? 'Valid product ID is required' : null)
      : await validateWishlistProduct(supabase, productId)
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      )
    }
    
    const result = action === 'add'
      ? { added: true, item: await addToWishlist(user.id, productId) }
      : action === 'remove'
        ? { added: false, ...(await removeFromWishlist(user.id, productId)) }
        : await toggleWishlist(user.id, productId)
    const storeItems = await getStoreWishlist(user.id)
    
    return NextResponse.json({
      success: true,
      data: { ...result, store_items: storeItems },
      message: result.added ? 'Added to wishlist' : 'Removed from wishlist'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update wishlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const productId = body?.productId

    if (productId) {
      if (!isUuid(productId)) {
        return NextResponse.json(
          { success: false, error: 'Valid product ID is required' },
          { status: 400 }
        )
      }

      await removeFromWishlist(user.id, productId)
    } else {
      await clearWishlist(user.id)
    }

    const storeItems = await getStoreWishlist(user.id)

    return NextResponse.json({
      success: true,
      data: {
        store_items: storeItems,
        count: storeItems.length,
      },
      message: productId ? 'Removed from wishlist' : 'Wishlist cleared',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete wishlist item' },
      { status: 500 }
    )
  }
}

// Merge guest wishlist into the signed-in user's persistent wishlist
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
    const removedProductIds = Array.isArray(body?.removedProductIds)
      ? body.removedProductIds.filter(isUuid)
      : []
    const shouldClear = body?.clear === true

    for (const item of items) {
      const validationError = await validateWishlistProduct(supabase, item?.productId)
      if (validationError) {
        return NextResponse.json(
          { success: false, error: validationError },
          { status: 400 }
        )
      }
    }

    if (shouldClear) {
      await clearWishlist(user.id)
    }

    for (const productId of removedProductIds) {
      await removeFromWishlist(user.id, productId)
    }

    const storeItems = items.length > 0
      ? await mergeWishlistItems(user.id, items)
      : await getStoreWishlist(user.id)

    return NextResponse.json({
      success: true,
      data: {
        store_items: storeItems,
        count: storeItems.length,
      },
      message: 'Wishlist synced',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync wishlist' },
      { status: 500 }
    )
  }
}
