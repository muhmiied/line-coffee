/**
 * ===========================================
 * CATEGORIES SERVICE - خدمة التصنيفات
 * ===========================================
 * 
 * هذا الملف يحتوي على جميع الدوال التي تتعامل مع التصنيفات
 */

import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types/database'

// ==========================================
// GET ALL CATEGORIES - جلب جميع التصنيفات
// ==========================================

export async function getCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error(error.message)
  }
  
  return data as Category[]
}

// ==========================================
// GET SINGLE CATEGORY - جلب تصنيف واحد
// ==========================================

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching category:', error)
    throw new Error(error.message)
  }
  
  return data as Category
}

// ==========================================
// GET CATEGORY WITH PRODUCTS COUNT
// ==========================================

export async function getCategoriesWithCount() {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error(error.message)
  }
  
  // جلب عدد المنتجات لكل تصنيف
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_visible', true)
      
      return {
        ...category,
        products_count: count || 0
      }
    })
  )
  
  return categoriesWithCount
}
