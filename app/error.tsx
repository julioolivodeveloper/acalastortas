'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <img src="/logo.png" alt="La Fondita de Mamá" className="h-20 mb-6 drop-shadow-xl" />
      <h1 className="text-3xl font-black text-gray-900 mb-2">Algo salió mal</h1>
      <p className="text-gray-400 mb-8 max-w-sm">Ocurrió un error inesperado. Por favor intenta de nuevo.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl font-black text-white hover:opacity-90 transition"
          style={{ backgroundColor: '#006B42' }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-2xl font-black text-white hover:opacity-90 transition"
          style={{ backgroundColor: '#C61620' }}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
