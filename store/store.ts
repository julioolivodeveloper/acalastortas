'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MenuItem, DEFAULT_MENU } from '@/data/menu'

export type CartItem = {
  item: MenuItem
  quantity: number
}

export type OrderStatus = 'nuevo' | 'preparando' | 'listo' | 'entregado' | 'cancelado'

export type Order = {
  id: string
  orderNumber: number
  items: CartItem[]
  customerName: string
  customerPhone: string
  notes: string
  status: OrderStatus
  total: number
  createdAt: string
  customerId?: string
  pointsEarned: number
}

export type Customer = {
  id: string
  name: string
  phone: string
  points: number
  createdAt: string
  orderCount: number
}

type Store = {
  // Menu
  menu: MenuItem[]
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
  addMenuItem: (item: MenuItem) => void
  deleteMenuItem: (id: string) => void
  resetMenu: () => void

  // Cart
  cart: CartItem[]
  addToCart: (item: MenuItem) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void

  // Orders
  orders: Order[]
  orderCounter: number
  placeOrder: (data: { customerName: string; customerPhone: string; notes: string; customerId?: string }) => Order
  updateOrderStatus: (id: string, status: OrderStatus) => void

  // Customers
  customers: Customer[]
  findOrCreateCustomer: (name: string, phone: string) => Customer
  addPoints: (customerId: string, points: number) => void
  redeemPoints: (customerId: string, points: number) => void
}

export const useAcaTortasStore = create<Store>()(
  persist(
    (set, get) => ({
      // Menu
      menu: DEFAULT_MENU,
      updateMenuItem: (id, updates) =>
        set((s) => ({ menu: s.menu.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),
      addMenuItem: (item) => set((s) => ({ menu: [...s.menu, item] })),
      deleteMenuItem: (id) => set((s) => ({ menu: s.menu.filter((m) => m.id !== id) })),
      resetMenu: () => set({ menu: DEFAULT_MENU }),

      // Cart
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

      // Orders
      orders: [],
      orderCounter: 1001,
      placeOrder: ({ customerName, customerPhone, notes, customerId }) => {
        const { cart, orderCounter, customers } = get()
        const total = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)
        const pointsEarned = Math.floor(total)
        const order: Order = {
          id: crypto.randomUUID(),
          orderNumber: orderCounter,
          items: [...cart],
          customerName,
          customerPhone,
          notes,
          status: 'nuevo',
          total,
          createdAt: new Date().toISOString(),
          customerId,
          pointsEarned,
        }
        // Add points to customer
        if (customerId) {
          const customer = customers.find((c) => c.id === customerId)
          if (customer) {
            set((s) => ({
              customers: s.customers.map((c) =>
                c.id === customerId
                  ? { ...c, points: c.points + pointsEarned, orderCount: c.orderCount + 1 }
                  : c
              ),
            }))
          }
        }
        set((s) => ({ orders: [order, ...s.orders], orderCounter: s.orderCounter + 1, cart: [] }))
        return order
      },
      updateOrderStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),

      // Customers
      customers: [],
      findOrCreateCustomer: (name, phone) => {
        const existing = get().customers.find((c) => c.phone === phone)
        if (existing) return existing
        const customer: Customer = {
          id: crypto.randomUUID(),
          name,
          phone,
          points: 0,
          createdAt: new Date().toISOString(),
          orderCount: 0,
        }
        set((s) => ({ customers: [...s.customers, customer] }))
        return customer
      },
      addPoints: (customerId, points) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === customerId ? { ...c, points: c.points + points } : c
          ),
        })),
      redeemPoints: (customerId, points) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === customerId ? { ...c, points: Math.max(0, c.points - points) } : c
          ),
        })),
    }),
    {
      name: 'acatortas-store',
    }
  )
)

// Helpers
export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)

export const cartCount = (cart: CartItem[]) =>
  cart.reduce((sum, c) => sum + c.quantity, 0)

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nuevo: 'Nuevo',
  preparando: 'En Preparación',
  listo: 'Listo para Recoger',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  nuevo: '#F59E0B',
  preparando: '#3B82F6',
  listo: '#16A34A',
  entregado: '#6B7280',
  cancelado: '#EF4444',
}

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  nuevo: 'preparando',
  preparando: 'listo',
  listo: 'entregado',
}

export const ADMIN_PIN = '1234'
