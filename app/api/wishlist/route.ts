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
import { getWishlist, toggleWishlist, getWishlistCount } from '@/lib/services'

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
    const count = await getWishlistCount(user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        items,
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
    
    return NextResponse.json({
      success: true,
      data: result,
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
