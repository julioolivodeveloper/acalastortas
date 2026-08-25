'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, ChevronLeft, User, CreditCard, Store } from 'lucide-react'
import { useCartStore, cartTotal, cartItemPrice } from '@/store/store'
import type { CartItem } from '@/store/store'
import { useCustomerStore } from '@/store/customer-store'
import { placeOrder } from '@/lib/db'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const ck = (ci: CartItem) => ci.cartKey ?? ci.item.id
const DOORDASH_URL = 'https://www.doordash.com/store/aca-las-tortas-el-paso-10076-n-loop-dr-socorro-34404153/'

// ── Stripe card form (must be inside <Elements>) ────────────────────────────
function CardForm({ total, validate, onSuccess }: {
  total: number
  validate: () => boolean
  onSuccess: () => Promise<void>
}) {
  const stripe    = useStripe()
  const elements  = useElements()
  const [paying,    setPaying]    = useState(false)
  const [cardError, setCardError] = useState('')

  const pay = async () => {
    if (!validate()) return
    if (!stripe || !elements) return
    setPaying(true)
    setCardError('')

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      setCardError(error.message ?? 'Error al procesar el pago')
      setPaying(false)
      return
    }

    try {
      await onSuccess()
    } catch {
      setCardError('Pago exitoso pero hubo un error al guardar la orden. Llámanos al (915) 858-8226.')
      setPaying(false)
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {cardError && (
        <p className="text-red-500 text-sm font-semibold">{cardError}</p>
      )}
      <button
        onClick={pay}
        disabled={paying || !stripe || !elements}
        className="w-full py-4 rounded-2xl font-black text-white text-base hover:opacity-90 disabled:opacity-50 transition"
        style={{ backgroundColor: '#635BFF' }}
      >
        {paying ? 'Procesando pago...' : `Pagar $${total.toFixed(2)}`}
      </button>
      <p className="text-center text-xs text-gray-400">🔒 Pago seguro procesado por Stripe</p>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, updateQty, clearCart } = useCartStore()
  const { customer }  = useCustomerStore()
  const router        = useRouter()
  const total         = cartTotal(cart)

  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [notes,   setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  // Stripe state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [stripeKey,     setStripeKey]     = useState<string | null>(null)
  const [clientSecret,  setClientSecret]  = useState<string | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const stripePromise = useRef<ReturnType<typeof loadStripe> | null>(null)

  useEffect(() => {
    if (customer) { setName(customer.name); setPhone(customer.phone) }
  }, [customer])

  // Check if Stripe is configured
  useEffect(() => {
    fetch('/api/stripe/config')
      .then(r => r.json())
      .then(({ publishableKey }: { publishableKey: string | null }) => {
        if (publishableKey) {
          setStripeKey(publishableKey)
          stripePromise.current = loadStripe(publishableKey)
        }
      })
      .catch(() => {})
  }, [])

  // Create PaymentIntent whenever we switch to card mode or total changes
  useEffect(() => {
    if (paymentMethod !== 'card' || !stripeKey || total === 0) {
      setClientSecret(null)
      return
    }
    setLoadingIntent(true)
    setClientSecret(null)
    fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(total * 100) }),
    })
      .then(r => r.json())
      .then(({ clientSecret }) => setClientSecret(clientSecret))
      .finally(() => setLoadingIntent(false))
  }, [paymentMethod, stripeKey, total])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Ingresa tu nombre'
    if (!phone.replace(/\D/g, '').match(/^\d{10}$/)) e.phone = 'Ingresa un número válido (10 dígitos)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submitOrder = async () => {
    const order = await placeOrder({
      customerName: name.trim(),
      customerPhone: phone.replace(/\D/g, ''),
      notes,
      items: cart,
      total,
    })
    clearCart()
    router.push(`/pedido/confirmacion?id=${order.id}&num=${order.order_number}&pm=${paymentMethod}`)
  }

  const handleCashOrder = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await submitOrder()
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
        {/* Left: items + customer data */}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900 text-lg">Tus Datos</h2>
              {customer && (
                <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#006B42' }}>
                  <User className="w-3.5 h-3.5" /> {customer.name}
                </div>
              )}
            </div>
            {!customer && (
              <div className="mb-4 p-3 rounded-xl border border-green-100 bg-green-50 flex items-center justify-between">
                <p className="text-xs text-green-800 font-semibold">¿Tienes cuenta? Inicia sesión para auto-rellenar</p>
                <Link href="/cuenta" className="text-xs font-black underline" style={{ color: '#006B42' }}>Iniciar sesión</Link>
              </div>
            )}
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

        {/* Right: summary + payment */}
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

            {/* Payment method selector — only shown when Stripe is configured */}
            {stripeKey ? (
              <div className="space-y-2 mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Método de pago</p>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${paymentMethod === 'cash' ? 'border-[#006B42] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Store className={`w-5 h-5 shrink-0 ${paymentMethod === 'cash' ? 'text-[#006B42]' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-black text-sm ${paymentMethod === 'cash' ? 'text-[#006B42]' : 'text-gray-700'}`}>Pago en Ventanilla</p>
                    <p className="text-xs text-gray-400">Efectivo o tarjeta al recoger</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${paymentMethod === 'card' ? 'border-[#635BFF] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <CreditCard className={`w-5 h-5 shrink-0 ${paymentMethod === 'card' ? 'text-[#635BFF]' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-black text-sm ${paymentMethod === 'card' ? 'text-[#635BFF]' : 'text-gray-700'}`}>Pagar con Tarjeta</p>
                    <p className="text-xs text-gray-400">Visa, Mastercard, Amex</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏪</span>
                  <span className="font-black text-gray-900 text-sm">Pickup — Pago en Ventanilla</span>
                </div>
                <p className="text-xs text-gray-500">Tu orden estará lista en 15–25 minutos. Paga con efectivo o tarjeta al recoger.</p>
              </div>
            )}

            {/* Stripe card form */}
            {paymentMethod === 'card' && stripeKey && stripePromise.current && (
              <div className="mb-5">
                {loadingIntent || !clientSecret ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise.current}
                    options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#635BFF' } } }}
                  >
                    <CardForm
                      total={total}
                      validate={validate}
                      onSuccess={submitOrder}
                    />
                  </Elements>
                )}
              </div>
            )}

            {/* Cash confirm button */}
            {(!stripeKey || paymentMethod === 'cash') && (
              <button
                onClick={handleCashOrder}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-white text-base hover:opacity-90 disabled:opacity-60 transition"
                style={{ backgroundColor: '#006B42' }}
              >
                {loading ? 'Enviando...' : `Confirmar Orden — $${total.toFixed(2)}`}
              </button>
            )}

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold">o delivery por</span>
              <div className="flex-1 h-px bg-gray-200" />
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
