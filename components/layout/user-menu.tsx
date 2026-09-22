'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Store,
  Heart,
  Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type UserData = {
  email: string
  name: string
  initial: string
  role: string
}

export function UserMenu() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const name =
          (data.user.user_metadata?.name as string) ||
          data.user.email?.split('@')[0] ||
          'Usuario'
        const role =
          (data.user.user_metadata?.role as string) ||
          (data.user.app_metadata?.role as string) ||
          'customer'
        setUser({
          email: data.user.email || '',
          name,
          initial: name.charAt(0).toUpperCase(),
          role,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="size-10 animate-pulse rounded-full border border-[var(--border)] bg-[var(--card)]" />
    )
  }

  // Si no está logueado → botón "Entrar"
  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-[#3ecf8e]/50 hover:bg-[#3ecf8e]/[0.06] hover:text-[#3ecf8e] sm:flex"
      >
        <User size={16} />
        Entrar
      </Link>
    )
  }

  // Si está logueado → avatar con nombre
  const isAdmin = user.role === 'admin'

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="group flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-1.5 pl-1.5 pr-3 transition-all hover:border-[#3ecf8e]/50 hover:shadow-[0_0_16px_rgba(62,207,142,0.15)]"
      >
        {/* Avatar con gradiente */}
        <span
          className={`relative grid size-8 place-items-center rounded-full text-sm font-bold text-black shadow-md ${
            isAdmin
              ? 'bg-gradient-to-br from-[#ffd700] via-[#ffd700]/90 to-[#ffd700]/60 shadow-[#ffd700]/20'
              : 'bg-gradient-to-br from-[#3ecf8e] via-[#3ecf8e]/90 to-[#3ecf8e]/60 shadow-[#3ecf8e]/20'
          }`}
        >
          {user.initial}
        </span>

        {/* Nombre */}
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-white sm:block">
          {user.name}
        </span>

        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0a0a0a]/95 shadow-2xl backdrop-blur-xl">
            {/* Header del menú */}
            <div
              className={`relative overflow-hidden border-b border-[var(--border)] p-4 ${
                isAdmin
                  ? 'bg-gradient-to-br from-[#ffd700]/[0.08] to-transparent'
                  : 'bg-gradient-to-br from-[#3ecf8e]/[0.08] to-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-10 place-items-center rounded-xl text-base font-bold text-black ${
                    isAdmin
                      ? 'bg-gradient-to-br from-[#ffd700] to-[#ffd700]/60'
                      : 'bg-gradient-to-br from-[#3ecf8e] to-[#3ecf8e]/60'
                  }`}
                >
                  {user.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    {isAdmin && (
                      <span className="rounded-full bg-[#ffd700]/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#ffd700]">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-white/40">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Opciones */}
            <div className="p-1.5">
              {/* Admin — solo si es admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#ffd700]/[0.08] to-transparent px-3 py-2.5 text-sm font-semibold text-[#ffd700] transition-all hover:from-[#ffd700]/[0.15]"
                >
                  <LayoutDashboard
                    size={15}
                    className="transition-transform group-hover:scale-110"
                  />
                  Panel Admin
                </Link>
              )}

              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#3ecf8e]"
              >
                <User
                  size={15}
                  className="transition-transform group-hover:scale-110"
                />
                Mi perfil
              </Link>

              {!isAdmin && (
                <Link
                  href="/vender"
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#3ecf8e]"
                >
                  <Store
                    size={15}
                    className="transition-transform group-hover:scale-110"
                  />
                  Vender aquí
                </Link>
              )}

              <Link
                href="/perfil/favoritos"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#3ecf8e]"
              >
                <Heart
                  size={15}
                  className="transition-transform group-hover:scale-110"
                />
                Favoritos
              </Link>

              {!isAdmin && (
                <Link
                  href="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-[#3ecf8e]"
                >
                  <Settings
                    size={15}
                    className="transition-transform group-hover:scale-110"
                  />
                  Configuración
                </Link>
              )}

              <div className="my-1 border-t border-[var(--border)]" />

              <button
                onClick={handleLogout}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LogOut
                  size={15}
                  className="transition-transform group-hover:scale-110"
                />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}