'use client'

import { MessageSquare } from 'lucide-react'

export default function ChatsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Mensajería
        </p>
        <h1 className="text-3xl font-black tracking-tight">Conversaciones</h1>
        <p className="mt-2 text-sm text-white/50">
          Supervisa las conversaciones entre clientes y vendedores.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Chats
          </p>
          <div className="py-12 text-center">
            <MessageSquare size={28} className="mx-auto text-white/30" />
            <p className="mt-3 text-xs text-white/40">No hay conversaciones</p>
          </div>
        </aside>

        <section className="grid min-h-96 place-items-center rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-12 text-center">
          <div>
            <MessageSquare size={32} className="mx-auto text-white/30" />
            <p className="mt-4 text-sm font-medium text-white/60">
              Selecciona una conversación
            </p>
            <p className="mt-1 text-xs text-white/40">
              Los mensajes aparecerán cuando se conecte la mensajería.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}