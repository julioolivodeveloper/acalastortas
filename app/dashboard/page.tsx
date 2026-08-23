'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, DollarSign, Users, UtensilsCrossed, TrendingUp, Clock } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '@/store/store'
import { getDashboardStats, getOrders } from '@/lib/db'
import type { DbOrder } from '@/lib/supabase'

export default function DashboardHome() {
  const [stats, setStats] = useState({ ordersToday: 0, todayRevenue: 0, pending: 0, totalCustomers: 0 })
  const [recent, setRecent] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [s, orders] = await Promise.all([getDashboardStats(), getOrders('todos')])
      setStats(s)
      setRecent((orders as DbOrder[]).slice(0, 6))
      setLoading(false)
    }
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [])

  const statCards = [
    { label: 'Órdenes Hoy', value: stats.ordersToday.toString(), icon: ShoppingBag, color: '#CC0000' },
    { label: 'Ventas Hoy', value: `$${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: '#16A34A' },
    { label: 'Pendientes', value: stats.pending.toString(), icon: Clock, color: '#F59E0B' },
    { label: 'Clientes', value: stats.totalCustomers.toString(), icon: Users, color: '#6366F1' },
    { label: 'Total Órdenes', value: recent.length > 0 ? '—' : '0', icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Actualización', value: 'Auto', icon: UtensilsCrossed, color: '#14B8A6' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Panel de Control</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-white font-black text-2xl">{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {stats.pending > 0 && (
        <Link href="/dashboard/pedidos" className="block mb-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between hover:bg-amber-500/20 transition">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-amber-400 font-black text-sm">
                {stats.pending} {stats.pending === 1 ? 'orden pendiente' : 'órdenes pendientes'}
              </p>
            </div>
            <span className="text-amber-400 text-xs font-bold">Ver →</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/dashboard/pedidos', icon: ShoppingBag, title: 'Gestionar Pedidos', desc: 'Ver y actualizar órdenes en tiempo real', color: '#CC0000' },
          { href: '/dashboard/menu', icon: UtensilsCrossed, title: 'Editar Menú', desc: 'Precios, disponibilidad e ingredientes', color: '#6366F1' },
          { href: '/dashboard/clientes', icon: Users, title: 'Clientes', desc: 'Puntos y historial de clientes', color: '#14B8A6' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 hover:border-gray-600 transition">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: item.color + '20' }}>
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <p className="text-white font-black text-sm mb-1">{item.title}</p>
            <p className="text-gray-500 text-xs">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-base">Órdenes Recientes</h2>
          <Link href="/dashboard/pedidos" className="text-[#CC0000] text-xs font-bold hover:underline">Ver todas</Link>
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm text-center py-6">Cargando...</p>
        ) : recent.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Aún no hay órdenes</p>
        ) : (
          <div className="space-y-2">
            {recent.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white font-bold text-sm">#{order.order_number} — {order.customer_name}</p>
                  <p className="text-gray-500 text-xs">
                    {order.items.length} {order.items.length === 1 ? 'platillo' : 'platillos'} ·{' '}
                    {new Date(order.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-sm">${order.total.toFixed(2)}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[order.status] }}>
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
