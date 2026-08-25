'use client'
import { useEffect, useState } from 'react'
import { Monitor, Copy, ExternalLink, Check, RefreshCw, Plus, Trash2, Tv, RotateCcw, LayoutGrid } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const CAT_EMOJI: Record<string, string> = {
  'Tortas':          '🥖',
  'Hamburguesas':    '🍔',
  'Burritos':        '🌯',
  'Tacos':           '🌮',
  'Quesadillas':     '🧀',
  'Flautas y Pollo': '🍗',
  'Menú Kids':       '⭐',
  'Bebidas':         '🥤',
}

type ScreenConfig = {
  id: string
  name: string
  mode: 'rotate' | 'static'
  cats: string[]
  items: number       // max items per category
  intervalSec: number // rotation only
  catCols: number     // static only: columns of categories
}

const DEFAULT: Omit<ScreenConfig, 'id' | 'name'> = {
  mode: 'rotate', cats: [], items: 8, intervalSec: 10, catCols: 2,
}

function buildUrl(origin: string, cfg: ScreenConfig, allCats: string[]) {
  const p = new URLSearchParams()
  p.set('mode', cfg.mode)
  p.set('items', String(cfg.items))
  if (cfg.mode === 'rotate') p.set('interval', String(cfg.intervalSec))
  if (cfg.mode === 'static') p.set('catcols', String(cfg.catCols))
  const ordered = allCats.filter(c => cfg.cats.includes(c))
  if (ordered.length < allCats.length && ordered.length > 0) p.set('cats', ordered.join(','))
  return `${origin}/pantalla?${p.toString()}`
}

