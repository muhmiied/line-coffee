import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { isAdminEmail } from '@/lib/config/site'

const VALID_STATUSES = ['unread', 'read', 'replied'] as const

function isMissingTable(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || error?.message?.toLowerCase().includes('contact_messages')
}

async function guard() {
  if (!isSupabaseConfigured()) {
    return { error: 'Database service is not configured', status: 503 } as const
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return { error: 'Forbidden', status: 403 } as const
  }

  const admin = createAdminClient()
  if (!admin) {
    return { error: 'Server database service role is not configured', status: 503 } as const
  }

  return { admin }
}

export async function GET(request: NextRequest) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = result.admin
    .from('contact_messages')
    .select('id, name, email, subject, message, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { success: false, error: 'Contact messages table is not available. Apply the contact messages migration first.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}

export async function PATCH(request: NextRequest) {
  const result = await guard()
  if ('error' in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status })
  }

  const body = await request.json()
  const id = typeof body.id === 'string' ? body.id.trim() : ''
  const status = typeof body.status === 'string' ? body.status.trim() : ''

  if (!id || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ success: false, error: 'Valid message id and status are required' }, { status: 400 })
  }

  const { data, error } = await result.admin
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select('id, name, email, subject, message, status, created_at')
    .single()

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { success: false, error: 'Contact messages table is not available. Apply the contact messages migration first.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
