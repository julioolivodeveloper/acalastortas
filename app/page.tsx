'use client'
import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Clock, Phone, ExternalLink, Star, ChevronRight, ShoppingBag } from 'lucide-react'
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
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#F5C000', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#F5C000', transform: 'translate(-30%, 30%)' }} />
        <div className="relative z-10 max-w-2xl">
          <img src="/logo.png" alt="Aca Las Tortas" className="h-28 mx-auto mb-6 drop-shadow-2xl" />
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
            Las Mejores<br /><span style={{ color: '#F5C000' }}>Tortas de El Paso</span>
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
            Ordena en línea y recoge en ventanilla. ¡Sin esperas, sin complicaciones!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[#CC0000] text-lg shadow-xl hover:scale-105 transition-transform" style={{ backgroundColor: '#F5C000' }}>
              <ShoppingBag className="w-5 h-5" /> Ordenar Ahora — Pickup
            </Link>
            <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg border-2 border-white/40 hover:border-white hover:bg-white/10 transition">
              <ExternalLink className="w-4 h-4" /> Delivery — DoorDash
            </a>
          </div>
        </div>
      </section>

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

      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#CC0000] font-black text-sm uppercase tracking-widest mb-1">Más Pedidos</p>
            <h2 className="text-3xl font-black text-gray-900">Lo Más Popular</h2>
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
                  <p className="text-[#CC0000] font-black text-lg mt-1">${item.price.toFixed(2)}</p>
                </div>
                <span className="shrink-0 flex items-center gap-0.5 text-yellow-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" /> Popular
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.description}</p>
              <button onClick={() => handleAdd(item.id, item)}
                className="w-full py-2.5 rounded-xl font-black text-sm text-white transition-all"
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

      <section className="py-16 px-4" style={{ backgroundColor: '#FFF9F0' }}>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-[#CC0000] font-black text-sm uppercase tracking-widest mb-2">Sin complicaciones</p>
          <h2 className="text-3xl font-black text-gray-900">¿Cómo funciona?</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { num: '1', title: 'Elige tu comida', desc: 'Navega nuestro menú y agrega tus platillos al carrito' },
            { num: '2', title: 'Confirma tu orden', desc: 'Ingresa tu nombre y número. Tu orden llega al restaurante al instante' },
            { num: '3', title: 'Recoge y paga', desc: 'Llega al restaurante y paga en ventanilla con efectivo o tarjeta' },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-2xl shadow-lg" style={{ backgroundColor: '#CC0000' }}>
                {step.num}
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4" style={{ backgroundColor: '#FF3008' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-black mb-1">¿Prefieres que te lo lleven?</h3>
            <p className="text-white/80">Ordena por DoorDash y recíbelo en tu puerta</p>
          </div>
          <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-[#FF3008] px-8 py-4 rounded-2xl font-black text-base hover:scale-105 transition-transform shadow-xl">
            <ExternalLink className="w-4 h-4" /> Ordenar en DoorDash
          </a>
        </div>
      </section>

      <footer className="bg-[#111] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <img src="/logo.png" alt="Aca Las Tortas" className="h-16 mb-3" />
            <p className="text-gray-400 text-sm">Las mejores tortas de El Paso, TX</p>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider mb-3" style={{ color: '#F5C000' }}>Navegación</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white">Inicio</Link></li>
              <li><Link href="/menu" className="hover:text-white">Menú</Link></li>
              <li><Link href="/cuenta" className="hover:text-white">Mi Cuenta</Link></li>
              <li><a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">Delivery — DoorDash</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider mb-3" style={{ color: '#F5C000' }}>Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>10076 N Loop Dr, Socorro, TX</li>
              <li>(915) 858-8226</li>
              <li>Lun–Sáb: 8am – 9pm</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-gray-600 text-xs">
          © {new Date().getFullYear()} ¡Acá Las Tortas! El Paso
        </div>
      </footer>
    </main>
  )
}
