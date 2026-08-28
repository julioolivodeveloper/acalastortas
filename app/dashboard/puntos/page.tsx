'use client'
import { useEffect, useState } from 'react'
import { Star, Plus, Pencil, Trash2, Check, Power, Gift, Percent, DollarSign, Save, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

type RewardType = 'discount_percent' | 'free_item' | 'cash'

type LoyaltyConfig = {
  id: number
  points_per_dollar: number
  point_value_cents: number
  min_redeem_points: number
  active: boolean
}

type Reward = {
  id: string
  title: string
  description: string
  type: RewardType
  points_cost: number
  discount_percent: number
  item_ids: string[]
  emoji: string
  active: boolean
  created_at: string
}

type MenuItem = { id: string; name: string; category: string; price: number }

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: LoyaltyConfig = {
  id: 1,
  points_per_dollar: 1,
  point_value_cents: 1,
  min_redeem_points: 100,
  active: true,
}

const EMPTY_REWARD: Omit<Reward, 'id' | 'created_at'> = {
  title: '',
  description: '',
  type: 'discount_percent',
  points_cost: 100,
  discount_percent: 10,
  item_ids: [],
  emoji: '🎁',
  active: true,
}

const REWARD_TYPES: { key: RewardType; label: string; desc: string }[] = [
  { key: 'discount_percent', label: 'Descuento %',    desc: '% de descuento en platillos seleccionados' },
  { key: 'free_item',        label: 'Platillo Gratis', desc: 'El cliente recibe un platillo sin costo' },
  { key: 'cash',             label: 'Descuento $',    desc: 'Dólares de descuento directo en la orden' },
]

const EMOJIS = ['🎁', '⭐', '🔥', '🏆', '💰', '🎉', '🎯', '🌮', '🥖', '🍔', '💥', '🎊', '🧃', '🥤', '🍟', '🎀']

// ── Helpers ───────────────────────────────────────────────────────────────────

function rewardSummary(r: Reward) {
  if (r.type === 'discount_percent') return `${r.discount_percent}% de descuento`
  if (r.type === 'free_item') return r.item_ids.length === 1 ? '1 platillo gratis' : `Platillo gratis`
  if (r.type === 'cash') return `$${(r.points_cost * 0.01).toFixed(2)} de descuento`
  return ''
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PuntosPage() {
  const [config, setConfig]         = useState<LoyaltyConfig>(DEFAULT_CONFIG)
  const [configDraft, setConfigDraft] = useState<LoyaltyConfig>(DEFAULT_CONFIG)
  const [configSaving, setConfigSaving] = useState(false)
  const [configDirty, setConfigDirty] = useState(false)

  const [rewards, setRewards]       = useState<Reward[]>([])
  const [items, setItems]           = useState<MenuItem[]>([])
  const [editing, setEditing]       = useState<Partial<Reward> | null>(null)
  const [isNew, setIsNew]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [catFilter, setCatFilter]   = useState('Todos')

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadConfig()
    loadRewards()
    supabase.from('menu_items').select('id,name,category,price').eq('available', true).order('category')
      .then(({ data }) => { if (data) setItems(data) })
  }, [])

  const loadConfig = async () => {
    const { data } = await supabase.from('loyalty_config').select('*').eq('id', 1).single()
    if (data) {
      setConfig(data)
      setConfigDraft(data)
    }
  }

  const loadRewards = async () => {
    const { data } = await supabase.from('loyalty_rewards').select('*').order('points_cost')
    if (data) setRewards(data)
  }

  // ── Config actions ────────────────────────────────────────────────────────

  const updateDraft = (patch: Partial<LoyaltyConfig>) => {
    setConfigDraft(prev => ({ ...prev, ...patch }))
    setConfigDirty(true)
  }

  const saveConfig = async () => {
    setConfigSaving(true)
    await supabase.from('loyalty_config').upsert(configDraft)
    setConfig(configDraft)
    setConfigDirty(false)
    setConfigSaving(false)
  }

  const toggleProgram = async () => {
    const next = !config.active
    await supabase.from('loyalty_config').update({ active: next }).eq('id', 1)
    setConfig(prev => ({ ...prev, active: next }))
    setConfigDraft(prev => ({ ...prev, active: next }))
  }

  // ── Reward actions ────────────────────────────────────────────────────────

  const saveReward = async () => {
    if (!editing?.title?.trim()) return
    setSaving(true)
    if (editing.id) {
      await supabase.from('loyalty_rewards').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('loyalty_rewards').insert(editing)
    }
    await loadRewards()
    setEditing(null); setIsNew(false); setSaving(false)
  }

  const deleteReward = async (id: string) => {
    if (!confirm('¿Eliminar esta recompensa?')) return
    await supabase.from('loyalty_rewards').delete().eq('id', id)
    setRewards(prev => prev.filter(r => r.id !== id))
  }

  const toggleReward = async (reward: Reward) => {
    await supabase.from('loyalty_rewards').update({ active: !reward.active }).eq('id', reward.id)
    setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, active: !r.active } : r))
  }

  const toggleItem = (id: string) => {
    if (!editing) return
    const ids = editing.item_ids ?? []
    setEditing({ ...editing, item_ids: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] })
  }

  const startNew = () => { setEditing({ ...EMPTY_REWARD }); setIsNew(true) }

  const cats = ['Todos', ...new Set(items.map(m => m.category))]
  const filtered = catFilter === 'Todos' ? items : items.filter(m => m.category === catFilter)

  // ── Preview math ──────────────────────────────────────────────────────────
  const ex10 = (10 * configDraft.points_per_dollar).toFixed(0)
  const ex100val = (100 * configDraft.point_value_cents / 100).toFixed(2)

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#D97706' }}>
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Programa de Puntos</h1>
            <p className="text-gray-400 text-sm">Configura cómo funcionan los puntos y qué pueden canjear los clientes</p>
          </div>
        </div>
        {/* Toggle general del programa */}
        <button
          onClick={toggleProgram}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition ${config.active ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
        >
          {config.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {config.active ? 'Programa Activo' : 'Programa Inactivo'}
        </button>
      </div>

      {/* ── Configuración de valor ─────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-white font-black text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Valor de los Puntos
          </p>
          {configDirty && (
            <button
              onClick={saveConfig}
              disabled={configSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-white text-sm disabled:opacity-50 transition hover:opacity-90"
              style={{ backgroundColor: '#006B42' }}
            >
              <Save className="w-3.5 h-3.5" />
              {configSaving ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Puntos por dólar */}
          <div className="bg-gray-800 rounded-xl p-4">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block">
              Puntos por $1 gastado
            </label>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={configDraft.points_per_dollar}
                onChange={e => updateDraft({ points_per_dollar: parseFloat(e.target.value) || 1 })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-lg font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">Por cada $1 de compra</p>
          </div>

          {/* Valor de cada punto */}
          <div className="bg-gray-800 rounded-xl p-4">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block">
              Valor de cada punto (¢)
            </label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400 shrink-0" />
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={configDraft.point_value_cents}
                onChange={e => updateDraft({ point_value_cents: parseFloat(e.target.value) || 1 })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-lg font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-gray-400 text-sm font-bold">¢</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">Centavos por punto al canjear</p>
          </div>

          {/* Mínimo para canjear */}
          <div className="bg-gray-800 rounded-xl p-4">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block">
              Mínimo para canjear
            </label>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="number"
                min="1"
                step="10"
                value={configDraft.min_redeem_points}
                onChange={e => updateDraft({ min_redeem_points: parseInt(e.target.value) || 100 })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-lg font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">Puntos mínimos para usar rewards</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 flex flex-wrap gap-6">
          <div className="text-center">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">$10 de compra =</p>
            <p className="text-white font-black text-2xl">{ex10} <span className="text-amber-400 text-base">pts</span></p>
          </div>
          <div className="w-px bg-amber-500/20 self-stretch hidden sm:block" />
          <div className="text-center">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">100 puntos valen</p>
            <p className="text-white font-black text-2xl">${ex100val} <span className="text-green-400 text-base">USD</span></p>
          </div>
          <div className="w-px bg-amber-500/20 self-stretch hidden sm:block" />
          <div className="text-center">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Mínimo canjearlo</p>
            <p className="text-white font-black text-2xl">{configDraft.min_redeem_points} <span className="text-amber-400 text-base">pts</span></p>
          </div>
        </div>
      </div>

      {/* ── Recompensas ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" /> Recompensas canjeables
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Define qué pueden obtener los clientes con sus puntos</p>
        </div>
        {!editing && (
          <button
            onClick={startNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90 transition"
            style={{ backgroundColor: '#D97706' }}
          >
            <Plus className="w-4 h-4" /> Nueva Recompensa
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Lista ── */}
        <div className="space-y-3">
          {rewards.length === 0 && !editing && (
            <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-10 text-center">
              <Gift className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-bold text-sm mb-1">Sin recompensas aún</p>
              <p className="text-gray-600 text-xs mb-4">Agrega la primera para que los clientes puedan canjear sus puntos</p>
              <button onClick={startNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90"
                style={{ backgroundColor: '#D97706' }}>
                <Plus className="w-4 h-4" /> Crear Primera Recompensa
              </button>
            </div>
          )}

          {rewards.map(reward => (
            <div key={reward.id}
              className={`bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition ${!reward.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3 p-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-amber-500/15">
                  {reward.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-black text-sm">{reward.title}</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white bg-amber-600">
                      {reward.points_cost} pts
                    </span>
                    {!reward.active && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">Pausada</span>
                    )}
                  </div>
                  <p className="text-amber-400 text-xs font-bold mt-0.5">{rewardSummary(reward)}</p>
                  {reward.description && (
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{reward.description}</p>
                  )}
                  <p className="text-gray-600 text-[11px] mt-1">
                    {reward.type === 'discount_percent' && (
                      reward.item_ids.length === 0
                        ? 'Aplica a todo el menú'
                        : `${reward.item_ids.length} platillo${reward.item_ids.length > 1 ? 's' : ''} seleccionados`
                    )}
                    {reward.type === 'free_item' && (
                      reward.item_ids.length === 0 ? 'Cualquier platillo' : `${reward.item_ids.length} platillo${reward.item_ids.length > 1 ? 's' : ''} elegibles`
                    )}
                    {reward.type === 'cash' && `Equivale a $${(reward.points_cost * configDraft.point_value_cents / 100).toFixed(2)} USD`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 px-4 pb-4">
                <button onClick={() => toggleReward(reward)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition ${reward.active ? 'border-green-800/40 text-green-400 hover:bg-green-900/20' : 'border-gray-700 text-gray-500 hover:text-white'}`}>
                  <Power className="w-3 h-3" />
                  {reward.active ? 'Activa' : 'Inactiva'}
                </button>
                <button onClick={() => { setEditing({ ...reward }); setIsNew(false) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border border-gray-700 text-gray-400 hover:text-white transition">
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => deleteReward(reward.id)}
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
            <h3 className="text-white font-black text-base">{isNew ? 'Nueva Recompensa' : 'Editar Recompensa'}</h3>

            {/* Tipo */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de recompensa</label>
              <div className="space-y-2">
                {REWARD_TYPES.map(t => (
                  <button key={t.key} onClick={() => setEditing({ ...editing, type: t.key })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${editing.type === t.key ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${editing.type === t.key ? 'bg-amber-500' : 'bg-gray-800'}`}>
                      {t.key === 'discount_percent' && <Percent className="w-4 h-4 text-white" />}
                      {t.key === 'free_item' && <Gift className="w-4 h-4 text-white" />}
                      {t.key === 'cash' && <DollarSign className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className={`font-black text-sm ${editing.type === t.key ? 'text-white' : 'text-gray-300'}`}>{t.label}</p>
                      <p className="text-gray-500 text-[11px]">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">Nombre de la recompensa</label>
              <input value={editing.title ?? ''}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                placeholder="Ej: 15% en tortas · Torta Gratis · $2 de descuento"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Costo en puntos */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">
                Costo en puntos <span className="text-amber-400 normal-case font-normal ml-1">⭐ {editing.points_cost ?? 100} pts</span>
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {[50, 100, 150, 200, 300, 500, 1000].map(n => (
                  <button key={n} onClick={() => setEditing({ ...editing, points_cost: n })}
                    className={`px-3 py-1.5 rounded-xl font-black text-sm transition ${editing.points_cost === n ? 'text-white bg-amber-600' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    {n}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={editing.points_cost ?? 100}
                onChange={e => setEditing({ ...editing, points_cost: parseInt(e.target.value) || 100 })}
                placeholder="O escribe un número personalizado"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Descuento % — solo si tipo es discount_percent */}
            {editing.type === 'discount_percent' && (
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Porcentaje de descuento — <span className="text-white">{editing.discount_percent ?? 10}%</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 15, 20, 25, 30, 50].map(n => (
                    <button key={n} onClick={() => setEditing({ ...editing, discount_percent: n })}
                      className={`px-3 py-1.5 rounded-xl font-black text-sm transition ${editing.discount_percent === n ? 'text-white bg-amber-600' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
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
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${editing.emoji === e ? 'bg-gray-600 ring-2 ring-amber-400' : 'bg-gray-800 hover:bg-gray-700'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">
                Descripción <span className="text-gray-600 normal-case font-normal">(opcional)</span>
              </label>
              <textarea value={editing.description ?? ''}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                placeholder="Ej: Válido lunes y martes · Solo en platillos del día"
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Platillos — para descuento o free_item */}
            {(editing.type === 'discount_percent' || editing.type === 'free_item') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    {editing.type === 'free_item' ? 'Platillos elegibles' : 'Aplicar a platillos'}
                  </label>
                  {(editing.item_ids?.length ?? 0) > 0 && (
                    <button onClick={() => setEditing({ ...editing, item_ids: [] })}
                      className="text-[11px] text-gray-500 hover:text-white transition font-bold">
                      {editing.item_ids!.length} sel. · limpiar
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-xs mb-2">Deja vacío para aplicar a todo el menú</p>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {cats.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${catFilter === c ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      style={catFilter === c ? { backgroundColor: '#D97706' } : {}}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {filtered.map(m => {
                    const sel = editing.item_ids?.includes(m.id) ?? false
                    return (
                      <button key={m.id} onClick={() => toggleItem(m.id)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition text-left ${sel ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${sel ? 'border-amber-500 bg-amber-500' : 'border-gray-600'}`}>
                          {sel && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-gray-200 text-xs font-semibold flex-1 truncate">{m.name}</span>
                        <span className="text-gray-500 text-[11px] shrink-0">${m.price.toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Activa */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-black text-sm">Visible para clientes</p>
                <p className="text-gray-500 text-xs">{editing.active ? 'Los clientes pueden canjearla' : 'Oculta temporalmente'}</p>
              </div>
              <button onClick={() => setEditing({ ...editing, active: !editing.active })}
                className={`w-12 h-6 rounded-full transition-all relative ${editing.active ? 'bg-amber-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${editing.active ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Resumen de lo que ven los clientes */}
            {editing.title && (
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
                <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">Vista previa para el cliente</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{editing.emoji}</span>
                  <div>
                    <p className="text-white text-sm font-black">{editing.title}</p>
                    <p className="text-amber-400 text-xs font-bold">
                      ⭐ {editing.points_cost} puntos
                      {editing.type === 'discount_percent' && ` → ${editing.discount_percent}% OFF`}
                      {editing.type === 'free_item' && ` → Gratis`}
                      {editing.type === 'cash' && ` → $${((editing.points_cost ?? 0) * configDraft.point_value_cents / 100).toFixed(2)} off`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 pt-1">
              <button onClick={saveReward} disabled={saving || !editing.title?.trim()}
                className="flex-1 py-2.5 rounded-xl font-black text-white text-sm hover:opacity-90 disabled:opacity-40 transition"
                style={{ backgroundColor: '#D97706' }}>
                {saving ? 'Guardando...' : isNew ? 'Crear Recompensa' : 'Guardar Cambios'}
              </button>
              <button onClick={() => { setEditing(null); setIsNew(false) }}
                className="px-4 py-2.5 rounded-xl font-black text-sm border border-gray-700 text-gray-400 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
