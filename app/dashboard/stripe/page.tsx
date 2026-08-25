'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CreditCard, CheckCircle2, ExternalLink, Pencil, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Status = 'loading' | 'connected' | 'disconnected'

const STEPS = [
  {
    n: 1,
    title: 'Entra a stripe.com',
    desc: 'Si no tienes cuenta, haz clic en "Start now" y llena tus datos. Si ya tienes, inicia sesión.',
    action: { label: 'Ir a Stripe →', href: 'https://stripe.com' },
  },
  {
    n: 2,
    title: 'Ve a Developers → API keys',
    desc: 'En el menú de la izquierda de tu dashboard de Stripe, busca "Developers" y luego "API keys".',
    path: ['stripe.com/dashboard', 'Developers', 'API keys'],
  },
  {
    n: 3,
    title: 'Asegúrate de estar en modo Live',
    desc: 'En la parte superior derecha, cambia el toggle de "Test mode" a modo Live (producción). Las llaves Live empiezan con pk_live_ y sk_live_.',
    warning: 'No uses las llaves de Test — esas no cobran dinero real.',
  },
  {
    n: 4,
    title: 'Copia tus llaves y pégalas abajo',
    desc: 'Copia la "Publishable key" y la "Secret key" (haz clic en "Reveal live key" para verla). Pégalas en el formulario de abajo.',
  },
]

function StripeContent() {
  const router = useRouter()
  const params  = useSearchParams()
  const [status, setStatus]     = useState<Status>('loading')
  const [maskedPk, setMaskedPk] = useState('')
  const [pk, setPk]             = useState('')
  const [sk, setSk]             = useState('')
  const [showSk, setShowSk]     = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editing, setEditing]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['stripe_publishable_key'])
      .then(({ data }) => {
        const rec = data?.find(r => r.key === 'stripe_publishable_key')
        if (rec?.value) {
          setMaskedPk(rec.value.slice(0, 12) + '••••••••••••••••••••••')
          setStatus('connected')
        } else {
          setStatus('disconnected')
        }
      })
  }, [])

  const save = async () => {
    if (!pk.startsWith('pk_live_')) { setError('La Publishable key debe empezar con pk_live_'); return }
    if (!sk.startsWith('sk_live_')) { setError('La Secret key debe empezar con sk_live_'); return }
    setSaving(true); setError('')
    const rows = [
      { key: 'stripe_publishable_key', value: pk.trim() },
      { key: 'stripe_secret_key',      value: sk.trim() },
    ]
    const { error: dbErr } = await supabase.from('app_settings').upsert(rows)
    if (dbErr) { setError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }
    setMaskedPk(pk.slice(0, 12) + '••••••••••••••••••••••')
    setStatus('connected')
    setEditing(false)
    setPk(''); setSk('')
    setSaving(false)
  }

  const showForm = status === 'disconnected' || editing

  return (
    <div className="p-6 max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#635BFF' }}>
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-black text-2xl">Pagos con Stripe</h1>
          <p className="text-gray-400 text-sm">Acepta tarjetas en línea — el dinero va directo a tu cuenta</p>
        </div>
      </div>

      {/* Status pill */}
      {status === 'loading' && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Verificando conexión...</span>
        </div>
      )}

      {status === 'connected' && !editing && (
        <div className="bg-green-900/20 border border-green-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-green-300 font-black text-sm">Stripe conectado</p>
              <p className="text-gray-500 text-xs font-mono mt-0.5">{maskedPk}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border border-gray-700 text-gray-300 hover:text-white transition">
              <ExternalLink className="w-3.5 h-3.5" /> Dashboard
            </a>
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border border-gray-700 text-gray-400 hover:text-white transition">
              <Pencil className="w-3.5 h-3.5" /> Actualizar llaves
            </button>
          </div>
        </div>
      )}

      {/* Guide */}
      {showForm && (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-5">
            <p className="text-white font-black text-sm">Cómo obtener tus llaves de Stripe</p>

            {STEPS.map(step => (
              <div key={step.n} className="flex gap-4">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-black text-xs text-white mt-0.5"
                  style={{ backgroundColor: '#635BFF' }}>
                  {step.n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{step.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{step.desc}</p>

                  {step.path && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {step.path.map((seg, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="text-[11px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">{seg}</span>
                          {i < step.path!.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600" />}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.warning && (
                    <div className="flex items-start gap-2 mt-2 bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                      <p className="text-yellow-300 text-[11px] font-semibold">{step.warning}</p>
                    </div>
                  )}

                  {step.action && (
                    <a href={step.action.href} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-black px-3 py-1.5 rounded-lg text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#635BFF' }}>
                      {step.action.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
            <p className="text-white font-black text-sm">Pega tus llaves aquí</p>

            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">
                Publishable Key <span className="text-gray-600 normal-case font-normal">(empieza con pk_live_)</span>
              </label>
              <input
                value={pk}
                onChange={e => { setPk(e.target.value); setError('') }}
                placeholder="pk_live_..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#635BFF] placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">
                Secret Key <span className="text-gray-600 normal-case font-normal">(empieza con sk_live_)</span>
              </label>
              <div className="relative">
                <input
                  type={showSk ? 'text' : 'password'}
                  value={sk}
                  onChange={e => { setSk(e.target.value); setError('') }}
                  placeholder="sk_live_..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 pr-11 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#635BFF] placeholder:text-gray-600"
                />
                <button onClick={() => setShowSk(!showSk)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-1">Esta llave es privada — no la compartas con nadie.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-xs font-semibold">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving || !pk || !sk}
                className="flex-1 py-2.5 rounded-xl font-black text-white text-sm transition hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#635BFF' }}>
                {saving ? 'Guardando...' : 'Guardar y conectar'}
              </button>
              {editing && (
                <button onClick={() => { setEditing(false); setPk(''); setSk(''); setError('') }}
                  className="px-4 py-2.5 rounded-xl font-black text-sm border border-gray-700 text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Info card when connected */}
      {status === 'connected' && !editing && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Próximo paso</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Stripe está conectado. Cuando quieras activar el botón de pago en el carrito del menú público, dinos y lo activamos en el sitio.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { label: 'Comisión Stripe', value: '2.9% + $0.30' },
              { label: 'Depósitos', value: 'A tu banco' },
              { label: 'Seguridad', value: 'PCI compliant' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-white font-black text-sm">{value}</p>
                <p className="text-gray-500 text-[11px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StripePage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="w-8 h-8 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" /></div>}>
      <StripeContent />
    </Suspense>
  )
}
