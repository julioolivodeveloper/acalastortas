'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, ChevronLeft } from 'lucide-react'
import { useAcaTortasStore, cartTotal } from '@/store/store'

const DOORDASH_URL = 'https://www.doordash.com/store/aca-las-tortas-el-paso-10076-n-loop-dr-socorro-34404153/'

export default function CheckoutPage() {
  const { cart, updateQty, removeFromCart, placeOrder, findOrCreateCustomer } = useAcaTortasStore()
  const router = useRouter()
  const total = cartTotal(cart)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [usePoints, setUsePoints] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Ingresa tu nombre'
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) e.phone = 'Ingresa un número válido (10 dígitos)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleOrder = async () => {
    if (!validate()) return
    setLoading(true)
    const customer = findOrCreateCustomer(name.trim(), phone.trim())
    const order = placeOrder({ customerName: name.trim(), customerPhone: phone.trim(), notes, customerId: customer.id })
    await new Promise((r) => setTimeout(r, 600))
    router.push(`/pedido/confirmacion?id=${order.id}&num=${order.orderNumber}`)
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Agrega platillos desde el menú para ordenar</p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white text-base"
          style={{ backgroundColor: '#CC0000' }}
        >
          <ChevronLeft className="w-5 h-5" /> Ver Menú
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/menu" className="inline-flex items-center gap-1 text-[#CC0000] font-bold text-sm mb-6 hover:underline">
        <ChevronLeft className="w-4 h-4" /> Regresar al menú
      </Link>

      <h1 className="text-3xl font-black text-gray-900 mb-8">Confirmar Orden</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT: Cart + Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cart items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 text-lg mb-4">Tu Orden</h2>
            <div className="space-y-3">
              {cart.map((ci) => (
                <div key={ci.item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{ci.item.name}</p>
                    <p className="text-[#CC0000] font-black text-sm">${(ci.item.price * ci.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(ci.item.id, ci.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                    >
                      {ci.quantity === 1
                        ? <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        : <Minus className="w-3.5 h-3.5 text-gray-600" />
                      }
                    </button>
                    <span className="w-5 text-center font-black text-sm">{ci.quantity}</span>
                    <button
                      onClick={() => updateQty(ci.item.id, ci.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition"
                      style={{ backgroundColor: '#CC0000' }}
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 text-lg mb-4">Tus Datos</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ingresa tu nombre y número para recibir actualizaciones de tu orden y acumular puntos de cliente frecuente.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(915) 000-0000"
                  type="tel"
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notas especiales (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sin cebolla, extra salsa, etc."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-black text-gray-900 text-lg mb-4">Resumen</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {cart.map((ci) => (
                <div key={ci.item.id} className="flex justify-between">
                  <span>{ci.item.name} × {ci.quantity}</span>
                  <span className="font-semibold">${(ci.item.price * ci.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mb-5">
              <div className="flex justify-between font-black text-lg text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">+ impuesto aplicable en caja</p>
            </div>

            {/* Points notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
              <p className="text-xs font-bold text-yellow-800">
                ⭐ Ganarás <strong>{Math.floor(total)} puntos</strong> con esta orden
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">100 puntos = $1.00 de descuento</p>
            </div>

            {/* Pickup info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏪</span>
                <span className="font-black text-gray-900 text-sm">Pickup — Pago en Ventanilla</span>
              </div>
              <p className="text-xs text-gray-500">Tu orden estará lista en 15–25 minutos. Paga con efectivo o tarjeta al recoger.</p>
            </div>

            <button
              onClick={handleOrder}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-base transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#CC0000' }}
            >
              {loading ? 'Enviando...' : `Confirmar Orden — $${total.toFixed(2)}`}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold">o delivery por</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <a
              href={DOORDASH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white text-sm transition hover:opacity-90"
              style={{ backgroundColor: '#FF3008' }}
            >
              <ExternalLink className="w-4 h-4" />
              Ordenar por DoorDash
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
