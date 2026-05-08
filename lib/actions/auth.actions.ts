/**
 * ===========================================
 * AUTH ACTIONS - إجراءات المصادقة
 * ===========================================
 * 
 * هذا الملف يحتوي على Server Actions للمصادقة
 * Server Actions هي دوال تعمل على السيرفر ويمكن استدعاؤها من الـ Client
 * 
 * للمبتدئين: استخدم هذه الدوال مباشرة في الـ Components
 * بدلاً من كتابة fetch requests
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ==========================================
// SIGN UP - تسجيل مستخدم جديد
// ==========================================

interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()
  
  if (!supabase) {
    return { success: false, error: 'Authentication service not configured' }
  }
  
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      // رابط التأكيد
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      // بيانات إضافية للمستخدم
      data: {
        first_name: data.firstName,
        last_name: data.lastName
      }
    }
  })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // المستخدم يحتاج تأكيد البريد
  return { 
    success: true, 
    message: 'Please check your email to confirm your account',
    user: authData.user
  }
}

// ==========================================
// SIGN IN - تسجيل الدخول
// ==========================================

interface SignInData {
  email: string
  password: string
}

export async function signIn(data: SignInData) {
  const supabase = await createClient()
  
  if (!supabase) {
    return { success: false, error: 'Authentication service not configured' }
  }
  
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/', 'layout')
  return { success: true, user: authData.user }
}

// ==========================================
// SIGN OUT - تسجيل الخروج
// ==========================================

export async function signOut() {
  const supabase = await createClient()
  
  if (!supabase) {
    redirect('/')
  }
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/', 'layout')
  redirect('/')
}

// ==========================================
// GET CURRENT USER - جلب المستخدم الحالي
// ==========================================

export async function getCurrentUser() {
  const supabase = await createClient()
  
  if (!supabase) {
    return null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // جلب الـ profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return {
    ...user,
    profile
  }
}

// ==========================================
// UPDATE PROFILE - تحديث الملف الشخصي
// ==========================================

interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  preferredLanguage?: 'en' | 'ar'
}

export async function updateProfile(data: UpdateProfileData) {
  const supabase = await createClient()
  
  if (!supabase) {
    return { success: false, error: 'Authentication service not configured' }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      preferred_language: data.preferredLanguage
    })
    .eq('id', user.id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/account')
  return { success: true }
}

// ==========================================
// FORGOT PASSWORD - نسيت كلمة المرور
// ==========================================

export async function forgotPassword(email: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    return { success: false, error: 'Authentication service not configured' }
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/auth/reset-password`
  })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, message: 'Password reset email sent' }
}

// ==========================================
// RESET PASSWORD - إعادة تعيين كلمة المرور
// ==========================================

export async function resetPassword(newPassword: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    return { success: false, error: 'Authentication service not configured' }
  }
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// ==========================================
// CHECK AUTH - التحقق من المصادقة
// ==========================================

export async function checkAuth() {
  const supabase = await createClient()
  
  if (!supabase) {
    return false
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}
