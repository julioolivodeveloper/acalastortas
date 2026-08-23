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
  const pointsEarned = Math.floor(data.total)

  // find or create customer
  let customer = await findCustomerByPhone(data.customerPhone)
  if (!customer) {
    customer = await createCustomer(data.customerName, data.customerPhone)
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

  // update customer points + order count
  await supabase
    .from('customers')
    .update({
      points: (customer.points ?? 0) + pointsEarned,
      order_count: (customer.order_count ?? 0) + 1,
    })
    .eq('id', customer.id)

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
export async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
