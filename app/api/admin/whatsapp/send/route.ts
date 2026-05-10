import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const { phones, message } = await request.json()

  if (!phones?.length || !message) {
    return NextResponse.json({ success: false, error: 'phones and message are required' }, { status: 400 })
  }

  // Get CallMeBot credentials from site_settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['wa_phone', 'wa_apikey'])

  const apikey = settings?.find(s => s.key === 'wa_apikey')?.value
  if (!apikey) {
    return NextResponse.json({ success: false, error: 'CallMeBot API key not configured. Go to Settings → WhatsApp.' }, { status: 400 })
  }

  const results: { phone: string; ok: boolean; status?: number }[] = []

  for (const phone of phones as string[]) {
    const clean = phone.replace(/\s/g, '').replace(/^00/, '+')
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(clean)}&text=${encodeURIComponent(message)}&apikey=${apikey}`
    try {
      const res = await fetch(url)
      results.push({ phone: clean, ok: res.ok, status: res.status })
    } catch {
      results.push({ phone: clean, ok: false })
    }
    // CallMeBot rate limit: 1 message / second
    await new Promise(r => setTimeout(r, 1100))
  }

  const sent = results.filter(r => r.ok).length
  return NextResponse.json({ success: true, sent, total: phones.length, results })
}
