'use client'

import { Gavel, ShieldAlert } from 'lucide-react'

export default function ModerationPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Moderación
        </p>
        <h1 className="text-3xl font-black tracking-tight">Moderación</h1>
        <p className="mt-2 text-sm text-white/50">
          Revisa los reportes de usuarios y toma acciones.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
          <ShieldAlert size={18} className="text-white/40" />
          <p className="mt-4 text-3xl font-black">0</p>
          <p className="mt-1 text-sm text-white/80">Reportes pendientes</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
          <Gavel size={18} className="text-white/40" />
          <p className="mt-4 text-3xl font-black">0</p>
          <p className="mt-1 text-sm text-white/80">Acciones tomadas</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
          <ShieldAlert size={18} className="text-white/40" />
          <p className="mt-4 text-3xl font-black">0</p>
          <p className="mt-1 text-sm text-white/80">Usuarios advertidos</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-12 text-center">
        <Gavel size={32} className="mx-auto text-white/30" />
        <p className="mt-4 text-sm font-medium text-white/60">Sin reportes por ahora</p>
        <p className="mt-1 text-xs text-white/40">
          Los reportes aparecerán cuando los usuarios empiecen a reportar.
        </p>
      </div>
    </div>
  )
}