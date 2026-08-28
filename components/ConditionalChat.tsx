'use client'
import { usePathname } from 'next/navigation'
import ChatWidget from './ChatWidget'

export default function ConditionalChat() {
  const pathname = usePathname()
  if (pathname.startsWith('/dashboard')) return null
  if (pathname.startsWith('/pantalla')) return null
  if (pathname.startsWith('/pedido')) return null
  return <ChatWidget />
}
