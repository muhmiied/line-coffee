import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/supabase/config'

export function createAdminClient() {
  const { url } = getSupabaseConfig()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) return null

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
