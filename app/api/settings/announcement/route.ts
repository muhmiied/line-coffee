import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const DEFAULT_ANNOUNCEMENT = {
  text: '🚀 توصيل مجاني على الطلبات فوق 500 ج',
  active: true,
}

export async function GET() {
  try {
    const admin = createAdminClient()
    if (!admin) return NextResponse.json(DEFAULT_ANNOUNCEMENT)

    const { data, error } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', ['announcement_text', 'announcement_active', 'wa_phone', 'wa_apikey'])

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT)
    }

    const get = (k: string) => data.find(r => r.key === k)?.value ?? null

    return NextResponse.json({
      text: get('announcement_text') ?? DEFAULT_ANNOUNCEMENT.text,
      active: get('announcement_active') === 'true',
      wa_phone: get('wa_phone') ?? '',
      wa_apikey: get('wa_apikey') ?? '',
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

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })
    }

    const body = await request.json()
    const rows = []

    if (typeof body.text === 'string') rows.push({ key: 'announcement_text', value: body.text })
    if (typeof body.active === 'boolean') rows.push({ key: 'announcement_active', value: String(body.active) })
    if (typeof body.wa_phone === 'string') rows.push({ key: 'wa_phone', value: body.wa_phone })
    if (typeof body.wa_apikey === 'string') rows.push({ key: 'wa_apikey', value: body.wa_apikey })

    if (rows.length > 0) {
      const { error } = await admin
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
