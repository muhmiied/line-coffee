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
import { getWishlist, getStoreWishlist, toggleWishlist, mergeWishlistItems, getWishlistCount } from '@/lib/services'

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
    const { productId } = body
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    const result = await toggleWishlist(user.id, productId)
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
