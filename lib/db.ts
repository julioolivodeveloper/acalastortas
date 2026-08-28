import { supabase, CartItem, OrderStatus } from './supabase'

// ── MENÚ ──────────────────────────────────────────────────────────────────
export async function getMenu() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
  if (error) throw error
  return data
}

export async function updateMenuItem(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('menu_items').update(updates).eq('id', id)
  if (error) throw error
}

export async function addMenuItem(item: {
  id: string; name: string; description: string
  price: number; category: string; available: boolean
  image?: string | null; ingredients?: string[]
}) {
  const { error } = await supabase.from('menu_items').insert(item)
  if (error) throw error
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) throw error
}

// ── CLIENTES ──────────────────────────────────────────────────────────────
export async function findCustomerByPhone(phone: string) {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()
  return data
}

export async function createCustomer(name: string, phone: string) {
  const { data, error } = await supabase
    .from('customers')
    .insert({ name, phone })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateCustomerPoints(id: string, points: number) {
  const { error } = await supabase
    .from('customers')
    .update({ points })
    .eq('id', id)
  if (error) throw error
}

// ── ÓRDENES ───────────────────────────────────────────────────────────────
export async function placeOrder(data: {
  customerName: string
  customerPhone: string
  notes: string
  items: CartItem[]
  total: number
  customerId?: string
}) {
  if (!data.customerName.trim()) throw new Error('Nombre requerido')
  if (!data.customerPhone || data.customerPhone.length < 10) throw new Error('Teléfono inválido')
  if (!data.items.length) throw new Error('El carrito está vacío')
  if (data.total <= 0) throw new Error('Total inválido')

  const pointsEarned = Math.floor(data.total)

  // find or create customer — handle race condition on concurrent orders
  let customer = await findCustomerByPhone(data.customerPhone)
  if (!customer) {
    try {
      customer = await createCustomer(data.customerName, data.customerPhone)
    } catch (err: unknown) {
      // Unique violation (23505): another concurrent request created the customer first
      if ((err as { code?: string })?.code === '23505') {
        const found = await findCustomerByPhone(data.customerPhone)
        if (!found) throw err
        customer = found
      } else {
        throw err
      }
    }
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_id: customer.id,
      items: data.items,
      notes: data.notes,
      total: data.total,
      points_earned: pointsEarned,
      status: 'nuevo',
    })
    .select()
    .single()

  if (error) throw error

  // atomic points increment — avoids race condition on concurrent orders
  const { error: rpcError } = await supabase.rpc('increment_customer_points', {
    customer_id: customer.id,
    pts: pointsEarned,
  })
  if (rpcError) {
    console.error('increment_customer_points failed:', rpcError.message)
  }

  return order
}

export async function getOrders(filter?: 'activos' | 'todos') {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'activos') {
    query = query.not('status', 'in', '("entregado","cancelado")')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function getCustomerOrders(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ── STATS ─────────────────────────────────────────────────────────────────
// Returns midnight of today in El Paso (Mountain Time = UTC-6 MDT / UTC-7 MST)
function getElPasoMidnightUTC(): Date {
  const now = new Date()
  // Interpret El Paso local time numerically (server is UTC, so this preserves the local numbers)
  const elPasoNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }))
  // Offset = how many ms ahead UTC is of El Paso local (6h MDT / 7h MST)
  const offset = now.getTime() - elPasoNow.getTime()
  const midnightLocal = new Date(elPasoNow)
  midnightLocal.setHours(0, 0, 0, 0)
  return new Date(midnightLocal.getTime() + offset)
}

export async function getDashboardStats() {
  const today = getElPasoMidnightUTC()

  const [ordersToday, allOrders, customers] = await Promise.all([
    supabase.from('orders').select('total,status').gte('created_at', today.toISOString()),
    supabase.from('orders').select('status').not('status', 'in', '("entregado","cancelado")'),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
  ])

  const todayList = ordersToday.data ?? []
  const todayRevenue = todayList.reduce((s, o) => s + (o.total ?? 0), 0)
  const pending = (allOrders.data ?? []).length

  return {
    ordersToday: todayList.length,
    todayRevenue,
    pending,
    totalCustomers: customers.count ?? 0,
  }
}
