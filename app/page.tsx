'use client'
import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Clock, Phone, ExternalLink, Star, ChevronRight, ShoppingBag, ThumbsUp } from 'lucide-react'
import { useAcaTortasStore } from '@/store/store'

const POPULAR_IDS = ['t7', 't3', 'b1', 'ta1', 'q1', 't1']
const DOORDASH_URL = 'https://www.doordash.com/store/aca-las-tortas-el-paso-10076-n-loop-dr-socorro-34404153/'

export default function Home() {
  const { menu, addToCart } = useAcaTortasStore()
  const [added, setAdded] = useState<string | null>(null)
  const popular = menu.filter((m) => POPULAR_IDS.includes(m.id) && m.available)

  const handleAdd = (id: string, item: (typeof menu)[0]) => {
    addToCart(item)
    setAdded(id)
    setTimeout(() => setAdded(null), 1200)
  }

  return (
    <main>

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">
        {/* Background food photo */}
        <div className="absolute inset-0">
          <img src="/hero-bg.webp" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(180,0,0,0.75) 60%, rgba(120,0,0,0.9) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-3xl">
          <img src="/logo.png" alt="Aca Las Tortas" className="h-36 md:h-44 mx-auto mb-6 drop-shadow-2xl" />
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-2 drop-shadow-lg">
            Las Mejores<br />
            <span style={{ color: '#F5C000' }}>Tortas de El Paso</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-lg mx-auto font-semibold">
            Ordena en línea y recoge en ventanilla.<br />¡Sin esperas, sin complicaciones!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-black text-[#111] text-xl shadow-2xl hover:scale-105 transition-transform"
              style={{ backgroundColor: '#F5C000' }}>
              <ShoppingBag className="w-6 h-6" /> Ordenar Ahora — Pickup
            </Link>
            <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-black text-white text-xl border-2 border-white/50 hover:border-white hover:bg-white/10 transition">
              <ExternalLink className="w-5 h-5" /> Delivery — DoorDash
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── INFO BAR ── */}
      <div className="bg-[#111] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {[
            { icon: MapPin, label: 'Dirección', value: '10076 N Loop Dr, Socorro, TX' },
            { icon: Clock, label: 'Horario', value: 'Lun–Sáb: 8am – 9pm' },
            { icon: Phone, label: 'Teléfono', value: '(915) 858-8226' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3 sm:py-0 sm:px-6 first:sm:pl-0">
              <Icon className="w-5 h-5 shrink-0" style={{ color: '#F5C000' }} />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── POPULAR ── */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#CC0000] font-black text-sm uppercase tracking-widest mb-1">Más Pedidos</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Lo Más Popular</h2>
          </div>
          <Link href="/menu" className="flex items-center gap-1 text-[#CC0000] font-bold text-sm hover:underline">
            Ver todo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popular.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div>
                  <h3 className="font-black text-gray-900 text-base leading-tight">{item.name}</h3>
                  <p className="text-[#CC0000] font-black text-xl mt-1">${item.price.toFixed(2)}</p>
                </div>
                <span className="shrink-0 flex items-center gap-0.5 text-yellow-500 text-xs font-bold bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" /> Popular
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.description}</p>
              <button onClick={() => handleAdd(item.id, item)}
                className="w-full py-3 rounded-xl font-black text-sm text-white transition-all"
                style={{ backgroundColor: added === item.id ? '#16A34A' : '#CC0000' }}>
                {added === item.id ? '¡Agregado!' : 'Agregar al Carrito'}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-base shadow-lg hover:scale-105 transition-transform" style={{ backgroundColor: '#CC0000' }}>
            Ver Menú Completo <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── ORDENA Y RECOGE ── */}
      <section className="py-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-80 lg:h-auto">
            <img src="/ordena-recoge.webp" alt="Ordena y Recoge" className="w-full h-full object-cover" />
          </div>
          {/* Content */}
          <div className="flex flex-col justify-center px-8 py-16 lg:px-16" style={{ backgroundColor: '#111' }}>
            <p className="font-black text-sm uppercase tracking-widest mb-3" style={{ color: '#F5C000' }}>Pickup</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              Ordena Online<br />y Recoge<br />
              <span style={{ color: '#F5C000' }}>Sin Esperar</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Haz tu pedido desde el celular, llega al restaurante y paga en ventanilla. Rápido, fácil y sin filas.
            </p>
            <div className="space-y-3 mb-8">
              {[
                { num: '1', text: 'Elige tus platillos favoritos en el menú' },
                { num: '2', text: 'Confirma tu orden con tu nombre y teléfono' },
                { num: '3', text: 'Llega y paga en ventanilla — ¡listo!' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ backgroundColor: '#CC0000', color: 'white' }}>
                    {s.num}
                  </div>
                  <p className="text-gray-300 text-base">{s.text}</p>
                </div>
              ))}
            </div>
            <Link href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[#111] text-base self-start hover:scale-105 transition-transform"
              style={{ backgroundColor: '#F5C000' }}>
              <ShoppingBag className="w-5 h-5" /> Ordenar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* ── AUTOSERVICIO ── */}
      <section className="py-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Content */}
          <div className="flex flex-col justify-center px-8 py-16 lg:px-16 order-2 lg:order-1" style={{ backgroundColor: '#CC0000' }}>
            <p className="font-black text-sm uppercase tracking-widest mb-3 text-white/60">Comodidad</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              Autoservicio<br />y Comedor<br />
              <span style={{ color: '#F5C000' }}>¡Los mejores!</span>
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Visítanos en nuestro comedor o usa el drive-thru. Siempre con la misma calidad y sabor que nos caracteriza.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/menu"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-[#CC0000] text-base hover:scale-105 transition-transform"
                style={{ backgroundColor: '#F5C000' }}>
                Ver Menú
              </Link>
              <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-white text-base border-2 border-white/40 hover:border-white hover:bg-white/10 transition">
                <ExternalLink className="w-4 h-4" /> DoorDash
              </a>
            </div>
          </div>
          {/* Image */}
          <div className="relative h-80 lg:h-auto order-1 lg:order-2">
            <img src="/imgcel.webp" alt="Autoservicio y Comedor" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── INTERIOR ── */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img src="/interior.webp" alt="Interior del restaurante" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h3 className="text-3xl md:text-4xl font-black mb-2">Visítanos en Persona</h3>
            <p className="text-white/80 text-lg">Comedor cómodo y ambiente familiar</p>
          </div>
        </div>
      </section>

      {/* ── CLIENTES ── */}
      <section className="py-16 px-4" style={{ backgroundColor: '#FFF9F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#CC0000] font-black text-sm uppercase tracking-widest mb-2">Nuestra Familia</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Clientes Felices</h2>
            <p className="text-gray-500 mt-2">La vida es muy corta como para quedarse con las ganas</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { img: '/cliente1.webp', text: '"Los mejores tacos de El Paso. ¡Siempre vuelvo!"' },
              { img: '/cliente2.webp', text: '"La mejor comida para toda la familia. ¡El sabor es increíble!"' },
              { img: '/cliente3.webp', text: '"El lugar favorito de la zona. ¡No hay nada igual!"' },
            ].map((c, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden shadow-md group">
                <img src={c.img} alt="Cliente feliz" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4">
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-white text-sm font-semibold leading-snug">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UBICACIÓN ── */}
      <section className="py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-72 lg:h-auto">
            <img src="/ubicacion.webp" alt="Aca Las Tortas El Paso" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center px-8 py-16 lg:px-16 bg-white">
            <p className="text-[#CC0000] font-black text-sm uppercase tracking-widest mb-3">Encuéntranos</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              ¡Visítanos en<br />
              <span style={{ color: '#CC0000' }}>El Paso, TX!</span>
            </h2>
            <div className="space-y-4 mb-8">
              {[
                { icon: MapPin, title: 'Dirección', value: '10076 N Loop Dr, Socorro, TX 79927' },
                { icon: Clock, title: 'Horario', value: 'Lunes a Sábado: 8:00am – 9:00pm' },
                { icon: Phone, title: 'Teléfono', value: '(915) 858-8226' },
              ].map(({ icon: Icon, title, value }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#CC000015' }}>
                    <Icon className="w-5 h-5" style={{ color: '#CC0000' }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</p>
                    <p className="text-gray-900 font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/menu"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-white text-base hover:scale-105 transition-transform"
                style={{ backgroundColor: '#CC0000' }}>
                <ShoppingBag className="w-5 h-5" /> Ordenar Pickup
              </Link>
              <a href="https://maps.google.com/?q=10076+N+Loop+Dr+Socorro+TX" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 text-base transition">
                <MapPin className="w-4 h-4" /> Ver en Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOORDASH CTA ── */}
      <section className="py-14 px-4" style={{ backgroundColor: '#FF3008' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl md:text-3xl font-black mb-1">¿Prefieres que te lo lleven?</h3>
            <p className="text-white/80 text-lg">Ordena por DoorDash y recíbelo en tu puerta</p>
          </div>
          <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-[#FF3008] px-9 py-4 rounded-2xl font-black text-base hover:scale-105 transition-transform shadow-xl">
            <ExternalLink className="w-4 h-4" /> Ordenar en DoorDash
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111] text-white py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <img src="/logo.png" alt="Aca Las Tortas" className="h-20 mb-3" />
            <p className="text-gray-400 text-sm">Las mejores tortas de El Paso, TX</p>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider mb-4" style={{ color: '#F5C000' }}>Navegación</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
              <li><Link href="/menu" className="hover:text-white transition">Menú</Link></li>
              <li><Link href="/cuenta" className="hover:text-white transition">Mi Cuenta</Link></li>
              <li><a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Delivery — DoorDash</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider mb-4" style={{ color: '#F5C000' }}>Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F5C000' }} /> 10076 N Loop Dr, Socorro, TX</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" style={{ color: '#F5C000' }} /> (915) 858-8226</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" style={{ color: '#F5C000' }} /> Lun–Sáb: 8am – 9pm</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-gray-600 text-xs">
          © {new Date().getFullYear()} ¡Acá Las Tortas! El Paso — Todos los derechos reservados
        </div>
      </footer>
    </main>
  )
}
