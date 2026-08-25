'use client'
import { useEffect, useState } from 'react'
import { Monitor, Copy, ExternalLink, Check, RefreshCw } from 'lucide-react'
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

export default function PantallaConfigPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [interval, setInterval] = useState(10)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    const load = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('category')
        .eq('available', true)
      if (data) {
        const cats = [...new Set(data.map((r: { category: string }) => r.category))]
        setCategories(cats)
        setSelected(new Set(cats))
      }
    }
    load()
  }, [])

  const toggleCat = (cat: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(cat)) { next.delete(cat) } else { next.add(cat) }
      return next
    })
  }

  const allSelected = selected.size === categories.length
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(categories))

  const displayUrl = (() => {
    if (!origin) return ''
    const params = new URLSearchParams()
    params.set('interval', String(interval))
    const orderedSelected = categories.filter(c => selected.has(c))
    if (orderedSelected.length < categories.length) {
      params.set('cats', orderedSelected.join(','))
    }
    return `${origin}/pantalla?${params.toString()}`
  })()

  const copy = async () => {
    await navigator.clipboard.writeText(displayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#006B42' }}>
          <Monitor className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-black text-2xl">Pantalla Digital</h1>
          <p className="text-gray-400 text-sm">Configura el menú para proyectar en TV o pantallas del restaurante</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Config ── */}
        <div className="space-y-5">

          {/* Categorías */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black text-sm">Categorías a mostrar</h2>
              <button onClick={toggleAll} className="text-xs font-bold px-3 py-1 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition">
                {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-800 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={selected.has(cat)}
                    onChange={() => toggleCat(cat)}
                    className="w-4 h-4 accent-[#006B42]"
                  />
                  <span className="text-lg leading-none">{CAT_EMOJI[cat] ?? '🍽️'}</span>
                  <span className="text-gray-200 font-semibold text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Velocidad */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <h2 className="text-white font-black text-sm mb-4">Tiempo por categoría</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={interval}
                onChange={e => setInterval(Number(e.target.value))}
                className="flex-1 accent-[#006B42]"
              />
              <div className="bg-gray-800 rounded-xl px-4 py-2 text-white font-black text-lg min-w-[72px] text-center">
                {interval}s
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {interval < 8 ? 'Rotación rápida' : interval < 15 ? 'Velocidad normal' : 'Rotación lenta — ideal si hay pocos clientes'}
            </p>
          </div>
        </div>

        {/* ── URL + Preview ── */}
        <div className="space-y-5">

          {/* URL generada */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <h2 className="text-white font-black text-sm mb-3">URL para la pantalla</h2>
            <div className="bg-gray-800 rounded-xl p-3 mb-3 break-all">
              <p className="text-green-400 font-mono text-xs leading-relaxed">{displayUrl}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copy}
                disabled={!displayUrl || selected.size === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm text-white disabled:opacity-40 transition hover:opacity-90"
                style={{ backgroundColor: '#006B42' }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiada!' : 'Copiar URL'}
              </button>
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir
              </a>
            </div>
            {selected.size === 0 && (
              <p className="text-red-400 text-xs font-semibold mt-2">Selecciona al menos una categoría</p>
            )}
          </div>

          {/* Instrucciones */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <h2 className="text-white font-black text-sm mb-4">Cómo usarlo</h2>
            <ol className="space-y-3">
              {[
                'Configura las categorías y velocidad de rotación',
                'Copia la URL y ábrela en el navegador de la pantalla o TV',
                'Pon el navegador en pantalla completa (F11 en Windows/Linux, Cmd+Shift+F en Mac)',
                'Los precios se actualizan automáticamente desde el dashboard — sin recargar',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-400">
                  <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-black text-xs text-white mt-0.5" style={{ backgroundColor: '#006B42' }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-yellow-300 text-xs font-semibold leading-relaxed">
                Al cambiar un precio desde <strong>Menú</strong>, la pantalla se actualiza sola en tiempo real gracias a Supabase Realtime. No necesitas recargar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
