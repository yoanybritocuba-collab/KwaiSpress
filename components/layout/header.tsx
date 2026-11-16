'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Search, User, LogOut, Package, LayoutDashboard, Store, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { ChatBell } from '@/components/chat/chat-bell'

type Me = {
  user: { id: string; email: string; name: string; isAdmin: boolean } | null
  seller: { slug: string; status: 'pending' | 'approved' | 'suspended' } | null
}

function SearchForm({ className = '' }: { className?: string }) {
  return (
    <form action="/productos" method="get" role="search" className={className}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          size={18}
        />
        <input
          type="search"
          name="q"
          maxLength={80}
          aria-label="Buscar productos"
          placeholder="Buscar productos..."
          className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[#ffd700]/50"
        />
      </div>
    </form>
  )
}

export function Header() {
  const [me, setMe] = useState<Me>({ user: null, seller: null })
  const [menuAbierto, setMenuAbierto] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // El rol se calcula en el servidor: aquí no se confía en user_metadata
  const loadMe = useCallback(async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' })
      if (res.ok) setMe(await res.json())
    } catch {
      /* sin conexión: se mantiene el estado anterior */
    }
  }, [])

  useEffect(() => {
    loadMe()
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setMe({ user: null, seller: null })
      else loadMe()
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase, loadMe])

  useEffect(() => {
    if (!menuAbierto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuAbierto])

  const cerrarSesion = async () => {
    setMenuAbierto(false)
    await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {})
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const { user, seller } = me
  const menuLink =
    'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--background)]'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="KwaiSpress, inicio">
          <span className="grid size-8 place-items-center rounded-lg bg-[#ffd700] text-xl font-bold text-black">
            K
          </span>
          <span className="hidden font-display text-xl font-bold sm:block">KwaiSpress</span>
        </Link>

        <SearchForm className="hidden max-w-xl flex-1 px-4 md:block" />

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Icono de chats con contador, sonido y notificación */}
          {user && <ChatBell />}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuAbierto((o) => !o)}
                aria-expanded={menuAbierto}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 transition-colors hover:border-[#ffd700]/50"
              >
                <span className="grid size-6 place-items-center rounded-full bg-[#3ecf8e] text-xs font-bold uppercase text-black">
                  {user.name.charAt(0) || 'U'}
                </span>
                <span className="hidden max-w-[110px] truncate text-sm font-medium sm:block">
                  {user.name}
                </span>
              </button>

              {menuAbierto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl"
                  >
                    <div className="mb-2 border-b border-[var(--border)] px-4 py-3">
                      <p className="truncate text-sm font-bold">{user.name}</p>
                      <p className="truncate text-xs text-[var(--muted-foreground)]">{user.email}</p>
                    </div>

                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuAbierto(false)}
                        className={`${menuLink} mb-1 font-bold text-[#ffd700]`}
                      >
                        <LayoutDashboard size={16} /> Panel de administración
                      </Link>
                    )}

                    <Link href="/perfil" onClick={() => setMenuAbierto(false)} className={menuLink}>
                      <User size={16} /> Mi perfil
                    </Link>

                    <Link href="/chat" onClick={() => setMenuAbierto(false)} className={menuLink}>
                      <MessageCircle size={16} /> Mis chats
                    </Link>

                    {seller?.status === 'approved' ? (
                      <Link
                        href={`/vendedor/${seller.slug}/panel`}
                        onClick={() => setMenuAbierto(false)}
                        className={menuLink}
                      >
                        <Store size={16} /> Mi tienda
                      </Link>
                    ) : (
                      !seller && (
                        <Link href="/vender" onClick={() => setMenuAbierto(false)} className={menuLink}>
                          <Package size={16} /> Vender aquí
                        </Link>
                      )
                    )}

                    <div className="my-2 h-px bg-[var(--border)]" />

                    <button
                      onClick={cerrarSesion}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#ffd700] px-4 py-2 text-sm font-bold text-black hover:bg-[#ffd700]/90"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {/* Buscador en móvil */}
      <SearchForm className="px-5 pb-3 md:hidden" />
    </header>
  )
}