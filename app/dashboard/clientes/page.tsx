'use client'
import { useState } from 'react'
import { Star, Phone, ShoppingBag, Plus, Minus, Search } from 'lucide-react'
import { useAcaTortasStore, STATUS_LABELS, STATUS_COLORS } from '@/store/store'

export default function ClientesPage() {
  const { customers, orders, addPoints, redeemPoints } = useAcaTortasStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [pointsInput, setPointsInput] = useState('')

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  )

  const selectedCustomer = customers.find((c) => c.id === selected)
  const customerOrders = selected ? orders.filter((o) => o.customerId === selected) : []

  const tier = (points: number) => {
    if (points >= 500) return { label: 'VIP Gold', color: '#F5C000' }
    if (points >= 200) return { label: 'Silver', color: '#9CA3AF' }
    return { label: 'Bronce', color: '#CD7F32' }
  }

  const totalRevenue = customers.reduce((sum, c) => {
    const cOrders = orders.filter((o) => o.customerId === c.id)
    return sum + cOrders.reduce((s, o) => s + o.total, 0)
  }, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Clientes</h1>
        <p className="text-gray-400 text-sm mt-0.5">{customers.length} clientes registrados · ${totalRevenue.toFixed(2)} total facturado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Customer list */}
        <div className="lg:col-span-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((c) => {
                const t = tier(c.points)
                const cOrders = orders.filter((o) => o.customerId === c.id)
                const revenue = cOrders.reduce((s, o) => s + o.total, 0)
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id === selected ? null : c.id)}
                    className={`w-full text-left bg-gray-900 rounded-xl border p-4 transition ${
                      selected === c.id ? 'border-[#CC0000] bg-[#CC0000]/5' : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-black text-sm">{c.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{c.phone}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-3.5 h-3.5" style={{ color: t.color, fill: t.color }} />
                          <span className="font-black text-sm" style={{ color: t.color }}>{c.points}</span>
                        </div>
                        <p className="text-gray-500 text-xs">{c.orderCount} pedidos</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Customer detail */}
        <div className="lg:col-span-3">
          {!selectedCustomer ? (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center h-48">
              <p className="text-gray-500 text-sm">Selecciona un cliente para ver detalles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Customer header */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-white font-black text-xl">{selectedCustomer.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Cliente desde {new Date(selectedCustomer.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Star className="w-5 h-5" style={{ color: tier(selectedCustomer.points).color, fill: tier(selectedCustomer.points).color }} />
                      <span className="font-black text-2xl" style={{ color: tier(selectedCustomer.points).color }}>
                        {selectedCustomer.points}
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: tier(selectedCustomer.points).color }}>
                      {tier(selectedCustomer.points).label}
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Pedidos', value: selectedCustomer.orderCount.toString() },
                    { label: 'Total gastado', value: `$${customerOrders.reduce((s, o) => s + o.total, 0).toFixed(2)}` },
                    { label: 'Puntos', value: selectedCustomer.points.toString() },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs font-semibold">{s.label}</p>
                      <p className="text-white font-black text-lg">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Points management */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Gestión de Puntos</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      placeholder="Cantidad de puntos"
                      className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                    />
                    <button
                      onClick={() => { if (pointsInput) { addPoints(selectedCustomer.id, parseInt(pointsInput)); setPointsInput('') } }}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-500 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                    <button
                      onClick={() => { if (pointsInput) { redeemPoints(selectedCustomer.id, parseInt(pointsInput)); setPointsInput('') } }}
                      className="flex items-center gap-1 px-3 py-2 border border-red-500/30 text-red-400 rounded-xl text-xs font-black hover:bg-red-500/10 transition"
                    >
                      <Minus className="w-3.5 h-3.5" /> Canjear
                    </button>
                  </div>
                </div>
              </div>

              {/* Order history */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <h3 className="text-white font-black text-base mb-4">
                  Historial de Pedidos ({customerOrders.length})
                </h3>
                {customerOrders.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin pedidos aún</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="text-white font-bold text-sm">#{order.orderNumber}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(order.createdAt).toLocaleDateString('es-MX')} · {order.items.length} platillos
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
          )}
        </div>
      </div>
    </div>
  )
}
