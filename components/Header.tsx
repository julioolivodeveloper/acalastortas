'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
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
    { href: '/cuenta', label: 'Mi Cuenta' },
  ]

  return (
    <>
      <header className="sticky top-0 z-30 shadow-lg" style={{ backgroundColor: '#CC0000' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="Aca Las Tortas" className="h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                  pathname === link.href ? 'bg-white text-[#CC0000]' : 'text-white hover:bg-white/20'
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
              className="relative flex items-center gap-1.5 bg-white text-[#CC0000] px-3 py-2 rounded-xl font-black text-sm hover:bg-yellow-50 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orden</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center" style={{ backgroundColor: '#F5C000' }}>
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
                  pathname === link.href ? 'bg-white text-[#CC0000]' : 'text-white hover:bg-white/20'
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
