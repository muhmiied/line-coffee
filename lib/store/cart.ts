'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  product_id: string
  name_en: string
  name_ar: string
  size: '250g' | '500g' | '1kg'
  price: number
  quantity: number
  image: string
  customizations?: Record<string, unknown>
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  ownerId: string | null
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  replaceItems: (items: CartItem[]) => void
  resetForGuest: () => void
  syncOwner: (ownerId: string | null) => void
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

      addItem: (item) => {
        const quantityToAdd = item.quantity || 1
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === item.id)

          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += quantityToAdd
            return { items: newItems, isOpen: true }
          }

          return {
            items: [...state.items, { ...item, quantity: quantityToAdd }],
            isOpen: true,
          }
        })
        syncAddItem(item, quantityToAdd, get().ownerId)
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

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
        syncQuantity(id, quantity, get().ownerId)
      },

      clearCart: () => {
        set({ items: [] })
        syncClearCart(get().ownerId)
      },

      replaceItems: (items) => set({ items }),

      resetForGuest: () => set({ items: [], isOpen: false, ownerId: null }),

      syncOwner: (ownerId) => set({ ownerId }),

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
    }
  )
)
