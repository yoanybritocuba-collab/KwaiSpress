'use client'

import { BarChart3, TrendingUp, Eye, MessageSquare } from 'lucide-react'

const metrics = [
  { label: 'Visitas hoy', value: '1.248', icon: Eye },
  { label: 'Productos vistos', value: '3.902', icon: TrendingUp },
  { label: 'Chats iniciados', value: '184', icon: MessageSquare },
  { label: 'Conversión', value: '3.2%', icon: BarChart3 },
]

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Estadísticas
        </p>
        <h1 className="text-3xl font-black tracking-tight">Analítica</h1>
        <p className="mt-2 text-sm text-white/50">
          Métricas de uso, tráfico y comportamiento de la plataforma.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/30"
          >
            <Icon size={18} className="text-white/40" />
            <p className="mt-5 text-3xl font-black">{value}</p>
            <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
        <h2 className="font-bold">Tráfico últimos 14 días</h2>
        <p className="mt-1 text-xs text-white/40">Visitas diarias</p>
        <div className="mt-8 flex h-40 items-end gap-1.5">
          {[42, 58, 34, 78, 62, 88, 54, 96, 72, 84, 90, 68, 100, 82].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-white/10 transition-colors hover:bg-[#d4af37]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between text-[10px] text-white/30">
          <span>Hace 14 días</span>
          <span>Hoy</span>
        </div>
      </section>
    </div>
  )
}