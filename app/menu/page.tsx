'use client'
import { useState } from 'react'
import { ShoppingBag, Plus, Check } from 'lucide-react'
import { useAcaTortasStore, cartCount } from '@/store/store'
import { CATEGORIES } from '@/data/menu'
import CartDrawer from '@/components/CartDrawer'

export default function MenuPage() {
  const { menu, cart, addToCart } = useAcaTortasStore()
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cartOpen, setCartOpen] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  const count = cartCount(cart)

  const allCategories = ['Todos', ...CATEGORIES]
  const visible = activeCategory === 'Todos'
    ? menu.filter((m) => m.available)
    : menu.filter((m) => m.category === activeCategory && m.available)

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    const items = visible.filter((m) => m.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<string, typeof menu>)

  const handleAdd = (id: string, item: (typeof menu)[0]) => {
    addToCart(item)
    setAdded(id)
    setTimeout(() => setAdded(null), 1200)
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">Nuestro Menú</h1>
          <p className="text-gray-500 mt-1">Selecciona tus platillos favoritos y ordena para pickup</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all"
              style={
                activeCategory === cat
                  ? { backgroundColor: '#CC0000', color: 'white' }
                  : { backgroundColor: '#F3F4F6', color: '#374151' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items by category */}
        {activeCategory === 'Todos' ? (
          <div className="space-y-12">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#CC0000' }} />
                  <h2 className="text-2xl font-black text-gray-900">{cat}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <MenuCard key={item.id} item={item} added={added === item.id} onAdd={() => handleAdd(item.id, item)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((item) => (
              <MenuCard key={item.id} item={item} added={added === item.id} onAdd={() => handleAdd(item.id, item)} />
            ))}
          </div>
        )}

        {visible.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-semibold">No hay platillos disponibles en esta categoría</p>
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-black text-white text-base transition-transform hover:scale-105"
            style={{ backgroundColor: '#CC0000' }}
          >
            <ShoppingBag className="w-5 h-5" />
            Ver orden ({count} {count === 1 ? 'item' : 'items'})
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
}: {
  item: { id: string; name: string; description: string; price: number }
  added: boolean
  onAdd: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
      <div className="flex-1">
        <h3 className="font-black text-gray-900 text-base leading-tight mb-1">{item.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.description}</p>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[#CC0000] font-black text-xl">${item.price.toFixed(2)}</span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-white text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: added ? '#16A34A' : '#CC0000' }}
        >
          {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {added ? '¡Listo!' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
