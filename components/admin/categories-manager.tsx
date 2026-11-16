'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { crearCategoria, cambiarCategoriaActiva, eliminarCategoria } from '@/app/actions/categorias'

export type CategoryRow = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
  active: boolean | null
  productsCount: number
}

export function CategoriesManager({ categorias }: { categorias: CategoryRow[] }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const mains = categorias.filter((c) => !c.parentId)
  const subsOf = (id: string) => categorias.filter((c) => c.parentId === id)

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError('')
    start(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error ?? 'Error')
    })
  }

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    run(async () => {
      const r = await crearCategoria({ name, icon, parentId: parentId || null })
      if (r.ok) { setName(''); setIcon('') }
      return r
    })
  }

  const Row = ({ c, sub }: { c: CategoryRow; sub?: boolean }) => (
    <div className={`flex items-center gap-3 py-3 ${sub ? 'pl-8' : ''}`}>
      <span className="w-6 text-center">{c.icon ?? '📁'}</span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${sub ? '' : 'font-semibold'} ${c.active === false ? 'opacity-50 line-through' : ''}`}>{c.name}</p>
        <p className="text-xs text-[var(--muted-foreground)]">/{c.slug} · {c.productsCount} producto{c.productsCount !== 1 ? 's' : ''}</p>
      </div>
      <button disabled={pending} onClick={() => run(() => cambiarCategoriaActiva(c.id, !(c.active ?? true)))} aria-label={c.active === false ? 'Activar' : 'Desactivar'} className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-white/[0.05] disabled:opacity-50">
        {c.active === false ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      <button disabled={pending} onClick={() => confirm(`¿Eliminar la categoría "${c.name}"?`) && run(() => eliminarCategoria(c.id))} aria-label="Eliminar" className="rounded-lg p-2 text-red-400 hover:bg-red-400/10 disabled:opacity-50">
        <Trash2 size={16} />
      </button>
    </div>
  )

  return (
    <>
      <form onSubmit={add} className="mb-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-[1fr_80px_1fr_auto]">
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} placeholder="Nombre de la categoría" aria-label="Nombre" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-[#ffd700]" />
        <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} placeholder="😀" aria-label="Icono" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-center text-sm outline-none focus:border-[#ffd700]" />
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} aria-label="Categoría padre" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[#ffd700]">
          <option value="">Categoría principal</option>
          {mains.map((m) => <option key={m.id} value={m.id}>Subcategoría de {m.name}</option>)}
        </select>
        <button disabled={pending || !name.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-[#ffd700] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Crear
        </button>
      </form>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4">
        {mains.length === 0 && <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">Todavía no hay categorías.</p>}
        {mains.map((m) => (
          <div key={m.id}>
            <Row c={m} />
            {subsOf(m.id).map((s) => <Row key={s.id} c={s} sub />)}
          </div>
        ))}
      </div>
    </>
  )
}
