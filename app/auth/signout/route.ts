import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  if (supabase) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')

  return NextResponse.redirect(new URL('/', request.url))
}
