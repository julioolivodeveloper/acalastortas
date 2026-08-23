'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, Plus, Check } from 'lucide-react'
import { useCartStore, cartCount } from '@/store/store'
import { getMenu } from '@/lib/db'
import type { DbMenuItem } from '@/lib/supabase'
import CartDrawer from '@/components/CartDrawer'

const CATEGORIES = ['Tortas','Burritos','Quesadillas','Tacos','Enchiladas','Gorditas','Bebidas','Extras']

export default function MenuPage() {
  const { cart, addToCart } = useCartStore()
  const [menu, setMenu] = useState<DbMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cartOpen, setCartOpen] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
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
    setTimeout(() => setAdded(null), 1200)
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">Nuestro Menú</h1>
          <p className="text-gray-500 mt-1">Selecciona tus platillos y ordena para pickup</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
          {['Todos', ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all"
              style={activeCategory === cat ? { backgroundColor: '#006B42', color: 'white' } : { backgroundColor: '#F3F4F6', color: '#374151' }}>
              {cat}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#006B42] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeCategory === 'Todos' ? (
          <div className="space-y-12">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#006B42' }} />
                  <h2 className="text-2xl font-black text-gray-900">{cat}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <MenuCard key={item.id} item={item} added={added === item.id} onAdd={() => handleAdd(item)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((item) => (
              <MenuCard key={item.id} item={item} added={added === item.id} onAdd={() => handleAdd(item)} />
            ))}
          </div>
        )}
        {!loading && visible.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-semibold">No hay platillos en esta categoría</p>
          </div>
        )}
      </div>
      {count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-black text-white text-base hover:scale-105 transition-transform"
            style={{ backgroundColor: '#006B42' }}>
            <ShoppingBag className="w-5 h-5" />
            Ver orden ({count} {count === 1 ? 'item' : 'items'})
          </button>
        </div>
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

function MenuCard({ item, added, onAdd }: { item: DbMenuItem; added: boolean; onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
      {item.image && <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-3" />}
      <div className="flex-1">
        <h3 className="font-black text-gray-900 text-base leading-tight mb-1">{item.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.description}</p>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[#006B42] font-black text-xl">${item.price.toFixed(2)}</span>
        <button onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-white text-sm hover:opacity-90"
          style={{ backgroundColor: added ? '#16A34A' : '#006B42' }}>
          {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {added ? '¡Listo!' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
