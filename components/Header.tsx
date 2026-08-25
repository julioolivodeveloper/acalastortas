'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Menu, X, Home, UtensilsCrossed, Info, ChevronRight } from 'lucide-react'
import { useAcaTortasStore, cartCount } from '@/store/store'
import CartDrawer from './CartDrawer'

const NAV = [
  { href: '/',               label: 'Inicio',          icon: Home },
  { href: '/menu',           label: 'Menú',            icon: UtensilsCrossed },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros',  icon: Info },
  { href: '/cuenta',         label: 'Mi Cuenta',       icon: User },
]

export default function Header() {
  const { cart } = useAcaTortasStore()
  const count    = cartCount(cart)
  const [cartOpen,  setCartOpen]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className="sticky top-0 z-30 transition-shadow duration-300"
        style={{
          backgroundColor: '#006B42',
          boxShadow: scrolled
            ? '0 4px 24px rgba(0,0,0,0.35)'
            : '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-[68px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img
              src="/logo.png"
              alt="Acá Las Tortas"
              className="h-11 drop-shadow-lg transition-opacity hover:opacity-90"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
                  style={
                    active
                      ? { color: 'white', backgroundColor: 'rgba(255,255,255,0.18)' }
                      : { color: 'rgba(255,255,255,0.72)' }
                  }
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#C61620',
                boxShadow: '0 4px 14px rgba(198,22,32,0.45)',
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orden</span>
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-xs font-black flex items-center justify-center"
                  style={{ color: '#C61620' }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-white transition hover:bg-white/15"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="md:hidden border-t border-white/15"
            style={{ backgroundColor: '#005535' }}
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 font-bold text-sm border-b border-white/10 last:border-0 transition"
                  style={
                    active
                      ? { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                      : { color: 'rgba(255,255,255,0.72)' }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: active ? '#C61620' : 'rgba(255,255,255,0.1)' }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {label}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                </Link>
              )
            })}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
