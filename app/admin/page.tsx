'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  Package,
  ShieldAlert,
  Store,
  Users,
} from 'lucide-react'

const metrics = [
  { label: 'Vendedores pendientes', value: '12', detail: 'Requieren revisión', icon: Store },
  { label: 'Productos publicados', value: '248', detail: '+18 esta semana', icon: Package },
  { label: 'Chats abiertos', value: '36', detail: '8 mensajes hoy', icon: MessageSquare },
  { label: 'Reportes pendientes', value: '4', detail: 'Atención prioritaria', icon: ShieldAlert },
]

const activity = [
  ['Nueva solicitud de vendedor', 'María López quiere abrir una tienda', 'Hace 8 min', 'Revisar'],
  ['Producto pendiente de aprobación', 'Auriculares inalámbricos · Tecnología', 'Hace 23 min', 'Moderar'],
  ['Reporte recibido', 'Un usuario reportó un mensaje', 'Hace 1 h', 'Investigar'],
]

export default function AdminPage() {
  const [approval, setApproval] = useState(true)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
            Centro de control
          </p>
          <h1 className="text-3xl font-black tracking-tight">Buenos días, Director.</h1>
          <p className="mt-2 text-sm text-white/50">
            Administra vendedores, productos, conversaciones y toda la experiencia.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#10b77f]/20 bg-[#10b77f]/[0.06] px-3.5 py-1.5 text-xs font-medium text-[#10b77f]">
          <span className="size-1.5 rounded-full bg-[#10b77f]" /> Sistema operativo
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/30"
          >
            <Icon size={18} className="text-white/40" />
            <p className="mt-5 text-3xl font-black">{value}</p>
            <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
            <p className="mt-1.5 text-xs text-white/40">{detail}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold">Actividad de la plataforma</h2>
              <p className="mt-1 text-xs text-white/40">Últimos 30 días</p>
            </div>
            <Activity size={18} className="text-white/40" />
          </div>
          <div className="mt-8 flex h-40 items-end gap-1.5">
            {[32, 48, 40, 58, 52, 70, 62, 82, 68, 92, 76, 100, 85, 94, 73, 88, 96, 78, 100, 90, 83, 98, 86, 100, 92, 98, 94, 100, 96, 100].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-sm bg-white/10 transition-colors hover:bg-[#d4af37]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] text-white/30">
            <span>Hace 30 días</span>
            <span>Hoy</span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
          <h2 className="font-bold">Accesos rápidos</h2>
          <p className="mt-1 text-xs text-white/40">Gestiona lo urgente</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/admin/sellers"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]"
            >
              <span className="flex items-center gap-3">
                <Store size={16} /> Revisar vendedores
              </span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]"
            >
              <span className="flex items-center gap-3">
                <Package size={16} /> Gestionar categorías
              </span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]"
            >
              <span className="flex items-center gap-3">
                <Users size={16} /> Ver usuarios
              </span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div>
            <p className="font-bold">Moderación previa</p>
            <p className="mt-1 text-xs text-white/45">
              Aprobar productos antes de publicarlos.
            </p>
          </div>
          <input
            type="checkbox"
            checked={approval}
            onChange={(e) => setApproval(e.target.checked)}
            className="size-4 accent-[#10b77f]"
          />
        </label>
      </section>

      <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Actividad reciente</h2>
            <p className="mt-1 text-xs text-white/40">Registro de acciones y alertas</p>
          </div>
          <CheckCircle2 size={18} className="text-white/40" />
        </div>
        <div className="flex flex-col divide-y divide-white/[0.06]">
          {activity.map(([title, description, time, action]) => (
            <div
              key={title}
              className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-white/45">{description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/30">{time}</span>
                <button className="text-xs font-semibold text-white/60 transition-colors hover:text-[#d4af37]">
                  {action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}