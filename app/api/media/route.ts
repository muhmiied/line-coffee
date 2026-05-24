import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const SELECT_FIELDS = 'id,title_ar,title_en,subtitle_ar,subtitle_en,image_url,link_url,sort_order,is_active,media_type,usage_area,alt_en,alt_ar,is_featured,images,section_key,slide_key,section_type,button_text_ar,button_text_en,button_link,mobile_image_url,overlay_opacity,object_position,content,layout,animation_type,animation_duration,device_visibility,starts_at,ends_at,created_at,updated_at'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient() ?? await createClient()
    const usageArea = request.nextUrl.searchParams.get('usage_area')
    const mediaType = request.nextUrl.searchParams.get('media_type')
    const sectionKey = request.nextUrl.searchParams.get('section_key')

    let query = supabase
      .from('banners')
      .select(SELECT_FIELDS)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (usageArea) query = query.eq('usage_area', usageArea)
    if (mediaType) query = query.eq('media_type', mediaType)
    if (sectionKey) query = query.eq('section_key', sectionKey)

    const { data, error } = await query
    if (error) throw error

    const now = Date.now()
    const activeData = (data || []).filter((item) => {
      const startsAt = item.starts_at ? Date.parse(item.starts_at) : null
      const endsAt = item.ends_at ? Date.parse(item.ends_at) : null
      return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now)
    })

    return NextResponse.json({ success: true, data: activeData })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
