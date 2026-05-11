import 'server-only'

import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/config/site'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { Profile } from '@/lib/types'

export type AuthState = {
  user: User | null
  profile: Profile | null
  isSupabaseConfigured: boolean
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  return data
}

export async function getInitialAuthState(): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      profile: null,
      isSupabaseConfigured: false,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    : { data: null }

  return {
    user,
    profile,
    isSupabaseConfigured: true,
  }
}

export async function requireUser(next = '/dashboard') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(next)}`)
  }

  return user
}

export async function requireAdminUser() {
  const user = await requireUser('/dashboard/admin')

  if (!isAdminEmail(user.email)) {
    redirect('/dashboard')
  }

  return user
}
