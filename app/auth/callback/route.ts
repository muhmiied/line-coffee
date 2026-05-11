import { createClient } from '@/lib/supabase/server'
import { sanitizeRedirectPath } from '@/lib/auth/redirect'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = sanitizeRedirectPath(searchParams.get('next'), '/dashboard')
  const origin = request.nextUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
