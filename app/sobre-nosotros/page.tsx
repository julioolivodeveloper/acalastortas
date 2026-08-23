'use client'
import Link from 'next/link'
import { MapPin, Phone, Clock, ShoppingBag, MessageCircle, ChevronRight, Star, Users, Heart } from 'lucide-react'

const WHATSAPP = 'https://wa.me/19158588226?text=Hola%2C%20quiero%20ordenar'
const DOORDASH = 'https://www.doordash.com/store/aca-las-tortas-el-paso-10076-n-loop-dr-socorro-34404153/'
const MAPS = 'https://maps.google.com/?q=10076+N+Loop+Dr,+Socorro,+TX+79927'

const FOOD_GALLERY = [
  '/menu/torta-bistec.jpg',
  '/menu/burrito-verde.jpg',
  '/menu/tacos-carnitas.jpg',
  '/menu/quesadilla-1.jpg',
  '/menu/torta-pastor.jpg',
  '/menu/hamburguesa-doble.jpg',
]

export default function SobreNosotrosPage() {
  return (
    <main className="bg-white">

      {/* ── HERO ── */}
      <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src="/sobre-hero.jpg"
          alt="Aca Las Tortas El Paso"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.85) 100%)' }} />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <img src="/logo.png" alt="Aca Las Tortas" className="h-28 md:h-36 mx-auto mb-6 drop-shadow-2xl" />
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg">
            Acá Las Tortas<br />
            <span style={{ color: '#C61620', textShadow: '0 0 30px rgba(198,22,32,0.5)' }}>El Paso</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-semibold mb-8">
            Contamos con autoservicio o comer en el lugar
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg shadow-2xl hover:scale-105 transition-transform"
              style={{ backgroundColor: '#C61620' }}
            >
              <ShoppingBag className="w-5 h-5" /> Ver Menú
            </Link>
            <a
              href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg border-2 border-white/50 hover:border-white hover:bg-white/10 transition"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── MISIÓN ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-6">
              <Heart className="w-4 h-4 text-[#006B42]" />
              <span className="text-[#006B42] font-black text-sm uppercase tracking-wider">Nuestra Misión</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6">
              El principal destino de<br />
              <span style={{ color: '#C61620' }}>Tortas, Burritos y Tacos</span><br />
              en El Paso
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Nuestra misión es convertirnos en el principal destino de Tortas, Burritos y Tacos en El Paso, sirviendo sabores auténticos con una calidad excepcional.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Nuestro objetivo es crear un ambiente acogedor donde cada cliente se sienta como en casa. A través de la dedicación a nuestro oficio y nuestra comunidad, nos esforzamos por ofrecer una experiencia gastronómica que haga que nuestros clientes regresen por más.
            </p>
            <a
              href={`tel:+19158001234`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-white text-base hover:opacity-90 transition"
              style={{ backgroundColor: '#006B42' }}
            >
              <Phone className="w-5 h-5" /> Contáctenos
            </a>
          </div>
          <div className="relative">
            <img
              src="/sobre-recurso2.jpg"
              alt="Nuestra misión"
              className="rounded-3xl shadow-2xl w-full object-cover aspect-square"
            />
            <div
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#006B42' }}>
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">Los Mejores</p>
                <p className="text-gray-500 text-xs">de la Zona</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section className="py-16 px-4" style={{ backgroundColor: '#006B42' }}>
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Los Mejores de la Zona</h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Ven y disfruta de nuestro delicioso menú y de un ambiente agradable y familiar
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🌮', title: 'Sabores Auténticos', desc: 'Recetas tradicionales con los mejores ingredientes frescos' },
            { icon: '🏠', title: 'Ambiente Familiar', desc: 'Un lugar acogedor donde cada cliente se siente como en casa' },
            { icon: '⚡', title: 'Servicio Rápido', title2: '', desc: 'Ordena en línea y tu comida estará lista cuando llegues' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center border border-white/20">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-white font-black text-lg mb-2">{title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GALERÍA DE COMIDA ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Nuestro Menú</h2>
            <p className="text-gray-500 text-lg">Tortas, tacos, burritos y mucho más</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {FOOD_GALLERY.map((src, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg hover:opacity-90 transition"
              style={{ backgroundColor: '#C61620' }}
            >
              Ver Menú Completo <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ORDENA FÁCIL ── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/sobre-recurso3.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.72)' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white font-black text-sm uppercase tracking-wider">Los Mejores de la Zona</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
            Ordena llamando o por<br />
            <span style={{ color: '#C61620', textShadow: '0 0 30px rgba(198,22,32,0.5)' }}>WhatsApp</span>
          </h2>
          <p className="text-white/80 text-xl mb-10">
            Tendremos lista tu orden cuando llegues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg shadow-2xl hover:scale-105 transition-transform"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
            <a
              href={DOORDASH} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg border-2 border-white/50 hover:border-white hover:bg-white/10 transition"
            >
              <ShoppingBag className="w-5 h-5" /> DoorDash
            </a>
          </div>
        </div>
      </section>

      {/* ── UBICACIÓN ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              Visítanos en<br />
              <span style={{ color: '#006B42' }}>El Paso, TX</span>
            </h2>
            <div className="space-y-5">
              <a href={MAPS} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition" style={{ backgroundColor: '#006B42' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">Dirección</p>
                  <p className="text-gray-600 text-sm mt-0.5">10076 N Loop Dr, Socorro, TX 79927</p>
                </div>
              </a>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#C61620' }}>
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">Horario</p>
                  <p className="text-gray-600 text-sm mt-0.5">Lun–Sáb: 8:00 AM – 9:00 PM</p>
                  <p className="text-gray-600 text-sm">Dom: 9:00 AM – 7:00 PM</p>
                </div>
              </div>
              <a href="tel:+19158001234" className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition" style={{ backgroundColor: '#006B42' }}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">Teléfono</p>
                  <p className="text-gray-600 text-sm mt-0.5">(915) 858-8226</p>
                </div>
              </a>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl h-80 md:h-full min-h-[320px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.0!2d-106.2485!3d31.6535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDM5JzEzLjAiTiAxMDbCsDE0JzU0LjYiVw!5e0!3m2!1ses!2sus!4v1600000000000!5m2!1ses!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 320 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ── REDES SOCIALES ── */}
      <section className="py-16 px-4" style={{ backgroundColor: '#111' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Contáctenos y síguenos en</h2>
          <p className="text-white font-black text-2xl mb-8" style={{ color: '#C61620' }}>nuestras redes sociales</p>
          <div className="flex justify-center gap-4">
            <a href="https://www.facebook.com/AcaLasTortasElPaso" target="_blank" rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl transition hover:scale-110"
              style={{ backgroundColor: '#1877F2' }}>
              <span className="font-black text-xl">f</span>
            </a>
            <a href="https://www.instagram.com/acalastortaselpaso" target="_blank" rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl transition hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
              <span className="font-black text-xl">ig</span>
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl transition hover:scale-110"
              style={{ backgroundColor: '#25D366' }}>
              <MessageCircle className="w-7 h-7" />
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
