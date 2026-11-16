'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, ChevronDown, LogOut, User, ShieldCheck, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminHeader({
  userName,
  userEmail,
  onMenuClick,
}: {
  userName: string
  userEmail: string
  onMenuClick: () => void
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const initial = (userName.charAt(0) || 'A').toUpperCase()

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {})
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <button
          onClick={onMenuClick}
          className="grid size-10 place-items-center rounded-xl text-white/60 transition-all hover:bg-white/5 hover:text-[#ffd700] lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-[#ffd700]/10 text-[#ffd700]">
            <Crown size={16} />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd700]">
              Panel de administración
            </p>
            <p className="hidden text-sm font-semibold text-white sm:block">
              Bienvenido, {userName}
            </p>
          </div>
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-1.5 pl-1.5 pr-3 transition-all hover:border-[#ffd700]/50"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#ffd700] to-[#ffd700]/60 text-sm font-bold text-black">
              {initial}
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
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#ffd700]/20 bg-[#0a0a0a] shadow-2xl"
              >
                <div className="border-b border-[var(--border)] bg-gradient-to-br from-[#ffd700]/[0.08] to-transparent p-4">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white">{userName}</p>
                    <span className="rounded-full bg-[#ffd700]/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#ffd700]">
                      Admin
                    </span>
                  </div>
                  <p className="truncate text-xs text-white/40">{userEmail}</p>
                </div>

                <div className="p-1.5">
                  <Link
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-[#ffd700]/[0.06] hover:text-[#ffd700]"
                  >
                    <User size={15} /> Mi perfil
                  </Link>
                  <Link
                    href="/admin/seguridad"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-[#ffd700]/[0.06] hover:text-[#ffd700]"
                  >
                    <ShieldCheck size={15} /> Seguridad
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
