import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, data: [] })

  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title_ar, title_en, slug, cover_image, content_ar, content_en, published_at, created_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    return NextResponse.json({ success: true, data: data || [] })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
