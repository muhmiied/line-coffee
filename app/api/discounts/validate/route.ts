import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type DiscountRow = {
  assigned_emails?: string[] | null
}

function isAssignedToEmail(discount: DiscountRow, email: string | null) {
  const assigned = Array.isArray(discount.assigned_emails)
    ? discount.assigned_emails.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
    : []
  if (assigned.length === 0) return true
  return Boolean(email && assigned.includes(email.toLowerCase()))
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.toUpperCase().trim()
  if (!code) return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ valid: false, error: 'Service unavailable' }, { status: 503 })

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email?.trim().toLowerCase() || null

    const { data, error } = await admin
      .from('discounts')
      .select('code, type, value, min_order, max_uses, uses, expires_at, assigned_emails')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !data) return NextResponse.json({ valid: false, error: 'Invalid or expired code' })

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This code has expired' })
    }

    if (data.max_uses !== null && data.uses >= data.max_uses) {
      return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' })
    }

    if (!isAssignedToEmail(data, userEmail)) {
      return NextResponse.json({ valid: false, error: 'This code is not assigned to your account' })
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
