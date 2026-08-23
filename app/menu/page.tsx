'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, Plus, Check, ChevronRight, X } from 'lucide-react'
import { useCartStore, cartCount, cartItemPrice } from '@/store/store'
import type { CartItemExtra } from '@/store/store'
import { getMenu } from '@/lib/db'
import type { DbMenuItem } from '@/lib/supabase'
import CartDrawer from '@/components/CartDrawer'

const CATEGORIES = ['Tortas', 'Hamburguesas', 'Burritos', 'Tacos', 'Quesadillas', 'Flautas y Pollo', 'Menú Kids', 'Bebidas']

const CATEGORY_IMG: Record<string, string> = {
  Tortas: '/menu/torta-bistec.jpg',
  Hamburguesas: '/menu/hamburguesa-doble.jpg',
  Burritos: '/menu/burrito-verde.jpg',
  Tacos: '/menu/tacos-carnitas.jpg',
  Quesadillas: '/menu/quesadilla-1.jpg',
  'Flautas y Pollo': '/menu/flauta-pechuga.jpg',
  'Menú Kids': '/menu/kids-nuggets.jpg',
  Bebidas: '/menu/bebida-aguas-frescas.jpg',
}

const EXTRAS = [
  { id: 'papitas', name: 'Papitas', price: 3.99, image: '/menu/kids-papitas.jpg' },
  { id: 'papitas-queso', name: 'Papitas c/Queso', price: 4.99, image: '/menu/kids-papitas-queso.jpg' },
  { id: 'refresco', name: 'Refresco', price: 2.99, image: '/menu/bebida-refresco-lata.jpg' },
  { id: 'agua-fresca', name: 'Agua Fresca', price: 2.99, image: '/menu/bebida-aguas-frescas.jpg' },
]

