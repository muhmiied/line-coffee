import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BLOG_SELECT = 'id, title_ar, title_en, slug, cover_image, content_ar, content_en, excerpt_ar, excerpt_en, published_at, sort_order, created_at'
const BLOG_FALLBACK_SELECT = 'id, title_ar, title_en, slug, cover_image, content_ar, content_en, published_at, created_at'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, data: [] })

  try {
    const query = supabase
      .from('blog_posts')
      .select(BLOG_SELECT)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('published_at', { ascending: false })

    const { data, error } = await query

    if (error?.code === '42703') {
      const { data: fallbackData } = await supabase
        .from('blog_posts')
        .select(BLOG_FALLBACK_SELECT)
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      return NextResponse.json({ success: true, data: fallbackData || [] })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
