'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Package,
  FolderKanban,
  CreditCard,
  Bell,
  Settings,
  ExternalLink,
  X,
  ShieldCheck,
  Crown,
  ShoppingBag,
} from 'lucide-react'

const navigation = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/mi-tienda', label: 'Mi Tienda', icon: ShoppingBag },
  { href: '/admin/vendedores', label: 'Vendedores', icon: Store },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: FolderKanban },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/admin/seguridad', label: 'Seguridad', icon: ShieldCheck },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border)] bg-[#0a0a0a] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-5">
          <Link
            href="/admin"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Kwai<span className="text-gold-gradient">Spress</span>
          </Link>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-[#ffd700] lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        {/* Badge "Admin" */}
        <div className="border-b border-[var(--border)] p-4">
          <div className="group relative overflow-hidden rounded-2xl border border-[#ffd700]/30 bg-gradient-to-br from-[#ffd700]/[0.10] via-transparent to-[#3ecf8e]/[0.05] p-4">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,215,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.8) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-[#ffd700]/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-8 -bottom-8 size-24 rounded-full bg-[#3ecf8e]/20 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ffd700] via-[#ffd700]/90 to-[#ffd700]/60 text-black shadow-lg shadow-[#ffd700]/30">
                <Crown size={20} strokeWidth={2.5} />
                <span className="absolute inset-0 animate-ping rounded-xl bg-[#ffd700]/20" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#ffd700]">
                  Panel Admin
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Control total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Panel de control
          </p>
          <div className="flex flex-col gap-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== '/admin' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#ffd700]/[0.12] to-transparent text-[#ffd700] shadow-[inset_0_0_0_1px_rgba(255,215,0,0.1)]'
                      : 'text-white/60 hover:translate-x-1 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                  )}

                  <Icon
                    size={18}
                    className={`transition-transform group-hover:scale-110 ${
                      active
                        ? 'text-[#ffd700] drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]'
                        : ''
                    }`}
                  />
                  <span className="flex-1">{label}</span>

                  {active && (
                    <span className="size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="my-4 border-t border-[var(--border)]" />

          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/40 transition-all hover:translate-x-1 hover:bg-white/[0.04] hover:text-[#3ecf8e]"
          >
            <ExternalLink
              size={16}
              className="transition-transform group-hover:scale-110"
            />
            Ver tienda pública
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3ecf8e] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#3ecf8e]" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf8e]">
                Sistema activo
              </p>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-white/40">
              KwaiSpress · v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}