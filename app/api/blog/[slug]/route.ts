import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BLOG_SELECT = 'id, title_ar, title_en, slug, cover_image, content_ar, content_en, excerpt_ar, excerpt_en, published_at, sort_order, created_at'
const BLOG_FALLBACK_SELECT = 'id, title_ar, title_en, slug, cover_image, content_ar, content_en, published_at, created_at'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Unavailable' }, { status: 503 })

  const { slug } = await params

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(BLOG_SELECT)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error?.code === '42703') {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('blog_posts')
        .select(BLOG_FALLBACK_SELECT)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (fallbackError || !fallbackData) {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: fallbackData })
    }

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }
}
