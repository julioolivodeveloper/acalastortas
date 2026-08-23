'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DbMenuItem } from '@/lib/supabase'

export type CartItem = {
  item: DbMenuItem
  quantity: number
}

type CartStore = {
  cart: CartItem[]
  addToCart: (item: DbMenuItem) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (item) =>
        set((s) => {
          const existing = s.cart.find((c) => c.item.id === item.id)
          if (existing) {
            return { cart: s.cart.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) }
          }
          return { cart: [...s.cart, { item, quantity: 1 }] }
        }),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.item.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          cart: qty <= 0
            ? s.cart.filter((c) => c.item.id !== id)
            : s.cart.map((c) => c.item.id === id ? { ...c, quantity: qty } : c),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'acatortas-cart' }
  )
)

export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)

export const cartCount = (cart: CartItem[]) =>
  cart.reduce((sum, c) => sum + c.quantity, 0)

// Alias para compatibilidad con Header y CartDrawer
export const useAcaTortasStore = useCartStore

export const STATUS_LABELS = {
  nuevo: 'Nuevo',
  preparando: 'En Preparación',
  listo: 'Listo para Recoger',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
} as const

export const STATUS_COLORS = {
  nuevo: '#F59E0B',
  preparando: '#3B82F6',
  listo: '#16A34A',
  entregado: '#6B7280',
  cancelado: '#EF4444',
} as const

export const NEXT_STATUS: Partial<Record<string, string>> = {
  nuevo: 'preparando',
  preparando: 'listo',
  listo: 'entregado',
}

export const ADMIN_PIN = '1234'
