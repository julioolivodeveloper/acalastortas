'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { DbMenuItem } from '@/lib/supabase'

const CAT_COLOR: Record<string, string> = {
  'Tortas':          '#C61620',
  'Hamburguesas':    '#D97706',
  'Burritos':        '#7C3AED',
  'Tacos':           '#059669',
  'Quesadillas':     '#DC2626',
  'Flautas y Pollo': '#EA580C',
  'Menú Kids':       '#DB2777',
  'Bebidas':         '#0284C7',
}
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

// ── Shared header / footer ──────────────────────────────────────────────────
function Header({ time }: { time: string }) {
  return (
    <header style={{
      height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 36px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/logo.png" alt="" style={{ height: 48, width: 48, borderRadius: 12, objectFit: 'cover' }} />
        <div>
          <p style={{ color: 'white', fontWeight: 900, fontSize: 20, lineHeight: 1.1, margin: 0 }}>¡Acá Las Tortas! Y Más...</p>
          <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, margin: 0 }}>Socorro, TX · Menú Digital</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <p style={{ color: '#006B42', fontWeight: 700, fontSize: 13, margin: 0 }}>🌐 acalastortas-lake.vercel.app</p>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'white', fontWeight: 900, fontSize: 34, lineHeight: 1, margin: 0 }}>{time}</p>
          <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>Precios en USD</p>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer style={{
      height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 36px', backgroundColor: '#000', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
    }}>
      <p style={{ color: '#4b5563', fontSize: 12, fontWeight: 600, margin: 0 }}>📍 10076 N Loop Dr, Socorro TX 79927</p>
      <p style={{ color: '#4b5563', fontSize: 12, fontWeight: 600, margin: 0 }}>☎ (915) 858-8226  ·  Lun–Dom 8:00am – 10:00pm</p>
      <p style={{ color: '#4b5563', fontSize: 12, fontWeight: 600, margin: 0 }}>Ordena Online · Pickup · Sin Esperar</p>
    </footer>
  )
}

