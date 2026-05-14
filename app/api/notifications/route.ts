import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isMissingNotificationsTable(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || error?.message?.toLowerCase().includes('notifications')
}

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, type, is_read, related_order_id, promo_code, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    if (isMissingNotificationsTable(error)) {
      return NextResponse.json({ success: true, data: [], unread: 0, needsMigration: true })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    unread: (data || []).filter((item) => !item.is_read).length,
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database service not configured' }, { status: 503 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : []

  if (!body.all && ids.length === 0) {
    return NextResponse.json({ success: true })
  }

  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)

  if (!body.all && ids.length > 0) {
    query = query.in('id', ids)
  }

  const { error } = await query

  if (error) {
    if (isMissingNotificationsTable(error)) {
      return NextResponse.json({ success: true, needsMigration: true })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
