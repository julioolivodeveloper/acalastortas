'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { getMenu, updateMenuItem, addMenuItem, deleteMenuItem } from '@/lib/db'
import type { DbMenuItem } from '@/lib/supabase'

const CATEGORIES = ['Tortas', 'Hamburguesas', 'Burritos', 'Tacos', 'Quesadillas', 'Flautas y Pollo', 'Menú Kids', 'Bebidas']

export default function MenuEditorPage() {
  const [menu, setMenu] = useState<DbMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('Todos')
  const [editing, setEditing] = useState<Partial<DbMenuItem> & { id: string } | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState<Partial<DbMenuItem>>({ category: CATEGORIES[0], available: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMenu().then((data) => { setMenu(data as DbMenuItem[]); setLoading(false) })
  }, [])

  const visible = filterCat === 'Todos' ? menu : menu.filter((m) => m.category === filterCat)

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    const { id, ...updates } = editing
    await updateMenuItem(id, updates)
    setMenu((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } : m))
    setEditing(null); setSaving(false)
  }

  const handleAdd = async () => {
    if (!newItem.name?.trim() || !newItem.price) return
    setSaving(true)
    const item = {
      id: `custom-${Date.now()}`,
      name: newItem.name!,
      description: newItem.description || '',
      price: Number(newItem.price),
      category: newItem.category || CATEGORIES[0],
      available: newItem.available ?? true,
    }
    await addMenuItem(item)
    setMenu((prev) => [...prev, { ...item, image: null, created_at: new Date().toISOString() }])
    setNewItem({ category: CATEGORIES[0], available: true }); setShowAdd(false); setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este platillo?')) return
    await deleteMenuItem(id)
    setMenu((prev) => prev.filter((m) => m.id !== id))
  }

  const handleToggle = async (item: DbMenuItem) => {
    await updateMenuItem(item.id, { available: !item.available })
    setMenu((prev) => prev.map((m) => m.id === item.id ? { ...m, available: !m.available } : m))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-2xl">Gestión del Menú</h1>
          <p className="text-gray-400 text-sm mt-0.5">{menu.length} platillos en total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-white text-sm"
          style={{ backgroundColor: '#006B42' }}
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {['Todos', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition"
            style={filterCat === cat ? { backgroundColor: '#006B42', color: 'white' } : { backgroundColor: '#1F2937', color: '#9CA3AF' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-black text-sm mb-4">Nuevo Platillo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Nombre *"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B42]"
            />
            <input
              placeholder="Precio *"
              type="number"
              step="0.01"
              value={newItem.price || ''}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B42]"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
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
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none resize-none mb-3"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#16A34A' }}>
              <Check className="w-4 h-4" /> Guardar
            </button>
            <button onClick={() => setShowAdd(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-gray-400 border border-gray-700 text-sm hover:bg-gray-800 transition">
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-10">Cargando menú...</p>
      ) : (
        <div className="space-y-2">
          {visible.map((item) => (
            <div key={item.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {editing?.id === item.id ? (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      value={editing.name || ''}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                      placeholder="Nombre"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editing.price || ''}
                      onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })}
                      className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
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
                    <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-white text-sm disabled:opacity-50" style={{ backgroundColor: '#16A34A' }}>
                      <Check className="w-4 h-4" /> Guardar
                    </button>
                    <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-gray-400 border border-gray-700 text-sm hover:bg-gray-800 transition">
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-black text-sm ${item.available ? 'text-white' : 'text-gray-500 line-through'}`}>{item.name}</p>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{item.category}</span>
                      {!item.available && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold">No disponible</span>}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{item.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <p className="text-white font-black text-base">${Number(item.price).toFixed(2)}</p>
                    <button onClick={() => handleToggle(item)} title={item.available ? 'Desactivar' : 'Activar'}>
                      {item.available
                        ? <ToggleRight className="w-6 h-6 text-green-500" />
                        : <ToggleLeft className="w-6 h-6 text-gray-600" />}
                    </button>
                    <button onClick={() => setEditing({ ...item })} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
