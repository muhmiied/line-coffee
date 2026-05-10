import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.toUpperCase().trim()
  if (!code) return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ valid: false, error: 'Service unavailable' }, { status: 503 })

  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !data) return NextResponse.json({ valid: false, error: 'Invalid or expired code' })

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This code has expired' })
    }

    // Check max uses
    if (data.max_uses !== null && data.uses >= data.max_uses) {
      return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' })
    }

    return NextResponse.json({
      valid: true,
      code: data.code,
      type: data.type,
      value: data.value,
      min_order: data.min_order,
    })
  } catch {
    return NextResponse.json({ valid: false, error: 'Invalid code' })
  }
}
