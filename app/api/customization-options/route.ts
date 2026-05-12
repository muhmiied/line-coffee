import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  CUSTOM_BLEND_BEANS_KEY,
  DEFAULT_CUSTOM_BLEND_BEANS,
  parseBeanOptions,
} from '@/lib/config/customization'

export async function GET() {
  const admin = createAdminClient()

  if (!admin) {
    return NextResponse.json({
      success: true,
      data: {
        beans: DEFAULT_CUSTOM_BLEND_BEANS.filter((bean) => bean.isVisible),
      },
    })
  }

  const { data, error } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', CUSTOM_BLEND_BEANS_KEY)
    .maybeSingle()

  const beans = error
    ? DEFAULT_CUSTOM_BLEND_BEANS
    : parseBeanOptions(data?.value)

  return NextResponse.json({
    success: true,
    data: {
      beans: beans.filter((bean) => bean.isVisible),
    },
  })
}