// ── Item card (shared) ──────────────────────────────────────────────────────
function ItemCard({ item, color, compact = false }: { item: DbMenuItem; color: string; compact?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: compact ? 12 : 16,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.07)',
      height: '100%',
    }}>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <img
          src={item.image ?? '/logo.png'}
          alt={item.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', top: 7, right: 7,
          backgroundColor: color, color: 'white', fontWeight: 900,
          fontSize: compact ? 14 : 18, padding: compact ? '2px 8px' : '3px 11px',
          borderRadius: 99, boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          ${item.price.toFixed(2)}
        </div>
      </div>
      <div style={{ padding: compact ? '6px 8px' : '8px 10px', backgroundColor: 'rgba(0,0,0,0.65)', flexShrink: 0 }}>
        <p style={{
          color: 'white', fontWeight: 800, fontSize: compact ? 12 : 15,
          margin: 0, lineHeight: 1.2,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {item.name}
        </p>
      </div>
    </div>
  )
}

// ── MODO ROTACIÓN ───────────────────────────────────────────────────────────
function RotateMode({ allItems, cats, maxItems, intervalSec, time }:
  { allItems: DbMenuItem[]; cats: string[]; maxItems: number; intervalSec: number; time: string }) {

  const [catIdx, setCatIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (cats.length === 0) return
    const ms = intervalSec * 1000
    let elapsed = 0
    const tick = 80
    const id = window.setInterval(() => {
      elapsed += tick
      setProgress(Math.min((elapsed / ms) * 100, 100))
      if (elapsed >= ms) {
        elapsed = 0
        setVisible(false)
        setTimeout(() => {
          setCatIdx(prev => (prev + 1) % cats.length)
          setProgress(0)
          setVisible(true)
        }, 450)
      }
    }, tick)
    return () => window.clearInterval(id)
  }, [cats.length, intervalSec])

  const currentCat = cats[catIdx % cats.length] ?? cats[0]
  const catItems = allItems.filter(i => i.category === currentCat)
  const color = CAT_COLOR[currentCat] ?? '#006B42'
  const emoji = CAT_EMOJI[currentCat] ?? '🍽️'

  // Grid layout based on maxItems
  const cols = maxItems <= 3 ? maxItems : maxItems <= 5 ? maxItems : 4
  const rows = Math.ceil(Math.min(catItems.length, maxItems) / cols)
  const display = catItems.slice(0, cols * rows)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d0d0d' }}>
      <Header time={time} />

      {/* Category bar */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center', gap: 14,
        padding: '0 36px', borderBottom: `3px solid ${color}`,
        backgroundColor: color + '10', flexShrink: 0,
      }}>
        <span style={{ fontSize: 28 }}>{emoji}</span>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 28, margin: 0 }}>{currentCat}</h1>
        <p style={{ color: color, fontWeight: 700, fontSize: 13, margin: 0 }}>{catItems.length} opciones</p>
        <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', margin: '0 16px' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: color, borderRadius: 99, transition: 'width 0.08s linear' }} />
        </div>
        {cats.length > 1 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {cats.map((_, i) => (
              <div key={i} style={{
                width: i === catIdx % cats.length ? 22 : 8, height: 8, borderRadius: 99,
                backgroundColor: i === catIdx % cats.length ? color : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: 12, padding: 14, overflow: 'hidden',
        opacity: visible ? 1 : 0, transition: 'opacity 0.45s ease',
      }}>
        {display.map(item => (
          <ItemCard key={item.id} item={item} color={color} />
        ))}
      </div>

      <Footer />
    </div>
  )
}

// ── MODO ESTÁTICO ───────────────────────────────────────────────────────────
function StaticMode({ allItems, cats, maxItems, catCols, time }:
  { allItems: DbMenuItem[]; cats: string[]; maxItems: number; catCols: number; time: string }) {

  const catRows = Math.ceil(cats.length / catCols)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d0d0d' }}>
      <Header time={time} />

      {/* All categories grid */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: `repeat(${catCols}, 1fr)`,
        gridTemplateRows: `repeat(${catRows}, 1fr)`,
        gap: 10, padding: 10, overflow: 'hidden',
      }}>
        {cats.map(cat => {
          const color = CAT_COLOR[cat] ?? '#006B42'
          const emoji = CAT_EMOJI[cat] ?? '🍽️'
          const catItems = allItems.filter(i => i.category === cat).slice(0, maxItems)
          // Items per row within each category section
          const itemCols = catItems.length

          return (
            <div key={cat} style={{
              display: 'flex', flexDirection: 'column',
              border: `1px solid ${color}30`,
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', backgroundColor: color + '18',
                borderBottom: `2px solid ${color}`, flexShrink: 0,
              }}>
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <p style={{ color: 'white', fontWeight: 900, fontSize: 15, margin: 0 }}>{cat}</p>
                <span style={{ color: color, fontSize: 11, fontWeight: 700, marginLeft: 4 }}>{catItems.length} opciones</span>
              </div>
              {/* Items row */}
              <div style={{
                flex: 1, display: 'grid',
                gridTemplateColumns: `repeat(${itemCols}, 1fr)`,
                gap: 8, padding: 8, minHeight: 0,
              }}>
                {catItems.map(item => (
                  <ItemCard key={item.id} item={item} color={color} compact />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Footer />
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────
function PantallaContent() {
  const params = useSearchParams()
  const mode     = params.get('mode') ?? 'rotate'
  const intervalSec = Math.max(5, parseInt(params.get('interval') ?? '10'))
  const maxItems = Math.max(1, parseInt(params.get('items') ?? '8'))
  const catCols  = Math.max(1, parseInt(params.get('catcols') ?? '2'))
  const catsParam = params.get('cats')

  const [allItems, setAllItems] = useState<DbMenuItem[]>([])
  const [time, setTime] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('available', true).order('category')
      if (data) setAllItems(data)
    }
    load()
    const ch = supabase.channel('pantalla-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }))
    tick()
    const id = window.setInterval(tick, 10000)
    return () => window.clearInterval(id)
  }, [])

  const allCats = [...new Set(allItems.map(i => i.category))]
  const cats = catsParam
    ? catsParam.split(',').map(c => c.trim()).filter(c => allCats.includes(c))
    : allCats
  const displayCats = cats.length > 0 ? cats : allCats

  if (allItems.length === 0) {
    return <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #006B42', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  }

  if (mode === 'static') {
    return <StaticMode allItems={allItems} cats={displayCats} maxItems={maxItems} catCols={catCols} time={time} />
  }
  return <RotateMode allItems={allItems} cats={displayCats} maxItems={maxItems} intervalSec={intervalSec} time={time} />
}

export default function PantallaPage() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d0d0d' }} />}>
      <PantallaContent />
    </Suspense>
  )
}
