'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, LogOut, Lock } from 'lucide-react'
import { ADMIN_PIN } from '@/store/store'

const NAV = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem('acatortas-admin')
    if (stored === 'true') setAuthed(true)
  }, [])

  const login = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('acatortas-admin', 'true')
      setAuthed(true)
    } else {
      setError('PIN incorrecto')
      setPin('')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('acatortas-admin')
    setAuthed(false)
    router.push('/')
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-10 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#006B42' }}>
            <Lock className="w-7 h-7 text-white" />
          </div>
          <img src="/logo.png" alt="Aca Las Tortas" className="h-14 mx-auto mb-4" />
          <h1 className="text-white font-black text-xl mb-1">Panel de Administración</h1>
          <p className="text-gray-400 text-sm mb-6">Ingresa tu PIN para continuar</p>
          <div className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              placeholder="PIN de acceso"
              maxLength={6}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-center text-xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-[#006B42] placeholder:text-gray-600"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={login}
              className="w-full py-3.5 rounded-xl font-black text-white text-base"
              style={{ backgroundColor: '#006B42' }}
            >
              Entrar
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-6">Demo PIN: <span className="text-gray-400 font-mono font-bold">1234</span></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-800 fixed top-0 bottom-0 left-0 z-20">
        <div className="p-4 border-b border-gray-800">
          <img src="/logo.png" alt="" className="h-10 mx-auto" />
          <p className="text-gray-400 text-xs text-center mt-1 font-semibold">Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                  active ? 'bg-[#006B42] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-800 space-y-2">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition">
            Ver sitio web
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 text-xs font-semibold rounded-xl hover:bg-gray-800 transition"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800 flex">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold transition ${
                active ? 'text-[#006B42]' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <main className="md:ml-56 flex-1 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
