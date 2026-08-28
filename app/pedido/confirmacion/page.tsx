'use client'
import { useEffect, useState, Suspense, Fragment } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Star, ExternalLink, CheckCircle2, Navigation } from 'lucide-react'
import { getOrderById } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { DbOrder } from '@/lib/supabase'
import type { CartItem } from '@/store/store'

const STEPS = [
  { key: 'nuevo',      label: 'Recibido',   emoji: '📋', desc: 'Orden recibida en cocina',             color: '#006B42' },
  { key: 'preparando', label: 'Preparando', emoji: '🍳', desc: 'Estamos cocinando tu orden con amor',   color: '#D97706' },
  { key: 'listo',      label: '¡Lista!',    emoji: '🎉', desc: '¡Tu orden está lista para recoger!',    color: '#16A34A' },
  { key: 'entregado',  label: 'Entregado',  emoji: '⭐', desc: '¡Orden completada! Buen provecho',      color: '#006B42' },
] as const

const STATUS_IDX: Record<string, number> = {
  nuevo: 0, preparando: 1, listo: 2, entregado: 3, cancelado: -1,
}

const RESTAURANT = {
  name: 'Aca Las Tortas El Paso',
  address: '10076 N Loop Dr, Socorro, TX 79927',
  mapsUrl: 'https://maps.google.com/?q=10076+N+Loop+Dr+Socorro+TX+79927',
  phone: '(915) 343-8467',
  phoneLink: 'tel:+19153438467',
  hours: 'Lun–Dom · 8:00am – 10:00pm',
}

function itemUnitPrice(ci: CartItem) {
  return ci.item.price + (ci.extras ?? []).reduce((s, e) => s + e.price, 0)
}

