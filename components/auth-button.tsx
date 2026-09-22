'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown, LayoutDashboard, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type UserData = {
  id: string
  email: string
  name: string
}

export function AuthButton() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)
  const [isSeller, setIsSeller] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      setUser(null)
      setIsSeller(false)
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setUser({
      id: data.user.id,
      email: data.user.email || '',
      name:
        (data.user.user_metadata?.name as string) ||
        data.user.email?.split('@')[0] ||
        'Usuario',
    })

    /* ¿Es admin? */
    const role =
      (data.user.user_metadata?.role as string) ||
      (data.user.app_metadata?.role as string) ||
      'customer'
    setIsAdmin(role === 'admin')

    /* ¿Es vendedor aprobado? */
    const { data: sellerData } = await supabase
      .from('sellers')
      .select('status')
      .eq('user_id', data.user.id)
      .maybeSingle()

    setIsSeller(sellerData?.status === 'approved')
    setLoading(false)
  }

  useEffect(() => {
    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return <div className="h-10 w-24" />
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:text-[#d4af37] sm:block"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37]"
        >
          Registrarme
        </Link>
      </>
    )
  }

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0a0a0a] py-2 pl-2 pr-3 transition-colors hover:border-[#d4af37]/50"
        aria-label="Menú de usuario"
      >
        <span className="grid size-7 place-items-center rounded-lg bg-[#10b77f] text-xs font-black text-black">
          {initial}
        </span>
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-white sm:block">
          {user.name}
        </span>
        <ChevronDown size={14} className="text-white/40" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a] shadow-xl">
            <div className="border-b border-white/[0.06] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Conectado como
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {user.email}
              </p>
            </div>

            <div className="p-1">
              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#d4af37]"
              >
                <User size={15} />
                Mi perfil
              </Link>

              {isSeller && (
                <Link
                  href="/vendedor"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#d4af37]"
                >
                  <Store size={15} />
                  Panel de vendedor
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#d4af37]"
                >
                  <LayoutDashboard size={15} />
                  Panel de admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#d4af37]"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}