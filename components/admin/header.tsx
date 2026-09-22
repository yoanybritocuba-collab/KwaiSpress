'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Search,
  Sparkles,
  Crown,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState('Admin')
  const [userInitial, setUserInitial] = useState('A')
  const [userEmail, setUserEmail] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name =
          (data.user.user_metadata?.name as string) ||
          data.user.email?.split('@')[0] ||
          'Admin'
        setUserName(name)
        setUserInitial(name.charAt(0).toUpperCase())
        setUserEmail(data.user.email || '')
      }
    })
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* BARRA DE BIENVENIDA FUTURISTA */}
      <div className="relative overflow-hidden border-b border-[#ffd700]/20 bg-gradient-to-r from-[#ffd700]/[0.06] via-transparent to-[#3ecf8e]/[0.04]">
        {/* Grid decorativa de fondo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,215,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Halo de luz */}
        <div className="pointer-events-none absolute -right-20 top-0 size-40 rounded-full bg-[#ffd700]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 size-40 rounded-full bg-[#3ecf8e]/10 blur-3xl" />

        <div className="relative flex items-center gap-3 px-5 py-4">
          {/* Icono con animación */}
          <span className="group relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ffd700] via-[#ffd700]/90 to-[#ffd700]/60 text-black shadow-lg shadow-[#ffd700]/30 transition-transform hover:scale-110">
            <Crown size={20} strokeWidth={2.5} />
            <span className="absolute inset-0 animate-ping rounded-xl bg-[#ffd700]/20" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd700]">
                Panel de administración
              </p>
              <span className="hidden rounded-full border border-[#ffd700]/40 bg-[#ffd700]/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ffd700] sm:inline">
                Modo director
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <p className="truncate text-base font-semibold text-white">
                Bienvenido,{' '}
                <span className="text-gold-gradient">{userName}</span>
              </p>
              <span className="rounded-full border border-[#ffd700]/50 bg-gradient-to-r from-[#ffd700]/20 to-transparent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.15)]">
                Admin
              </span>
            </div>
          </div>

          {/* Estado en línea */}
          <div className="hidden items-center gap-2 rounded-full border border-[#3ecf8e]/30 bg-[#3ecf8e]/[0.06] px-3 py-1.5 sm:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3ecf8e] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#3ecf8e]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf8e]">
              En línea
            </span>
          </div>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 py-3.5">
          {/* Menú móvil */}
          <button
            onClick={onMenuClick}
            className="grid size-10 place-items-center rounded-xl text-white/60 transition-all hover:scale-105 hover:bg-white/5 hover:text-[#ffd700] lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          {/* Título */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <ShieldCheck size={16} className="text-[#ffd700]" />
            <h1 className="text-sm font-semibold text-white/60">
              Control total
            </h1>
          </div>

          {/* Buscador */}
          <div className="relative ml-auto hidden max-w-md flex-1 md:block">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="search"
              placeholder="Buscar en el panel..."
              className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-2.5 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-white/30 focus:border-[#ffd700]/50 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.08)]"
            />
          </div>

          {/* Acciones */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {/* Notificaciones */}
            <Link
              href="/admin/notificaciones"
              className="group relative grid size-10 place-items-center rounded-xl border border-transparent text-white/60 transition-all hover:scale-105 hover:border-[#ffd700]/30 hover:bg-[#ffd700]/[0.06] hover:text-[#ffd700]"
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ffd700]">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#ffd700]/60" />
              </span>
            </Link>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-1.5 pl-1.5 pr-3 transition-all hover:scale-[1.02] hover:border-[#ffd700]/50 hover:shadow-[0_0_12px_rgba(255,215,0,0.1)]"
              >
                <span className="relative grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#ffd700] via-[#ffd700]/90 to-[#ffd700]/60 text-sm font-bold text-black shadow-md shadow-[#ffd700]/20">
                  {userInitial}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                  {userName}
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
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#ffd700]/20 bg-[#0a0a0a]/95 shadow-2xl shadow-[#ffd700]/10 backdrop-blur-xl">
                    {/* Header del menú */}
                    <div className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-br from-[#ffd700]/[0.08] to-transparent p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#ffd700] to-[#ffd700]/60 text-base font-bold text-black">
                          {userInitial}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-semibold text-white">
                              {userName}
                            </p>
                            <span className="rounded-full bg-[#ffd700]/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#ffd700]">
                              Admin
                            </span>
                          </div>
                          <p className="truncate text-xs text-white/40">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones */}
                    <div className="p-1.5">
                      <Link
                        href="/perfil"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-[#ffd700]/[0.06] hover:text-[#ffd700]"
                      >
                        <User
                          size={15}
                          className="transition-transform group-hover:scale-110"
                        />
                        Mi perfil
                      </Link>
                      <Link
                        href="/admin/seguridad"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-[#ffd700]/[0.06] hover:text-[#ffd700]"
                      >
                        <ShieldCheck
                          size={15}
                          className="transition-transform group-hover:scale-110"
                        />
                        Seguridad
                      </Link>
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

                    {/* Footer */}
                    <div className="border-t border-[var(--border)] p-3">
                      <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <Zap size={11} className="text-[#ffd700]" />
                        KwaiSpress Admin · v1.0
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}