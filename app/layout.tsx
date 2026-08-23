import type { Metadata } from 'next'
import './globals.css'
import ConditionalHeader from '@/components/ConditionalHeader'
import ConditionalFooter from '@/components/ConditionalFooter'

export const metadata: Metadata = {
  metadataBase: new URL('https://acalastortas-lake.vercel.app'),
  title: '¡Acá Las Tortas! El Paso — Pedidos Online',
  description: 'Las mejores tortas de El Paso. Ordena en línea para pickup o delivery vía DoorDash.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: '¡Acá Las Tortas! El Paso',
    description: 'Las mejores tortas de El Paso. Ordena en línea para pickup o delivery vía DoorDash.',
    images: [{ url: '/logo.png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <ConditionalHeader />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  )
}
