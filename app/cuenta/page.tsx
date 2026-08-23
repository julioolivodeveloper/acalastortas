'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Star, ShoppingBag, Phone, User, Gift } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '@/store/store'
import { findCustomerByPhone, createCustomer, getCustomerOrders } from '@/lib/db'
import type { DbCustomer, DbOrder } from '@/lib/supabase'

const tier = (pts: number) => {
  if (pts >= 500) return { name: 'VIP Gold', color: '#C61620', emoji: '🏆' }
  if (pts >= 200) return { name: 'Silver', color: '#9CA3AF', emoji: '🥈' }
  return { name: 'Bronce', color: '#CD7F32', emoji: '🥉' }
}

export default function CuentaPage() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'search' | 'register' | 'profile'>('search')
  const [customer, setCustomer] = useState<DbCustomer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<DbOrder[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Ingresa un número válido de 10 dígitos'); return }
    setError(''); setLoading(true)
    try {
      const found = await findCustomerByPhone(digits)
      if (found) {
        const orders = await getCustomerOrders(found.id)
        setCustomer(found); setCustomerOrders(orders); setStep('profile')
      } else {
        setStep('register')
      }
    } catch { setError('Error al buscar. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!name.trim()) { setError('Ingresa tu nombre'); return }
    setError(''); setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      const newCustomer = await createCustomer(name.trim(), digits)
      setCustomer(newCustomer); setCustomerOrders([]); setStep('profile')
    } catch { setError('Error al registrar. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Mi Cuenta</h1>
        <p className="text-gray-500 mt-1">Acumula puntos y revisa tus pedidos</p>
      </div>

      {step === 'search' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEF3C7' }}>
              <Star className="w-8 h-8" style={{ color: '#C61620' }} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Programa de Puntos</h2>
            <p className="text-gray-500 text-sm">Busca tu cuenta con tu número de teléfono</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Número de Teléfono</label>
              <div className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="(915) 000-0000"
                  type="tel"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42]"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl font-black text-white text-sm disabled:opacity-50"
                  style={{ backgroundColor: '#006B42' }}
                >
                  {loading ? '...' : 'Buscar'}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { emoji: '🥉', level: 'Bronce', req: '0 pts' },
              { emoji: '🥈', level: 'Silver', req: '200 pts' },
              { emoji: '🏆', level: 'VIP Gold', req: '500 pts' },
            ].map((t) => (
              <div key={t.level} className="bg-gray-50 rounded-xl p-3">
                <p className="text-2xl mb-1">{t.emoji}</p>
                <p className="font-black text-gray-900 text-xs">{t.level}</p>
                <p className="text-gray-500 text-xs">{t.req}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">1 punto por cada dólar gastado</p>
        </div>
      )}

      {step === 'register' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center mb-6">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h2 className="text-xl font-black text-gray-900">Crear Cuenta</h2>
            <p className="text-gray-500 text-sm">No encontramos tu número. ¡Regístrate y empieza a acumular puntos!</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{phone}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tu Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                placeholder="Nombre completo"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42]"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm disabled:opacity-50"
              style={{ backgroundColor: '#006B42' }}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta y Empezar'}
            </button>
            <button
              onClick={() => { setStep('search'); setError('') }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-700 transition font-semibold"
            >
              Regresar
            </button>
          </div>
        </div>
      )}

      {step === 'profile' && customer && (
        <div className="space-y-5">
          <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#006B42' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: '#C61620', transform: 'translate(20%, -20%)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm">Bienvenido,</p>
                  <p className="font-black text-2xl">{customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs">{tier(customer.points).emoji} {tier(customer.points).name}</p>
                  <p className="text-xs text-white/60">{customer.order_count} pedidos</p>
                </div>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Puntos disponibles</p>
                <p className="font-black text-5xl">{customer.points}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Gift className="w-4 h-4 text-yellow-300" />
                  <p className="text-yellow-300 text-xs font-bold">
                    {customer.points >= 100
                      ? `Canjea ${Math.floor(customer.points / 100) * 100} pts por $${Math.floor(customer.points / 100)} de descuento`
                      : `Te faltan ${100 - customer.points} puntos para tu primer descuento`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/menu" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition">
              <ShoppingBag className="w-8 h-8 mb-2" style={{ color: '#006B42' }} />
              <p className="font-black text-gray-900 text-sm">Ordenar Ahora</p>
              <p className="text-gray-400 text-xs">Ver menú completo</p>
            </Link>
            <button
              onClick={() => { setStep('search'); setCustomer(null); setPhone('') }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition"
            >
              <User className="w-8 h-8 mb-2 text-gray-400" />
              <p className="font-black text-gray-900 text-sm">Cambiar Cuenta</p>
              <p className="text-gray-400 text-xs">Buscar otro número</p>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 text-lg mb-4">Historial de Pedidos</h2>
            {customerOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">Aún no tienes pedidos</p>
                <Link href="/menu" className="text-[#006B42] text-sm font-bold hover:underline mt-2 block">Hacer mi primer pedido</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-black text-gray-900 text-sm">Orden #{order.order_number}</p>
                      <p className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.items.length} {order.items.length === 1 ? 'platillo' : 'platillos'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[order.status] }}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <p className="text-xs text-yellow-600 font-bold mt-1">+{order.points_earned} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <h3 className="font-black text-gray-900 text-sm mb-2">¿Cómo canjear mis puntos?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Al hacer tu próxima orden, dile al cajero tu número de teléfono y los puntos que quieres canjear. 100 puntos = $1.00 de descuento en tu orden.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
