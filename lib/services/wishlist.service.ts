/**
 * ===========================================
 * WISHLIST SERVICE - خدمة قائمة الأمنيات
 * ===========================================
 * 
 * هذا الملف يحتوي على جميع الدوال التي تتعامل مع المفضلة
 */

import { createClient } from '@/lib/supabase/server'
import type { WishlistItem, WishlistItemWithProduct } from '@/lib/types/database'

// ==========================================
// GET WISHLIST - جلب المفضلة
// ==========================================

export async function getWishlist(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      product:products(
        *,
        category:categories(*),
        sizes:product_sizes(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching wishlist:', error)
    throw new Error(error.message)
  }
  
  return data as WishlistItemWithProduct[]
}

// ==========================================
// ADD TO WISHLIST - إضافة للمفضلة
// ==========================================

export async function addToWishlist(userId: string, productId: string) {
  const supabase = await createClient()
  
  // التحقق إذا المنتج موجود بالفعل
  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()
  
  if (existing) {
    // المنتج موجود بالفعل
    return existing
  }
  
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      user_id: userId,
      product_id: productId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error adding to wishlist:', error)
    throw new Error(error.message)
  }
  
  return data as WishlistItem
}

// ==========================================
// REMOVE FROM WISHLIST - حذف من المفضلة
// ==========================================

export async function removeFromWishlist(userId: string, productId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  
  if (error) {
    console.error('Error removing from wishlist:', error)
    throw new Error(error.message)
  }
  
  return { success: true }
}

// ==========================================
// CHECK IF IN WISHLIST - التحقق إذا موجود
// ==========================================

export async function isInWishlist(userId: string, productId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking wishlist:', error)
    return false
  }
  
  return !!data
}

// ==========================================
// TOGGLE WISHLIST - تبديل المفضلة
// ==========================================

export async function toggleWishlist(userId: string, productId: string) {
  const isIn = await isInWishlist(userId, productId)
  
  if (isIn) {
    await removeFromWishlist(userId, productId)
    return { added: false }
  } else {
    await addToWishlist(userId, productId)
    return { added: true }
  }
}

// ==========================================
// GET WISHLIST COUNT - عدد المفضلة
// ==========================================

export async function getWishlistCount(userId: string) {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('wishlist_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error getting wishlist count:', error)
    return 0
  }
  
  return count || 0
}
