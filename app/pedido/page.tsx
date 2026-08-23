'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, ChevronLeft } from 'lucide-react'
import { useCartStore, cartTotal, cartItemPrice } from '@/store/store'
import type { CartItem } from '@/store/store'

const ck = (ci: CartItem) => ci.cartKey ?? ci.item.id
import { placeOrder } from '@/lib/db'

const DOORDASH_URL = 'https://www.doordash.com/store/aca-las-tortas-el-paso-10076-n-loop-dr-socorro-34404153/'

export default function CheckoutPage() {
  const { cart, updateQty, clearCart } = useCartStore()
  const router = useRouter()
  const total = cartTotal(cart)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Ingresa tu nombre'
    if (!phone.replace(/\D/g, '').match(/^\d{10}$/)) e.phone = 'Ingresa un número válido (10 dígitos)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleOrder = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const order = await placeOrder({
        customerName: name.trim(),
        customerPhone: phone.replace(/\D/g, ''),
        notes,
        items: cart,
        total,
      })
      clearCart()
      router.push(`/pedido/confirmacion?id=${order.id}&num=${order.order_number}`)
    } catch (err) {
      console.error(err)
      alert('Error al enviar la orden. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Tu carrito está vacío</h2>
        <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white text-base" style={{ backgroundColor: '#006B42' }}>
          <ChevronLeft className="w-5 h-5" /> Ver Menú
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/menu" className="inline-flex items-center gap-1 text-[#006B42] font-bold text-sm mb-6 hover:underline">
        <ChevronLeft className="w-4 h-4" /> Regresar al menú
      </Link>
      <h1 className="text-3xl font-black text-gray-900 mb-8">Confirmar Orden</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 text-lg mb-4">Tu Orden</h2>
            <div className="space-y-3">
              {cart.map((ci) => {
                const unitPrice = cartItemPrice(ci)
                return (
                  <div key={ck(ci)} className="py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{ci.item.name}</p>
                        <p className="text-[#006B42] font-black text-sm">${(unitPrice * ci.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(ck(ci), ci.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                          {ci.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5 text-gray-600" />}
                        </button>
                        <span className="w-5 text-center font-black text-sm">{ci.quantity}</span>
                        <button onClick={() => updateQty(ck(ci), ci.quantity + 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006B42' }}>
                          <Plus className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                    {((ci.removedIngredients?.length ?? 0) > 0 || (ci.extras?.length ?? 0) > 0) && (
                      <div className="mt-1.5 space-y-0.5 pl-1">
                        {ci.removedIngredients && ci.removedIngredients.length > 0 && (
                          <p className="text-xs text-orange-600 font-semibold">Sin: {ci.removedIngredients.join(', ')}</p>
                        )}
                        {ci.extras?.map((ex) => (
                          <p key={ex.name} className="text-xs text-green-700 font-semibold">+ {ex.name} (${ex.price.toFixed(2)})</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 text-lg mb-4">Tus Datos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo"
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42] ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(915) 000-0000" type="tel"
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42] ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notas especiales (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sin cebolla, extra salsa, etc." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42] resize-none" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-black text-gray-900 text-lg mb-4">Resumen</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {cart.map((ci) => (
                <div key={ck(ci)} className="flex justify-between">
                  <span>{ci.item.name} × {ci.quantity}{ci.extras?.length ? ` + extras` : ''}</span>
                  <span className="font-semibold">${(cartItemPrice(ci) * ci.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mb-5">
              <div className="flex justify-between font-black text-lg text-gray-900">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">+ impuesto aplicable en caja</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
              <p className="text-xs font-bold text-yellow-800">⭐ Ganarás <strong>{Math.floor(total)} puntos</strong> con esta orden</p>
              <p className="text-xs text-yellow-700 mt-0.5">100 puntos = $1.00 de descuento</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-2"><span className="text-lg">🏪</span><span className="font-black text-gray-900 text-sm">Pickup — Pago en Ventanilla</span></div>
              <p className="text-xs text-gray-500">Tu orden estará lista en 15–25 minutos. Paga con efectivo o tarjeta al recoger.</p>
            </div>
            <button onClick={handleOrder} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-base hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#006B42' }}>
              {loading ? 'Enviando...' : `Confirmar Orden — $${total.toFixed(2)}`}
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400 font-semibold">o delivery por</span><div className="flex-1 h-px bg-gray-200" />
            </div>
            <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white text-sm hover:opacity-90"
              style={{ backgroundColor: '#FF3008' }}>
              <ExternalLink className="w-4 h-4" /> Ordenar por DoorDash
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
