/**
 * ===========================================
 * CART SERVICE - خدمة السلة
 * ===========================================
 * 
 * هذا الملف يحتوي على جميع الدوال التي تتعامل مع سلة التسوق
 * السلة مرتبطة بالمستخدم المسجل
 */

import { createClient } from '@/lib/supabase/server'
import type { CartItem, CartItemWithProduct } from '@/lib/types/database'

// ==========================================
// GET CART ITEMS - جلب عناصر السلة
// ==========================================

export async function getCartItems(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*),
      product_size:product_sizes!inner(*)
    `)
    .eq('user_id', userId)
    // ربط الحجم الصحيح
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching cart items:', error)
    throw new Error(error.message)
  }
  
  // فلترة لجلب الحجم المطابق فقط
  const itemsWithCorrectSize = data?.map(item => {
    const correctSize = Array.isArray(item.product_size) 
      ? item.product_size.find((s: { size: string }) => s.size === item.size)
      : item.product_size
    return {
      ...item,
      product_size: correctSize
    }
  })
  
  return itemsWithCorrectSize as CartItemWithProduct[]
}

// ==========================================
// ADD TO CART - إضافة للسلة
// ==========================================

interface AddToCartData {
  userId: string
  productId: string
  size: string
  quantity: number
}

export async function addToCart(data: AddToCartData) {
  const supabase = await createClient()
  
  // التحقق إذا كان المنتج موجود بالفعل في السلة
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', data.userId)
    .eq('product_id', data.productId)
    .eq('size', data.size)
    .single()
  
  if (existingItem) {
    // تحديث الكمية إذا موجود
    const { data: updated, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + data.quantity })
      .eq('id', existingItem.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating cart item:', error)
      throw new Error(error.message)
    }
    
    return updated as CartItem
  }
  
  // إضافة عنصر جديد
  const { data: newItem, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: data.userId,
      product_id: data.productId,
      size: data.size,
      quantity: data.quantity
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error adding to cart:', error)
    throw new Error(error.message)
  }
  
  return newItem as CartItem
}

// ==========================================
// UPDATE CART ITEM - تحديث عنصر السلة
// ==========================================

export async function updateCartItem(itemId: string, userId: string, quantity: number) {
  const supabase = await createClient()
  
  if (quantity <= 0) {
    // حذف العنصر إذا الكمية 0 أو أقل
    return removeFromCart(itemId, userId)
  }
  
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .eq('user_id', userId)  // للأمان - التأكد من ملكية العنصر
    .select()
    .single()
  
  if (error) {
    console.error('Error updating cart item:', error)
    throw new Error(error.message)
  }
  
  return data as CartItem
}

// ==========================================
// REMOVE FROM CART - حذف من السلة
// ==========================================

export async function removeFromCart(itemId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId)  // للأمان
  
  if (error) {
    console.error('Error removing from cart:', error)
    throw new Error(error.message)
  }
  
  return { success: true }
}

// ==========================================
// CLEAR CART - تفريغ السلة
// ==========================================

export async function clearCart(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error clearing cart:', error)
    throw new Error(error.message)
  }
  
  return { success: true }
}

// ==========================================
// GET CART COUNT - عدد عناصر السلة
// ==========================================

export async function getCartCount(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error getting cart count:', error)
    return 0
  }
  
  // مجموع الكميات
  return data.reduce((sum, item) => sum + item.quantity, 0)
}

// ==========================================
// GET CART TOTAL - المجموع الكلي للسلة
// ==========================================

export async function getCartTotal(userId: string) {
  const items = await getCartItems(userId)
  
  const subtotal = items.reduce((sum, item) => {
    const price = item.product_size?.price || 0
    return sum + (price * item.quantity)
  }, 0)
  
  return {
    subtotal,
    itemsCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
  }
}
