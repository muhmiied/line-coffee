/**
 * ===========================================
 * USE CART HOOK - هوك السلة
 * ===========================================
 * 
 * هذا الـ Hook يدير سلة التسوق
 * يستخدم SWR للـ caching و optimistic updates
 */

import useSWR from 'swr'
import { useCallback } from 'react'
import type { CartItemWithProduct } from '@/lib/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR('/api/cart', fetcher)
  
  // إضافة للسلة
  const addToCart = useCallback(async (productId: string, size: string, quantity: number = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, quantity })
      })
      
      const result = await res.json()
      
      if (result.success) {
        mutate()  // إعادة جلب البيانات
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Failed to add to cart' }
    }
  }, [mutate])
  
  // تحديث الكمية
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })
      
      const result = await res.json()
      
      if (result.success) {
        mutate()
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Failed to update cart' }
    }
  }, [mutate])
  
  // حذف من السلة
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      })
      
      const result = await res.json()
      
      if (result.success) {
        mutate()
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Failed to remove from cart' }
    }
  }, [mutate])
  
  // تفريغ السلة
  const clearCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE'
      })
      
      const result = await res.json()
      
      if (result.success) {
        mutate()
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Failed to clear cart' }
    }
  }, [mutate])
  
  return {
    items: (data?.data?.items || []) as CartItemWithProduct[],
    subtotal: data?.data?.subtotal || 0,
    itemsCount: data?.data?.itemsCount || 0,
    totalQuantity: data?.data?.totalQuantity || 0,
    isLoading,
    isError: error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    mutate
  }
}
