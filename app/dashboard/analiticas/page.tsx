'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, Users, Star } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getAnalytics } from '@/lib/analytics'

type Analytics = Awaited<ReturnType<typeof getAnalytics>>

const STATUS_COLORS: Record<string, string> = {
  entregado: '#006B42',
  preparando: '#F59E0B',
  listo: '#3B82F6',
  nuevo: '#8B5CF6',
  cancelado: '#EF4444',
}
const STATUS_LABELS: Record<string, string> = {
  entregado: 'Entregado',
  preparando: 'Preparando',
  listo: 'Listo',
  nuevo: 'Nuevo',
  cancelado: 'Cancelado',
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-white font-black text-2xl leading-none">{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function AnaliticasPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics().then((d) => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-white font-black text-2xl mb-6">Analíticas</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-72 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-white font-black text-2xl mb-4">Analíticas</h1>
        <p className="text-gray-500">No se pudieron cargar los datos. Verifica la conexión con Supabase.</p>
      </div>
    )
  }

  const { stats, dailyData, topItems, statusData } = data

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Analíticas</h1>
        <p className="text-gray-500 text-sm mt-0.5">Últimos 30 días</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign} label="Ingresos hoy" color="#006B42"
          value={`$${stats.todayRevenue.toFixed(2)}`}
          sub={`${stats.todayOrders} pedido${stats.todayOrders !== 1 ? 's' : ''}`}
        />
        <StatCard
          icon={TrendingUp} label="Ingresos 30 días" color="#3B82F6"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          sub={`${stats.totalOrders30} pedidos`}
        />
        <StatCard
          icon={Users} label="Clientes totales" color="#8B5CF6"
          value={String(stats.totalCustomers)}
          sub={`+${stats.newCustomers} este mes`}
        />
        <StatCard
          icon={Star} label="Platillo más pedido" color="#F59E0B"
          value={topItems[0]?.name || '—'}
          sub={topItems[0] ? `${topItems[0].qty} pedidos` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-white font-black text-base mb-4">Ingresos diarios (30 días)</h2>
          {dailyData.some((d) => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  interval={4}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#9CA3AF', fontWeight: 700 }}
                  itemStyle={{ color: '#006B42' }}
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Ingresos']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#006B42" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#006B42' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-600 text-sm">Sin órdenes en este período</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-black text-base mb-4">Top platillos</h2>
          {topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#D1D5DB', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: '#C61620' }}
                  formatter={(v) => [Number(v), 'Pedidos']}
                />
                <Bar dataKey="qty" fill="#C61620" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-600 text-sm">Sin datos de platillos</div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-black text-base mb-4">Estado de pedidos (30 días)</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData.map((s) => ({ ...s, name: STATUS_LABELS[s.name] || s.name }))}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLORS[s.name] || '#374151'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: '#D1D5DB' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-600 text-sm">Sin datos de pedidos</div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-white font-black text-base mb-4">Pedidos por día (30 días)</h2>
          {dailyData.some((d) => d.orders > 0) ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  interval={4}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: '#3B82F6' }}
                  formatter={(v) => [Number(v), 'Pedidos']}
                />
                <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-gray-600 text-sm">Sin pedidos en este período</div>
          )}
        </div>
      </div>
    </div>
  )
}
