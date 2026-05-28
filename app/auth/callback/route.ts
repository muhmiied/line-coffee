import { createClient } from '@/lib/supabase/server'
import { sanitizeRedirectPath } from '@/lib/auth/redirect'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = sanitizeRedirectPath(searchParams.get('next'), '/dashboard')
  const origin = request.nextUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Recovery flow always goes to reset-password regardless of next param
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
