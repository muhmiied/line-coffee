import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  isDateWindowActive,
  parseFreeShippingActive,
  parseFreeShippingThreshold,
} from '@/lib/config/shipping'

export async function GET() {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ threshold: DEFAULT_FREE_SHIPPING_THRESHOLD, active: true })
    }

    const { data, error } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'free_shipping_threshold',
        'free_shipping_active',
        'free_shipping_starts_at',
        'free_shipping_ends_at',
      ])

    if (error) {
      return NextResponse.json({ threshold: DEFAULT_FREE_SHIPPING_THRESHOLD, active: true })
    }

    const get = (key: string) => data?.find((row) => row.key === key)?.value ?? null
    const threshold = parseFreeShippingThreshold(get('free_shipping_threshold'))
    const active = parseFreeShippingActive(get('free_shipping_active')) &&
      isDateWindowActive(get('free_shipping_starts_at'), get('free_shipping_ends_at'))

    return NextResponse.json({
      threshold,
      active,
    })
  } catch {
    return NextResponse.json({ threshold: DEFAULT_FREE_SHIPPING_THRESHOLD, active: true })
  }
}
