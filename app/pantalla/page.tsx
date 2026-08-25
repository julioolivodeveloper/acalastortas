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

function gridLayout(count: number) {
  if (count <= 3) return { cols: count, rows: 1, show: count }
  if (count <= 8) return { cols: 4, rows: 2, show: Math.min(count, 8) }
  return { cols: 4, rows: 3, show: 12 }
}

function PantallaContent() {
  const params = useSearchParams()
  const intervalSec = Math.max(5, parseInt(params.get('interval') ?? '10'))
  const catsParam = params.get('cats')

  const [items, setItems] = useState<DbMenuItem[]>([])
  const [catIdx, setCatIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  const [time, setTime] = useState('')

  // Load items + realtime
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
      if (data) setItems(data)
    }
    load()
    const ch = supabase.channel('pantalla-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }))
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  // Derive category list
  const allCats = [...new Set(items.map(i => i.category))]
  const cats = catsParam
    ? catsParam.split(',').map(c => c.trim()).filter(c => allCats.includes(c))
    : allCats
  const safeCats = cats.length > 0 ? cats : allCats

  // Rotation
  useEffect(() => {
    if (safeCats.length === 0) return
    const ms = intervalSec * 1000
    let elapsed = 0
    const tick = 80
    const id = setInterval(() => {
      elapsed += tick
      setProgress(Math.min((elapsed / ms) * 100, 100))
      if (elapsed >= ms) {
        elapsed = 0
        setVisible(false)
        setTimeout(() => {
          setCatIdx(prev => (prev + 1) % safeCats.length)
          setProgress(0)
          setVisible(true)
        }, 500)
      }
    }, tick)
    return () => clearInterval(id)
  }, [safeCats.length, intervalSec])

  const currentCat = safeCats[catIdx % safeCats.length] ?? safeCats[0]
  const catItems = items.filter(i => i.category === currentCat)
  const color = CAT_COLOR[currentCat] ?? '#006B42'
  const emoji = CAT_EMOJI[currentCat] ?? '🍽️'
  const { cols, rows, show } = gridLayout(catItems.length)
  const display = catItems.slice(0, show)

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col select-none" style={{ backgroundColor: '#0d0d0d', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-10 shrink-0" style={{ height: 80, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" style={{ height: 52, width: 52, borderRadius: 14, objectFit: 'cover' }} />
          <div>
            <p style={{ color: 'white', fontWeight: 900, fontSize: 22, lineHeight: 1.1 }}>¡Acá Las Tortas! Y Más...</p>
            <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>Socorro, TX · Menú Digital</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#4b5563', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Pickup Online</p>
            <p style={{ color: '#006B42', fontWeight: 800, fontSize: 13 }}>acalastortas-lake.vercel.app</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'white', fontWeight: 900, fontSize: 38, lineHeight: 1 }}>{time}</p>
            <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Precios en USD</p>
          </div>
        </div>
      </header>

      {/* ── Category bar ── */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingLeft: 40,
          paddingRight: 40,
          borderBottom: `3px solid ${color}`,
          backgroundColor: color + '12',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 32 }}>{emoji}</span>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 30, margin: 0, letterSpacing: -0.5 }}>{currentCat}</h1>
        <p style={{ color: color, fontWeight: 700, fontSize: 14, marginLeft: 4 }}>{catItems.length} opciones</p>

        {/* Progress bar */}
        <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginLeft: 16, marginRight: 16 }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: color, borderRadius: 99, transition: 'width 0.08s linear' }} />
        </div>

        {/* Category dots */}
        {safeCats.length > 1 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {safeCats.map((c, i) => (
              <div key={c} style={{
                width: i === catIdx % safeCats.length ? 24 : 8,
                height: 8,
                borderRadius: 99,
                backgroundColor: i === catIdx % safeCats.length ? color : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Items grid ── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 14,
          padding: 16,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          overflow: 'hidden',
        }}
      >
        {display.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Image */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
              <img
                src={item.image ?? '/logo.png'}
                alt={item.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Price badge overlaid on image */}
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: color,
                color: 'white',
                fontWeight: 900,
                fontSize: rows === 1 ? 28 : rows === 2 ? 22 : 18,
                padding: '4px 12px',
                borderRadius: 99,
                lineHeight: 1.4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                ${item.price.toFixed(2)}
              </div>
            </div>

            {/* Name */}
            <div style={{
              padding: rows === 1 ? '12px 14px' : '8px 12px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              flexShrink: 0,
            }}>
              <p style={{
                color: 'white',
                fontWeight: 900,
                fontSize: rows === 1 ? 22 : rows === 2 ? 17 : 14,
                lineHeight: 1.2,
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {item.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 40,
        paddingRight: 40,
        backgroundColor: '#000',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <p style={{ color: '#4b5563', fontSize: 13, fontWeight: 600 }}>
          📍 10076 N Loop Dr, Socorro TX 79927
        </p>
        <p style={{ color: '#4b5563', fontSize: 13, fontWeight: 600 }}>
          ☎ (915) 858-8226  ·  Lun–Dom 8:00am – 10:00pm
        </p>
        <p style={{ color: '#006B42', fontSize: 13, fontWeight: 700 }}>
          🌐 Ordena Online · acalastortas-lake.vercel.app
        </p>
      </footer>
    </div>
  )
}

export default function PantallaPage() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d0d0d' }} />}>
      <PantallaContent />
    </Suspense>
  )
}
