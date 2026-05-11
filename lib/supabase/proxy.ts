import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/config/site'
import { getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase/config'

function copySupabaseResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie)
  })

  for (const headerName of ['Cache-Control', 'Expires', 'Pragma']) {
    const value = from.headers.get(headerName)
    if (value) {
      to.headers.set(headerName, value)
    }
  }

  return to
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  if (!isSupabaseConfigured()) {
    return supabaseResponse
  }

  const { url, key } = getSupabaseConfig()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        supabaseResponse = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })

        Object.entries(headers).forEach(([name, value]) => {
          supabaseResponse.headers.set(name, value)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)

    return copySupabaseResponseCookies(
      supabaseResponse,
      NextResponse.redirect(url),
    )
  }

  if (pathname.startsWith('/dashboard/admin') && !isAdminEmail(user?.email)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''

    return copySupabaseResponseCookies(
      supabaseResponse,
      NextResponse.redirect(url),
    )
  }

  return supabaseResponse
}
