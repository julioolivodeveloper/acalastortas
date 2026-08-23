'use client'
import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Upload, ImageIcon, Tag } from 'lucide-react'
import { getMenu, updateMenuItem, addMenuItem, deleteMenuItem } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { DbMenuItem } from '@/lib/supabase'

const CATEGORIES = ['Tortas', 'Hamburguesas', 'Burritos', 'Tacos', 'Quesadillas', 'Flautas y Pollo', 'Menú Kids', 'Bebidas']
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

type EditState = Partial<DbMenuItem> & { id: string }

function IngredientInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [input, setInput] = useState('')
  const add = () => {
    const trimmed = input.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
  }
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-2.5">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((ing) => (
          <span key={ing} className="flex items-center gap-1 bg-gray-700 text-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full">
            {ing}
            <button onClick={() => onChange(value.filter((i) => i !== ing))} className="text-gray-400 hover:text-red-400 ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
          placeholder="Agregar ingrediente (Enter para confirmar)"
          className="flex-1 bg-gray-900 border border-gray-600 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#006B42] placeholder:text-gray-600"
        />
        <button onClick={add} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: '#006B42' }}>
          <Tag className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function ImageUpload({
  currentImage,
  onUploaded,
}: {
  currentImage: string | null
  onUploaded: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImage || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `menu/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('menu-images').upload(path, file, { upsert: true })
    if (!error) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/menu-images/${path}`
      setImageUrl(publicUrl)
      onUploaded(publicUrl)
    }
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <div
        className="relative h-32 bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-[#006B42] transition group"
        onClick={() => fileRef.current?.click()}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-1">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs font-semibold">Subir imagen</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </div>
      <input
        value={imageUrl}
        onChange={(e) => { setImageUrl(e.target.value); onUploaded(e.target.value) }}
        placeholder="O pega una URL de imagen"
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#006B42] placeholder:text-gray-600"
      />
    </div>
  )
}

export default function MenuEditorPage() {
  const [menu, setMenu] = useState<DbMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('Todos')
  const [editing, setEditing] = useState<EditState | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState<Partial<DbMenuItem>>({ category: CATEGORIES[0], available: true, ingredients: [] })
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
    setMenu((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } as DbMenuItem : m))
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
      image: newItem.image || null,
      ingredients: newItem.ingredients || [],
    }
    await addMenuItem(item)
    setMenu((prev) => [...prev, { ...item, created_at: new Date().toISOString() }])
    setNewItem({ category: CATEGORIES[0], available: true, ingredients: [] }); setShowAdd(false); setSaving(false)
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

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Imagen</label>
              <ImageUpload
                currentImage={newItem.image || null}
                onUploaded={(url) => setNewItem({ ...newItem, image: url })}
              />
            </div>
            <div className="space-y-3">
              <input
                placeholder="Nombre *"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B42]"
              />
              <input
                placeholder="Precio * (USD)"
                type="number"
                step="0.01"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B42]"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="avail-new"
                  checked={newItem.available ?? true}
                  onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                  className="w-4 h-4 accent-green-600"
                />
                <label htmlFor="avail-new" className="text-gray-300 text-sm font-semibold">Disponible</label>
              </div>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <textarea
              placeholder="Descripción"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
            />
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Ingredientes</label>
              <IngredientInput
                value={newItem.ingredients || []}
                onChange={(v) => setNewItem({ ...newItem, ingredients: v })}
              />
            </div>
          </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Imagen</label>
                      <ImageUpload
                        currentImage={editing.image || null}
                        onUploaded={(url) => setEditing({ ...editing, image: url })}
                      />
                    </div>
                    <div className="space-y-3">
                      <input
                        value={editing.name || ''}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                        placeholder="Nombre"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editing.price || ''}
                        onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                        placeholder="Precio"
                      />
                      <select
                        value={editing.category || ''}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`avail-${item.id}`}
                          checked={editing.available ?? true}
                          onChange={(e) => setEditing({ ...editing, available: e.target.checked })}
                          className="w-4 h-4 accent-green-600"
                        />
                        <label htmlFor={`avail-${item.id}`} className="text-gray-300 text-sm font-semibold">Disponible</label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-3">
                    <textarea
                      value={editing.description || ''}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                      placeholder="Descripción"
                    />
                    <div>
                      <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Ingredientes</label>
                      <IngredientInput
                        value={editing.ingredients || []}
                        onChange={(v) => setEditing({ ...editing, ingredients: v })}
                      />
                    </div>
                  </div>
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
                <div className="flex items-center gap-3 p-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  {!item.image && (
                    <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-black text-sm ${item.available ? 'text-white' : 'text-gray-500 line-through'}`}>{item.name}</p>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{item.category}</span>
                      {!item.available && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold">No disponible</span>}
                    </div>
                    {item.description && <p className="text-gray-500 text-xs mt-0.5 truncate">{item.description}</p>}
                    {item.ingredients?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.ingredients.slice(0, 4).map((ing) => (
                          <span key={ing} className="text-gray-600 text-[10px] bg-gray-800 px-1.5 py-0.5 rounded">{ing}</span>
                        ))}
                        {item.ingredients.length > 4 && <span className="text-gray-600 text-[10px]">+{item.ingredients.length - 4} más</span>}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
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
