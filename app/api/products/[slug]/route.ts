/**
 * ===========================================
 * PRODUCT DETAIL API - واجهة تفاصيل المنتج
 * ===========================================
 * 
 * GET /api/products/[slug] - جلب منتج واحد بالـ slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug, getRelatedProducts } from '@/lib/services'
import type { ProductWithDetails } from '@/lib/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const product = await getProductBySlug(slug)
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // جلب المنتجات المشابهة
    let relatedProducts: ProductWithDetails[] = []
    if (product.category_id) {
      relatedProducts = await getRelatedProducts(
        product.id, 
        product.category_id, 
        4
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch product' 
      },
      { status: 500 }
    )
  }
}
