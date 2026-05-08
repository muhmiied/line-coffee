/**
 * ===========================================
 * USE PRODUCTS HOOK - هوك المنتجات
 * ===========================================
 * 
 * هذا الـ Hook يستخدم SWR لجلب المنتجات من الـ API
 * SWR يوفر caching وrevalidation تلقائي
 * 
 * للمبتدئين: الـ Hooks هي دوال تبدأ بـ "use" وتستخدم في React Components
 * تسهل إعادة استخدام المنطق بين الـ Components
 */

import useSWR from 'swr'
import type { ProductWithDetails } from '@/lib/types/database'

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

// ==========================================
// USE PRODUCTS - جلب المنتجات
// ==========================================

interface UseProductsOptions {
  category?: string
  featured?: boolean
  bestSeller?: boolean
  isNew?: boolean
  search?: string
  limit?: number
}

export function useProducts(options: UseProductsOptions = {}) {
  // بناء الـ URL مع الـ query parameters
  const params = new URLSearchParams()
  if (options.category) params.set('category', options.category)
  if (options.featured) params.set('featured', 'true')
  if (options.bestSeller) params.set('bestSeller', 'true')
  if (options.isNew) params.set('new', 'true')
  if (options.search) params.set('search', options.search)
  if (options.limit) params.set('limit', options.limit.toString())
  
  const queryString = params.toString()
  const url = `/api/products${queryString ? `?${queryString}` : ''}`
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    products: (data?.data || []) as ProductWithDetails[],
    isLoading,
    isError: error,
    mutate  // لإعادة جلب البيانات
  }
}

// ==========================================
// USE PRODUCT - جلب منتج واحد
// ==========================================

export function useProduct(slug: string) {
  const { data, error, isLoading } = useSWR(
    slug ? `/api/products/${slug}` : null,
    fetcher
  )
  
  return {
    product: data?.data?.product as ProductWithDetails | undefined,
    relatedProducts: (data?.data?.relatedProducts || []) as ProductWithDetails[],
    isLoading,
    isError: error
  }
}

// ==========================================
// USE FEATURED PRODUCTS - المنتجات المميزة
// ==========================================

export function useFeaturedProducts(limit: number = 4) {
  return useProducts({ featured: true, limit })
}

// ==========================================
// USE BEST SELLERS - الأكثر مبيعاً
// ==========================================

export function useBestSellers(limit: number = 4) {
  return useProducts({ bestSeller: true, limit })
}

// ==========================================
// USE NEW ARRIVALS - الوصول الجديد
// ==========================================

export function useNewArrivals(limit: number = 4) {
  return useProducts({ isNew: true, limit })
}
