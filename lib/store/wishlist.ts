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
  hasHydrated: boolean
  pendingAdds: WishlistItem[]
  pendingRemovals: string[]
  pendingClear: boolean
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
  setHasHydrated: (hasHydrated: boolean) => void
}

function canCallWishlistApi() {
  return typeof window !== 'undefined'
}

function syncWishlistAction(
  action: 'add' | 'remove',
  productId: string
) {
  if (!canCallWishlistApi()) return

  void fetch('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, action }),
  }).catch(() => {})
}

function syncClear() {
  if (!canCallWishlistApi()) return

  void fetch('/api/wishlist', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }).catch(() => {})
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      ownerId: null,
      hasHydrated: false,
      pendingAdds: [],
      pendingRemovals: [],
      pendingClear: false,

      addItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId)
          const pendingAdds = state.pendingAdds.some((i) => i.productId === item.productId)
            ? state.pendingAdds.map((i) => i.productId === item.productId ? item : i)
            : [...state.pendingAdds, item]

          return {
            items: exists ? state.items : [...state.items, item],
            pendingAdds,
            pendingRemovals: state.pendingRemovals.filter((id) => id !== item.productId),
          }
        })
        syncWishlistAction('add', item.productId)
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          pendingAdds: state.pendingAdds.filter((i) => i.productId !== productId),
          pendingRemovals: state.pendingRemovals.includes(productId)
            ? state.pendingRemovals
            : [...state.pendingRemovals, productId],
        }))
        syncWishlistAction('remove', productId)
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
      clearWishlist: () => {
        set({ items: [], pendingAdds: [], pendingRemovals: [], pendingClear: true })
        syncClear()
      },
      replaceItems: (items) => set({
        items,
        pendingAdds: [],
        pendingRemovals: [],
        pendingClear: false,
      }),
      resetForGuest: () => set({
        items: [],
        isOpen: false,
        ownerId: null,
        pendingAdds: [],
        pendingRemovals: [],
        pendingClear: false,
      }),
      syncOwner: (ownerId) => set({ ownerId }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'line-coffee-wishlist',
      partialize: (state) => ({
        items: state.items,
        ownerId: state.ownerId,
        pendingAdds: state.pendingAdds,
        pendingRemovals: state.pendingRemovals,
        pendingClear: state.pendingClear,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
