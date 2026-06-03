import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildPublicSettings, PUBLIC_SETTING_KEYS } from '@/lib/config/public-settings'

export async function GET() {
  try {
    const admin = createAdminClient()
    if (!admin) return NextResponse.json(buildPublicSettings())

    const { data, error } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', [...PUBLIC_SETTING_KEYS])

    if (error) return NextResponse.json(buildPublicSettings())

    return NextResponse.json(buildPublicSettings(data))
  } catch {
    return NextResponse.json(buildPublicSettings())
  }
}
