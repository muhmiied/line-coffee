'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name_en: string
  name_ar: string
  slug: string
  image: string
  price: number
}

interface WishlistStore {
  items: WishlistItem[]
  isOpen: boolean
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  toggleItem: (item: WishlistItem) => void
  isInWishlist: (productId: string) => boolean
  openWishlist: () => void
  closeWishlist: () => void
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId)
          if (exists) return state
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      toggleItem: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId)
        if (exists) {
          get().removeItem(item.productId)
        } else {
          get().addItem(item)
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId)
      },

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'line-coffee-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
