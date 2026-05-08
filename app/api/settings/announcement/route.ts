import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

const DEFAULT_ANNOUNCEMENT = {
  text: '🚀 توصيل مجاني على الطلبات فوق 500 ج',
  active: true,
}

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json(DEFAULT_ANNOUNCEMENT)

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['announcement_text', 'announcement_active'])

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT)
    }

    const textRow = data.find((r) => r.key === 'announcement_text')
    const activeRow = data.find((r) => r.key === 'announcement_active')

    return NextResponse.json({
      text: textRow?.value ?? DEFAULT_ANNOUNCEMENT.text,
      active: activeRow?.value === 'true',
    })
  } catch {
    return NextResponse.json(DEFAULT_ANNOUNCEMENT)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'DB not configured' }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminEmail(user?.email)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const rows = []

    if (typeof body.text === 'string') {
      rows.push({ key: 'announcement_text', value: body.text })
    }
    if (typeof body.active === 'boolean') {
      rows.push({ key: 'announcement_active', value: String(body.active) })
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
