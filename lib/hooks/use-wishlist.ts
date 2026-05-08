/**
 * ===========================================
 * USE WISHLIST HOOK - هوك المفضلة
 * ===========================================
 */

import useSWR from 'swr'
import { useCallback } from 'react'
import type { WishlistItemWithProduct } from '@/lib/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useWishlist() {
  const { data, error, isLoading, mutate } = useSWR('/api/wishlist', fetcher)
  
  // إضافة/حذف من المفضلة (toggle)
  const toggleWishlist = useCallback(async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      
      const result = await res.json()
      
      if (result.success) {
        mutate()
        return { success: true, added: result.data.added }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Failed to update wishlist' }
    }
  }, [mutate])
  
  // التحقق إذا المنتج في المفضلة
  const isInWishlist = useCallback((productId: string) => {
    if (!data?.data?.items) return false
    return data.data.items.some((item: WishlistItemWithProduct) => item.product_id === productId)
  }, [data])
  
  return {
    items: (data?.data?.items || []) as WishlistItemWithProduct[],
    count: data?.data?.count || 0,
    isLoading,
    isError: error,
    toggleWishlist,
    isInWishlist,
    mutate
  }
}
