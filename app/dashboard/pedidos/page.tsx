'use client'
import { useEffect, useState } from 'react'
import { Phone, Clock, ChevronDown, ChevronUp, X } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, NEXT_STATUS } from '@/store/store'
import { getOrders, updateOrderStatus } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { DbOrder, OrderStatus } from '@/lib/supabase'

const STATUS_ORDER: OrderStatus[] = ['nuevo', 'preparando', 'listo', 'entregado', 'cancelado']

export default function PedidosPage() {
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [filter, setFilter] = useState<'activos' | 'todos'>('activos')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const data = await getOrders(filter)
    setOrders(data as DbOrder[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // Realtime subscription
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const visible = filter === 'activos'
    ? orders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado')
    : orders

  const byStatus = STATUS_ORDER.reduce((acc, s) => {
    const items = visible.filter((o) => o.status === s)
    if (items.length) acc[s] = items
    return acc
  }, {} as Record<string, DbOrder[]>)

  const handleAdvance = async (order: DbOrder) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    await updateOrderStatus(order.id, next as OrderStatus)
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next as OrderStatus } : o))
  }

  const handleCancel = async (order: DbOrder) => {
    await updateOrderStatus(order.id, 'cancelado')
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'cancelado' as OrderStatus } : o))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-2xl">Pedidos</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tiempo real — Supabase Realtime</p>
        </div>
        <div className="flex gap-1 bg-gray-900 rounded-xl border border-gray-800 p-1">
          {(['activos', 'todos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black capitalize transition ${
                filter === f ? 'bg-[#CC0000] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-semibold">Cargando pedidos...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-semibold">No hay pedidos{filter === 'activos' ? ' activos' : ''}</p>
          <p className="text-sm mt-1">Las órdenes aparecen aquí cuando los clientes ordenan</p>
        </div>
      ) : (
        <div className="space-y-8">
          {STATUS_ORDER.map((status) => {
            const items = byStatus[status]
            if (!items) return null
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                  <h2 className="text-gray-300 font-black text-sm uppercase tracking-wider">
                    {STATUS_LABELS[status]} ({items.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {items.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      expanded={expanded === order.id}
                      onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                      onAdvance={() => handleAdvance(order)}
                      onCancel={() => handleCancel(order)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, expanded, onToggle, onAdvance, onCancel }: {
  order: DbOrder; expanded: boolean
  onToggle: () => void; onAdvance: () => void; onCancel: () => void
}) {
  const age = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
  const nextStatus = NEXT_STATUS[order.status]

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-black text-base">#{order.order_number}</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[order.status] }}>
                {STATUS_LABELS[order.status]}
              </span>
              {order.status === 'nuevo' && age < 3 && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold animate-pulse">¡NUEVO!</span>
              )}
            </div>
            <p className="text-gray-400 text-sm font-semibold mt-0.5">{order.customer_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white font-black">${order.total.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-gray-500 text-xs justify-end">
              <Clock className="w-3 h-3" />
              <span>hace {age === 0 ? 'menos de 1' : age} min</span>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-800 p-4">
          <div className="space-y-1.5 mb-4">
            {order.items.map((ci) => (
              <div key={ci.item.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{ci.quantity}× {ci.item.name}</span>
                <span className="text-gray-400">${(ci.item.price * ci.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {order.notes && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
              <p className="text-yellow-400 text-xs font-black mb-1">Notas del cliente:</p>
              <p className="text-yellow-200 text-sm">{order.notes}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
            <Phone className="w-4 h-4" />
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex gap-2">
            {nextStatus && (
              <button onClick={onAdvance} className="flex-1 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90" style={{ backgroundColor: STATUS_COLORS[nextStatus as OrderStatus] }}>
                → {STATUS_LABELS[nextStatus as OrderStatus]}
              </button>
            )}
            {order.status !== 'entregado' && order.status !== 'cancelado' && (
              <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 text-sm transition">
                <X className="w-4 h-4" /> Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
