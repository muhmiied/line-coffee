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
  ownerId: string | null
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  toggleItem: (item: WishlistItem) => void
  isInWishlist: (productId: string) => boolean
  openWishlist: () => void
  closeWishlist: () => void
  clearWishlist: () => void
  replaceItems: (items: WishlistItem[]) => void
  resetForGuest: () => void
  syncOwner: (ownerId: string | null) => void
}

function canSync(ownerId: string | null) {
  return Boolean(ownerId) && typeof window !== 'undefined'
}

function syncToggle(productId: string, ownerId: string | null) {
  if (!canSync(ownerId)) return

  void fetch('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  }).catch(() => {})
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      ownerId: null,

      addItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId)
          if (exists) return state
          return { items: [...state.items, item] }
        })
        syncToggle(item.productId, get().ownerId)
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
        syncToggle(productId, get().ownerId)
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
      replaceItems: (items) => set({ items }),
      resetForGuest: () => set({ items: [], isOpen: false, ownerId: null }),
      syncOwner: (ownerId) => set({ ownerId }),
    }),
    {
      name: 'line-coffee-wishlist',
      partialize: (state) => ({ items: state.items, ownerId: state.ownerId }),
    }
  )
)
