'use client'
import { useEffect, useState } from 'react'
import { Tag, Plus, Pencil, Trash2, Power, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type PromoType = 'discount' | '2x1' | 'combo' | 'custom'

type Promo = {
  id: string
  title: string
  description: string
  type: PromoType
  discount_percent: number
  item_ids: string[]
  active: boolean
  emoji: string
  badge_color: string
  created_at: string
}

type MenuItem = { id: string; name: string; category: string; price: number }

const EMPTY: Omit<Promo, 'id' | 'created_at'> = {
  title: '', description: '', type: 'discount',
  discount_percent: 10, item_ids: [], active: true,
  emoji: '🔥', badge_color: '#C61620',
}

const TYPES: { key: PromoType; label: string; desc: string }[] = [
  { key: 'discount', label: 'Descuento %',   desc: '% de descuento en platillos seleccionados' },
  { key: '2x1',     label: '2 × 1',          desc: 'Lleva 2 y paga 1 en los platillos seleccionados' },
  { key: 'combo',   label: 'Combo',           desc: 'Bundle de platillos a precio especial' },
  { key: 'custom',  label: 'Personalizado',   desc: 'Define tu propia descripción' },
]

const COLORS = ['#C61620', '#006B42', '#D97706', '#7C3AED', '#0284C7', '#DB2777', '#111827', '#EA580C']
const EMOJIS = ['🔥', '⭐', '🎉', '💥', '🏆', '🎁', '🌮', '🥖', '💰', '⚡', '🎯', '🍔']

function badgeLabel(type: PromoType, pct: number) {
  if (type === 'discount') return `${pct}% OFF`
  if (type === '2x1') return '2 × 1'
  if (type === 'combo') return 'Combo'
  return 'Promo'
}

export default function PromocionesPage() {
  const [promos,    setPromos]    = useState<Promo[]>([])
  const [items,     setItems]     = useState<MenuItem[]>([])
  const [editing,   setEditing]   = useState<Partial<Promo> | null>(null)
  const [isNew,     setIsNew]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [catFilter, setCatFilter] = useState('Todos')

  const load = async () => {
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
    if (data) setPromos(data)
  }

  useEffect(() => {
    load()
    supabase.from('menu_items').select('id,name,category,price').eq('available', true).order('category')
      .then(({ data }) => { if (data) setItems(data) })
  }, [])

  const save = async () => {
    if (!editing?.title?.trim()) return
    setSaving(true)
    if (editing.id) {
      await supabase.from('promotions').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('promotions').insert(editing)
    }
    await load()
    setEditing(null); setIsNew(false); setSaving(false)
  }

  const del = async (id: string) => {
    await supabase.from('promotions').delete().eq('id', id)
    setPromos(p => p.filter(x => x.id !== id))
  }

  const toggleActive = async (promo: Promo) => {
    await supabase.from('promotions').update({ active: !promo.active }).eq('id', promo.id)
    setPromos(p => p.map(x => x.id === promo.id ? { ...x, active: !x.active } : x))
  }

  const toggleItem = (id: string) => {
    if (!editing) return
    const ids = editing.item_ids ?? []
    setEditing({ ...editing, item_ids: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] })
  }

  const cats = ['Todos', ...new Set(items.map(m => m.category))]
  const filtered = catFilter === 'Todos' ? items : items.filter(m => m.category === catFilter)

  const startNew = () => { setEditing({ ...EMPTY }); setIsNew(true) }

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C61620' }}>
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Promociones</h1>
            <p className="text-gray-400 text-sm">Descuentos y ofertas que se muestran automáticamente en el menú</p>
          </div>
        </div>
        {!editing && (
          <button onClick={startNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
            style={{ backgroundColor: '#C61620' }}>
            <Plus className="w-4 h-4" /> Nueva Promoción
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Lista ── */}
        <div className="space-y-3">
          {promos.length === 0 && !editing && (
            <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-10 text-center">
              <Tag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-bold text-sm mb-1">Sin promociones aún</p>
              <p className="text-gray-600 text-xs mb-4">Crea una y aparecerá automáticamente en el menú mostrando "Coming Soon" mientras no haya</p>
              <button onClick={startNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90"
                style={{ backgroundColor: '#C61620' }}>
                <Plus className="w-4 h-4" /> Crear Primera Promoción
              </button>
            </div>
          )}

          {promos.map(promo => (
            <div key={promo.id}
              className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 transition ${!promo.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: promo.badge_color + '20' }}>
                  {promo.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-black text-sm">{promo.title}</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: promo.badge_color }}>
                      {badgeLabel(promo.type, promo.discount_percent)}
                    </span>
                    {!promo.active && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">Pausada</span>
                    )}
                  </div>
                  {promo.description && (
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{promo.description}</p>
                  )}
                  <p className="text-gray-600 text-[11px] mt-1">
                    {promo.item_ids.length === 0
                      ? 'Aplica a todo el menú'
                      : `${promo.item_ids.length} platillo${promo.item_ids.length > 1 ? 's' : ''} seleccionados`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleActive(promo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition ${promo.active ? 'border-green-800/40 text-green-400 hover:bg-green-900/20' : 'border-gray-700 text-gray-500 hover:text-white'}`}>
                  <Power className="w-3 h-3" />
                  {promo.active ? 'Activa' : 'Inactiva'}
                </button>
                <button onClick={() => { setEditing({ ...promo }); setIsNew(false) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border border-gray-700 text-gray-400 hover:text-white transition">
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => del(promo.id)}
                  className="ml-auto px-3 py-1.5 rounded-xl text-xs border border-red-900/40 text-red-500 hover:bg-red-900/20 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Formulario ── */}
        {editing && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-5 h-fit">
            <h3 className="text-white font-black text-base">{isNew ? 'Nueva Promoción' : 'Editar Promoción'}</h3>

            {/* Tipo */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de promoción</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button key={t.key} onClick={() => setEditing({ ...editing, type: t.key })}
                    className={`flex flex-col gap-0.5 p-3 rounded-xl border text-left transition ${editing.type === t.key ? 'border-[#C61620] bg-[#C61620]/10' : 'border-gray-700 hover:border-gray-600'}`}>
                    <p className={`font-black text-sm ${editing.type === t.key ? 'text-white' : 'text-gray-300'}`}>{t.label}</p>
                    <p className="text-gray-500 text-[11px] leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">Título</label>
              <input value={editing.title ?? ''}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                placeholder="Ej: 2x1 en Tortas los Lunes"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C61620]"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">Descripción <span className="text-gray-600 normal-case font-normal">(opcional)</span></label>
              <textarea value={editing.description ?? ''}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                placeholder="Ej: Válido lunes de 11am a 3pm · Solo en sucursal"
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C61620] resize-none"
              />
            </div>

            {/* Porcentaje — solo si tipo es discount */}
            {editing.type === 'discount' && (
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Descuento — <span className="text-white">{editing.discount_percent ?? 10}%</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 15, 20, 25, 30, 50].map(n => (
                    <button key={n} onClick={() => setEditing({ ...editing, discount_percent: n })}
                      className={`px-3 py-1.5 rounded-xl font-black text-sm transition ${editing.discount_percent === n ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      style={editing.discount_percent === n ? { backgroundColor: '#C61620' } : {}}>
                      {n}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Emoji */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEditing({ ...editing, emoji: e })}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${editing.emoji === e ? 'bg-gray-600 ring-2 ring-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Color del badge</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setEditing({ ...editing, badge_color: c })}
                    className={`w-8 h-8 rounded-full transition ${editing.badge_color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Activa */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-black text-sm">Visible en el menú</p>
                <p className="text-gray-500 text-xs">{editing.active ? 'Los clientes pueden verla' : 'Oculta para los clientes'}</p>
              </div>
              <button onClick={() => setEditing({ ...editing, active: !editing.active })}
                className={`w-12 h-6 rounded-full transition-all relative ${editing.active ? 'bg-[#006B42]' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${editing.active ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Selector de platillos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Platillos</label>
                {(editing.item_ids?.length ?? 0) > 0 && (
                  <button onClick={() => setEditing({ ...editing, item_ids: [] })}
                    className="text-[11px] text-gray-500 hover:text-white transition font-bold">
                    {editing.item_ids!.length} seleccionados · limpiar
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-xs mb-2">Deja vacío para aplicar a todo el menú</p>
              {/* Filtro de categoría */}
              <div className="flex gap-1.5 flex-wrap mb-2">
                {cats.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${catFilter === c ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    style={catFilter === c ? { backgroundColor: '#006B42' } : {}}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {filtered.map(m => {
                  const sel = editing.item_ids?.includes(m.id) ?? false
                  return (
                    <button key={m.id} onClick={() => toggleItem(m.id)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition text-left ${sel ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${sel ? 'border-[#C61620]' : 'border-gray-600'}`}
                        style={sel ? { backgroundColor: '#C61620' } : {}}>
                        {sel && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-gray-200 text-xs font-semibold flex-1 truncate">{m.name}</span>
                      <span className="text-gray-500 text-[11px] font-semibold shrink-0">${m.price.toFixed(2)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving || !editing.title?.trim()}
                className="flex-1 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90 disabled:opacity-40 transition"
                style={{ backgroundColor: '#C61620' }}>
                {saving ? 'Guardando...' : isNew ? 'Crear Promoción' : 'Guardar Cambios'}
              </button>
              <button onClick={() => { setEditing(null); setIsNew(false) }}
                className="px-4 py-2.5 rounded-xl font-black text-sm border border-gray-700 text-gray-400 hover:text-white transition">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Preview — cuando no hay formulario abierto */}
        {!editing && promos.filter(p => p.active).length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Vista previa en el menú</p>
            <div className="space-y-2">
              {promos.filter(p => p.active).slice(0, 4).map(promo => (
                <div key={promo.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: promo.badge_color + '15', border: `1px solid ${promo.badge_color}30` }}>
                  <span className="text-2xl shrink-0">{promo.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-black text-sm">{promo.title}</p>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shrink-0"
                        style={{ backgroundColor: promo.badge_color }}>
                        {badgeLabel(promo.type, promo.discount_percent)}
                      </span>
                    </div>
                    {promo.description && <p className="text-gray-400 text-xs truncate">{promo.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
