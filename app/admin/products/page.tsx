'use client'

import { Package, Search, Filter } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Catálogo
        </p>
        <h1 className="text-3xl font-black tracking-tight">Productos</h1>
        <p className="mt-2 text-sm text-white/50">
          Revisa, aprueba o elimina los productos publicados por los vendedores.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            placeholder="Buscar producto..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#d4af37]/50"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]">
          <Filter size={14} /> Filtrar
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-12 text-center">
        <Package size={32} className="mx-auto text-white/30" />
        <p className="mt-4 text-sm font-medium text-white/60">No hay productos todavía</p>
        <p className="mt-1 text-xs text-white/40">
          Los productos aparecerán aquí cuando se conecte la base de datos.
        </p>
      </div>
    </div>
  )
}