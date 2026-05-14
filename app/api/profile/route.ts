import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: profile })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Service role not configured' }, { status: 503 })
  }

  const body = await request.json()

  // Allow only safe profile fields
  const allowed = [
    'first_name',
    'last_name',
    'phone',
    'address',
    'city',
    'location_link',
    'notes',
    'preferred_language',
    'avatar_url',
  ]

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updatePayload[key] = body[key]
  }

  const { data, error } = await admin
    .from('profiles')
    .upsert({ id: user.id, ...updatePayload })
    .select()
    .single()

  if (error) {
    if ('location_link' in updatePayload && error.message?.toLowerCase().includes('location_link')) {
      const payloadWithoutLocation = { ...updatePayload }
      delete payloadWithoutLocation.location_link
      const retry = await admin
        .from('profiles')
        .upsert({ id: user.id, ...payloadWithoutLocation })
        .select()
        .single()

      if (!retry.error) {
        return NextResponse.json({
          success: true,
          data: retry.data,
          warning: 'Profile saved, but location_link needs the latest migration.',
        })
      }
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
