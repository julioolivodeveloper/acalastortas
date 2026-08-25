'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, Plus, Check, ChevronRight, X } from 'lucide-react'
import { useCartStore, cartCount, cartItemPrice } from '@/store/store'
import type { CartItemExtra } from '@/store/store'
import { getMenu } from '@/lib/db'
import type { DbMenuItem } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import CartDrawer from '@/components/CartDrawer'

type Promo = {
  id: string; title: string; description: string
  type: string; discount_percent: number
  emoji: string; badge_color: string
}

const CATEGORIES = ['Tortas', 'Hamburguesas', 'Burritos', 'Tacos', 'Quesadillas', 'Flautas y Pollo', 'Menú Kids', 'Bebidas']

const CATEGORY_IMG: Record<string, string> = {
  Tortas: '/menu/torta-bistec.webp',
  Hamburguesas: '/menu/hamburguesa-doble.webp',
  Burritos: '/menu/burrito-verde.jpg',
  Tacos: '/menu/tacos-carnitas.webp',
  Quesadillas: '/menu/quesadilla-sencilla.webp',
  'Flautas y Pollo': '/menu/flauta-pechuga-marinada.webp',
  'Menú Kids': '/menu/kids-nuggets.webp',
  Bebidas: '/menu/bebida-aguas-frescas.webp',
}

const CATEGORY_COLOR: Record<string, string> = {
  Tortas: '#C61620',
  Hamburguesas: '#D97706',
  Burritos: '#7B3F00',
  Tacos: '#B45309',
  Quesadillas: '#92400E',
  'Flautas y Pollo': '#15803D',
  'Menú Kids': '#7C3AED',
  Bebidas: '#0369A1',
}

const CATEGORY_EMOJI: Record<string, string> = {
  Tortas: '🥖',
  Hamburguesas: '🍔',
  Burritos: '🌯',
  Tacos: '🌮',
  Quesadillas: '🫓',
  'Flautas y Pollo': '🍗',
  'Menú Kids': '⭐',
  Bebidas: '🥤',
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
  const [promos, setPromos] = useState<Promo[]>([])
  const [promoOpen, setPromoOpen] = useState(false)
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
    supabase.from('promotions').select('id,title,description,type,discount_percent,emoji,badge_color')
      .eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setPromos(data) })
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
          src="/menu/hamburguesa-combo.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          style={{ filter: 'saturate(1.3) brightness(0.75)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,40,20,0.82) 35%, rgba(0,60,35,0.25) 100%)' }} />
        <div className="relative z-10 max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Nuestro Menú</h1>
            <p className="text-green-200/90 mt-1.5 text-sm font-semibold">Pickup en ~15 min · El Paso, TX</p>
            <button
              onClick={() => setPromoOpen(true)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm text-white border border-white/30 hover:bg-white/15 transition-all duration-200 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(198,22,32,0.6)' }}
            >
              🔥 Promociones
              {promos.length > 0 && (
                <span className="bg-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center" style={{ color: '#C61620' }}>
                  {promos.length}
                </span>
              )}
            </button>
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

      {/* ── Modal de Promociones ── */}
      {promoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setPromoOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="font-black text-gray-900 text-xl">Promociones</h2>
              </div>
              <button onClick={() => setPromoOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-6">
              {promos.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
                    style={{ backgroundColor: '#FFF7ED' }}>
                    🏷️
                  </div>
                  <p className="font-black text-gray-900 text-lg mb-2">No hay promociones disponibles</p>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                    Pronto tendremos ofertas especiales para ti.<br />¡Síguenos en redes sociales para no perderte nada!
                  </p>
                  <div className="flex justify-center gap-3 mt-5">
                    <a href="https://www.facebook.com/AcaLasTortasElPaso" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base transition hover:scale-110"
                      style={{ backgroundColor: '#1877F2' }}>f</a>
                    <a href="https://www.instagram.com/acalastortaselpaso" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base transition hover:scale-110"
                      style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>ig</a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {promos.map(promo => {
                    const label = promo.type === 'discount' ? `${promo.discount_percent}% OFF`
                      : promo.type === '2x1' ? '2 × 1'
                      : promo.type === 'combo' ? 'Combo' : 'Promo'
                    return (
                      <div key={promo.id} className="flex items-start gap-4 p-4 rounded-2xl"
                        style={{ backgroundColor: promo.badge_color + '10', border: `1.5px solid ${promo.badge_color}30` }}>
                        <span className="text-3xl shrink-0 mt-0.5">{promo.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-black text-gray-900 text-base">{promo.title}</p>
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full text-white shrink-0"
                              style={{ backgroundColor: promo.badge_color }}>{label}</span>
                          </div>
                          {promo.description && (
                            <p className="text-gray-500 text-sm leading-relaxed">{promo.description}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-8 pb-32 bg-gray-50">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-9 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[cat] || '#C61620' }} />
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{CATEGORY_EMOJI[cat]}</span>
                      <div>
                        <h2 className="text-xl font-black text-gray-900 leading-tight">{cat}</h2>
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: CATEGORY_COLOR[cat] || '#006B42' }}
                        >
                          {items.length} opciones
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1 text-xs font-black hover:underline px-3 py-1.5 rounded-xl transition"
                    style={{ color: CATEGORY_COLOR[cat] || '#006B42', backgroundColor: `${CATEGORY_COLOR[cat] || '#006B42'}15` }}
                  >
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-9 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[activeCategory] || '#C61620' }} />
              <span className="text-3xl">{CATEGORY_EMOJI[activeCategory]}</span>
              <div>
                <h2 className="text-xl font-black text-gray-900 leading-tight">{activeCategory}</h2>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: CATEGORY_COLOR[activeCategory] || '#006B42' }}
                >
                  {visible.length} platillos
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
  const catColor = CATEGORY_COLOR[item.category] || '#006B42'
  const hasIngredients = item.ingredients && item.ingredients.length > 0

  return (
    <div
      className="flex flex-row md:flex-col items-stretch rounded-2xl bg-white cursor-pointer transition-all duration-200 active:scale-[0.99] overflow-hidden"
      style={{
        border: `1.5px solid #e5e7eb`,
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        animationDelay: `${delay}ms`,
      }}
      onClick={onOpen}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = catColor; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.1)` }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.07)' }}
    >
      {/* Franja de color — solo móvil */}
      <div className="w-1 md:hidden shrink-0 self-stretch" style={{ backgroundColor: catColor }} />

      {/* Imagen — derecha en móvil, arriba en desktop */}
      <div className="w-[130px] h-[130px] md:w-full md:h-48 shrink-0 m-2.5 md:m-0 rounded-xl md:rounded-none overflow-hidden bg-gray-100 relative order-last md:order-first">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl md:text-5xl opacity-20">🍽️</div>
        )}
        {hasIngredients && (
          <div className="absolute top-1.5 left-1.5">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white bg-black/50 backdrop-blur-sm">
              ✏️ editar
            </span>
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="flex-1 flex flex-col justify-between px-3.5 py-3.5 md:p-4 min-w-0">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-widest mb-1"
            style={{ color: catColor }}
          >
            {item.category}
          </p>
          <h3 className="font-black text-gray-900 text-[15px] leading-snug mb-1.5">{item.name}</h3>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{item.description}</p>
          {hasIngredients && (
            <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">
              🌿 {item.ingredients!.length} ingredientes · personalizable
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span
            className="font-black text-sm px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: '#006B42' }}
          >
            ${item.price.toFixed(2)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd() }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: added ? '#16A34A' : catColor,
              boxShadow: `0 3px 10px ${catColor}55`,
            }}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
