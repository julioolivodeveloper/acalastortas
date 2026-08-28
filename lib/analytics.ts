import { supabase } from './supabase'

// Format a Date or ISO string as YYYY-MM-DD in El Paso (Mountain Time)
function toElPasoDate(d: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver' }).format(
    typeof d === 'string' ? new Date(d) : d
  )
}

export async function getAnalytics() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [ordersRes, customersRes, allOrdersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('created_at, total, items, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at'),
    supabase
      .from('customers')
      .select('created_at, points'),
    supabase
      .from('orders')
      .select('total, status')
      .eq('status', 'entregado'),
  ])

  const orders = ordersRes.data || []
  const customers = customersRes.data || []
  const completedOrders = allOrdersRes.data || []

  // Revenue by day (last 30 days) — keyed by El Paso local date
  const revenueMap: Record<string, number> = {}
  const ordersMap: Record<string, number> = {}

  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toElPasoDate(d)
    days.push(key)
    revenueMap[key] = 0
    ordersMap[key] = 0
  }

  orders.forEach((o) => {
    const day = toElPasoDate(o.created_at) // use El Paso date, not UTC
    if (revenueMap[day] !== undefined) {
      revenueMap[day] = (revenueMap[day] || 0) + Number(o.total)
      ordersMap[day] = (ordersMap[day] || 0) + 1
    }
  })

  const dailyData = days.map((day) => ({
    date: day.slice(5), // MM-DD
    revenue: Math.round(revenueMap[day] * 100) / 100,
    orders: ordersMap[day],
  }))

  // Top items by quantity
  const itemMap: Record<string, { qty: number; revenue: number }> = {}
  orders.forEach((o) => {
    if (!Array.isArray(o.items)) return
    o.items.forEach((ci: { item: { name: string }; quantity: number; item_price?: number }) => {
      const name = ci.item?.name || 'Desconocido'
      if (!itemMap[name]) itemMap[name] = { qty: 0, revenue: 0 }
      itemMap[name].qty += ci.quantity || 1
      itemMap[name].revenue += (ci.item_price || 0) * (ci.quantity || 1)
    })
  })

  const topItems = Object.entries(itemMap)
    .map(([name, { qty, revenue }]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, qty, revenue }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)

  // Summary stats
  const totalRevenue = completedOrders.reduce((s, o) => s + Number(o.total), 0)
  const today = toElPasoDate(new Date())
  const todayRevenue = revenueMap[today] || 0
  const todayOrders = ordersMap[today] || 0
  const totalOrders30 = orders.length

  // Status distribution (last 30 days)
  const statusMap: Record<string, number> = {}
  orders.forEach((o) => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1
  })
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

  // New customers last 30 days
  const thirtyDaysAgoKey = toElPasoDate(thirtyDaysAgo)
  const newCustomers = customers.filter(
    (c) => toElPasoDate(c.created_at) >= thirtyDaysAgoKey
  ).length

  return {
    dailyData,
    topItems,
    statusData,
    stats: {
      totalRevenue,
      todayRevenue,
      todayOrders,
      totalOrders30,
      totalCustomers: customers.length,
      newCustomers,
    },
  }
}
