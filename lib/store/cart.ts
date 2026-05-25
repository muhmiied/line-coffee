'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCustomItemMaxQuantity } from '@/lib/custom-stock'

export interface CartItem {
  id: string
  product_id: string
  name_en: string
  name_ar: string
  size: '250g' | '500g' | '1kg'
  price: number
  quantity: number
  image: string
  stock_quantity?: number
  customizations?: Record<string, unknown>
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  ownerId: string | null
  hasHydrated: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  replaceItems: (items: CartItem[]) => void
  resetForGuest: () => void
  syncOwner: (ownerId: string | null) => void
  setHasHydrated: (hasHydrated: boolean) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotal: () => number
}

function canSync(ownerId: string | null) {
  return Boolean(ownerId) && typeof window !== 'undefined'
}

function syncAddItem(item: CartItem, quantity: number, ownerId: string | null) {
  if (!canSync(ownerId)) return

  void fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientItemId: item.id,
      productId: item.product_id,
      size: item.size,
      quantity,
      name_en: item.name_en,
      name_ar: item.name_ar,
      price: item.price,
      image: item.image,
      customizations: item.customizations ?? null,
    }),
  }).catch(() => {})
}

function syncQuantity(id: string, quantity: number, ownerId: string | null) {
  if (!canSync(ownerId)) return

  void fetch(`/api/cart/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  }).catch(() => {})
}

function syncRemoveItem(id: string, ownerId: string | null) {
  if (!canSync(ownerId)) return

  void fetch(`/api/cart/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(() => {})
}

function syncClearCart(ownerId: string | null) {
  if (!canSync(ownerId)) return

  void fetch('/api/cart', { method: 'DELETE' }).catch(() => {})
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      ownerId: null,
      hasHydrated: false,

      addItem: (item) => {
        const quantityToAdd = item.quantity || 1
        const state = get()
        const existingIndex = state.items.findIndex((i) => i.id === item.id)
        const existingItem = existingIndex >= 0 ? state.items[existingIndex] : null
        const desiredQty = (existingItem?.quantity ?? 0) + quantityToAdd
        const customMaxQty = getCustomItemMaxQuantity(
          state.items,
          { ...(existingItem ?? item), ...item, quantity: desiredQty },
        )
        const maxQty = Math.min(item.stock_quantity ?? Infinity, customMaxQty)
        const nextQty = Math.min(desiredQty, maxQty)
        const syncDelta = existingItem ? Math.max(0, nextQty - existingItem.quantity) : nextQty

        if (nextQty <= 0 || syncDelta <= 0) {
          set({ isOpen: true })
          return
        }

        set((state) => {
          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex] = { ...newItems[existingIndex], ...item, quantity: nextQty, stock_quantity: item.stock_quantity }
            return { items: newItems, isOpen: true }
          }

          return {
            items: [...state.items, { ...item, quantity: nextQty }],
            isOpen: true,
          }
        })
        syncAddItem(item, syncDelta, get().ownerId)
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
        syncRemoveItem(id, get().ownerId)
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        const state = get()
        const target = state.items.find((i) => i.id === id)
        if (!target) return

        const customMaxQty = getCustomItemMaxQuantity(state.items, target)
        const maxQty = Math.min(target.stock_quantity ?? Infinity, customMaxQty)
        const capped = Math.min(quantity, maxQty)

        if (capped <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => {
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: capped } : item
            ),
          }
        })
        syncQuantity(id, capped, get().ownerId)
      },

      clearCart: () => {
        set({ items: [] })
        syncClearCart(get().ownerId)
      },

      replaceItems: (items) => set({ items }),

      resetForGuest: () => set({ items: [], isOpen: false, ownerId: null }),

      syncOwner: (ownerId) => set({ ownerId }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + item.price * item.quantity
        }, 0)
      },
    }),
    {
      name: 'line-coffee-cart',
      partialize: (state) => ({ items: state.items, ownerId: state.ownerId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
