/**
 * ===========================================
 * TESTIMONIALS API - واجهة شهادات العملاء
 * ===========================================
 * 
 * GET /api/testimonials - جلب الشهادات
 * 
 * Query Parameters:
 * - featured: true للمميزة فقط
 * - limit: عدد النتائج
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTestimonials, getFeaturedTestimonials } from '@/lib/services'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    const testimonials = featured && limit
      ? await getFeaturedTestimonials(limit)
      : await getTestimonials(featured)
    
    return NextResponse.json({
      success: true,
      data: testimonials
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}
