'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  CheckCircle,
  Trash2,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Seller = {
  id: string
  store_name: string
  slug: string
  description: string | null
  status: 'pending' | 'approved' | 'suspended'
  verified: boolean
  created_at: string
  user_id: string
}

export default function SellersPage() {
  const supabase = createClient()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const loadSellers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setSellers((data as Seller[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSellers()
  }, [])

  const updateStatus = async (
    id: string,
    status: 'approved' | 'pending' | 'suspended',
  ) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al actualizar')
      }

      await loadSellers()
      setMessage(
        status === 'approved'
          ? '✅ Vendedor aprobado'
          : status === 'suspended'
            ? '⏸️ Vendedor suspendido'
            : '⏳ Vendedor marcado como pendiente',
      )
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage('❌ ' + (e instanceof Error ? e.message : 'Error'))
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setActionLoading(null)
    }
  }

  const removeSeller = async (id: string) => {
    if (!confirm('¿Eliminar definitivamente esta tienda?')) return

    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }

      await loadSellers()
      setMessage('🗑️ Vendedor eliminado')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage('❌ ' + (e instanceof Error ? e.message : 'Error'))
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadge = (status: string) => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#10b77f]/[0.12] px-2.5 py-1 text-[11px] font-medium text-[#10b77f]">
          <CheckCircle size={11} /> Aprobado
        </span>
      )
    }
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-1 text-[11px] font-medium text-yellow-400">
          <Clock size={11} /> Pendiente
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400">
        <AlertCircle size={11} /> Suspendido
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Vendedores
        </p>
        <h1 className="text-3xl font-black tracking-tight">
          Gestiona vendedores
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Aprueba, suspende o elimina las tiendas de la plataforma.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-white/[0.08] bg-[#0a0a0a] px-4 py-3 text-sm text-white">
          {message}
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-white/[0.06] bg-[#0a0a0a] py-20">
          <Loader2 className="animate-spin text-white/40" size={24} />
        </div>
      ) : sellers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-12 text-center">
          <p className="text-sm font-medium text-white/60">
            No hay vendedores todavía
          </p>
          <p className="mt-1 text-xs text-white/40">
            Las solicitudes aparecerán aquí cuando alguien quiera vender.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Tienda
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Slug
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Solicitado
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {seller.store_name}
                      </p>
                      {seller.description && (
                        <p className="mt-1 line-clamp-1 max-w-xs text-xs text-white/40">
                          {seller.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-white/50">
                      /{seller.slug}
                    </td>
                    <td className="px-5 py-4 text-white/50">
                      {new Date(seller.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-5 py-4">{statusBadge(seller.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {seller.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(seller.id, 'approved')}
                            disabled={actionLoading === seller.id}
                            className="rounded-lg border border-[#10b77f]/30 px-3 py-1.5 text-xs font-medium text-[#10b77f] transition-colors hover:bg-[#10b77f]/10 disabled:opacity-50"
                          >
                            {actionLoading === seller.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              'Aprobar'
                            )}
                          </button>
                        )}
                        {seller.status !== 'suspended' && (
                          <button
                            onClick={() => updateStatus(seller.id, 'suspended')}
                            disabled={actionLoading === seller.id}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-yellow-500/40 hover:text-yellow-400 disabled:opacity-50"
                          >
                            Suspender
                          </button>
                        )}
                        <button
                          onClick={() => removeSeller(seller.id)}
                          disabled={actionLoading === seller.id}
                          className="rounded-lg border border-white/10 p-1.5 text-white/50 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}