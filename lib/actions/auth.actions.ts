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
    console.error('[signUp] Supabase auth.signUp error:', error.message, error)
    return { success: false, error: error.message }
  }

  // When email confirmation is enabled and the email already exists,
  // Supabase returns a user with empty identities instead of an error.
  if (authData.user && (authData.user.identities?.length ?? 0) === 0) {
    return { success: false, error: 'User already registered' }
  }

  // Upsert profile as a robust fallback in case the DB trigger didn't fire.
  if (authData.user) {
    const admin = createAdminClient()
    if (admin) {
      const { error: profileError } = await admin
        .from('profiles')
        .upsert(
          {
            id: authData.user.id,
            first_name: data.firstName?.trim() || null,
            last_name: data.lastName?.trim() || null,
            phone: data.phone?.trim() || null,
            whatsapp: data.whatsapp?.trim() || null,
            address: data.address?.trim() || null,
            location_link: data.locationLink?.trim() || null,
            preferred_language: 'ar',
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        console.error('[signUp] Profile upsert error:', profileError.message, profileError)
      }
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
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
