'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ShoppingBag, Phone, User, Gift, LogIn, UserPlus, ChevronLeft, ExternalLink } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '@/store/store'
import { useCustomerStore } from '@/store/customer-store'
import { findCustomerByPhone, createCustomer, getCustomerOrders } from '@/lib/db'
import type { DbCustomer, DbOrder } from '@/lib/supabase'

const DOORDASH_URL = 'https://www.doordash.com/store/aca-las-tortas-el-paso-10076-n-loop-dr-socorro-34404153/'

const tier = (pts: number) => {
  if (pts >= 500) return { name: 'VIP Gold', color: '#C61620', emoji: '🏆' }
  if (pts >= 200) return { name: 'Silver', color: '#9CA3AF', emoji: '🥈' }
  return { name: 'Bronce', color: '#CD7F32', emoji: '🥉' }
}

type Step = 'landing' | 'login' | 'register' | 'profile' | 'set-password'

export default function CuentaPage() {
  const { customer: storedCustomer, setCustomer, savePassword, checkPassword, hasPassword, clearCustomer } = useCustomerStore()

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState<Step>(storedCustomer ? 'profile' : 'landing')
  const [customer, setLocalCustomer] = useState<DbCustomer | null>(storedCustomer)
  const [customerOrders, setCustomerOrders] = useState<DbOrder[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setPhone(''); setName(''); setPassword(''); setError('') }

  const login = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Ingresa un número válido de 10 dígitos'); return }
    if (!password) { setError('Ingresa tu contraseña'); return }
    setError(''); setLoading(true)
    try {
      const found = await findCustomerByPhone(digits)
      if (!found) {
        setError('No encontramos una cuenta con ese número')
        return
      }
      // Si tiene contraseña guardada, verificar
      if (hasPassword(digits)) {
        if (!checkPassword(digits, password)) {
          setError('Contraseña incorrecta')
          return
        }
      } else {
        // Cuenta antigua sin contraseña — guardar la que ingresó
        savePassword(digits, password)
      }
      const orders = await getCustomerOrders(found.id)
      setCustomer(found)
      setLocalCustomer(found)
      setCustomerOrders(orders)
      setStep('profile')
    } catch { setError('Error al buscar. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  const register = async () => {
    if (!name.trim()) { setError('Ingresa tu nombre'); return }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Ingresa un número válido de 10 dígitos'); return }
    if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres'); return }
    setError(''); setLoading(true)
    try {
      const existing = await findCustomerByPhone(digits)
      if (existing) {
        setError('Ya existe una cuenta con ese número. Inicia sesión.')
        return
      }
      const newCustomer = await createCustomer(name.trim(), digits)
      savePassword(digits, password)
      setCustomer(newCustomer)
      setLocalCustomer(newCustomer)
      setCustomerOrders([])
      setStep('profile')
    } catch { setError('Error al registrar. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  const logout = () => {
    clearCustomer()
    setLocalCustomer(null)
    setCustomerOrders([])
    reset()
    setStep('landing')
  }

  const PasswordField = ({ placeholder = 'Contraseña', value, onChange, onEnter }: {
    placeholder?: string; value: string; onChange: (v: string) => void; onEnter?: () => void
  }) => (
    <div className="relative">
      <input
        type={showPw ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42]"
      />
      <button
        type="button"
        onClick={() => setShowPw(!showPw)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-12">

        {/* LANDING */}
        {step === 'landing' && (
          <div>
            <div className="text-center mb-10">
              <img src="/logo.png" alt="La Fondita de Mamá" className="h-24 mx-auto drop-shadow-xl mb-5" />
              <h1 className="text-3xl font-black text-gray-900 mb-2">Mi Cuenta</h1>
              <p className="text-gray-500">Gana puntos con cada pedido y canjéalos por descuentos</p>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => { reset(); setStep('login') }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl text-white font-black text-base hover:opacity-90 transition shadow-lg"
                style={{ backgroundColor: '#006B42' }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-base font-black">Iniciar Sesión</p>
                  <p className="text-white/70 text-xs font-normal">Ya tengo una cuenta</p>
                </div>
              </button>

              <button
                onClick={() => { reset(); setStep('register') }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl font-black text-base text-white hover:opacity-90 transition shadow-lg"
                style={{ backgroundColor: '#C61620' }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-base font-black">Crear Cuenta</p>
                  <p className="text-white/70 text-xs font-normal">Soy nuevo, quiero registrarme</p>
                </div>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 text-sm mb-4 text-center">Beneficios del programa</h3>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                {[
                  { emoji: '🥉', level: 'Bronce', req: '0 pts' },
                  { emoji: '🥈', level: 'Silver', req: '200 pts' },
                  { emoji: '🏆', level: 'VIP Gold', req: '500 pts' },
                ].map((t) => (
                  <div key={t.level} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-2xl mb-1">{t.emoji}</p>
                    <p className="font-black text-gray-900 text-xs">{t.level}</p>
                    <p className="text-gray-400 text-xs">{t.req}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400">1 punto por cada dólar gastado · 100 pts = $1 de descuento</p>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {step === 'login' && (
          <div>
            <button onClick={() => setStep('landing')} className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-gray-700 mb-6 transition">
              <ChevronLeft className="w-4 h-4" /> Regresar
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#006B42' }}>
                  <LogIn className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Iniciar Sesión</h2>
                <p className="text-gray-500 text-sm">Ingresa tu número y contraseña</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />Número de Celular
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(915) 000-0000"
                    type="tel"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                  <PasswordField value={password} onChange={setPassword} onEnter={login} />
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm disabled:opacity-50 hover:opacity-90 transition"
                  style={{ backgroundColor: '#006B42' }}
                >
                  {loading ? 'Verificando...' : 'Entrar'}
                </button>
                <p className="text-center text-sm text-gray-400">
                  ¿No tienes cuenta?{' '}
                  <button onClick={() => { reset(); setStep('register') }} className="font-black hover:underline" style={{ color: '#C61620' }}>
                    Crear una
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {step === 'register' && (
          <div>
            <button onClick={() => setStep('landing')} className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-gray-700 mb-6 transition">
              <ChevronLeft className="w-4 h-4" /> Regresar
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#C61620' }}>
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Crear Cuenta</h2>
                <p className="text-gray-500 text-sm">Regístrate gratis y empieza a ganar puntos</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    <User className="w-3.5 h-3.5 inline mr-1" />Tu Nombre
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />Número de Celular
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(915) 000-0000"
                    type="tel"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                  <PasswordField
                    placeholder="Mínimo 4 caracteres"
                    value={password}
                    onChange={setPassword}
                    onEnter={register}
                  />
                  <p className="text-xs text-gray-400 mt-1">Guarda tu contraseña, la necesitarás para iniciar sesión</p>
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  onClick={register}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm disabled:opacity-50 hover:opacity-90 transition"
                  style={{ backgroundColor: '#C61620' }}
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta y Empezar'}
                </button>
                <p className="text-center text-sm text-gray-400">
                  ¿Ya tienes cuenta?{' '}
                  <button onClick={() => { reset(); setStep('login') }} className="font-black hover:underline" style={{ color: '#006B42' }}>
                    Iniciar sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {step === 'profile' && customer && (
          <div className="space-y-5">
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#006B42' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white" style={{ transform: 'translate(20%, -20%)' }} />
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
                onClick={logout}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition"
              >
                <LogIn className="w-8 h-8 mb-2 text-gray-400" style={{ transform: 'scaleX(-1)' }} />
                <p className="font-black text-gray-900 text-sm">Cerrar Sesión</p>
                <p className="text-gray-400 text-xs">Cambiar cuenta</p>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-black text-gray-900 text-lg mb-4">Historial de Pedidos</h2>
              {customerOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold">Aún no tienes pedidos</p>
                  <Link href="/menu" className="text-sm font-black hover:underline mt-2 block" style={{ color: '#006B42' }}>Hacer mi primer pedido</Link>
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
                        <p className="text-xs font-bold mt-1" style={{ color: '#C61620' }}>+{order.points_earned} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <h3 className="font-black text-gray-900 text-sm mb-2">¿Cómo canjear mis puntos?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Al hacer tu próxima orden, dile al cajero tu número de teléfono y los puntos que quieres canjear. 100 puntos = $1.00 de descuento.
              </p>
            </div>
          </div>
        )}
      </div>

    {/* ── ORDENA Y RECOGE ── */}
    <section className="py-0 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-80 lg:h-auto">
          <img src="/ordena-recoge.png" alt="Ordena y Recoge" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 lg:px-16" style={{ backgroundColor: '#111' }}>
          <p className="font-black text-sm uppercase tracking-widest mb-3" style={{ color: '#C61620' }}>Pickup</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            Ordena Online<br />y Recoge<br />
            <span style={{ color: '#C61620' }}>Sin Esperar</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Haz tu pedido desde el celular, llega al restaurante y paga en ventanilla. Rápido, fácil y sin filas.
          </p>
          <div className="space-y-3 mb-8">
            {[
              { num: '1', text: 'Elige tus platillos favoritos en el menú' },
              { num: '2', text: 'Confirma tu orden con tu nombre y teléfono' },
              { num: '3', text: 'Llega y paga en ventanilla — ¡listo!' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ backgroundColor: '#006B42', color: 'white' }}>
                  {s.num}
                </div>
                <p className="text-gray-300 text-base">{s.text}</p>
              </div>
            ))}
          </div>
          <Link href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-base self-start hover:scale-105 transition-transform"
            style={{ backgroundColor: '#C61620' }}>
            <ShoppingBag className="w-5 h-5" /> Ordenar Ahora
          </Link>
        </div>
      </div>
    </section>

    {/* ── AUTOSERVICIO ── */}
    <section className="py-0 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 lg:px-16 order-2 lg:order-1 bg-black">
          <p className="font-black text-sm uppercase tracking-widest mb-3" style={{ color: '#C61620' }}>Comodidad</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            Autoservicio<br />y Comedor<br />
            <span style={{ color: '#006B42' }}>¡Los mejores!</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Visítanos en nuestro comedor o usa el drive-thru. Siempre con la misma calidad y sabor que nos caracteriza.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/menu"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-white text-base hover:scale-105 transition-transform"
              style={{ backgroundColor: '#C61620' }}>
              Ver Menú
            </Link>
            <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-white text-base border-2 border-white/30 hover:border-white hover:bg-white/10 transition">
              <ExternalLink className="w-4 h-4" /> DoorDash
            </a>
          </div>
        </div>
        <div className="relative h-80 lg:h-auto order-1 lg:order-2">
          <img src="/imgcel.webp" alt="Autoservicio y Comedor" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  </div>
)
}
