'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, MapPin, ChevronRight, Star } from 'lucide-react'
import { getOrderById } from '@/lib/db'
import type { DbOrder } from '@/lib/supabase'

function ConfirmacionContent() {
  const params = useSearchParams()
  const orderId = params.get('id')
  const orderNum = params.get('num')
  const [order, setOrder] = useState<DbOrder | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (orderId) getOrderById(orderId).then(setOrder)
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [orderId])

  return (
    <div className="max-w-md mx-auto px-4 py-16 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}>
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl" style={{ backgroundColor: '#16A34A' }}>
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">¡Orden Recibida!</h1>
        <p className="text-gray-500">Tu orden ha sido enviada al restaurante</p>
      </div>

      <div className="rounded-2xl p-5 mb-5 text-center" style={{ backgroundColor: '#CC0000' }}>
        <p className="text-white/70 text-sm font-semibold mb-1">Número de Orden</p>
        <p className="text-white font-black text-5xl">#{orderNum}</p>
        <p className="text-white/70 text-xs mt-2">Muestra este número al recoger</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-2 text-[#CC0000]" />
          <p className="text-xs text-gray-500 font-semibold">Tiempo estimado</p>
          <p className="font-black text-gray-900">15–25 min</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <MapPin className="w-5 h-5 mx-auto mb-2 text-[#CC0000]" />
          <p className="text-xs text-gray-500 font-semibold">Recoge en</p>
          <p className="font-black text-gray-900 text-xs">N Loop Dr, Socorro</p>
        </div>
      </div>

      {order && order.points_earned > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-400 shrink-0" />
          <div>
            <p className="font-black text-gray-900 text-sm">¡Ganaste {order.points_earned} puntos!</p>
            <p className="text-xs text-gray-500">Acumula 100 puntos y obtén $1 de descuento</p>
          </div>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-black text-gray-900 text-sm mb-3">Tu Orden</h3>
          <div className="space-y-2">
            {order.items.map((ci, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{ci.item.name} × {ci.quantity}</span>
                <span className="font-bold text-gray-900">${(ci.item.price * ci.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-black">
            <span>Total</span><span>${order.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Pago en ventanilla al recoger</p>
          {order.notes && (
            <div className="mt-3 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-semibold">Notas:</p>
              <p className="text-xs text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <Link href="/cuenta" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-sm" style={{ backgroundColor: '#CC0000' }}>
          Ver mis puntos y pedidos <ChevronRight className="w-4 h-4" />
        </Link>
        <Link href="/menu" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-gray-700 text-sm bg-gray-100 hover:bg-gray-200 transition">
          Volver al menú
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return <Suspense><ConfirmacionContent /></Suspense>
}
