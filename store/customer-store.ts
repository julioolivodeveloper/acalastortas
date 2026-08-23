'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DbCustomer } from '@/lib/supabase'

type CustomerStore = {
  customer: DbCustomer | null
  // phone → contraseña (guardada localmente)
  passwords: Record<string, string>
  setCustomer: (c: DbCustomer | null) => void
  savePassword: (phone: string, password: string) => void
  checkPassword: (phone: string, password: string) => boolean
  hasPassword: (phone: string) => boolean
  clearCustomer: () => void
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customer: null,
      passwords: {},
      setCustomer: (customer) => set({ customer }),
      savePassword: (phone, password) =>
        set((s) => ({ passwords: { ...s.passwords, [phone]: password } })),
      checkPassword: (phone, password) => get().passwords[phone] === password,
      hasPassword: (phone) => !!get().passwords[phone],
      clearCustomer: () => set({ customer: null }),
    }),
    { name: 'acatortas-customer' }
  )
)
