'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DbCustomer } from '@/lib/supabase'

type CustomerStore = {
  customer: DbCustomer | null
  setCustomer: (c: DbCustomer | null) => void
  clearCustomer: () => void
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (customer) => set({ customer }),
      clearCustomer: () => set({ customer: null }),
    }),
    {
      name: 'acatortas-customer',
      partialize: (s) => ({ customer: s.customer }),
    }
  )
)
