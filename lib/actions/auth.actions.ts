'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  whatsapp?: string
  address?: string
  locationLink?: string
}

interface SignInData {
  email: string
  password: string
}

interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  preferredLanguage?: 'en' | 'ar'
}

type ProfileUpsertPayload = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  location_link: string | null
  preferred_language: 'ar'
}

async function getRequestOrigin() {
  const headerStore = await headers()
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

  if (configuredSiteUrl && process.env.NODE_ENV === 'production') {
    return configuredSiteUrl
  }

  const origin = headerStore.get('origin')
  if (origin) return origin

  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host')
  const protocol =
    headerStore.get('x-forwarded-proto') ??
    (host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
      ? 'http'
      : 'https')

  return host ? `${protocol}://${host}` : configuredSiteUrl ?? 'http://localhost:3000'
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function cleanString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

const isDev = process.env.NODE_ENV === 'development'

function getAuthErrorDetails(error: unknown) {
  const maybeDetails = error as { status?: unknown; code?: unknown }

  return {
    status: maybeDetails.status,
    code: maybeDetails.code,
  }
}

function buildSignUpProfilePayload(userId: string, data: SignUpData): ProfileUpsertPayload {
  return {
    id: userId,
    first_name: cleanString(data.firstName),
    last_name: cleanString(data.lastName),
    phone: cleanString(data.phone),
    whatsapp: cleanString(data.whatsapp),
    address: cleanString(data.address),
    location_link: cleanString(data.locationLink),
    preferred_language: 'ar',
  }
}

function buildRecoveredProfilePayload(user: {
  id: string
  user_metadata?: Record<string, unknown> | null
}): ProfileUpsertPayload {
  const metadata = user.user_metadata ?? {}

  return {
    id: user.id,
    first_name: cleanString(metadata.first_name),
    last_name: cleanString(metadata.last_name),
    phone: cleanString(metadata.phone),
    whatsapp: cleanString(metadata.whatsapp),
    address: cleanString(metadata.address),
    location_link: cleanString(metadata.location_link),
    preferred_language: 'ar',
  }
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()
  const origin = await getRequestOrigin()

  const { data: authData, error } = await supabase.auth.signUp({
    email: normalizeEmail(data.email),
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/dashboard')}`,
      data: {
        first_name: data.firstName?.trim() || null,
        last_name: data.lastName?.trim() || null,
        phone: data.phone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        address: data.address?.trim() || null,
        location_link: data.locationLink?.trim() || null,
      },
    },
  })

  if (error) {
    const details = getAuthErrorDetails(error)

    console.error('[signUp] ❌ auth.signUp error:', {
      message: error.message,
      name: error.name,
      status: details.status,
      code: details.code,
    })
    return {
      success: false as const,
      error: error.message,
      devError: isDev
        ? `[Auth] ${error.message} | name=${error.name} status=${details.status} code=${details.code}`
        : undefined,
    }
  }

  console.log('[signUp] ✅ auth.signUp succeeded, user id:', authData.user?.id)

  // When email confirmation is enabled and the email already exists,
  // Supabase returns a user with empty identities instead of an error.
  if (authData.user && (authData.user.identities?.length ?? 0) === 0) {
    return { success: false as const, error: 'User already registered', devError: undefined }
  }

  // Upsert profile via admin client as a fallback in case the DB trigger failed.
  if (authData.user) {
    const admin = createAdminClient()
    if (admin) {
      const profilePayload = buildSignUpProfilePayload(authData.user.id, data)
      console.log('[signUp] Upserting profile:', profilePayload)

      const { error: profileError } = await admin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })

      if (profileError) {
        console.error('[signUp] ❌ Profile upsert error:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        })
      } else {
        console.log('[signUp] ✅ Profile upsert succeeded')
      }
    } else {
      console.warn('[signUp] ⚠️ Admin client unavailable — SUPABASE_SERVICE_ROLE_KEY not set')
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true as const,
    requiresEmailConfirmation: !authData.session,
    user: authData.user,
  }
}

export async function signIn(data: SignInData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(data.email),
    password: data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: 'Unable to verify your session. Please try again.',
    }
  }

  // Recover missing profile — happens when signup trigger failed but auth user was created
  const admin = createAdminClient()
  if (admin) {
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      console.warn('[signIn] ⚠️ Profile missing for user', user.id, '— creating now')
      const profilePayload = buildRecoveredProfilePayload(user)
      const { error: createErr } = await admin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
      if (createErr) {
        console.error('[signIn] ❌ Profile recovery failed:', createErr.message)
      } else {
        console.log('[signIn] ✅ Profile recovered for user', user.id)
      }
    }
  }

  revalidatePath('/', 'layout')

  return { success: true, user }
}

export async function updateProfile(data: UpdateProfileData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      preferred_language: data.preferredLanguage,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function forgotPassword(email: string) {
  const supabase = await createClient()
  const origin = await getRequestOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(
    normalizeEmail(email),
    {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/auth/reset-password')}`,
    },
  )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Password reset email sent' }
}

export async function resetPassword(newPassword: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