export default function MenuPage() {
  const { cart, addToCart } = useCartStore()
  const [menu, setMenu] = useState<DbMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cartOpen, setCartOpen] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  const [cartBounce, setCartBounce] = useState(false)
  const [selected, setSelected] = useState<DbMenuItem | null>(null)
  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set())
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({})
  const count = cartCount(cart)

  useEffect(() => {
    getMenu().then(setMenu).finally(() => setLoading(false))
  }, [])

  const openItem = (item: DbMenuItem) => {
    setSelected(item)
    setRemovedIngredients(new Set())
    setSelectedExtras({})
  }

  const visible = (activeCategory === 'Todos' ? menu : menu.filter((m) => m.category === activeCategory))
    .filter((m) => m.available)

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    const items = visible.filter((m) => m.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {} as Record<string, DbMenuItem[]>)

  const handleAdd = (item: DbMenuItem) => {
    addToCart(item)
    setAdded(item.id)
    setCartBounce(true)
    setTimeout(() => setAdded(null), 1400)
    setTimeout(() => setCartBounce(false), 600)
  }

  const handleAddFromPopup = () => {
    if (!selected) return
    const removed = Array.from(removedIngredients)
    const extras: CartItemExtra[] = EXTRAS.filter((e) => selectedExtras[e.id]).map((e) => ({ name: e.name, price: e.price }))
    addToCart(selected, { removedIngredients: removed, extras })
    setAdded(selected.id)
    setCartBounce(true)
    setTimeout(() => setAdded(null), 1400)
    setTimeout(() => setCartBounce(false), 600)
    setSelected(null)
  }

  const toggleIngredient = (ing: string) => {
    setRemovedIngredients((prev) => {
      const next = new Set(prev)
      if (next.has(ing)) next.delete(ing)
      else next.add(ing)
      return next
    })
  }

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const extrasTotal = EXTRAS.filter((e) => selectedExtras[e.id]).reduce((s, e) => s + e.price, 0)
  const popupPrice = selected ? selected.price + extrasTotal : 0

  return (
    <>
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-10 pb-8" style={{ backgroundColor: '#004D2E' }}>
        <img
          src="/menu/hamburguesa-combo.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 scale-105"
          style={{ filter: 'saturate(1.2)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,50,30,0.85) 40%, rgba(0,80,50,0.3) 100%)' }} />
        <div className="relative z-10 max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Nuestro Menú</h1>
            <p className="text-green-200/90 mt-1.5 text-sm font-semibold">Pickup en ~15 min · El Paso, TX</p>
          </div>
          <img src="/logo.png" alt="Aca Las Tortas" className="h-24 md:h-32 drop-shadow-2xl shrink-0" />
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-16 z-10 border-b border-red-900 shadow-md" style={{ backgroundColor: '#C61620' }}>
        <div className="max-w-screen-xl mx-auto px-3">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar md:justify-center">
            {(['Todos'] as const).map(() => {
              const active = activeCategory === 'Todos'
              return (
                <button
                  key="Todos"
                  onClick={() => setActiveCategory('Todos')}
                  className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-sm transition-all duration-200"
                  style={active
                    ? { backgroundColor: '#006B42', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }
                    : { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: active ? 'rgba(198,22,32,0.08)' : 'rgba(255,255,255,0.15)' }}
                  >
                    🍽️
                  </div>
                  Todos
                </button>
              )
            })}

            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-sm transition-all duration-200 whitespace-nowrap"
                  style={active
                    ? { backgroundColor: '#006B42', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }
                    : { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={CATEGORY_IMG[cat]}
                      alt={cat}
                      className="w-full h-full object-cover"
                      style={{ filter: active ? 'brightness(1.1)' : 'none' }}
                    />
                  </div>
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-32 bg-gray-50">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
                <div className="flex-1 p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-6 bg-gray-200 rounded w-16 mt-2" />
                </div>
                <div className="w-[120px] h-[120px] shrink-0 m-3 rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>
        ) : activeCategory === 'Todos' ? (
          <div className="space-y-12">
            {Object.entries(byCategory).map(([cat, items]) => (
              <section key={cat}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: '#C61620' }} />
                    <div>
                      <div className="flex items-center gap-2">
                        {CATEGORY_IMG[cat] && (
                          <img src={CATEGORY_IMG[cat]} alt="" className="w-8 h-8 rounded-xl object-cover" />
                        )}
                        <h2 className="text-2xl font-black text-gray-900">{cat}</h2>
                      </div>
                      <p className="text-gray-500 text-xs ml-1">{items.length} opciones</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1 text-xs font-bold text-green-700 hover:underline"
                  >
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item, idx) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      added={added === item.id}
                      onAdd={() => handleAdd(item)}
                      onOpen={() => openItem(item)}
                      delay={idx * 40}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: '#C61620' }} />
              <div className="flex items-center gap-2">
                {CATEGORY_IMG[activeCategory] && (
                  <img src={CATEGORY_IMG[activeCategory]} alt="" className="w-9 h-9 rounded-xl object-cover" />
                )}
                <h2 className="text-2xl font-black text-gray-900">{activeCategory}</h2>
              </div>
              <span className="text-sm text-gray-500 font-medium">({visible.length} platillos)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visible.map((item, idx) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  added={added === item.id}
                  onAdd={() => handleAdd(item)}
                  onOpen={() => openItem(item)}
                  delay={idx * 40}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-lg font-bold text-gray-500">No hay platillos en esta categoría</p>
            <p className="text-sm mt-1">Intenta con otra selección</p>
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setCartOpen(true)}
            className={`flex items-center gap-3 px-7 py-4 rounded-2xl font-black text-white text-base transition-all duration-200 ${
              cartBounce ? 'scale-110' : 'scale-100 hover:scale-105'
            }`}
            style={{ backgroundColor: '#C61620', boxShadow: '0 8px 30px rgba(198,22,32,0.45)' }}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-white text-[#C61620] text-xs font-black w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-1">
                {count}
              </span>
            </div>
            Ver mi orden
          </button>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Item detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '94vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-56 sm:h-64 bg-gray-100 shrink-0">
              {selected.image ? (
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🍽️</div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {selected.category}
              </span>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 pt-5 pb-0">
              <h2 className="text-2xl font-black text-gray-900 mb-1.5">{selected.name}</h2>
              {selected.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{selected.description}</p>
              )}

              {/* Ingredient toggles */}
              {selected.ingredients && selected.ingredients.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5">
                    Ingredientes <span className="font-normal normal-case text-gray-400">— toca para quitar</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.ingredients.map((ing) => {
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
                    <p className="text-xs font-bold text-orange-500 mt-2.5 flex items-center gap-1">
                      <span>⚠️</span> Sin: {Array.from(removedIngredients).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Extras */}
              {selected.category !== 'Bebidas' && (
                <div className="mb-5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">¿Le agrego algo más?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EXTRAS.map((extra) => {
                      const active = !!selectedExtras[extra.id]
                      return (
                        <button
                          key={extra.id}
                          onClick={() => toggleExtra(extra.id)}
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

            {/* Price + Add button — fixed at bottom */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black" style={{ color: '#006B42' }}>
                    ${popupPrice.toFixed(2)}
                  </span>
                  {extrasTotal > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ${selected.price.toFixed(2)} + ${extrasTotal.toFixed(2)} extras
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAddFromPopup}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white text-base transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#C61620', boxShadow: '0 4px 20px rgba(198,22,32,0.35)' }}
                >
                  <Plus className="w-5 h-5" /> Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MenuCard({
  item,
  added,
  onAdd,
  onOpen,
  delay = 0,
}: {
  item: DbMenuItem
  added: boolean
  onAdd: () => void
  onOpen: () => void
  delay?: number
}) {
  return (
    <div
      className="flex items-center rounded-2xl border border-gray-200 bg-white cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', animationDelay: `${delay}ms` }}
      onClick={onOpen}
    >
      {/* Texto izquierda */}
      <div className="flex-1 flex flex-col justify-between self-stretch px-4 py-4 min-w-0">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.category}</p>
          <h3 className="font-black text-gray-900 text-[15px] leading-snug mb-1.5">{item.name}</h3>
          <p className="text-gray-500 text-sm leading-snug line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-black" style={{ color: '#006B42' }}>
            ${item.price.toFixed(2)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd() }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-all duration-200 active:scale-95"
            style={{ backgroundColor: added ? '#16A34A' : '#006B42', boxShadow: '0 2px 8px rgba(0,107,66,0.35)' }}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Imagen derecha */}
      <div className="w-[120px] h-[120px] shrink-0 m-3 rounded-xl overflow-hidden bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🍽️</div>
        )}
      </div>
    </div>
  )
}
