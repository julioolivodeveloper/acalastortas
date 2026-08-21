'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAcaTortasStore } from '@/store/store'
import { CATEGORIES, type MenuItem } from '@/data/menu'

type EditState = Partial<MenuItem> & { id: string }

export default function MenuEditorPage() {
  const { menu, updateMenuItem, addMenuItem, deleteMenuItem, resetMenu } = useAcaTortasStore()
  const [filterCat, setFilterCat] = useState('Todos')
  const [editing, setEditing] = useState<EditState | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    category: CATEGORIES[0], available: true
  })
  const [confirmReset, setConfirmReset] = useState(false)

  const visible = filterCat === 'Todos' ? menu : menu.filter((m) => m.category === filterCat)

  const saveEdit = () => {
    if (!editing) return
    const { id, ...updates } = editing
    updateMenuItem(id, updates)
    setEditing(null)
  }

  const handleAdd = () => {
    if (!newItem.name?.trim() || !newItem.price) return
    addMenuItem({
      id: `custom-${Date.now()}`,
      name: newItem.name!,
      description: newItem.description || '',
      price: Number(newItem.price),
      category: newItem.category || CATEGORIES[0],
      available: newItem.available ?? true,
    })
    setNewItem({ category: CATEGORIES[0], available: true })
    setShowAdd(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-2xl">Gestión del Menú</h1>
          <p className="text-gray-400 text-sm mt-0.5">{menu.length} platillos en total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-white text-sm"
            style={{ backgroundColor: '#CC0000' }}
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {['Todos', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition"
            style={filterCat === cat ? { backgroundColor: '#CC0000', color: 'white' } : { backgroundColor: '#1F2937', color: '#9CA3AF' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-black text-sm mb-4">Nuevo Platillo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Nombre *"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
            <input
              placeholder="Precio *"
              type="number"
              step="0.01"
              value={newItem.price || ''}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="avail-new"
                checked={newItem.available ?? true}
                onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                className="w-4 h-4 accent-red-600"
              />
              <label htmlFor="avail-new" className="text-gray-300 text-sm font-semibold">Disponible</label>
            </div>
          </div>
          <textarea
            placeholder="Descripción"
            value={newItem.description || ''}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none mb-3"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-white text-sm" style={{ backgroundColor: '#16A34A' }}>
              <Check className="w-4 h-4" /> Guardar
            </button>
            <button onClick={() => setShowAdd(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-gray-400 border border-gray-700 text-sm hover:bg-gray-800 transition">
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Menu list */}
      <div className="space-y-2">
        {visible.map((item) => (
          <div key={item.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {editing?.id === item.id ? (
              /* Edit mode */
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                    placeholder="Nombre"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editing.price || ''}
                    onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })}
                    className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                    placeholder="Precio"
                  />
                  <select
                    value={editing.category || ''}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`avail-${item.id}`}
                      checked={editing.available ?? true}
                      onChange={(e) => setEditing({ ...editing, available: e.target.checked })}
                      className="w-4 h-4 accent-red-600"
                    />
                    <label htmlFor={`avail-${item.id}`} className="text-gray-300 text-sm font-semibold">Disponible</label>
                  </div>
                </div>
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none resize-none mb-3"
                  placeholder="Descripción"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-white text-sm" style={{ backgroundColor: '#16A34A' }}>
                    <Check className="w-4 h-4" /> Guardar
                  </button>
                  <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-gray-400 border border-gray-700 text-sm hover:bg-gray-800 transition">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-black text-sm ${item.available ? 'text-white' : 'text-gray-500 line-through'}`}>{item.name}</p>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{item.category}</span>
                    {!item.available && (
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold">No disponible</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{item.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <p className="text-white font-black text-base">${item.price.toFixed(2)}</p>
                  {/* Toggle availability */}
                  <button
                    onClick={() => updateMenuItem(item.id, { available: !item.available })}
                    className="transition"
                    title={item.available ? 'Marcar como no disponible' : 'Marcar como disponible'}
                  >
                    {item.available
                      ? <ToggleRight className="w-6 h-6 text-green-500" />
                      : <ToggleLeft className="w-6 h-6 text-gray-600" />
                    }
                  </button>
                  <button
                    onClick={() => setEditing({ ...item })}
                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="text-xs text-gray-600 hover:text-gray-400 transition font-semibold"
          >
            Restaurar menú a valores originales
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm flex-1">¿Restaurar el menú original? Se perderán los cambios.</p>
            <button onClick={() => { resetMenu(); setConfirmReset(false) }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-black">Sí, restaurar</button>
            <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 border border-gray-700 text-gray-400 rounded-lg text-xs font-black hover:bg-gray-800">Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}
