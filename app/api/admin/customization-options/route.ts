import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'
import {
  CUSTOM_BLEND_BEANS_KEY,
  DEFAULT_CUSTOM_BLEND_BEANS,
  normalizeBeanOptions,
  parseBeanOptions,
} from '@/lib/config/customization'

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) {
    return { error: NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 }) }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) }
  }

  const admin = createAdminClient()
  if (!admin) {
    return { error: NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 }) }
  }

  return { admin }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { data, error } = await auth.admin
    .from('site_settings')
    .select('value')
    .eq('key', CUSTOM_BLEND_BEANS_KEY)
    .maybeSingle()

  const beans = error
    ? DEFAULT_CUSTOM_BLEND_BEANS
    : parseBeanOptions(data?.value)

  return NextResponse.json({ success: true, data: { beans } })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const body = await request.json()
  const beans = normalizeBeanOptions(body.beans)

  if (beans.length === 0) {
    return NextResponse.json(
      { success: false, error: 'At least one valid bean option is required' },
      { status: 400 },
    )
  }

  const { error } = await auth.admin
    .from('site_settings')
    .upsert(
      { key: CUSTOM_BLEND_BEANS_KEY, value: JSON.stringify(beans) },
      { onConflict: 'key' },
    )

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { beans } })
}
