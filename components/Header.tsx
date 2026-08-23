'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Menu, X, Home } from 'lucide-react'
import { useAcaTortasStore, cartCount } from '@/store/store'
import CartDrawer from './CartDrawer'

export default function Header() {
  const { cart } = useAcaTortasStore()
  const count = cartCount(cart)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/menu', label: 'Menú' },
    { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
    { href: '/cuenta', label: 'Mi Cuenta' },
  ]

  return (
    <>
      <header className="sticky top-0 z-30 shadow-lg" style={{ backgroundColor: '#006B42' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-xl text-white hover:bg-white/20 transition shrink-0" title="Inicio">
            <Home className="w-6 h-6" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                  pathname === link.href ? 'bg-white text-[#006B42]' : 'text-white hover:bg-white/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cuenta" className="p-2 text-white hover:bg-white/20 rounded-xl transition hidden md:flex">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-sm text-white transition hover:opacity-90"
              style={{ backgroundColor: '#C61620' }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orden</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[#C61620] bg-white text-xs font-black flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white hover:bg-white/20 rounded-xl transition">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/20 bg-[#AA0000] px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  pathname === link.href ? 'bg-white text-[#006B42]' : 'text-white hover:bg-white/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
