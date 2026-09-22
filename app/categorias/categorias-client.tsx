'use client'

import { useMemo, useState } from 'react'
import {
  TrendingUp,
  Sparkles,
  Percent,
  Filter,
  ChevronDown,
  X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProductGrid } from '@/components/product/product-grid'

type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
  isAdult: boolean | null
  subcategories?: Category[]
}

type Producto = {
  id: string
  title: string
  price: number
  oldPrice: number | null
  imageUrl: string | null
  badge: string | null
  rating: number
  reviewsCount: number
  sellerName: string
  categoryId?: string | null
}

export function CategoriasClient({
  categorias,
  productos,
}: {
  categorias: Category[]
  productos: (Producto & { categoryId: string | null })[]
}) {
  const [categoriaAbierta, setCategoriaAbierta] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState<{
    id: string
    nombre: string
  } | null>(null)
  const [seleccionTemporal, setSeleccionTemporal] = useState<string | null>(null)

  const normales = categorias.filter((c) => !c.isAdult)

  // Filtrar productos por la categoría activa
  const productosFiltrados = useMemo(() => {
    if (!categoriaActiva) return productos

    // Buscar la categoría principal (sea cual sea la subcategoría)
    const catEncontrada = normales.find(
      (c) =>
        c.id === categoriaActiva.id ||
        c.subcategories?.some((s) => s.id === categoriaActiva.id),
    )

    // IDs válidos: la categoría + todas sus subcategorías
    const idsValidos = new Set<string>()
    if (catEncontrada) {
      idsValidos.add(catEncontrada.id)
      catEncontrada.subcategories?.forEach((s) => idsValidos.add(s.id))
    } else {
      idsValidos.add(categoriaActiva.id)
    }

    return productos.filter(
      (p) => p.categoryId && idsValidos.has(p.categoryId),
    )
  }, [productos, categoriaActiva, normales])

  const abrirPanel = () => {
    setSeleccionTemporal(categoriaActiva?.id || null)
    setCategoriaAbierta(true)
  }

  const aplicarSeleccion = () => {
    if (!seleccionTemporal) {
      setCategoriaActiva(null)
      setCategoriaAbierta(false)
      return
    }

    // Buscar nombre
    let nombre = ''
    for (const cat of normales) {
      if (cat.id === seleccionTemporal) {
        nombre = cat.name
        break
      }
      const sub = cat.subcategories?.find((s) => s.id === seleccionTemporal)
      if (sub) {
        nombre = sub.name
        break
      }
    }

    setCategoriaActiva({ id: seleccionTemporal, nombre })
    setCategoriaAbierta(false)
  }

  const restablecer = () => {
    setSeleccionTemporal(null)
  }

  const limpiarCategoria = () => {
    setCategoriaActiva(null)
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="border-b border-[var(--border)] px-5 py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          <QuickPill icon={<TrendingUp size={13} />} label="Artículos más vendidos" />
          <QuickPill icon={<Sparkles size={13} />} label="Almacén local" />
          <QuickPill icon={<Percent size={13} />} label="Ofertas" />
          <QuickPill icon={<Sparkles size={13} />} label="Destacados" />
        </div>
      </section>

      <section className="border-b border-[var(--border)] px-5 py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto pb-1">
          <FilterPill icon={<Filter size={13} />} label="Filtros" />
          <FilterPill label="Ordenar por: Relevancia" hasChevron />
          <FilterPill
            label={categoriaActiva ? categoriaActiva.nombre : 'Categoría'}
            hasChevron
            onClick={abrirPanel}
            active={!!categoriaActiva}
          />
          <FilterPill label="Precio" hasChevron />
          <FilterPill label="Valoración" hasChevron />
          <FilterPill label="Envío" hasChevron />
          <FilterPill label="Novedades" hasChevron />

          {categoriaActiva && (
            <button
              onClick={limpiarCategoria}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#ffd700]/[0.12] px-3 py-2 text-xs font-medium text-[#ffd700]"
            >
              <X size={12} />
              Quitar filtro
            </button>
          )}
        </div>
      </section>

      <section className="px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {categoriaActiva && (
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Mostrando{' '}
              <span className="font-medium text-[var(--foreground)]">
                {productosFiltrados.length}
              </span>{' '}
              productos en{' '}
              <span className="font-medium text-[#ffd700]">
                {categoriaActiva.nombre}
              </span>
            </p>
          )}
          <ProductGrid
            products={productosFiltrados}
            emptyMessage="No hay productos en esta categoría"
          />
        </div>
      </section>

      {categoriaAbierta && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setCategoriaAbierta(false)}
          />

          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[var(--background)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <h2 className="font-display text-xl font-semibold">
                Elegir categoría
              </h2>
              <button
                onClick={() => setCategoriaAbierta(false)}
                className="grid size-9 place-items-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[#ffd700]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                {normales.map((cat) => (
                  <div key={cat.id}>
                    <button
                      onClick={() => setSeleccionTemporal(cat.id)}
                      className={`mb-3 text-base font-semibold transition-colors ${
                        seleccionTemporal === cat.id
                          ? 'text-[#ffd700]'
                          : 'text-[var(--foreground)] hover:text-[#ffd700]'
                      }`}
                    >
                      {cat.name}
                    </button>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSeleccionTemporal(sub.id)}
                            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                              seleccionTemporal === sub.id
                                ? 'border-[#ffd700] bg-[#ffd700]/[0.12] text-[#ffd700]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 border-t border-[var(--border)] px-6 py-5">
              <button
                onClick={restablecer}
                className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:border-[#ffd700] hover:text-[#ffd700]"
              >
                Restablecer
              </button>
              <button
                onClick={aplicarSeleccion}
                className="flex-1 rounded-full bg-[#3ecf8e] px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]"
              >
                Mostrar resultados
              </button>
            </div>
          </aside>
        </>
      )}
    </main>
  )
}

function QuickPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[#ffd700]/40 hover:text-[#ffd700]">
      <span className="text-[#ffd700]">{icon}</span>
      {label}
    </button>
  )
}

function FilterPill({
  icon,
  label,
  hasChevron,
  onClick,
  active,
}: {
  icon?: React.ReactNode
  label: string
  hasChevron?: boolean
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? 'border-[#ffd700]/50 bg-[#ffd700]/[0.08] text-[#ffd700]'
          : 'border-[var(--border)] bg-[var(--card)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {hasChevron && (
        <ChevronDown size={14} className="text-[var(--muted-foreground)]" />
      )}
    </button>
  )
}