'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem {
  productId: string
}

interface WishlistStore {
  items: WishlistItem[]
  isOpen: boolean
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string) => void
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

      addItem: (productId) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === productId)
          if (exists) return state
          return { items: [...state.items, { productId }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      toggleItem: (productId) => {
        const exists = get().items.some((i) => i.productId === productId)
        if (exists) {
          get().removeItem(productId)
        } else {
          get().addItem(productId)
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
