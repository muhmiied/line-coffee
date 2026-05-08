/**
 * ===========================================
 * PRODUCTS SERVICE - خدمة المنتجات
 * ===========================================
 * 
 * هذا الملف يحتوي على جميع الدوال التي تتعامل مع المنتجات
 * كل دالة تقوم بعملية واحدة محددة (CRUD operations)
 * 
 * CRUD = Create, Read, Update, Delete
 * 
 * للمبتدئين: الـ Service هو طبقة وسيطة بين الـ API والـ Database
 * يفصل المنطق عن الـ API routes ويجعل الكود قابل لإعادة الاستخدام
 */

import { createClient } from '@/lib/supabase/server'
import type { 
  Product, 
  ProductWithDetails, 
  ProductSize, 
  Category 
} from '@/lib/types/database'

// ==========================================
// GET ALL PRODUCTS - جلب جميع المنتجات
// ==========================================

interface GetProductsOptions {
  categorySlug?: string       // فلترة بالتصنيف
  featured?: boolean          // فقط المميزة
  bestSeller?: boolean        // فقط الأكثر مبيعاً
  isNew?: boolean            // فقط الجديدة
  limit?: number             // عدد المنتجات
  offset?: number            // بداية الصفحة
  search?: string            // البحث بالاسم
}

export async function getProducts(options: GetProductsOptions = {}) {
  const supabase = await createClient()
  
  // نبدأ ببناء الـ query
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      sizes:product_sizes(*)
    `)
    .eq('is_visible', true)  // فقط المنتجات الظاهرة
  
  // فلترة بالتصنيف
  if (options.categorySlug) {
    // أولاً نجلب معرف التصنيف
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .single()
    
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }
  
  // فلترة المنتجات المميزة
  if (options.featured) {
    query = query.eq('is_featured', true)
  }
  
  // فلترة الأكثر مبيعاً
  if (options.bestSeller) {
    query = query.eq('is_best_seller', true)
  }
  
  // فلترة الجديدة
  if (options.isNew) {
    query = query.eq('is_new', true)
  }
  
  // البحث بالاسم
  if (options.search) {
    query = query.or(`name_en.ilike.%${options.search}%,name_ar.ilike.%${options.search}%`)
  }
  
  // ترتيب النتائج
  query = query.order('created_at', { ascending: false })
  
  // Pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching products:', error)
    throw new Error(error.message)
  }
  
  return data as ProductWithDetails[]
}

// ==========================================
// GET SINGLE PRODUCT - جلب منتج واحد
// ==========================================

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      sizes:product_sizes(*)
    `)
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // المنتج غير موجود
      return null
    }
    console.error('Error fetching product:', error)
    throw new Error(error.message)
  }
  
  return data as ProductWithDetails
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      sizes:product_sizes(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    throw new Error(error.message)
  }
  
  return data as ProductWithDetails
}

// ==========================================
// GET FEATURED PRODUCTS - المنتجات المميزة
// ==========================================

export async function getFeaturedProducts(limit: number = 4) {
  return getProducts({ featured: true, limit })
}

// ==========================================
// GET BEST SELLERS - الأكثر مبيعاً
// ==========================================

export async function getBestSellers(limit: number = 4) {
  return getProducts({ bestSeller: true, limit })
}

// ==========================================
// GET NEW ARRIVALS - الوصول الجديد
// ==========================================

export async function getNewArrivals(limit: number = 4) {
  return getProducts({ isNew: true, limit })
}

// ==========================================
// GET RELATED PRODUCTS - المنتجات المشابهة
// ==========================================

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      sizes:product_sizes(*)
    `)
    .eq('category_id', categoryId)
    .neq('id', productId)  // استبعاد المنتج الحالي
    .eq('is_visible', true)
    .limit(limit)
  
  if (error) {
    console.error('Error fetching related products:', error)
    throw new Error(error.message)
  }
  
  return data as ProductWithDetails[]
}

// ==========================================
// COUNT PRODUCTS - عدد المنتجات
// ==========================================

export async function countProducts(categorySlug?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_visible', true)
  
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }
  
  const { count, error } = await query
  
  if (error) {
    console.error('Error counting products:', error)
    throw new Error(error.message)
  }
  
  return count || 0
}
