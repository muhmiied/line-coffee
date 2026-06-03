import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WHATSAPP_DISPLAY, WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, '')
}

function formatDisplayPhone(value: string) {
  const clean = normalizePhone(value)
  if (clean.startsWith('20') && clean.length === 12) {
    return `+${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`
  }
  return value || WHATSAPP_DISPLAY
}

export async function GET() {
  const admin = createAdminClient()

  if (!admin) {
    return NextResponse.json({
      success: true,
      data: {
        phone: WHATSAPP_ORDER_PHONE_E164,
        display_phone: WHATSAPP_DISPLAY,
      },
    })
  }

  const { data } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'wa_phone')
    .maybeSingle()

  const phone = normalizePhone(data?.value || WHATSAPP_ORDER_PHONE_E164)

  return NextResponse.json({
    success: true,
    data: {
      phone,
      display_phone: formatDisplayPhone(phone),
    },
  })
}
