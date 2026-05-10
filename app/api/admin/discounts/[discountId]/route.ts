import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/config/site'

async function guard() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  return supabase
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ discountId: string }> }
) {
  const supabase = await guard()
  if (!supabase) return NextResponse.json({ success: false }, { status: 403 })
  const { discountId } = await params
  const { error } = await supabase.from('discounts').delete().eq('id', discountId)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
