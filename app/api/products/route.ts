/**
 * ===========================================
 * PRODUCTS API - واجهة برمجة المنتجات
 * ===========================================
 * 
 * GET /api/products - جلب جميع المنتجات
 * 
 * Query Parameters:
 * - category: slug التصنيف (مثل: whole-beans)
 * - featured: true/false للمنتجات المميزة
 * - bestSeller: true/false للأكثر مبيعاً
 * - new: true/false للمنتجات الجديدة
 * - search: نص البحث
 * - limit: عدد النتائج
 * - offset: بداية الصفحة
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProducts, countProducts } from '@/lib/services'

export async function GET(request: NextRequest) {
  try {
    // قراءة الـ query parameters
    const searchParams = request.nextUrl.searchParams
    
    const options = {
      categorySlug: searchParams.get('category') || undefined,
      featured: searchParams.get('featured') === 'true',
      bestSeller: searchParams.get('bestSeller') === 'true',
      isNew: searchParams.get('new') === 'true',
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    }
    
    // جلب المنتجات
    const products = await getProducts(options)
    const total = await countProducts(options.categorySlug)
    
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        limit: options.limit || products.length,
        offset: options.offset || 0
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products' 
      },
      { status: 500 }
    )
  }
}
