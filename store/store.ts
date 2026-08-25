'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DbMenuItem, CartItemExtra } from '@/lib/supabase'

export type { CartItemExtra }

export type CartItem = {
  cartKey?: string
  item: DbMenuItem
  quantity: number
  removedIngredients?: string[]
  extras?: CartItemExtra[]
}

const ck = (ci: CartItem) => ci.cartKey ?? ci.item.id

type CartStore = {
  cart: CartItem[]
  addToCart: (item: DbMenuItem, options?: { removedIngredients?: string[]; extras?: CartItemExtra[] }) => void
  removeFromCart: (cartKey: string) => void
  updateQty: (cartKey: string, qty: number) => void
  replaceCartItem: (cartKey: string, item: DbMenuItem, quantity: number, options?: { removedIngredients?: string[]; extras?: CartItemExtra[] }) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (item, options) =>
        set((s) => {
          const hasCustom = (options?.removedIngredients?.length ?? 0) > 0 || (options?.extras?.length ?? 0) > 0
          if (hasCustom) {
            const cartKey = `${item.id}-${Date.now()}`
            return {
              cart: [...s.cart, { cartKey, item, quantity: 1, removedIngredients: options?.removedIngredients, extras: options?.extras }],
            }
          }
          const existing = s.cart.find((c) => ck(c) === item.id && !c.removedIngredients?.length && !c.extras?.length)
          if (existing) {
            return { cart: s.cart.map((c) => ck(c) === ck(existing) ? { ...c, quantity: c.quantity + 1 } : c) }
          }
          return { cart: [...s.cart, { cartKey: item.id, item, quantity: 1 }] }
        }),
      removeFromCart: (cartKey) => set((s) => ({ cart: s.cart.filter((c) => ck(c) !== cartKey) })),
      replaceCartItem: (cartKey, item, quantity, options) =>
        set((s) => ({
          cart: s.cart.map((c) =>
            ck(c) === cartKey
              ? {
                  cartKey: `${item.id}-${Date.now()}`,
                  item,
                  quantity,
                  removedIngredients: options?.removedIngredients,
                  extras: options?.extras,
                }
              : c
          ),
        })),
      updateQty: (cartKey, qty) =>
        set((s) => ({
          cart: qty <= 0
            ? s.cart.filter((c) => ck(c) !== cartKey)
            : s.cart.map((c) => ck(c) === cartKey ? { ...c, quantity: qty } : c),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'acatortas-cart' }
  )
)

export const cartItemPrice = (ci: CartItem) =>
  ci.item.price + (ci.extras ?? []).reduce((s, e) => s + e.price, 0)

export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((sum, c) => sum + cartItemPrice(c) * c.quantity, 0)

export const cartCount = (cart: CartItem[]) =>
  cart.reduce((sum, c) => sum + c.quantity, 0)

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
