import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

async function guard() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Database service not configured', status: 503 }

  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return { error: 'Forbidden', status: 403 }

  const admin = createAdminClient()
  if (!admin) return { error: 'Service role not configured', status: 503 }

  return { admin }
}

function isMissingNotificationsTable(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || error?.message?.toLowerCase().includes('notifications')
}

export async function POST(request: NextRequest) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }

  const body = await request.json()
  const userId = typeof body.user_id === 'string' ? body.user_id.trim() : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!userId || !title || !message) {
    return NextResponse.json(
      { success: false, error: 'Customer, title and message are required' },
      { status: 400 },
    )
  }

  const { data, error } = await result.admin
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type: typeof body.type === 'string' ? body.type : 'admin_message',
      related_order_id: typeof body.related_order_id === 'string' && body.related_order_id ? body.related_order_id : null,
      promo_code: typeof body.promo_code === 'string' && body.promo_code.trim() ? body.promo_code.trim().toUpperCase() : null,
    })
    .select()
    .single()

  if (error) {
    if (isMissingNotificationsTable(error)) {
      return NextResponse.json(
        { success: false, error: 'Notifications table is not available. Apply the notifications migration first.' },
        { status: 500 },
      )
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
