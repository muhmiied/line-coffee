import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const SELECT_FIELDS = 'id,title_ar,title_en,subtitle_ar,subtitle_en,image_url,link_url,sort_order,is_active,media_type,usage_area,alt_en,alt_ar,is_featured,images,created_at'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient() ?? await createClient()
    const usageArea = request.nextUrl.searchParams.get('usage_area')
    const mediaType = request.nextUrl.searchParams.get('media_type')

    let query = supabase
      .from('banners')
      .select(SELECT_FIELDS)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (usageArea) query = query.eq('usage_area', usageArea)
    if (mediaType) query = query.eq('media_type', mediaType)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
