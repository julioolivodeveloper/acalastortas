import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type OrderStatus = 'nuevo' | 'preparando' | 'listo' | 'entregado' | 'cancelado'

export type DbMenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
  image: string | null
  ingredients: string[]
  created_at: string
}

export type CartItem = {
  item: DbMenuItem
  quantity: number
}

export type DbOrder = {
  id: string
  order_number: number
  customer_name: string
  customer_phone: string
  customer_id: string | null
  items: CartItem[]
  notes: string
  status: OrderStatus
  total: number
  points_earned: number
  created_at: string
}

export type DbCustomer = {
  id: string
  name: string
  phone: string
  points: number
  order_count: number
  created_at: string
}
