import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ discount: null })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ discount: null })

  try {
    // Find active discounts assigned to this user's email
    const { data } = await supabase
      .from('discounts')
      .select('code, type, value, expires_at, assigned_emails')
      .eq('is_active', true)
      .not('assigned_emails', 'is', null)

    const now = new Date()
    const mine = (data || []).find(d => {
      if (d.expires_at && new Date(d.expires_at) < now) return false
      const emails: string[] = Array.isArray(d.assigned_emails) ? d.assigned_emails : []
      return emails.map(e => e.toLowerCase()).includes(user.email!.toLowerCase())
    })

    if (!mine) return NextResponse.json({ discount: null })

    return NextResponse.json({
      discount: {
        code: mine.code,
        type: mine.type,
        value: mine.value,
      },
    })
  } catch {
    return NextResponse.json({ discount: null })
  }
}
