'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useAcaTortasStore, cartTotal, cartCount, cartItemPrice } from '@/store/store'
import type { CartItem } from '@/store/store'

const ck = (ci: CartItem) => ci.cartKey ?? ci.item.id

type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const { cart, updateQty, clearCart } = useAcaTortasStore()
  const router = useRouter()
  const total = cartTotal(cart)
  const count = cartCount(cart)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ backgroundColor: '#006B42' }}>
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

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <ShoppingBag className="w-12 h-12 opacity-30" />
              <p className="font-semibold">Tu carrito está vacío</p>
              <button onClick={onClose} className="text-sm text-[#006B42] font-bold hover:underline">
                Ver el menú
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((ci) => {
                const unitPrice = cartItemPrice(ci)
                return (
                  <div key={ck(ci)} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{ci.item.name}</p>
                        <p className="font-black text-sm mt-0.5" style={{ color: '#006B42' }}>
                          ${(unitPrice * ci.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQty(ck(ci), ci.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                        >
                          {ci.quantity === 1
                            ? <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            : <Minus className="w-3.5 h-3.5" />}
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

                    {((ci.removedIngredients?.length ?? 0) > 0 || (ci.extras?.length ?? 0) > 0) && (
                      <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                        {ci.removedIngredients && ci.removedIngredients.length > 0 && (
                          <p className="text-xs text-orange-600 font-semibold">
                            Sin: {ci.removedIngredients.join(', ')}
                          </p>
                        )}
                        {ci.extras && ci.extras.map((ex) => (
                          <p key={ex.name} className="text-xs text-green-700 font-semibold">
                            + {ex.name} <span className="text-gray-400">(${ex.price.toFixed(2)})</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Total estimado</span>
              <span className="font-black text-xl text-gray-900">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">Pago en ventanilla al recoger</p>
            <button
              onClick={() => { onClose(); router.push('/pedido') }}
              className="w-full py-3.5 rounded-2xl font-black text-white text-base hover:opacity-90"
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
    </>
  )
}
