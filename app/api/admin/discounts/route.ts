import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const DISCOUNT_TYPES = ['percentage', 'fixed'] as const

async function guardAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  return createAdminClient()
}

export async function GET() {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { data, error } = await admin
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch {
    return NextResponse.json({ success: false, error: 'Table not found' }, { status: 404 })
  }
}

export async function POST(request: Request) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const input = body as Record<string, unknown>
    const code = String(input.code || '').trim().toUpperCase()
    const type = String(input.type || '')
    const value = Number(input.value)
    const minOrder = input.min_order === null || input.min_order === undefined || input.min_order === ''
      ? null
      : Number(input.min_order)
    const maxUses = input.max_uses === null || input.max_uses === undefined || input.max_uses === ''
      ? null
      : Number(input.max_uses)
    const assignedEmails = Array.isArray(input.assigned_emails)
      ? input.assigned_emails
          .filter((email): email is string => typeof email === 'string')
          .map((email) => email.trim().toLowerCase())
          .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          .slice(0, 200)
      : null

    if (!code || code.length > 40 || !DISCOUNT_TYPES.includes(type as (typeof DISCOUNT_TYPES)[number])) {
      return NextResponse.json({ success: false, error: 'Invalid discount code or type' }, { status: 400 })
    }

    if (!Number.isFinite(value) || value <= 0 || (type === 'percentage' && value > 100)) {
      return NextResponse.json({ success: false, error: 'Invalid discount value' }, { status: 400 })
    }

    if ((minOrder !== null && (!Number.isFinite(minOrder) || minOrder < 0)) || (maxUses !== null && (!Number.isFinite(maxUses) || maxUses < 1))) {
      return NextResponse.json({ success: false, error: 'Invalid discount limits' }, { status: 400 })
    }

    const payload = {
      code,
      type,
      value,
      min_order: minOrder,
      max_uses: maxUses,
      expires_at: typeof input.expires_at === 'string' && input.expires_at ? input.expires_at : null,
      is_active: input.is_active !== false,
      assigned_emails: assignedEmails && assignedEmails.length > 0 ? assignedEmails : null,
      uses: 0,
    }

    const { data, error } = await admin.from('discounts').insert(payload).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create discount' }, { status: 400 })
  }
}
