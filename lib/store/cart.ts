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
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  ownerId: string | null
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  resetForGuest: () => void
  syncOwner: (ownerId: string | null) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      ownerId: null,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === item.id)

          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += item.quantity || 1
            return { items: newItems, isOpen: true }
          }

          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
            isOpen: true,
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
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
      },

      clearCart: () => set({ items: [] }),

      resetForGuest: () => set({ items: [], isOpen: false, ownerId: null }),

      syncOwner: (ownerId) => {
        set((state) => {
          if (state.ownerId === ownerId) return state

          if (state.ownerId === null && ownerId && state.items.length > 0) {
            return { ownerId }
          }

          return { ownerId, items: [], isOpen: false }
        })
      },

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
