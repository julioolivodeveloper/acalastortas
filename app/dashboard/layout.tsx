'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, LogOut, Lock, BarChart3, Eye, EyeOff } from 'lucide-react'
import { adminSignIn, adminSignOut, getAdminSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/analiticas', label: 'Analíticas', icon: BarChart3 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [signing, setSigning] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    getAdminSession().then((session) => {
      setAuthed(!!session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = async () => {
    if (!email || !password) { setError('Ingresa tu correo y contraseña'); return }
    setSigning(true); setError('')
    try {
      await adminSignIn(email, password)
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setSigning(false)
    }
  }

  const logout = async () => {
    await adminSignOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#006B42] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0,107,66,0.08) 0%, transparent 60%)' }}>
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#006B42' }}>
              <Lock className="w-7 h-7 text-white" />
            </div>
            <img src="/logo.png" alt="Aca Las Tortas" className="h-12 mx-auto mb-4" />
            <h1 className="text-white font-black text-xl">Panel de Administración</h1>
            <p className="text-gray-500 text-sm mt-1">Inicia sesión para continuar</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">Correo electrónico</label>
              <input type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="admin@correo.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B42] placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && login()}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B42] placeholder:text-gray-600"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm font-semibold">{error}</div>}
            <button onClick={login} disabled={signing}
              className="w-full py-3.5 rounded-xl font-black text-white text-base disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: '#006B42' }}>
              {signing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 border-r border-gray-800 fixed top-0 bottom-0 left-0 z-20">
        <div className="p-5 border-b border-gray-800">
          <img src="/logo.png" alt="" className="h-10 mx-auto" />
          <p className="text-gray-500 text-xs text-center mt-1 font-semibold">Panel Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${active ? 'text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                style={active ? { backgroundColor: '#006B42' } : {}}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link href="/menu" target="_blank"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-black text-white text-xs transition hover:opacity-90"
            style={{ backgroundColor: '#C61620' }}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Ver Menú ↗
          </Link>
          <Link href="/" target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition">
            Ver sitio público ↗
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 text-xs font-semibold rounded-xl hover:bg-gray-800 transition">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800 flex">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition ${active ? 'text-[#006B42]' : 'text-gray-500'}`}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>

      <main className="md:ml-60 flex-1 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
