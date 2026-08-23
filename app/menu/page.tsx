'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, Plus, Check, ChevronRight } from 'lucide-react'
import { useCartStore, cartCount } from '@/store/store'
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

export default function MenuPage() {
  const { cart, addToCart } = useCartStore()
  const [menu, setMenu] = useState<DbMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cartOpen, setCartOpen] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  const [cartBounce, setCartBounce] = useState(false)
  const count = cartCount(cart)

  useEffect(() => {
    getMenu().then(setMenu).finally(() => setLoading(false))
  }, [])

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
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Nuestro Menú</h1>
          <p className="text-green-200/90 mt-1.5 text-sm font-semibold">Pickup en ~15 min · El Paso, TX</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-md">
        <div className="max-w-6xl mx-auto px-3">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar md:justify-center">
            {/* Todos pill */}
            {(['Todos'] as const).map(() => {
              const active = activeCategory === 'Todos'
              return (
                <button
                  key="Todos"
                  onClick={() => setActiveCategory('Todos')}
                  className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-sm transition-all duration-200"
                  style={active
                    ? { backgroundColor: '#006B42', color: 'white', boxShadow: '0 4px 16px rgba(0,107,66,0.35)' }
                    : { backgroundColor: '#F3F4F6', color: '#6B7280' }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#E5E7EB' }}
                  >
                    🍽️
                  </div>
                  Todos
                </button>
              )
            })}

            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              const label = cat === 'Flautas y Pollo' ? 'Flautas y Pollo' : cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-sm transition-all duration-200 whitespace-nowrap"
                  style={active
                    ? { backgroundColor: '#006B42', color: 'white', boxShadow: '0 4px 16px rgba(0,107,66,0.35)' }
                    : { backgroundColor: '#F3F4F6', color: '#6B7280' }}
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={CATEGORY_IMG[cat]}
                      alt={cat}
                      className="w-full h-full object-cover"
                      style={{ filter: active ? 'brightness(1.1)' : 'none' }}
                    />
                  </div>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-lg w-full" />
                  <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                  <div className="flex justify-between pt-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-16" />
                    <div className="h-9 bg-gray-200 rounded-xl w-28" />
                  </div>
                </div>
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
                      <p className="text-gray-400 text-xs ml-1">{items.length} opciones</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1 text-xs font-bold text-[#006B42] hover:underline"
                  >
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((item, idx) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      added={added === item.id}
                      onAdd={() => handleAdd(item)}
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
              <span className="text-sm text-gray-400 font-medium">({visible.length} platillos)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((item, idx) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  added={added === item.id}
                  onAdd={() => handleAdd(item)}
                  delay={idx * 40}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="text-center py-20 text-gray-400">
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
            style={{
              backgroundColor: '#C61620',
              boxShadow: '0 8px 30px rgba(198,22,32,0.45)',
            }}
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
    </>
  )
}

function MenuCard({
  item,
  added,
  onAdd,
  delay = 0,
}: {
  item: DbMenuItem
  added: boolean
  onAdd: () => void
  delay?: number
}) {
  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 h-48">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🍽️</div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="font-black text-gray-900 text-base leading-tight mb-1.5">{item.name}</h3>
        <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-4">{item.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black" style={{ color: '#006B42' }}>
              ${item.price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={onAdd}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-white text-sm transition-all duration-200 ${
              added ? 'scale-95' : 'hover:scale-105 active:scale-95'
            }`}
            style={{
              backgroundColor: added ? '#16A34A' : '#006B42',
              boxShadow: added ? '0 2px 12px rgba(22,163,74,0.4)' : '0 2px 12px rgba(0,107,66,0.3)',
            }}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                ¡Listo!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
