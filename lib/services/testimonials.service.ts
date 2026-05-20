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

export async function getTestimonials(featured?: boolean) {
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
    console.error('Error fetching testimonials:', error)
    throw new Error(error.message)
  }
  
  return data as Testimonial[]
}

// ==========================================
// GET FEATURED TESTIMONIALS - المميزة
// ==========================================

export async function getFeaturedTestimonials(limit: number = 5) {
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
    console.error('Error fetching featured testimonials:', error)
    throw new Error(error.message)
  }
  
  return data as Testimonial[]
}
