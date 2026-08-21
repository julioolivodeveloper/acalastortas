'use client'
import Link from 'next/link'
import { ShoppingBag, DollarSign, Users, UtensilsCrossed, TrendingUp, Clock } from 'lucide-react'
import { useAcaTortasStore, STATUS_LABELS, STATUS_COLORS } from '@/store/store'

export default function DashboardHome() {
  const { orders, customers, menu } = useAcaTortasStore()

  const today = new Date().toDateString()
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today)
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === 'nuevo' || o.status === 'preparando')
  const availableItems = menu.filter((m) => m.available).length

  const recentOrders = orders.slice(0, 6)

  const stats = [
    { label: 'Órdenes Hoy', value: todayOrders.length.toString(), icon: ShoppingBag, color: '#CC0000' },
    { label: 'Ventas Hoy', value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, color: '#16A34A' },
    { label: 'Pendientes', value: pendingOrders.length.toString(), icon: Clock, color: '#F59E0B' },
    { label: 'Clientes', value: customers.length.toString(), icon: Users, color: '#6366F1' },
    { label: 'Total Órdenes', value: orders.length.toString(), icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Platillos Activos', value: availableItems.toString(), icon: UtensilsCrossed, color: '#14B8A6' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Panel de Control</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-white font-black text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending orders alert */}
      {pendingOrders.length > 0 && (
        <Link href="/dashboard/pedidos" className="block mb-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between hover:bg-amber-500/20 transition">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-amber-400 font-black text-sm">
                {pendingOrders.length} {pendingOrders.length === 1 ? 'orden pendiente' : 'órdenes pendientes'}
              </p>
            </div>
            <span className="text-amber-400 text-xs font-bold">Ver →</span>
          </div>
        </Link>
      )}

      {/* Quick access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/dashboard/pedidos', icon: ShoppingBag, title: 'Gestionar Pedidos', desc: 'Ver y actualizar órdenes en tiempo real', color: '#CC0000' },
          { href: '/dashboard/menu', icon: UtensilsCrossed, title: 'Editar Menú', desc: 'Precios, disponibilidad e ingredientes', color: '#6366F1' },
          { href: '/dashboard/clientes', icon: Users, title: 'Clientes', desc: 'Puntos y historial de clientes', color: '#14B8A6' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-5 hover:border-gray-600 transition group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: item.color + '20' }}>
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <p className="text-white font-black text-sm mb-1">{item.title}</p>
            <p className="text-gray-500 text-xs">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-base">Órdenes Recientes</h2>
          <Link href="/dashboard/pedidos" className="text-[#CC0000] text-xs font-bold hover:underline">Ver todas</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Aún no hay órdenes</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white font-bold text-sm">#{order.orderNumber} — {order.customerName}</p>
                  <p className="text-gray-500 text-xs">
                    {order.items.length} {order.items.length === 1 ? 'platillo' : 'platillos'} ·{' '}
                    {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-sm">${order.total.toFixed(2)}</p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: STATUS_COLORS[order.status] }}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
