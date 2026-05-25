import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

async function guard() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Database service not configured', status: 503 }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return { error: 'Forbidden', status: 403 }

  const admin = createAdminClient()
  if (!admin) return { error: 'Service role not configured', status: 503 }

  return { admin }
}

export async function GET() {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }

  const { data, error } = await result.admin
    .from('site_settings')
    .select('key, value')
    .in('key', ['wa_phone', 'wa_apikey'])

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const get = (key: string) => data?.find((row) => row.key === key)?.value ?? ''

  return NextResponse.json({
    success: true,
    data: {
      wa_phone: get('wa_phone'),
      wa_apikey: get('wa_apikey'),
    },
  })
}

export async function PATCH(request: NextRequest) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }
  const rows: Array<{ key: string; value: string }> = []

  if (typeof body.wa_phone === 'string') {
    rows.push({ key: 'wa_phone', value: body.wa_phone.trim() })
  }

  if (typeof body.wa_apikey === 'string') {
    rows.push({ key: 'wa_apikey', value: body.wa_apikey.trim() })
  }

  if (rows.length === 0) {
    return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await result.admin
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
