'use client'
import Link from 'next/link'
import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react'

const RESTAURANT = {
  name: 'La Fondita de Mamá',
  address: '10076 N Loop Dr, Socorro, TX 79927',
  phone: '(915) 858-8226',
  phoneLink: 'tel:+19158588226',
  hours: 'Lun – Dom · 8:00 am – 10:00 pm',
  mapsUrl: 'https://maps.google.com/?q=10076+N+Loop+Dr,+Socorro,+TX+79927',
  embedUrl: 'https://maps.google.com/maps?q=10076+N+Loop+Dr,+Socorro,+TX+79927&output=embed&z=15',
}

const DOORDASH_URL = 'https://www.doordash.com/store/aca-las-tortas-el-paso-10076-n-loop-dr-socorro-34404153/'

export default function SiteFooter() {
  return (
    <footer>
      {/* ── Mapa + Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ backgroundColor: '#111' }}>
        {/* Mapa */}
        <div className="relative h-72 lg:h-auto min-h-[320px]">
          <iframe
            title="Ubicación La Fondita de Mamá"
            src={RESTAURANT.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, position: 'absolute', inset: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center px-8 py-14 lg:px-16">
          <p className="font-black text-sm uppercase tracking-widest mb-3" style={{ color: '#C61620' }}>
            Dónde Estamos
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-8">
            Visítanos en<br />
            <span style={{ color: '#006B42' }}>Socorro, TX</span>
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#006B42' }}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{RESTAURANT.address}</p>
                <p className="text-gray-400 text-xs mt-0.5">Socorro, Texas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#006B42' }}>
                <Clock className="w-4 h-4 text-white" />
              </div>
              <p className="text-white font-bold text-sm">{RESTAURANT.hours}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#006B42' }}>
                <Phone className="w-4 h-4 text-white" />
              </div>
              <a href={RESTAURANT.phoneLink} className="text-white font-bold text-sm hover:underline">
                {RESTAURANT.phone}
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={RESTAURANT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-white text-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: '#C61620' }}
            >
              <Navigation className="w-4 h-4" /> Abrir en Google Maps
            </a>
            <a
              href={RESTAURANT.phoneLink}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm border-2 border-white/20 text-white hover:border-white/50 transition"
            >
              <Phone className="w-4 h-4" /> Llamar
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div className="bg-black px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-xl object-cover" />
            <div>
              <p className="text-white font-black text-sm leading-tight">La Fondita de Mamá</p>
              <p className="text-gray-500 text-xs">Socorro, TX</p>
            </div>
          </div>

          <nav className="flex items-center gap-5 text-xs font-bold text-gray-400">
            <Link href="/" className="hover:text-white transition">Inicio</Link>
            <Link href="/menu" className="hover:text-white transition">Menú</Link>
            <Link href="/cuenta" className="hover:text-white transition">Mi Cuenta</Link>
            <a href={DOORDASH_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">
              DoorDash <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} La Fondita de Mamá</p>
        </div>
      </div>
    </footer>
  )
}
