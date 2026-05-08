/**
 * ===========================================
 * CATEGORIES API - واجهة برمجة التصنيفات
 * ===========================================
 * 
 * GET /api/categories - جلب جميع التصنيفات
 * 
 * Query Parameters:
 * - withCount: true لإضافة عدد المنتجات
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCategories, getCategoriesWithCount } from '@/lib/services'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const withCount = searchParams.get('withCount') === 'true'
    
    const categories = withCount 
      ? await getCategoriesWithCount()
      : await getCategories()
    
    return NextResponse.json({
      success: true,
      data: categories
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch categories' 
      },
      { status: 500 }
    )
  }
}
