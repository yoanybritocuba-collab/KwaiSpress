'use client'

import { Users } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Comunidad
        </p>
        <h1 className="text-3xl font-black tracking-tight">Usuarios</h1>
        <p className="mt-2 text-sm text-white/50">
          Gestiona clientes, vendedores y administradores de la plataforma.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-12 text-center">
        <Users size={32} className="mx-auto text-white/30" />
        <p className="mt-4 text-sm font-medium text-white/60">No hay usuarios cargados</p>
        <p className="mt-1 text-xs text-white/40">
          Los usuarios aparecerán cuando se conecte la autenticación.
        </p>
      </div>
    </div>
  )
}