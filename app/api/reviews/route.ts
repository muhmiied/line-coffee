import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_NAME = 100
const MAX_CONTENT = 1000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, rating, content_en, content_ar } = body

    if (!customer_name?.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }
    const parsedRating = parseInt(rating, 10)
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 })
    }
    if (!content_en?.trim()) {
      return NextResponse.json({ success: false, error: 'Comment is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })
    }

    const { error } = await admin.from('testimonials').insert({
      customer_name: customer_name.trim().slice(0, MAX_NAME),
      rating: parsedRating,
      content_en: content_en.trim().slice(0, MAX_CONTENT),
      content_ar: content_ar?.trim()?.slice(0, MAX_CONTENT) || null,
      is_approved: false,
      is_visible: true,
      is_featured: false,
    })

    if (error) {
      console.error('Review insert error:', error)
      return NextResponse.json({ success: false, error: 'Failed to save review' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save review' }, { status: 500 })
  }
}
