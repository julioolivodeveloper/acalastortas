import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: '¡Acá Las Tortas! El Paso — Pedidos Online',
  description: 'Las mejores tortas de El Paso. Ordena en línea para pickup o delivery vía DoorDash.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <Header />
        {children}
      </body>
    </html>
  )
}
