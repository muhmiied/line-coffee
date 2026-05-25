import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/config/site'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function guardAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  return createAdminClient()
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ discountId: string }> }
) {
  const admin = await guardAdmin()
  if (!admin) return NextResponse.json({ success: false }, { status: 403 })
  const { discountId } = await params
  if (!UUID_RE.test(discountId)) {
    return NextResponse.json({ success: false, error: 'Invalid discount id' }, { status: 400 })
  }
  const { error } = await admin.from('discounts').delete().eq('id', discountId)
  if (error) return NextResponse.json({ success: false, error: 'Failed to delete discount' }, { status: 400 })
  return NextResponse.json({ success: true })
}
