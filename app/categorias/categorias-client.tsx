'use client'

import { useMemo, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductGrid } from '@/components/product/product-grid'
import type { ProductCardData } from '@/lib/types'

type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
  isAdult: boolean | null
  subcategories?: Category[]
}

type Orden = 'recientes' | 'precio-asc' | 'precio-desc' | 'rating'

export function CategoriasClient({
  categorias,
  productos,
  initialSlug,
}: {
  categorias: Category[]
  productos: ProductCardData[]
  initialSlug?: string
}) {
  const normales = categorias.filter((c) => !c.isAdult)

  // Estado inicial a partir de ?cat=slug (principal o subcategoría)
  const inicial = useMemo(() => {
    if (!initialSlug) return { main: null as string | null, sub: null as string | null }
    for (const c of normales) {
      if (c.slug === initialSlug) return { main: c.id, sub: null }
      const s = c.subcategories?.find((x) => x.slug === initialSlug)
      if (s) return { main: c.id, sub: s.id }
    }
    return { main: null, sub: null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [mainId, setMainId] = useState<string | null>(inicial.main)
  const [subId, setSubId] = useState<string | null>(inicial.sub)
  const [orden, setOrden] = useState<Orden>('recientes')

  const main = normales.find((c) => c.id === mainId) ?? null

  const lista = useMemo(() => {
    let r = [...productos]
    if (subId) {
      r = r.filter((p) => p.categoryId === subId)
    } else if (main) {
      const ids = new Set([main.id, ...(main.subcategories ?? []).map((s) => s.id)])
      r = r.filter((p) => p.categoryId && ids.has(p.categoryId))
    }
    if (orden === 'precio-asc') r.sort((a, b) => a.price - b.price)
    if (orden === 'precio-desc') r.sort((a, b) => b.price - a.price)
    if (orden === 'rating') r.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return r
  }, [productos, main, subId, orden])

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
      active
        ? 'border-[#ffd700] bg-[#ffd700] text-black'
        : 'border-[var(--border)] bg-[var(--card)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
    }`

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="border-b border-[var(--border)] px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Categorías</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Explora los productos por tipo.</p>

          <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
            <button className={chip(!main)} onClick={() => { setMainId(null); setSubId(null) }}>
              Todas
            </button>
            {normales.map((c) => (
              <button
                key={c.id}
                className={chip(mainId === c.id)}
                onClick={() => { setMainId(c.id); setSubId(null) }}
              >
                {c.icon || '📦'} {c.name}
              </button>
            ))}
          </div>

          {main && (main.subcategories?.length ?? 0) > 0 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSubId(null)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  !subId ? 'border-[#3ecf8e] bg-[#3ecf8e]/15 text-[#3ecf8e]' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[#3ecf8e]'
                }`}
              >
                Todo en {main.name}
              </button>
              {main.subcategories!.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubId(s.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                    subId === s.id
                      ? 'border-[#3ecf8e] bg-[#3ecf8e]/15 text-[#3ecf8e]'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[#3ecf8e]'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">{lista.length}</span> producto{lista.length !== 1 ? 's' : ''}
            </p>
            <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              Ordenar
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[#3ecf8e]/60"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </label>
          </div>

          <ProductGrid products={lista} emptyMessage="No hay productos en esta categoría" />
        </div>
      </section>

      <Footer />
    </main>
  )
}