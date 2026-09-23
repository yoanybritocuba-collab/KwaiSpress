'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  Loader2,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Producto = {
  id: string
  title: string
  price: string
  old_price: string | null
  image_url: string | null
  stock: number | null
  status: 'draft' | 'pending' | 'published' | 'rejected'
  created_at: string
  category_id: string | null
}

export default function MisProductosPage() {
  const supabase = createClient()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const cargar = async () => {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: sellerData } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (!sellerData) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('products')
      .select(
        'id, title, price, old_price, image_url, stock, status, created_at, category_id',
      )
      .eq('seller_id', sellerData.id)
      .order('created_at', { ascending: false })

    setProductos((data as Producto[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  const toggleEstado = async (producto: Producto) => {
    const nuevoEstado =
      producto.status === 'published' ? 'pending' : 'published'

    setActionLoading(producto.id)
    const { error } = await supabase
      .from('products')
      .update({ status: nuevoEstado })
      .eq('id', producto.id)

    if (error) {
      setMessage(`❌ ${error.message}`)
    } else {
      setMessage(
        nuevoEstado === 'published'
          ? '✅ Producto publicado'
          : '⏸️ Producto oculto',
      )
      await cargar()
    }
    setActionLoading(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este producto definitivamente?')) return

    setActionLoading(id)
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      setMessage(`❌ ${error.message}`)
    } else {
      setMessage('🗑️ Producto eliminado')
      await cargar()
    }
    setActionLoading(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const filtrados = productos.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <Link
          href="/admin/mi-tienda"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
        >
          <ArrowLeft size={14} />
          Volver a mi tienda
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd700]">
              Mi catálogo
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              Mis productos
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {productos.length} producto{productos.length !== 1 ? 's' : ''} en
              tu tienda
            </p>
          </div>
          <Link
            href="/admin/mi-tienda/productos/nuevo"
            className="flex items-center gap-2 rounded-xl bg-[#ffd700] px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]/90"
          >
            <Plus size={16} />
            Añadir producto
          </Link>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-white/[0.08] bg-[var(--card)] px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {productos.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type="text"
              placeholder="Buscar en mis productos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] py-20">
          <Loader2 className="animate-spin text-[#ffd700]" size={28} />
        </div>
      ) : productos.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-20 text-center">
          <Package size={40} className="mx-auto text-white/20" />
          <p className="mt-4 font-medium">No tienes productos todavía</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Empieza añadiendo tu primer producto
          </p>
          <Link
            href="/admin/mi-tienda/productos/nuevo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ffd700] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#ffd700]/90"
          >
            <Plus size={15} />
            Añadir mi primer producto
          </Link>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            No hay productos con esa búsqueda
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((p) => (
            <article
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[#ffd700]/30"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[var(--background)]">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-2xl text-[var(--muted-foreground)]">
                    📦
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium">{p.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      p.status === 'published'
                        ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]'
                        : p.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : p.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {p.status === 'published'
                      ? 'Publicado'
                      : p.status === 'pending'
                        ? 'Pendiente'
                        : p.status === 'rejected'
                          ? 'Rechazado'
                          : 'Borrador'}
                  </span>
                </div>

                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-display text-base font-bold">
                    {Number(p.price).toFixed(2)} €
                  </span>
                  {p.old_price && (
                    <span className="text-xs text-[var(--muted-foreground)] line-through">
                      {Number(p.old_price).toFixed(2)} €
                    </span>
                  )}
                  {p.stock !== null && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      · Stock: {p.stock}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleEstado(p)}
                  disabled={actionLoading === p.id}
                  className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-[#ffd700]/40 hover:text-[#ffd700] disabled:opacity-40"
                  title={p.status === 'published' ? 'Ocultar' : 'Publicar'}
                >
                  {actionLoading === p.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : p.status === 'published' ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>

                <Link
                  href={`/admin/mi-tienda/productos/${p.id}/editar`}
                  className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-[#ffd700]/40 hover:text-[#ffd700]"
                  title="Editar"
                >
                  <Edit3 size={15} />
                </Link>

                <button
                  onClick={() => eliminar(p.id)}
                  disabled={actionLoading === p.id}
                  className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-40"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}