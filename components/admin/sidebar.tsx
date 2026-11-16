'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Settings,
  LogOut,
  Store,
  Lock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MENU = [
  { name: 'Inicio (Dashboard)', href: '/admin', icon: LayoutDashboard },
  { name: 'Mi Tienda Oficial', href: '/admin/mi-tienda', icon: Store },
  { name: 'Todos los Productos', href: '/admin/productos', icon: Package },
  { name: 'Categorías', href: '/admin/categorias', icon: Tags },
  { name: 'Vendedores', href: '/admin/vendedores', icon: Users },
  { name: 'Configuración', href: '/admin/seguridad', icon: Settings },
]

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const lockPanel = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {})
    router.replace('/admin/unlock')
    router.refresh()
  }

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {})
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <>
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-xl font-bold"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-[#ffd700] text-black">
            K
          </span>
          KwaiSpress Admin
        </Link>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4" aria-label="Panel de administración">
        {MENU.map((item) => {
          const activo =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={activo ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                activo
                  ? 'bg-[#ffd700] text-black'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--border)] p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--background)]"
        >
          <Store size={18} /> Ir a la Web
        </Link>
        <button
          onClick={lockPanel}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--background)]"
        >
          <Lock size={18} /> Bloquear panel
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </>
  )
}
