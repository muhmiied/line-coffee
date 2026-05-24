/**
 * ===========================================
 * TESTIMONIALS SERVICE - خدمة شهادات العملاء
 * ===========================================
 */

import { createClient } from '@/lib/supabase/server'
import type { Testimonial } from '@/lib/types/database'

// ==========================================
// GET TESTIMONIALS - جلب الشهادات
// ==========================================

export async function getTestimonials(featured?: boolean): Promise<Testimonial[]> {
  const supabase = await createClient()

  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('is_visible', true)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (featured) {
    query = query.eq('is_featured', true)
  }

  const { data, error } = await query

  if (error) {
    // Column not yet added — fall back to is_visible only
    if (error.code === '42703') {
      let fallback = supabase
        .from('testimonials')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (featured) {
        fallback = fallback.eq('is_featured', true)
      }

      const { data: fbData, error: fbErr } = await fallback
      if (fbErr) throw new Error(fbErr.message)
      return (fbData || []) as Testimonial[]
    }
    throw new Error(error.message)
  }

  return (data || []) as Testimonial[]
}

// ==========================================
// GET FEATURED TESTIMONIALS - المميزة
// ==========================================

export async function getFeaturedTestimonials(limit: number = 5): Promise<Testimonial[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_visible', true)
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (error.code === '42703') {
      const { data: fbData, error: fbErr } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_visible', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fbErr) throw new Error(fbErr.message)
      return (fbData || []) as Testimonial[]
    }
    throw new Error(error.message)
  }

  return (data || []) as Testimonial[]
}
