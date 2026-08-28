'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import Link from 'next/link'

// ── Types ────────────────────────────────────────────────────────────────────

type BotResponse = {
  text: string
  chips?: string[]
  cta?: { label: string; href: string; external?: boolean }
}

type Message =
  | { from: 'user'; text: string }
  | { from: 'bot'; response: BotResponse }

// ── Responses ────────────────────────────────────────────────────────────────

const MENU_CHIPS = ['🕐 Horarios', '📍 Dirección', '📦 Cómo ordenar', '💳 Pagos', '⭐ Mis puntos']

const GREETING: BotResponse = {
  text: '¡Hola! 👋 Soy el asistente de La Fondita de Mamá. ¿En qué te ayudo?',
  chips: ['📋 Ver el menú', '🕐 Horarios', '📍 Dirección', '📦 Cómo ordenar', '💳 Pagos', '⭐ Mis puntos'],
}

const RESPONSES: { pattern: RegExp; response: BotResponse }[] = [
  {
    pattern: /menu|menú|comida|platillo|torta|burrito|taco|hamburguesa|quesadilla|flauta|bebida|kids/,
    response: {
      text: 'Tenemos tortas, hamburguesas, burritos, tacos, quesadillas, flautas, Menú Kids y bebidas. Mira el menú completo con precios aquí:',
      cta: { label: '📋 Ver Menú Completo', href: '/menu' },
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /horario|hora|abierto|cierra|cuando|abren|cierran|dia/,
    response: {
      text: 'Estamos abiertos todos los días de 8:00 AM a 10:00 PM 🕐',
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /dirección|direccion|donde|ubicacion|ubicación|mapa|llegar|domicilio|address|lugar/,
    response: {
      text: 'Nos encuentras en 10076 N Loop Dr, Socorro, TX 79927 📍',
      cta: { label: '🗺️ Ver en Google Maps', href: 'https://maps.google.com/?q=10076+N+Loop+Dr+Socorro+TX+79927', external: true },
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /orden|ordenar|pedir|pedido|pickup|recoger|como.*ord|cómo.*ord/,
    response: {
      text: 'Puedes ordenar de 3 formas:\n1️⃣ Online para pickup en nuestro sitio\n2️⃣ Por WhatsApp al (915) 858-8226\n3️⃣ En persona en el local',
      cta: { label: '🛒 Ordenar Online', href: '/menu' },
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /whatsapp|mensaje|msj|chat|escribir|escribeme|escríbeme/,
    response: {
      text: 'Escríbenos directo por WhatsApp y te atendemos al momento 💬',
      cta: { label: '💬 Abrir WhatsApp', href: 'https://wa.me/19158588226?text=Hola%2C%20quiero%20ordenar', external: true },
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /pago|tarjeta|efectivo|credito|crédito|debito|débito|cash|pay/,
    response: {
      text: 'Aceptamos efectivo y tarjeta de crédito/débito 💳\nPara pagos online también puedes pagar con tarjeta al ordenar.',
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /punto|puntos|descuento|reward|loyalty|acumul|canje/,
    response: {
      text: 'Por cada dólar que gastas ganas 1 punto ⭐\nAcúmula puntos y canjéalos por descuentos en tus próximas órdenes. Crea tu cuenta para empezar.',
      cta: { label: '⭐ Crear mi cuenta', href: '/cuenta' },
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /delivery|envio|envío|doordash|a domicilio|llevar|entrega/,
    response: {
      text: 'El pickup lo haces directo en el local. Para delivery está disponible por DoorDash 🚗',
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /telefono|teléfono|número|numero|llamar|llama|contacto|contact/,
    response: {
      text: 'Nuestro número es (915) 858-8226 ☎️\nPuedes llamarnos o escribirnos por WhatsApp.',
      cta: { label: '💬 WhatsApp', href: 'https://wa.me/19158588226', external: true },
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /precio|precios|costo|cuanto|cuánto|vale|cuesta/,
    response: {
      text: 'Los precios están en el menú online. ¡Míralo aquí!',
      cta: { label: '📋 Ver Precios', href: '/menu' },
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /gracias|thanks|ty|perfecto|excelente|genial|bien/,
    response: {
      text: '¡Con gusto! 😊 ¿Hay algo más en que te pueda ayudar?',
      chips: MENU_CHIPS,
    },
  },
  {
    pattern: /hola|buenas|hi|buenos|saludos|ola/,
    response: GREETING,
  },
]

const DEFAULT_RESPONSE: BotResponse = {
  text: 'No entendí bien tu pregunta. ¿Te puedo ayudar con algo de esto?',
  chips: ['📋 Ver el menú', '🕐 Horarios', '📍 Dirección', '📦 Cómo ordenar', '💳 Pagos'],
}

// ── Logic ────────────────────────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function getResponse(input: string): BotResponse {
  const q = normalize(input)
  for (const { pattern, response } of RESPONSES) {
    if (pattern.test(q)) return response
  }
  return DEFAULT_RESPONSE
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', response: GREETING },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  function sendText(text: string) {
    if (!text.trim() || typing) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text }])
    setTyping(true)
    setTimeout(() => {
      const response = getResponse(text)
      setMessages(prev => [...prev, { from: 'bot', response }])
      setTyping(false)
    }, 600)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); sendText(input) }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: '#006B42' }}
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ height: 500 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ backgroundColor: '#006B42' }}
          >
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-full object-cover bg-white/20" />
            <div>
              <p className="text-white font-black text-sm leading-tight">La Fondita de Mamá</p>
              <p className="text-green-200 text-xs">Asistente · Respuesta inmediata</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#f9fafb' }}>
            {messages.map((m, i) => (
              <div key={i}>
                {m.from === 'user' ? (
                  <div className="flex justify-end">
                    <div
                      className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                      style={{ backgroundColor: '#006B42', color: 'white', borderBottomRightRadius: 4 }}
                    >
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div
                      className="max-w-[88%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line"
                      style={{ backgroundColor: 'white', color: '#111827', borderBottomLeftRadius: 4, border: '1px solid #e5e7eb' }}
                    >
                      {m.response.text}
                    </div>

                    {m.response.cta && (
                      <div>
                        {m.response.cta.external ? (
                          <a
                            href={m.response.cta.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-bold px-4 py-2 rounded-xl text-white transition hover:opacity-90"
                            style={{ backgroundColor: '#006B42' }}
                          >
                            {m.response.cta.label}
                          </a>
                        ) : (
                          <Link
                            href={m.response.cta.href}
                            className="inline-block text-xs font-bold px-4 py-2 rounded-xl text-white transition hover:opacity-90"
                            style={{ backgroundColor: '#006B42' }}
                            onClick={() => setOpen(false)}
                          >
                            {m.response.cta.label}
                          </Link>
                        )}
                      </div>
                    )}

                    {i === messages.length - 1 && m.response.chips && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {m.response.chips.map(chip => (
                          <button
                            key={chip}
                            onClick={() => sendText(chip)}
                            className="text-xs px-3 py-1.5 rounded-full border font-semibold transition hover:bg-green-50 hover:border-green-600 hover:text-green-700"
                            style={{ borderColor: '#d1d5db', color: '#374151', backgroundColor: 'white' }}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-3 flex gap-1 items-center"
                  style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderBottomLeftRadius: 4 }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 flex gap-2 border-t border-gray-200 flex-shrink-0 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu pregunta..."
              disabled={typing}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600 disabled:opacity-50 transition"
            />
            <button
              onClick={() => sendText(input)}
              disabled={typing || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: '#006B42' }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