function TrackingContent() {
  const params = useSearchParams()
  const orderId = params.get('id')
  const orderNum = params.get('num')
  const pm = params.get('pm') ?? 'cash'
  const [order, setOrder] = useState<DbOrder | null>(null)
  const [visible, setVisible] = useState(false)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!orderId) return
    getOrderById(orderId).then(setOrder)
    setTimeout(() => setVisible(true), 80)

    // Realtime: escuchar cambios de status en esta orden
    const channel = supabase
      .channel(`order-track-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(payload.new as DbOrder)
          setPulse(true)
          setTimeout(() => setPulse(false), 1000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  const stepIdx = order ? (STATUS_IDX[order.status] ?? 0) : 0
  const step = STEPS[Math.max(0, stepIdx)]
  const cancelled = order?.status === 'cancelado'
  const ready = order?.status === 'listo'

  return (
    <div
      className="max-w-lg mx-auto px-4 py-10 transition-all duration-500 pb-16"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
    >
      {/* ── Status hero ── */}
      <div
        className={`rounded-3xl p-7 mb-5 text-center transition-all duration-700 ${pulse ? 'scale-[1.02]' : ''} ${ready ? 'ring-4 ring-green-300' : ''}`}
        style={{ backgroundColor: cancelled ? '#FEF2F2' : step.color + '14', border: `2px solid ${cancelled ? '#FCA5A5' : step.color + '30'}` }}
      >
        <div className={`text-7xl mb-3 ${order?.status === 'preparando' ? 'animate-bounce' : ''}`}>
          {cancelled ? '❌' : step.emoji}
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">
          {cancelled ? 'Orden Cancelada' : step.desc}
        </h1>
        <p className="text-sm font-semibold text-gray-500">
          {cancelled ? 'Contacta al restaurante para más info' : 'Actualiza automáticamente · sin recargar'}
        </p>
        {!cancelled && (
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-black px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: step.color }}>
            <span className={`w-2 h-2 rounded-full bg-white ${order?.status !== 'entregado' ? 'animate-pulse' : ''}`} />
            En vivo
          </div>
        )}
      </div>

      {/* ── Progress stepper ── */}
      {!cancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <Fragment key={s.key}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                      i <= stepIdx
                        ? 'text-white scale-100'
                        : 'bg-gray-100 text-gray-400 scale-95'
                    } ${i === stepIdx ? 'ring-4 ring-offset-1 scale-110' : ''}`}
                    style={i <= stepIdx ? { backgroundColor: s.color } : {}}
                  >
                    {i < stepIdx
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <span className="text-xs font-black">{i + 1}</span>}
                  </div>
                  <p className={`text-[9px] font-black text-center leading-tight w-14 ${i <= stepIdx ? 'text-gray-800' : 'text-gray-400'}`}>
                    {s.label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-1 rounded-full transition-all duration-700"
                    style={{ backgroundColor: i < stepIdx ? step.color : '#E5E7EB' }}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── Número de orden ── */}
      <div className="rounded-2xl p-5 mb-5 flex items-center justify-between" style={{ backgroundColor: '#006B42' }}>
        <div>
          <p className="text-white/70 text-xs font-semibold">Número de Orden</p>
          <p className="text-white font-black text-5xl leading-none">#{orderNum}</p>
          <p className="text-white/60 text-xs mt-1">Muéstralo al recoger</p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs font-semibold">Tiempo estimado</p>
          <p className="text-white font-black text-2xl">15–25</p>
          <p className="text-white/60 text-xs">minutos</p>
        </div>
      </div>

      {/* ── Dirección del restaurante ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">📍 Dónde Recoger</p>
        <p className="font-black text-gray-900 text-base mb-0.5">{RESTAURANT.name}</p>
        <p className="text-gray-500 text-sm mb-4">{RESTAURANT.address}</p>
        <p className="text-gray-400 text-xs mb-4">🕐 {RESTAURANT.hours}</p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={RESTAURANT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm text-white transition hover:opacity-90"
            style={{ backgroundColor: '#006B42' }}
          >
            <Navigation className="w-4 h-4" /> Cómo Llegar
          </a>
          <a
            href={RESTAURANT.phoneLink}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm border-2 border-gray-200 text-gray-700 hover:border-gray-300 transition"
          >
            <Phone className="w-4 h-4" /> Llamar
          </a>
        </div>
      </div>

      {/* ── Orden detallada ── */}
      {order && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">🧾 Detalle de tu Orden</p>
          <div className="space-y-3">
            {order.items.map((ci: CartItem, i: number) => {
              const unit = itemUnitPrice(ci)
              return (
                <div key={i} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm">{ci.item.name}</p>
                      <p className="text-gray-400 text-xs">× {ci.quantity} · ${ci.item.price.toFixed(2)} c/u</p>
                    </div>
                    <p className="font-black text-gray-900 text-sm shrink-0">${(unit * ci.quantity).toFixed(2)}</p>
                  </div>
                  {((ci.removedIngredients?.length ?? 0) > 0 || (ci.extras?.length ?? 0) > 0) && (
                    <div className="mt-1.5 space-y-0.5 pl-2 border-l-2 border-gray-100 ml-1">
                      {ci.removedIngredients && ci.removedIngredients.length > 0 && (
                        <p className="text-[11px] text-orange-500 font-semibold">✕ Sin: {ci.removedIngredients.join(', ')}</p>
                      )}
                      {ci.extras?.map((ex) => (
                        <p key={ex.name} className="text-[11px] text-green-700 font-semibold">+ {ex.name} (${ex.price.toFixed(2)})</p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {order.notes && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-black text-amber-700 mb-0.5">📝 Notas especiales</p>
              <p className="text-xs text-amber-900">{order.notes}</p>
            </div>
          )}

          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Forma de pago</span>
              <span>{pm === 'card' ? '💳 Tarjeta' : '🏪 Ventanilla al recoger'}</span>
            </div>
            <div className="flex justify-between font-black text-lg text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Puntos ganados ── */}
      {order && order.points_earned > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-400 shrink-0" />
          <div>
            <p className="font-black text-gray-900 text-sm">¡Ganaste {order.points_earned} puntos!</p>
            <p className="text-xs text-gray-500">Acumula 100 puntos y obtén $1 de descuento</p>
          </div>
        </div>
      )}

      {/* ── Botones ── */}
      <div className="space-y-3">
        <Link
          href="/cuenta"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-sm hover:opacity-90 transition"
          style={{ backgroundColor: '#006B42' }}
        >
          <Star className="w-4 h-4" /> Ver mis puntos y pedidos
        </Link>
        <Link
          href="/menu"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-gray-700 text-sm bg-gray-100 hover:bg-gray-200 transition"
        >
          Volver al menú
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#006B42', borderTopColor: 'transparent' }} />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
