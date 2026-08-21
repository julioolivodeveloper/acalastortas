'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Star, ShoppingBag, Phone, User, ChevronRight, Gift } from 'lucide-react'
import { useAcaTortasStore, STATUS_LABELS, STATUS_COLORS } from '@/store/store'

export default function CuentaPage() {
  const { customers, orders, findOrCreateCustomer } = useAcaTortasStore()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'search' | 'register' | 'profile'>('search')
  const [activeCustomer, setActiveCustomer] = useState<(typeof customers)[0] | null>(null)
  const [error, setError] = useState('')

  const handleSearch = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Ingresa un número válido'); return }
    setError('')
    const found = customers.find((c) => c.phone === phone || c.phone === digits)
    if (found) {
      setActiveCustomer(found)
      setStep('profile')
    } else {
      setStep('register')
    }
  }

  const handleRegister = () => {
    if (!name.trim()) { setError('Ingresa tu nombre'); return }
    const customer = findOrCreateCustomer(name.trim(), phone.replace(/\D/g, ''))
    setActiveCustomer(customer)
    setStep('profile')
  }

  const customerOrders = activeCustomer
    ? orders.filter((o) => o.customerId === activeCustomer.id)
    : []

  // Points tier
  const tier = (points: number) => {
    if (points >= 500) return { name: 'VIP Gold', color: '#F5C000', emoji: '🏆' }
    if (points >= 200) return { name: 'Silver', color: '#9CA3AF', emoji: '🥈' }
    return { name: 'Bronce', color: '#CD7F32', emoji: '🥉' }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Mi Cuenta</h1>
        <p className="text-gray-500 mt-1">Acumula puntos y revisa tus pedidos</p>
      </div>

      {/* SEARCH */}
      {step === 'search' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEF3C7' }}>
              <Star className="w-8 h-8" style={{ color: '#F5C000' }} />
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
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                />
                <button
                  onClick={handleSearch}
                  className="px-5 py-3 rounded-xl font-black text-white text-sm"
                  style={{ backgroundColor: '#CC0000' }}
                >
                  Buscar
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          </div>

          {/* Points info */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { emoji: '🥉', level: 'Bronce', req: '0 pts', badge: 'Nuevo cliente' },
              { emoji: '🥈', level: 'Silver', req: '200 pts', badge: '$2 de descuento' },
              { emoji: '🏆', level: 'VIP Gold', req: '500 pts', badge: '$5 de descuento' },
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

      {/* REGISTER */}
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              onClick={handleRegister}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm"
              style={{ backgroundColor: '#CC0000' }}
            >
              Crear Cuenta y Empezar
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

      {/* PROFILE */}
      {step === 'profile' && activeCustomer && (
        <div className="space-y-5">
          {/* Points card */}
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden"
            style={{ backgroundColor: '#CC0000' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: '#F5C000', transform: 'translate(20%, -20%)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm">Bienvenido,</p>
                  <p className="font-black text-2xl">{activeCustomer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs">{tier(activeCustomer.points).emoji} {tier(activeCustomer.points).name}</p>
                  <p className="text-xs text-white/60">{activeCustomer.orderCount} pedidos</p>
                </div>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Puntos disponibles</p>
                <p className="font-black text-5xl">{activeCustomer.points}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Gift className="w-4 h-4 text-yellow-300" />
                  <p className="text-yellow-300 text-xs font-bold">
                    {activeCustomer.points >= 100
                      ? `Canjea ${Math.floor(activeCustomer.points / 100) * 100} pts por $${Math.floor(activeCustomer.points / 100)} de descuento`
                      : `Te faltan ${100 - activeCustomer.points} puntos para tu primer descuento`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/menu"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition"
            >
              <ShoppingBag className="w-8 h-8 mb-2" style={{ color: '#CC0000' }} />
              <p className="font-black text-gray-900 text-sm">Ordenar Ahora</p>
              <p className="text-gray-400 text-xs">Ver menú completo</p>
            </Link>
            <button
              onClick={() => { setStep('search'); setActiveCustomer(null); setPhone(''); }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition"
            >
              <User className="w-8 h-8 mb-2 text-gray-400" />
              <p className="font-black text-gray-900 text-sm">Cambiar Cuenta</p>
              <p className="text-gray-400 text-xs">Buscar otro número</p>
            </button>
          </div>

          {/* Order history */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 text-lg mb-4">Historial de Pedidos</h2>
            {customerOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">Aún no tienes pedidos</p>
                <Link href="/menu" className="text-[#CC0000] text-sm font-bold hover:underline mt-2 block">
                  Hacer mi primer pedido
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-black text-gray-900 text-sm">Orden #{order.orderNumber}</p>
                      <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.items.length} {order.items.length === 1 ? 'platillo' : 'platillos'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: STATUS_COLORS[order.status] }}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                      <p className="text-xs text-yellow-600 font-bold mt-1">+{order.pointsEarned} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How to redeem */}
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
