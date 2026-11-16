'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Ban, Trash2, BadgeCheck, Loader2, AlertCircle, ExternalLink } from 'lucide-react'

type Status = 'pending' | 'approved' | 'suspended'

export type SellerRow = {
  id: string
  storeName: string
  slug: string
  email: string | null
  location: string | null
  status: Status
  verified: boolean
  productsCount: number
  createdAt: string
}

const LABEL: Record<Status, string> = { pending: 'Pendiente', approved: 'Aprobado', suspended: 'Suspendido' }
const STYLE: Record<Status, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  approved: 'bg-[#3ecf8e]/10 text-[#3ecf8e]',
  suspended: 'bg-red-500/10 text-red-400',
}

export function SellersTable({ sellers, initialFilter }: { sellers: SellerRow[]; initialFilter: Status | 'all' }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Status | 'all'>(initialFilter)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const list = filter === 'all' ? sellers : sellers.filter((s) => s.status === filter)

  const call = async (id: string, init: RequestInit) => {
    setError('')
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        ...init,
        headers: { 'Content-Type': 'application/json' },
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) setError(data.error || 'No se pudo completar la acción')
      else router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setBusy(null)
    }
  }

  const setStatus = (id: string, status: Status) =>
    call(id, { method: 'PATCH', body: JSON.stringify({ status }) })
  const toggleVerified = (id: string, verified: boolean) =>
    call(id, { method: 'PATCH', body: JSON.stringify({ verified }) })
  const remove = (s: SellerRow) => {
    if (!confirm(`¿Eliminar la tienda "${s.storeName}" y todos sus productos? No se puede deshacer.`)) return
    call(s.id, { method: 'DELETE' })
  }

  const tabs: { v: Status | 'all'; l: string }[] = [
    { v: 'all', l: 'Todos' },
    { v: 'pending', l: 'Pendientes' },
    { v: 'approved', l: 'Aprobados' },
    { v: 'suspended', l: 'Suspendidos' },
  ]

  return (
    <>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1">
        {tabs.map((t) => (
          <button
            key={t.v}
            onClick={() => setFilter(t.v)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${
              filter === t.v ? 'bg-[#ffd700] text-black' : 'text-[var(--muted-foreground)] hover:bg-white/[0.04]'
            }`}
          >
            {t.l} ({t.v === 'all' ? sellers.length : sellers.filter((s) => s.status === t.v).length})
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {list.length === 0 ? (
        <p className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-16 text-center text-[var(--muted-foreground)]">
          No hay vendedores en esta vista.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#3ecf8e]/15 text-lg font-bold text-[#3ecf8e]">
                {s.storeName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 basis-48">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{s.storeName}</p>
                  {s.verified && <BadgeCheck size={15} className="text-[#3ecf8e]" />}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STYLE[s.status]}`}>{LABEL[s.status]}</span>
                </div>
                <p className="truncate text-xs text-[var(--muted-foreground)]">
                  /{s.slug} · {s.email ?? 'sin email'} · {s.productsCount} producto{s.productsCount !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {busy === s.id && <Loader2 size={16} className="animate-spin text-[#ffd700]" />}
                {s.status !== 'approved' && (
                  <button disabled={busy === s.id} onClick={() => setStatus(s.id, 'approved')} className="flex items-center gap-1.5 rounded-lg bg-[#3ecf8e]/15 px-3 py-2 text-xs font-semibold text-[#3ecf8e] hover:bg-[#3ecf8e]/25 disabled:opacity-50">
                    <Check size={14} /> Aprobar
                  </button>
                )}
                {s.status !== 'suspended' && (
                  <button disabled={busy === s.id} onClick={() => setStatus(s.id, 'suspended')} className="flex items-center gap-1.5 rounded-lg bg-yellow-500/15 px-3 py-2 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/25 disabled:opacity-50">
                    <Ban size={14} /> Suspender
                  </button>
                )}
                <button disabled={busy === s.id} onClick={() => toggleVerified(s.id, !s.verified)} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:bg-white/[0.04] disabled:opacity-50">
                  <BadgeCheck size={14} /> {s.verified ? 'Quitar verificado' : 'Verificar'}
                </button>
                <Link href={`/vendedor/${s.slug}`} target="_blank" aria-label="Ver tienda" className="rounded-lg p-2 text-gray-400 hover:bg-gray-400/10">
                  <ExternalLink size={16} />
                </Link>
                <button disabled={busy === s.id} onClick={() => remove(s)} aria-label="Eliminar tienda" className="rounded-lg p-2 text-red-400 hover:bg-red-400/10 disabled:opacity-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
