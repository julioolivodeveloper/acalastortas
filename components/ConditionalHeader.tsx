'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  if (pathname.startsWith('/dashboard')) return null
  if (pathname.startsWith('/pantalla')) return null
  return <Header />
}
