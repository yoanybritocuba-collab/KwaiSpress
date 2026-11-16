'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Edit3,
  Trash2,
  Search,
  Package,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { eliminarProducto, cambiarEstadoProducto } from '@/app/actions/productos'

export type ProductRow = {
  id: string
  title: string
  price: string
  stock: number | null
  status: 'draft' | 'pending' | 'published' | 'rejected'
  imageUrl: string | null
  sellerName: string | null
}

const STATUS_OPTIONS: { value: ProductRow['status']; label: string }[] = [
  { value: 'published', label: 'Publicado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'draft', label: 'Borrador' },
  { value: 'rejected', label: 'Rechazado' },
]

const STATUS_STYLE: Record<ProductRow['status'], string> = {
  published: 'bg-[#3ecf8e]/10 text-[#3ecf8e]',
  pending: 'bg-yellow-500/10 text-yellow-400',
  draft: 'bg-white/5 text-[var(--muted-foreground)]',
  rejected: 'bg-red-500/10 text-red-400',
}

export function ProductsTable({
  productos,
  newHref,
  editHref,
  canModerate = false,
  showSeller = false,
  emptyText = 'Añade tu primer producto para empezar.',
}: {
  productos: ProductRow[]
  newHref: string
  /** Genera la URL de edición de un producto */
  editHref: string
  canModerate?: boolean
  showSeller?: boolean
  emptyText?: string
}) {
  const [rows, setRows] = useState(productos)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((p) => p.title.toLowerCase().includes(q))
  }, [rows, busqueda])

  const borrar = (id: string, title: string) => {
    if (!confirm(`¿Seguro que quieres borrar "${title}"? Esta acción no se puede deshacer.`)) return
    setError('')
    setBusyId(id)
    startTransition(async () => {
      const res = await eliminarProducto(id)
      if ('success' in res) {
        setRows((prev) => prev.filter((p) => p.id !== id))
      } else {
        setError(res.error)
      }
      setBusyId(null)
    })
  }

  const cambiarEstado = (id: string, status: ProductRow['status']) => {
    setError('')
    setBusyId(id)
    startTransition(async () => {
      const res = await cambiarEstadoProducto(id, status)
      if (res.ok) {
        setRows((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      } else {
        setError(res.error)
      }
      setBusyId(null)
    })
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <Search className="text-[var(--muted-foreground)]" size={20} />
        <input
          type="search"
          placeholder="Buscar producto por nombre..."
          aria-label="Buscar producto"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Link
          href={newHref}
          className="flex items-center gap-2 rounded-xl bg-[#ffd700] px-4 py-2 text-sm font-bold text-black hover:bg-[#ffd700]/90"
        >
          <Plus size={16} /> Añadir producto
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400"
        >
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center p-16 text-center">
            <Package size={48} className="mb-4 text-[var(--muted-foreground)]" />
            <h3 className="text-xl font-bold">No hay productos</h3>
            <p className="text-[var(--muted-foreground)]">
              {busqueda ? 'Ningún producto coincide con la búsqueda.' : emptyText}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-[var(--border)] bg-[var(--background)]/50 text-xs uppercase text-[var(--muted-foreground)]">
                <tr>
                  <th className="p-4 font-bold">Producto</th>
                  <th className="p-4 font-bold">Precio</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtrados.map((prod) => (
                  <tr key={prod.id} className="transition-colors hover:bg-[var(--background)]/50">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                          {prod.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={prod.imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="grid size-full place-items-center">📦</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="line-clamp-1 text-sm font-semibold">{prod.title}</span>
                          {showSeller && prod.sellerName && (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {prod.sellerName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold">{Number(prod.price).toFixed(2)} €</td>
                    <td className="p-4 text-sm">{prod.stock ?? '∞'}</td>
                    <td className="p-4">
                      {canModerate ? (
                        <select
                          aria-label={`Estado de ${prod.title}`}
                          value={prod.status}
                          disabled={busyId === prod.id}
                          onChange={(e) =>
                            cambiarEstado(prod.id, e.target.value as ProductRow['status'])
                          }
                          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs outline-none focus:border-[#ffd700]"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[prod.status]}`}
                        >
                          {STATUS_OPTIONS.find((o) => o.value === prod.status)?.label}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/producto/${prod.id}`}
                          target="_blank"
                          aria-label="Ver en la web"
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-400/10"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link
                          href={editHref.replace('{id}', prod.id)}
                          aria-label="Editar"
                          className="rounded-lg p-2 text-blue-400 hover:bg-blue-400/10"
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button
                          onClick={() => borrar(prod.id, prod.title)}
                          disabled={busyId === prod.id}
                          aria-label="Eliminar"
                          className="rounded-lg p-2 text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                        >
                          {busyId === prod.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
