import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Service not configured' }, { status: 503 })
    }

    const searchParams = request.nextUrl.searchParams
    const categorySlug = searchParams.get('category') || undefined
    const featured    = searchParams.get('featured') === 'true'
    const bestSeller  = searchParams.get('bestSeller') === 'true'
    const isNew       = searchParams.get('new') === 'true'
    const search      = searchParams.get('search') || undefined
    const limit       = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset      = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    let query = admin
      .from('products')
      .select('*, category:categories(*), sizes:product_sizes(*)')
      .eq('is_visible', true)

    if (categorySlug) {
      const { data: cat } = await admin.from('categories').select('id').eq('slug', categorySlug).single()
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (featured)   query = query.eq('is_featured', true)
    if (bestSeller) query = query.eq('is_best_seller', true)
    if (isNew)      query = query.eq('is_new', true)
    if (search)     query = query.or(`name_en.ilike.%${search}%,name_ar.ilike.%${search}%`)

    query = query.order('created_at', { ascending: false })

    if (limit)  query = query.limit(limit)
    if (offset) query = query.range(offset, offset + (limit ?? 50) - 1)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const { count } = await admin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', true)

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: { total: count || 0, limit: limit || (data?.length ?? 0), offset },
    })

  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 },
    )
  }
}
