import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Service not configured' }, { status: 503 })
    }

    const withCount = request.nextUrl.searchParams.get('withCount') === 'true'

    const { data: cats, error } = await admin
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(error.message)

    if (!withCount) {
      return NextResponse.json({ success: true, data: cats || [] })
    }

    const { data: products } = await admin.from('products').select('category_id').eq('is_visible', true)
    const countMap: Record<string, number> = {}
    ;(products || []).forEach(p => {
      if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1
    })

    const data = (cats || []).map(c => ({ ...c, products_count: countMap[c.id] || 0 }))
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 },
    )
  }
}
