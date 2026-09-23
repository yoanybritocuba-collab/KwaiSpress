'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Search,
  Menu,
  X,
  Sparkles,
  Home,
  Package,
  Store,
  FolderKanban,
  ShieldCheck,
  ShoppingBag,
  User,
  LogOut,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { CartButton } from '@/components/cart/cart-button'
import { UserMenu } from '@/components/layout/user-menu'
import { createClient } from '@/lib/supabase/client'

type UserData = {
  name: string
  initial: string
  role: string
  isSeller: boolean
}

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setUser(null)
        return
      }

      const name =
        (data.user.user_metadata?.name as string) ||
        data.user.email?.split('@')[0] ||
        'Usuario'

      const role =
        (data.user.user_metadata?.role as string) ||
        (data.user.app_metadata?.role as string) ||
        'customer'

      /* Verificar si es vendedor aprobado */
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('status')
        .eq('user_id', data.user.id)
        .maybeSingle()

      setUser({
        name,
        initial: name.charAt(0).toUpperCase(),
        role,
        isSeller: sellerData?.status === 'approved',
      })
    }

    cargar()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      cargar()
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase.auth])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    setMobileMenu(false)
    router.push('/')
    router.refresh()
  }

  const isAdmin = user?.role === 'admin'

  return (
    <>
      {/* Barra superior */}
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-r from-[#ffd700]/[0.03] via-transparent to-[#3ecf8e]/[0.03]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-[10px] font-medium text-white/50 sm:text-[11px]">
          <Sparkles size={11} className="shrink-0 text-[#ffd700]" />
          <span className="truncate">
            Envío directo · Vendedores verificados ·{' '}
            <span className="text-[#ffd700]">Ofertas cada día</span>
          </span>
        </div>
      </div>

      {/* Header principal */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#0a0a0a]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="group shrink-0 font-display text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl"
          >
            Kwai
            <span className="text-gold-gradient transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
              Spress
            </span>
          </Link>

          {/* Buscador desktop */}
          <div className="relative ml-auto hidden max-w-2xl flex-1 lg:block">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              size={16}
            />
            <input
              type="search"
              placeholder="Buscar productos, vendedores..."
              className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-2.5 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-foreground)] focus:border-[#3ecf8e]/50 focus:shadow-[0_0_0_3px_rgba(62,207,142,0.08)]"
            />
          </div>

          {/* Acciones desktop */}
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <CartButton />
            <UserMenu />
          </div>

          {/* Acciones móvil */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <CartButton />
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="grid size-10 place-items-center rounded-full text-[var(--foreground)] transition-colors hover:bg-white/5 hover:text-[#ffd700]"
              aria-label={mobileMenu ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenu && (
          <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-4 lg:hidden">
            {/* Usuario logueado */}
            {user ? (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl text-base font-bold text-black ${
                    isAdmin
                      ? 'bg-gradient-to-br from-[#ffd700] to-[#ffd700]/70'
                      : 'bg-gradient-to-br from-[#3ecf8e] to-[#3ecf8e]/70'
                  }`}
                >
                  {user.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{user.name}</p>
                  <p className="truncate text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                    {isAdmin
                      ? 'Administrador'
                      : user.isSeller
                        ? 'Vendedor'
                        : 'Comprador'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-4 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenu(false)}
                  className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-medium transition-colors hover:border-[#ffd700]/40 hover:text-[#ffd700]"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenu(false)}
                  className="flex-1 rounded-xl bg-[#ffd700] px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-[#ffd700]/90"
                >
                  Registrarme
                </Link>
              </div>
            )}

            {/* Buscador móvil */}
            <div className="relative mb-4">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={16}
              />
              <input
                type="search"
                placeholder="Buscar productos..."
                className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#3ecf8e]/50"
              />
            </div>

            {/* Navegación */}
            <nav className="flex flex-col gap-0.5">
              <MenuItem
                href="/"
                label="Inicio"
                icon={Home}
                onClose={() => setMobileMenu(false)}
              />
              <MenuItem
                href="/productos"
                label="Productos"
                icon={Package}
                onClose={() => setMobileMenu(false)}
              />
              <MenuItem
                href="/vendedores"
                label="Vendedores"
                icon={Store}
                onClose={() => setMobileMenu(false)}
              />
              <MenuItem
                href="/categorias"
                label="Categorías"
                icon={FolderKanban}
                onClose={() => setMobileMenu(false)}
              />

              {/* Panel Admin (solo admin) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenu(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl border border-[#ffd700]/30 bg-gradient-to-r from-[#ffd700]/[0.08] to-transparent px-4 py-3 text-sm font-bold text-[#ffd700] transition-all hover:border-[#ffd700]/60"
                >
                  <ShieldCheck size={18} />
                  Panel Admin
                </Link>
              )}

              {/* Mi tienda (admin o vendedor) */}
              {(isAdmin || user?.isSeller) && (
                <Link
                  href="/admin/mi-tienda"
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 rounded-xl border border-[#3ecf8e]/20 bg-[#3ecf8e]/[0.04] px-4 py-3 text-sm font-bold text-[#3ecf8e] transition-all hover:border-[#3ecf8e]/50"
                >
                  <ShoppingBag size={18} />
                  Mi Tienda
                </Link>
              )}

              {/* Mi perfil (logueado) */}
              {user && (
                <>
                  <div className="my-3 border-t border-[var(--border)]" />
                  <MenuItem
                    href="/perfil"
                    label="Mi perfil"
                    icon={User}
                    onClose={() => setMobileMenu(false)}
                  />
                  <button
                    onClick={cerrarSesion}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    Cerrar sesión
                  </button>
                </>
              )}
            </nav>

            {/* Toggle tema abajo */}
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-xs text-[var(--muted-foreground)]">
                Modo oscuro / claro
              </span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>
    </>
  )
}

function MenuItem({
  href,
  label,
  icon: Icon,
  onClose,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  onClose: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card)] hover:text-[#ffd700]"
    >
      <Icon size={18} />
      {label}
    </Link>
  )
}