// ── Screen card (list view) ─────────────────────────────────────────────────
function ScreenCard({ cfg, url, onEdit, onDelete, onCopy, copied }:
  { cfg: ScreenConfig; url: string; onEdit: () => void; onDelete: () => void; onCopy: () => void; copied: boolean }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-gray-400" />
          <p className="text-white font-black text-sm">{cfg.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.mode === 'rotate' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
            {cfg.mode === 'rotate' ? '↻ Rotación' : '⊞ Estático'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cfg.cats.slice(0, 6).map(c => (
          <span key={c} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-semibold">
            {CAT_EMOJI[c]} {c}
          </span>
        ))}
        {cfg.cats.length === 0 && <span className="text-[10px] text-gray-500 font-semibold">Todas las categorías</span>}
      </div>

      <div className="flex gap-1.5 text-[11px] text-gray-500 font-semibold">
        <span>{cfg.items} productos/categoría</span>
        {cfg.mode === 'rotate' && <span>· {cfg.intervalSec}s por slide</span>}
        {cfg.mode === 'static' && <span>· {cfg.catCols} columnas</span>}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCopy} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-xs text-white transition hover:opacity-90" style={{ backgroundColor: '#006B42' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? '¡Copiada!' : 'Copiar URL'}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition">
          <ExternalLink className="w-3.5 h-3.5" /> Abrir
        </a>
        <button onClick={onEdit} className="px-3 py-2 rounded-xl text-xs font-black border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition">
          Editar
        </button>
        <button onClick={onDelete} className="px-3 py-2 rounded-xl text-xs border border-red-900/40 text-red-500 hover:bg-red-900/20 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Config form ─────────────────────────────────────────────────────────────
function ConfigForm({ cfg, allCats, onChange, onSave, onCancel, isNew }:
  { cfg: ScreenConfig; allCats: string[]; onChange: (c: ScreenConfig) => void; onSave: () => void; onCancel: () => void; isNew: boolean }) {

  const toggle = (cat: string) => {
    const next = cfg.cats.includes(cat) ? cfg.cats.filter(c => c !== cat) : [...cfg.cats, cat]
    onChange({ ...cfg, cats: next })
  }
  const allSelected = cfg.cats.length === 0 || cfg.cats.length === allCats.length

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-5">
      <h3 className="text-white font-black text-base">{isNew ? 'Nueva Pantalla' : 'Editar Pantalla'}</h3>

      {/* Name */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">Nombre</label>
        <input
          value={cfg.name}
          onChange={e => onChange({ ...cfg, name: e.target.value })}
          placeholder="Ej: Pantalla Principal"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#006B42]"
        />
      </div>

      {/* Mode */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Modo de Display</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'rotate', label: 'Rotación', icon: RotateCcw, desc: 'Una categoría a la vez, cambia automáticamente' },
            { key: 'static', label: 'Estático',  icon: LayoutGrid, desc: 'Todas las categorías visibles al mismo tiempo' },
          ] as const).map(m => (
            <button key={m.key} onClick={() => onChange({ ...cfg, mode: m.key })}
              className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left transition ${cfg.mode === m.key ? 'border-[#006B42] bg-[#006B42]/10' : 'border-gray-700 hover:border-gray-600'}`}>
              <div className="flex items-center gap-2">
                <m.icon className={`w-4 h-4 ${cfg.mode === m.key ? 'text-[#006B42]' : 'text-gray-400'}`} />
                <p className={`font-black text-sm ${cfg.mode === m.key ? 'text-white' : 'text-gray-300'}`}>{m.label}</p>
              </div>
              <p className="text-gray-500 text-[11px] leading-tight">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Categorías</label>
          <button onClick={() => onChange({ ...cfg, cats: allSelected ? [] : [...allCats] })}
            className="text-[11px] font-bold text-gray-500 hover:text-white transition">
            {allSelected ? 'Personalizar' : 'Todas'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {allCats.map(cat => (
            <label key={cat} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${cfg.cats.length === 0 || cfg.cats.includes(cat) ? 'bg-gray-800' : 'bg-gray-850 opacity-50'}`}>
              <input type="checkbox"
                checked={cfg.cats.length === 0 || cfg.cats.includes(cat)}
                onChange={() => toggle(cat)}
                className="accent-[#006B42] w-3.5 h-3.5"
              />
              <span className="text-sm">{CAT_EMOJI[cat] ?? '🍽️'}</span>
              <span className="text-gray-200 text-xs font-semibold truncate">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Items per category */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
          Productos por categoría — <span className="text-white">{cfg.items}</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {(cfg.mode === 'rotate' ? [4, 6, 8, 12, 16] : [2, 3, 4, 5, 6]).map(n => (
            <button key={n} onClick={() => onChange({ ...cfg, items: n })}
              className={`px-4 py-2 rounded-xl font-black text-sm transition ${cfg.items === n ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              style={cfg.items === n ? { backgroundColor: '#006B42' } : {}}>
              {n}
            </button>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-1.5">
          {cfg.mode === 'rotate'
            ? cfg.items <= 4 ? 'Fotos muy grandes — ideal para pocos platillos' : cfg.items <= 8 ? 'Tamaño estándar' : 'Más platillos, fotos más pequeñas'
            : cfg.items <= 3 ? 'Más espacio por foto' : 'Más platillos por fila'}
        </p>
      </div>

      {/* Mode-specific options */}
      {cfg.mode === 'rotate' && (
        <div>
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
            Segundos por categoría — <span className="text-white">{cfg.intervalSec}s</span>
          </label>
          <input type="range" min={5} max={30} step={1} value={cfg.intervalSec}
            onChange={e => onChange({ ...cfg, intervalSec: Number(e.target.value) })}
            className="w-full accent-[#006B42]" />
          <div className="flex justify-between text-xs text-gray-600 mt-0.5">
            <span>5s (rápido)</span><span>30s (lento)</span>
          </div>
        </div>
      )}

      {cfg.mode === 'static' && (
        <div>
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Columnas de categorías</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => onChange({ ...cfg, catCols: n })}
                className={`flex-1 py-2 rounded-xl font-black text-sm transition ${cfg.catCols === n ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                style={cfg.catCols === n ? { backgroundColor: '#006B42' } : {}}>
                {n} {n === 1 ? 'col' : 'cols'}
              </button>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            {cfg.catCols === 1 ? 'Una categoría por fila — usa para pocas categorías' :
             cfg.catCols === 2 ? 'Dos columnas — lo más común para TV 16:9' :
             cfg.catCols === 3 ? 'Tres columnas — ideal para muchas categorías' :
             'Cuatro columnas — pantalla muy ancha o pocas filas'}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onSave}
          className="flex-1 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
          style={{ backgroundColor: '#006B42' }}>
          {isNew ? 'Crear Pantalla' : 'Guardar Cambios'}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 rounded-xl font-black text-sm border border-gray-700 text-gray-400 hover:text-white transition">
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function PantallaConfigPage() {
  const [allCats, setAllCats] = useState<string[]>([])
  const [screens, setScreens] = useState<ScreenConfig[]>([])
  const [editing, setEditing] = useState<ScreenConfig | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [origin, setOrigin] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
    const saved = localStorage.getItem('acatortas-screens')
    if (saved) setScreens(JSON.parse(saved))

    supabase.from('menu_items').select('category').eq('available', true).then(({ data }) => {
      if (data) setAllCats([...new Set(data.map((r: { category: string }) => r.category))])
    })
  }, [])

  const save = (list: ScreenConfig[]) => {
    setScreens(list)
    localStorage.setItem('acatortas-screens', JSON.stringify(list))
  }

  const startNew = () => {
    setEditing({ ...DEFAULT, id: Date.now().toString(), name: `Pantalla ${screens.length + 1}`, cats: [] })
    setIsNew(true)
  }

  const saveEditing = () => {
    if (!editing) return
    if (!editing.name.trim()) return
    const exists = screens.find(s => s.id === editing.id)
    save(exists ? screens.map(s => s.id === editing.id ? editing : s) : [...screens, editing])
    setEditing(null)
    setIsNew(false)
  }

  const deleteScreen = (id: string) => save(screens.filter(s => s.id !== id))

  const copy = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#006B42' }}>
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Pantallas Digitales</h1>
            <p className="text-gray-400 text-sm">Configura el menú para proyectar en TV o monitores del restaurante</p>
          </div>
        </div>
        {!editing && (
          <button onClick={startNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
            style={{ backgroundColor: '#006B42' }}>
            <Plus className="w-4 h-4" /> Nueva Pantalla
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: screen list */}
        <div className="space-y-4">
          {screens.length === 0 && !editing && (
            <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-10 text-center">
              <Tv className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-bold text-sm mb-1">No hay pantallas configuradas</p>
              <p className="text-gray-600 text-xs mb-4">Crea una pantalla para cada TV o monitor de tu restaurante</p>
              <button onClick={startNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90"
                style={{ backgroundColor: '#006B42' }}>
                <Plus className="w-4 h-4" /> Crear Primera Pantalla
              </button>
            </div>
          )}

          {screens.map(cfg => {
            const url = origin ? buildUrl(origin, cfg, allCats) : ''
            return (
              <ScreenCard
                key={cfg.id}
                cfg={cfg}
                url={url}
                onEdit={() => { setEditing({ ...cfg }); setIsNew(false) }}
                onDelete={() => deleteScreen(cfg.id)}
                onCopy={() => copy(cfg.id, url)}
                copied={copiedId === cfg.id}
              />
            )
          })}

          {/* Tip */}
          {screens.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <div className="flex gap-2">
                <RefreshCw className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <p className="text-gray-400 text-xs leading-relaxed">
                  Los precios se actualizan en tiempo real en todas las pantallas. Al cambiar un precio en <strong className="text-white">Menú</strong>, se refleja automáticamente sin recargar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: form or instructions */}
        <div>
          {editing ? (
            <ConfigForm
              cfg={editing}
              allCats={allCats}
              onChange={setEditing}
              onSave={saveEditing}
              onCancel={() => { setEditing(null); setIsNew(false) }}
              isNew={isNew}
            />
          ) : (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <h2 className="text-white font-black text-sm">Cómo usarlo</h2>
              <ol className="space-y-3">
                {[
                  { title: 'Crea una pantalla', desc: 'Configura el modo, categorías y productos. Puedes tener una diferente para cada TV.' },
                  { title: 'Copia la URL', desc: 'Cada pantalla genera una URL única con tu configuración.' },
                  { title: 'Abre en la TV', desc: 'Pega la URL en el navegador de la TV o monitor y ponlo en pantalla completa (F11).' },
                  { title: 'Listo, se actualiza solo', desc: 'Cualquier cambio de precio desde el dashboard se refleja en tiempo real.' },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-black text-xs text-white mt-0.5" style={{ backgroundColor: '#006B42' }}>{i + 1}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{s.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="border-t border-gray-800 pt-4 space-y-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ejemplos de uso</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <p>• <strong className="text-gray-300">Pantalla entrada:</strong> Estático · Tortas + Hamburguesas · 2 cols</p>
                  <p>• <strong className="text-gray-300">Pantalla mostrador:</strong> Rotación · Todo el menú · 8 productos</p>
                  <p>• <strong className="text-gray-300">Pantalla kids:</strong> Estático · Solo Menú Kids + Bebidas · 1 col</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
