'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { AdminSidebarContent } from './sidebar'
import { AdminHeader } from './header'

export function AdminShell({
  userName,
  userEmail,
  children,
}: {
  userName: string
  userEmail: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Barra lateral de escritorio */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] lg:flex">
        <AdminSidebarContent />
      </aside>

      {/* Menú móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--background)]"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            <AdminSidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setOpen(true)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
