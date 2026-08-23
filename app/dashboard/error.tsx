'use client'
import { useEffect } from 'react'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-black text-white mb-2">Error en el panel</h1>
      <p className="text-gray-400 mb-6 text-sm max-w-sm">Ocurrió un error al cargar esta sección.</p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-2xl font-black text-white hover:opacity-90 transition"
        style={{ backgroundColor: '#006B42' }}
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
