import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <img src="/logo.png" alt="Aca Las Tortas El Paso" className="h-24 mb-6 drop-shadow-xl" />
      <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
      <p className="text-xl font-black text-gray-700 mb-2">Página no encontrada</p>
      <p className="text-gray-400 mb-8">Esta página no existe o fue movida.</p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-2xl font-black text-white hover:opacity-90 transition"
          style={{ backgroundColor: '#006B42' }}
        >
          Ir al inicio
        </Link>
        <Link
          href="/menu"
          className="px-6 py-3 rounded-2xl font-black text-white hover:opacity-90 transition"
          style={{ backgroundColor: '#C61620' }}
        >
          Ver Menú
        </Link>
      </div>
    </div>
  )
}
