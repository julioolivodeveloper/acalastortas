'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, ShoppingBag, Trash2, Pencil, Check } from 'lucide-react'
import { useAcaTortasStore, cartTotal, cartCount, cartItemPrice } from '@/store/store'
import type { CartItem, CartItemExtra } from '@/store/store'

const ck = (ci: CartItem) => ci.cartKey ?? ci.item.id

const EXTRAS = [
  { id: 'papitas',       name: 'Papitas',        price: 3.99, image: '/menu/kids-papitas.webp' },
  { id: 'papitas-queso', name: 'Papitas c/Queso', price: 4.99, image: '/menu/kids-papitas-queso.webp' },
  { id: 'refresco',      name: 'Refresco',        price: 2.99, image: '/menu/bebida-refresco-lata.webp' },
  { id: 'agua-fresca',   name: 'Agua Fresca',     price: 2.99, image: '/menu/bebida-aguas-frescas.webp' },
]

type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const { cart, updateQty, clearCart, replaceCartItem } = useAcaTortasStore()
  const router = useRouter()
  const total = cartTotal(cart)
  const count = cartCount(cart)

  // Edit popup state
  const [editing, setEditing] = useState<CartItem | null>(null)
  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set())
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editing) setEditing(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, editing])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const openEdit = (ci: CartItem) => {
    setEditing(ci)
    setRemovedIngredients(new Set(ci.removedIngredients ?? []))
    const extrasMap: Record<string, boolean> = {}
    EXTRAS.forEach(e => {
      extrasMap[e.id] = (ci.extras ?? []).some(ex => ex.name === e.name)
    })
    setSelectedExtras(extrasMap)
  }

  const saveEdit = () => {
    if (!editing) return
    const removed = Array.from(removedIngredients)
    const extras: CartItemExtra[] = EXTRAS.filter(e => selectedExtras[e.id]).map(e => ({ name: e.name, price: e.price }))
    replaceCartItem(ck(editing), editing.item, editing.quantity, {
      removedIngredients: removed.length > 0 ? removed : undefined,
      extras: extras.length > 0 ? extras : undefined,
    })
    setEditing(null)
  }

  const toggleIngredient = (ing: string) => {
    setRemovedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(ing)) next.delete(ing)
      else next.add(ing)
      return next
    })
  }

  const extrasTotal = EXTRAS.filter(e => selectedExtras[e.id]).reduce((s, e) => s + e.price, 0)
  const editPrice = editing ? editing.item.price + extrasTotal : 0

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={editing ? () => setEditing(null) : onClose} />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ backgroundColor: '#006B42' }}>
          <div className="flex items-center gap-2 text-white">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-black text-lg">Tu Orden</span>
            {count > 0 && (
              <span className="bg-white text-[#006B42] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <ShoppingBag className="w-12 h-12 opacity-30" />
              <p className="font-semibold">Tu carrito está vacío</p>
              <button onClick={onClose} className="text-sm font-bold hover:underline" style={{ color: '#006B42' }}>
                Ver el menú
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((ci) => {
                const unitPrice = cartItemPrice(ci)
                return (
                  <div key={ck(ci)} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    {/* Item row */}
                    <div className="flex gap-3 p-3">
                      {/* Thumbnail */}
                      {ci.item.image && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                          <img src={ci.item.image} alt={ci.item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm leading-tight">{ci.item.name}</p>
                            <p className="font-black text-sm mt-0.5" style={{ color: '#006B42' }}>
                              ${(unitPrice * ci.quantity).toFixed(2)}
                            </p>
                          </div>
                          {/* Edit button */}
                          <button
                            onClick={() => openEdit(ci)}
                            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#006B42] hover:bg-green-50 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Customizations */}
                    {((ci.removedIngredients?.length ?? 0) > 0 || (ci.extras?.length ?? 0) > 0) && (
                      <div className="px-3 pb-2.5 space-y-1 border-t border-gray-200 pt-2">
                        {ci.removedIngredients && ci.removedIngredients.length > 0 && (
                          <p className="text-xs text-orange-600 font-semibold">
                            Sin: {ci.removedIngredients.join(', ')}
                          </p>
                        )}
                        {ci.extras?.map(ex => (
                          <p key={ex.name} className="text-xs text-green-700 font-semibold">
                            + {ex.name} <span className="text-gray-400">(${ex.price.toFixed(2)})</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Qty controls */}
                    <div className="flex items-center justify-end gap-2 px-3 pb-3">
                      <button
                        onClick={() => updateQty(ck(ci), ci.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                      >
                        {ci.quantity === 1
                          ? <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          : <Minus className="w-3.5 h-3.5 text-gray-600" />}
                      </button>
                      <span className="w-5 text-center font-black text-sm">{ci.quantity}</span>
                      <button
                        onClick={() => updateQty(ck(ci), ci.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#006B42' }}
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-white shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Total estimado</span>
              <span className="font-black text-xl text-gray-900">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">Pago en ventanilla al recoger</p>
            <button
              onClick={() => { onClose(); router.push('/pedido') }}
              className="w-full py-3.5 rounded-2xl font-black text-white text-base hover:opacity-90 transition"
              style={{ backgroundColor: '#C61620' }}
            >
              Ordenar — ${total.toFixed(2)}
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center text-sm text-gray-400 hover:text-red-500 transition font-semibold py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>

      {/* ── Edit popup ── */}
      {editing && open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-52 sm:h-60 bg-gray-100 shrink-0">
              {editing.item.image
                ? <img src={editing.item.image} alt={editing.item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🍽️</div>
              }
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
              <button
                onClick={() => setEditing(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {editing.item.category}
              </span>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 pt-5 pb-0">
              <h2 className="text-2xl font-black text-gray-900 mb-1.5">{editing.item.name}</h2>
              {editing.item.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{editing.item.description}</p>
              )}

              {/* Ingredients */}
              {editing.item.ingredients && editing.item.ingredients.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5">
                    Ingredientes <span className="font-normal normal-case text-gray-400">— toca para quitar</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editing.item.ingredients.map(ing => {
                      const removed = removedIngredients.has(ing)
                      return (
                        <button
                          key={ing}
                          onClick={() => toggleIngredient(ing)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150"
                          style={removed
                            ? { backgroundColor: '#f5f5f5', borderColor: '#ddd', color: '#aaa', textDecoration: 'line-through' }
                            : { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                        >
                          {removed ? '✕ ' : '✓ '}{ing}
                        </button>
                      )
                    })}
                  </div>
                  {removedIngredients.size > 0 && (
                    <p className="text-xs font-bold text-orange-500 mt-2.5">
                      ⚠️ Sin: {Array.from(removedIngredients).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Extras */}
              {editing.item.category !== 'Bebidas' && (
                <div className="mb-5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">¿Le agrego algo más?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EXTRAS.map(extra => {
                      const active = !!selectedExtras[extra.id]
                      return (
                        <button
                          key={extra.id}
                          onClick={() => setSelectedExtras(prev => ({ ...prev, [extra.id]: !prev[extra.id] }))}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-150"
                          style={active
                            ? { borderColor: '#006B42', backgroundColor: '#f0fdf4' }
                            : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
                        >
                          <img src={extra.image} alt={extra.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-gray-900 leading-tight">{extra.name}</p>
                            <p className="font-black text-sm" style={{ color: '#006B42' }}>+${extra.price.toFixed(2)}</p>
                          </div>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                            style={active
                              ? { backgroundColor: '#006B42', borderColor: '#006B42' }
                              : { borderColor: '#d1d5db', backgroundColor: 'white' }}
                          >
                            {active && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black" style={{ color: '#006B42' }}>
                    ${editPrice.toFixed(2)}
                  </span>
                  {extrasTotal > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ${editing.item.price.toFixed(2)} + ${extrasTotal.toFixed(2)} extras
                    </p>
                  )}
                </div>
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white text-base transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#006B42', boxShadow: '0 4px 20px rgba(0,107,66,0.35)' }}
                >
                  <Check className="w-5 h-5" /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
