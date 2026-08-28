import type { Metadata } from 'next'
import './globals.css'
import ConditionalHeader from '@/components/ConditionalHeader'
import ConditionalFooter from '@/components/ConditionalFooter'
import ConditionalChat from '@/components/ConditionalChat'

const DOMAIN = 'https://lafonditademama.com'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'La Fondita de Mamá',
  image: `${DOMAIN}/logo.png`,
  url: DOMAIN,
  telephone: '+19153438467',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '10076 N Loop Dr',
    addressLocality: 'Socorro',
    addressRegion: 'TX',
    postalCode: '79927',
    addressCountry: 'US',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '22:00',
    },
  ],
  servesCuisine: 'Mexican',
  priceRange: '$$',
  menu: `${DOMAIN}/menu`,
  hasMenu: `${DOMAIN}/menu`,
  acceptsReservations: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),
  title: {
    default: 'La Fondita de Mamá — Tortas, Burritos y Más | El Paso TX',
    template: '%s | La Fondita de Mamá',
  },
  description: 'La Fondita de Mamá en Socorro, El Paso TX. Las mejores tortas, burritos, tacos y hamburguesas. Ordena en línea para pickup en 15 minutos. Abierto todos los días 8am–10pm.',
  keywords: ['tortas el paso', 'fondita de mama', 'comida mexicana el paso tx', 'burritos el paso', 'tacos socorro tx', 'hamburguesas el paso', 'ordena en linea el paso', 'pickup el paso tx'],
  alternates: {
    canonical: DOMAIN,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: DOMAIN,
    siteName: 'La Fondita de Mamá',
    title: 'La Fondita de Mamá — Tortas, Burritos y Más | El Paso TX',
    description: 'Las mejores tortas, burritos, tacos y hamburguesas en El Paso TX. Ordena online y recoge en 15 minutos.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'La Fondita de Mamá' }],
  },
  twitter: {
    card: 'summary',
    title: 'La Fondita de Mamá | El Paso TX',
    description: 'Tortas, burritos, tacos y más. Ordena online para pickup rápido.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <ConditionalHeader />
        {children}
        <ConditionalFooter />
        <ConditionalChat />
      </body>
    </html>
  )
}
