'use client'

import Link from 'next/link'
import { Search, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { CartButton } from '@/components/cart/cart-button'
import { UserMenu } from '@/components/layout/user-menu'

export function Header() {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <>
      {/* Barra superior */}
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-r from-[#ffd700]/[0.03] via-transparent to-[#3ecf8e]/[0.03]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-[11px] font-medium text-white/50">
          <Sparkles size={11} className="text-[#ffd700]" />
          <span>
            Envío directo · Vendedores verificados ·{' '}
            <span className="text-[#ffd700]">Ofertas cada día</span>
          </span>
        </div>
      </div>

      {/* Header principal */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#0a0a0a]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="group font-display text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Kwai
            <span className="text-gold-gradient transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
              Spress
            </span>
          </Link>

          {/* Buscador */}
          <div className="relative ml-auto hidden max-w-2xl flex-1 md:block">
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
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <CartButton />
            <UserMenu />
          </div>

          {/* Botones móviles */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <CartButton />
            <UserMenu />
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
          <div className="border-t border-[var(--border)] px-4 py-4 md:hidden">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={16}
              />
              <input
                type="search"
                placeholder="Buscar productos..."
                className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-2.5 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none"
              />
            </div>
          </div>
        )}
      </header>
    </>
  )
}