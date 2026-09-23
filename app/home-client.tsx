'use client'

import { useMemo, useState } from 'react'
import {
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  ArrowRight,
  Sparkles,
  Star,
  Tag,
  ArrowUpDown,
  Check,
  Flame,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { ProductGrid } from '@/components/product/product-grid'
import type { ProductCardData } from '@/components/product/product-card'

type SubCategory = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
}

type Category = SubCategory & {
  subcategories?: SubCategory[]
}

type Ordenar = 'relevancia' | 'precio-asc' | 'precio-desc' | 'rating' | 'nuevos'
type AccesoRapido = 'todos' | 'ofertas' | 'novedades' | 'top'

export function HomeClient({
  categorias,
  productos,
  ofertas,
  novedades,
  masVendidos,
}: {
  categorias: Category[]
  productos: ProductCardData[]
  ofertas: ProductCardData[]
  novedades: ProductCardData[]
  masVendidos: ProductCardData[]
}) {
  // Categorías
  const [categoriaAbierta, setCategoriaAbierta] = useState(false)
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(
    null,
  )
  const [categoriasActivas, setCategoriasActivas] = useState<Set<string>>(
    new Set(),
  )
  const [seleccionCatTemp, setSeleccionCatTemp] = useState<Set<string>>(
    new Set(),
  )

  // Filtros
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [precioMin, setPrecioMin] = useState<number | null>(null)
  const [precioMax, setPrecioMax] = useState<number | null>(null)
  const [ratingMin, setRatingMin] = useState<number | null>(null)

  // Temporales
  const [tempPrecioMin, setTempPrecioMin] = useState(0)
  const [tempPrecioMax, setTempPrecioMax] = useState(500)
  const [tempRating, setTempRating] = useState<number | null>(null)

  // Ordenar
  const [ordenarAbierto, setOrdenarAbierto] = useState(false)
  const [ordenar, setOrdenar] = useState<Ordenar>('relevancia')

  // Acceso rápido
  const [accesoRapido, setAccesoRapido] = useState<AccesoRapido>('todos')

  // Rango precios
  const rangoPrecio = useMemo(() => {
    if (productos.length === 0) return { min: 0, max: 500 }
    const precios = productos.map((p) => p.price)
    return {
      min: Math.floor(Math.min(...precios)),
      max: Math.ceil(Math.max(...precios)),
    }
  }, [productos])

  const arbol = useMemo(() => {
    const principales = categorias.filter((c) => !c.parentId)
    return principales.map((cat) => ({
      ...cat,
      subcategories: categorias.filter((s) => s.parentId === cat.id),
    }))
  }, [categorias])

  // Base según acceso rápido
  const productosBase = useMemo(() => {
    switch (accesoRapido) {
      case 'ofertas':
        return ofertas
      case 'novedades':
        return novedades
      case 'top':
        return masVendidos
      default:
        return productos
    }
  }, [accesoRapido, productos, ofertas, novedades, masVendidos])

  // Filtrado final
  const productosFiltrados = useMemo(() => {
    let result = [...productosBase]

    if (categoriasActivas.size > 0) {
      result = result.filter(
        (p) => p.categoryId && categoriasActivas.has(p.categoryId),
      )
    }

    if (precioMin !== null) result = result.filter((p) => p.price >= precioMin)
    if (precioMax !== null) result = result.filter((p) => p.price <= precioMax)
    if (ratingMin !== null)
      result = result.filter((p) => (p.rating || 0) >= ratingMin)

    switch (ordenar) {
      case 'precio-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'precio-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'nuevos':
        result.reverse()
        break
    }

    return result
  }, [
    productosBase,
    categoriasActivas,
    precioMin,
    precioMax,
    ratingMin,
    ordenar,
  ])

  const numFiltros =
    (precioMin !== null ? 1 : 0) +
    (precioMax !== null ? 1 : 0) +
    (ratingMin !== null ? 1 : 0)

  const hayFiltros = numFiltros > 0 || categoriasActivas.size > 0

  /* ---- ACCIONES ---- */

  const abrirCategorias = () => {
    setSeleccionCatTemp(new Set(categoriasActivas))
    setCategoriaAbierta(true)
  }

  const toggleCategoriaTemp = (id: string) => {
    setSeleccionCatTemp((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  const aplicarCategorias = () => {
    setCategoriasActivas(new Set(seleccionCatTemp))
    setCategoriaAbierta(false)
  }

  const restablecerCategorias = () => setSeleccionCatTemp(new Set())

  const quitarCategoria = (id: string) => {
    setCategoriasActivas((prev) => {
      const nuevo = new Set(prev)
      nuevo.delete(id)
      return nuevo
    })
  }

  const abrirFiltros = () => {
    setTempPrecioMin(precioMin ?? rangoPrecio.min)
    setTempPrecioMax(precioMax ?? rangoPrecio.max)
    setTempRating(ratingMin)
    setFiltrosAbiertos(true)
  }

  const aplicarFiltros = () => {
    setPrecioMin(tempPrecioMin > rangoPrecio.min ? tempPrecioMin : null)
    setPrecioMax(tempPrecioMax < rangoPrecio.max ? tempPrecioMax : null)
    setRatingMin(tempRating)
    setFiltrosAbiertos(false)
  }

  const restablecerFiltros = () => {
    setTempPrecioMin(rangoPrecio.min)
    setTempPrecioMax(rangoPrecio.max)
    setTempRating(null)
  }

  const limpiarTodo = () => {
    setCategoriasActivas(new Set())
    setPrecioMin(null)
    setPrecioMax(null)
    setRatingMin(null)
    setOrdenar('relevancia')
    setAccesoRapido('todos')
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      {/* ==================== BARRA DE ACCESOS RÁPIDOS ==================== */}
      <section className="border-b border-[var(--border)] px-5 py-2.5 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto pb-0.5">
          <QuickTab
            icon={<TrendingUp size={12} />}
            label="Todos"
            active={accesoRapido === 'todos'}
            onClick={() => setAccesoRapido('todos')}
          />
          <QuickTab
            icon={<Flame size={12} />}
            label="Ofertas"
            active={accesoRapido === 'ofertas'}
            onClick={() => setAccesoRapido('ofertas')}
          />
          <QuickTab
            icon={<Sparkles size={12} />}
            label="Novedades"
            active={accesoRapido === 'novedades'}
            onClick={() => setAccesoRapido('novedades')}
          />
          <QuickTab
            icon={<Trophy size={12} />}
            label="Top ventas"
            active={accesoRapido === 'top'}
            onClick={() => setAccesoRapido('top')}
          />
        </div>
      </section>

      {/* ==================== BARRA DE FILTROS ==================== */}
      <section className="sticky top-[57px] z-30 border-b border-[var(--border)] bg-[var(--background)]/95 px-5 py-2.5 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto pb-0.5">
          <FilterPill
            icon={<Filter size={12} />}
            label={numFiltros > 0 ? `Filtros (${numFiltros})` : 'Filtros'}
            hasChevron
            onClick={abrirFiltros}
            active={numFiltros > 0}
          />
          <FilterPill
            icon={<ArrowUpDown size={12} />}
            label={`Ordenar: ${
              ordenar === 'relevancia'
                ? 'Relevancia'
                : ordenar === 'precio-asc'
                  ? 'Menor precio'
                  : ordenar === 'precio-desc'
                    ? 'Mayor precio'
                    : ordenar === 'rating'
                      ? 'Mejor valorados'
                      : 'Novedades'
            }`}
            hasChevron
            onClick={() => setOrdenarAbierto(true)}
            active={ordenar !== 'relevancia'}
          />
          <FilterPill
            label={
              categoriasActivas.size > 0
                ? `Categoría (${categoriasActivas.size})`
                : 'Categoría'
            }
            hasChevron
            onClick={abrirCategorias}
            active={categoriasActivas.size > 0}
          />

          {hayFiltros && (
            <button
              onClick={limpiarTodo}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/[0.06] px-3 py-1.5 text-xs font-medium text-red-400"
            >
              <X size={11} />
              Limpiar
            </button>
          )}

          <span className="ml-auto hidden shrink-0 text-xs text-[var(--muted-foreground)] sm:block">
            {productosFiltrados.length} producto
            {productosFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {hayFiltros && (
          <div className="mx-auto mt-2 flex max-w-[1600px] flex-wrap gap-1.5">
            {Array.from(categoriasActivas).map((id) => {
              let nombre = ''
              for (const cat of arbol) {
                if (cat.id === id) {
                  nombre = cat.name
                  break
                }
                const sub = cat.subcategories?.find((s) => s.id === id)
                if (sub) {
                  nombre = sub.name
                  break
                }
              }
              return (
                <span
                  key={id}
                  className="flex items-center gap-1 rounded-full bg-[#ffd700]/[0.12] px-2.5 py-0.5 text-[10px] font-medium text-[#ffd700]"
                >
                  {nombre}
                  <button onClick={() => quitarCategoria(id)}>
                    <X size={10} />
                  </button>
                </span>
              )
            })}

            {(precioMin !== null || precioMax !== null) && (
              <span className="flex items-center gap-1 rounded-full bg-[#3ecf8e]/[0.12] px-2.5 py-0.5 text-[10px] font-medium text-[#3ecf8e]">
                {precioMin ?? rangoPrecio.min} -{' '}
                {precioMax ?? rangoPrecio.max} €
                <button
                  onClick={() => {
                    setPrecioMin(null)
                    setPrecioMax(null)
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {ratingMin !== null && (
              <span className="flex items-center gap-1 rounded-full bg-[#3ecf8e]/[0.12] px-2.5 py-0.5 text-[10px] font-medium text-[#3ecf8e]">
                <Star size={10} className="fill-[#3ecf8e]" />
                {ratingMin}+
                <button onClick={() => setRatingMin(null)}>
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* ==================== GRID DE PRODUCTOS ==================== */}
      <section className="px-5 py-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <ProductGrid
            products={productosFiltrados}
            emptyMessage="No hay productos con esos filtros"
          />
        </div>
      </section>

      {/* ==================== CTA VENDER ==================== */}
      <section className="border-t border-[var(--border)] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3ecf8e]/30 bg-[#3ecf8e]/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3ecf8e]">
            <Sparkles size={12} />
            Únete
          </span>
          <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            ¿Tienes algo que <em className="italic">vender</em>?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-[var(--muted-foreground)] sm:text-base">
            Abre tu tienda en KwaiSpress y empieza a vender hoy mismo.
          </p>
          <Link
            href="/vender"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3ecf8e] px-7 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-[#ffd700]"
          >
            Abrir mi tienda
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display text-lg font-semibold tracking-tight">
            Kwai<span className="text-gold-gradient">Spress</span>
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            © 2026 KwaiSpress
          </p>
        </div>
      </footer>

      {/* ==================== PANEL CATEGORÍAS ==================== */}
      {categoriaAbierta && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setCategoriaAbierta(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[var(--background)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Filtrar por categoría
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Selecciona una o varias
                </p>
              </div>
              <button
                onClick={() => setCategoriaAbierta(false)}
                className="grid size-9 place-items-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[#ffd700]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {arbol.map((cat) => {
                  const expandida = categoriaExpandida === cat.id
                  const tieneSubcats = (cat.subcategories?.length || 0) > 0
                  const catSeleccionada = seleccionCatTemp.has(cat.id)

                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCategoriaTemp(cat.id)}
                          className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                            catSeleccionada
                              ? 'bg-[#ffd700]/[0.08] text-[#ffd700]'
                              : 'text-[var(--foreground)] hover:bg-[var(--card)] hover:text-[#ffd700]'
                          }`}
                        >
                          <span
                            className={`grid size-5 shrink-0 place-items-center rounded-md border transition-all ${
                              catSeleccionada
                                ? 'border-[#ffd700] bg-[#ffd700]'
                                : 'border-[var(--border)]'
                            }`}
                          >
                            {catSeleccionada && (
                              <Check
                                size={12}
                                className="text-black"
                                strokeWidth={3}
                              />
                            )}
                          </span>
                          <span className="text-xl">{cat.icon || '📦'}</span>
                          <span className="flex-1">{cat.name}</span>
                        </button>

                        {tieneSubcats && (
                          <button
                            onClick={() =>
                              setCategoriaExpandida(expandida ? null : cat.id)
                            }
                            className="grid size-9 place-items-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[#ffd700]"
                          >
                            {expandida ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                        )}
                      </div>

                      {expandida && tieneSubcats && (
                        <div className="mb-2 ml-11 mt-1 flex flex-wrap gap-1.5">
                          {cat.subcategories!.map((sub) => {
                            const subSeleccionada = seleccionCatTemp.has(
                              sub.id,
                            )
                            return (
                              <button
                                key={sub.id}
                                onClick={() => toggleCategoriaTemp(sub.id)}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                  subSeleccionada
                                    ? 'border-[#ffd700] bg-[#ffd700]/[0.12] text-[#ffd700]'
                                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
                                }`}
                              >
                                {subSeleccionada && (
                                  <Check size={10} strokeWidth={3} />
                                )}
                                {sub.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3 border-t border-[var(--border)] px-6 py-5">
              <button
                onClick={restablecerCategorias}
                disabled={seleccionCatTemp.size === 0}
                className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Restablecer
              </button>
              <button
                onClick={aplicarCategorias}
                className="flex-1 rounded-full bg-[#3ecf8e] px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]"
              >
                Mostrar{' '}
                {seleccionCatTemp.size > 0 ? `(${seleccionCatTemp.size})` : ''}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ==================== PANEL FILTROS ==================== */}
      {filtrosAbiertos && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setFiltrosAbiertos(false)}
          />

          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[var(--background)] shadow-2xl">
            <div className="relative overflow-hidden border-b border-[var(--border)] px-6 py-5">
              <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-[#ffd700]/[0.08] blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-[#ffd700]/30 bg-[#ffd700]/[0.06]">
                    <Filter size={18} className="text-[#ffd700]" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">
                      Filtros
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      Afina tu búsqueda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFiltrosAbiertos(false)}
                  className="grid size-9 place-items-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[#ffd700]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {/* PRECIO */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#3ecf8e]/[0.1]">
                    <span className="text-xs font-bold text-[#3ecf8e]">€</span>
                  </span>
                  Precio
                </h3>

                <div className="relative pb-2 pt-10">
                  <div className="relative h-1.5 rounded-full bg-[var(--card)]">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-[#3ecf8e] to-[#ffd700]"
                      style={{
                        left: `${((tempPrecioMin - rangoPrecio.min) / (rangoPrecio.max - rangoPrecio.min)) * 100}%`,
                        right: `${100 - ((tempPrecioMax - rangoPrecio.min) / (rangoPrecio.max - rangoPrecio.min)) * 100}%`,
                      }}
                    />

                    <div
                      className="pointer-events-none absolute -top-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#3ecf8e]/40 bg-black px-2 py-1 text-[10px] font-bold text-[#3ecf8e] shadow-lg"
                      style={{
                        left: `${((tempPrecioMin - rangoPrecio.min) / (rangoPrecio.max - rangoPrecio.min)) * 100}%`,
                      }}
                    >
                      {tempPrecioMin} €
                    </div>

                    <div
                      className="pointer-events-none absolute -top-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#ffd700]/40 bg-black px-2 py-1 text-[10px] font-bold text-[#ffd700] shadow-lg"
                      style={{
                        left: `${((tempPrecioMax - rangoPrecio.min) / (rangoPrecio.max - rangoPrecio.min)) * 100}%`,
                      }}
                    >
                      {tempPrecioMax} €
                    </div>
                  </div>

                  <input
                    type="range"
                    min={rangoPrecio.min}
                    max={rangoPrecio.max}
                    value={tempPrecioMin}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (val <= tempPrecioMax) setTempPrecioMin(val)
                    }}
                    className="pointer-events-none absolute left-0 top-10 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3ecf8e] [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-[0_0_16px_rgba(62,207,142,0.6)] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#3ecf8e] [&::-moz-range-thumb]:bg-black"
                    style={{ zIndex: 3 }}
                  />

                  <input
                    type="range"
                    min={rangoPrecio.min}
                    max={rangoPrecio.max}
                    value={tempPrecioMax}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (val >= tempPrecioMin) setTempPrecioMax(val)
                    }}
                    className="pointer-events-none absolute left-0 top-10 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ffd700] [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-[0_0_16px_rgba(255,215,0,0.6)] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#ffd700] [&::-moz-range-thumb]:bg-black"
                    style={{ zIndex: 4 }}
                  />

                  <div className="mt-6 flex justify-between text-[10px] font-medium text-[var(--muted-foreground)]">
                    <span>{rangoPrecio.min} €</span>
                    <span>{rangoPrecio.max} €</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      min={rangoPrecio.min}
                      max={tempPrecioMax}
                      value={tempPrecioMin}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        if (val <= tempPrecioMax)
                          setTempPrecioMin(Math.max(rangoPrecio.min, val))
                      }}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#3ecf8e]/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Máximo
                    </label>
                    <input
                      type="number"
                      min={tempPrecioMin}
                      max={rangoPrecio.max}
                      value={tempPrecioMax}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        if (val >= tempPrecioMin)
                          setTempPrecioMax(Math.min(rangoPrecio.max, val))
                      }}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { label: 'Hasta 20€', min: rangoPrecio.min, max: 20 },
                    { label: '20-50€', min: 20, max: 50 },
                    { label: '50-100€', min: 50, max: 100 },
                    { label: '100€+', min: 100, max: rangoPrecio.max },
                  ].map((r) => (
                    <button
                      key={r.label}
                      onClick={() => {
                        setTempPrecioMin(r.min)
                        setTempPrecioMax(r.max)
                      }}
                      className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:-translate-y-0.5 hover:border-[#3ecf8e]/50 hover:text-[#3ecf8e]"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VALORACIÓN */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#ffd700]/[0.1]">
                    <Star size={12} className="fill-[#ffd700] text-[#ffd700]" />
                  </span>
                  Valoración
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[5, 4, 3, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() =>
                        setTempRating(tempRating === r ? null : r)
                      }
                      className={`group flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all ${
                        tempRating === r
                          ? 'border-[#ffd700]/50 bg-[#ffd700]/[0.08]'
                          : 'border-[var(--border)] bg-[var(--card)] hover:border-[#ffd700]/30'
                      }`}
                    >
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i <= r
                                ? 'fill-[#ffd700] text-[#ffd700]'
                                : 'text-[var(--muted-foreground)]/30'
                            }
                          />
                        ))}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          tempRating === r
                            ? 'text-[#ffd700]'
                            : 'text-[var(--muted-foreground)]'
                        }`}
                      >
                        {r}+ estrellas
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-[var(--border)] px-6 py-5">
              <button
                onClick={restablecerFiltros}
                className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:border-red-500/40 hover:text-red-400"
              >
                Restablecer
              </button>
              <button
                onClick={aplicarFiltros}
                className="flex-1 rounded-full bg-[#3ecf8e] px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]"
              >
                Aplicar filtros
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ==================== PANEL ORDENAR ==================== */}
      {ordenarAbierto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOrdenarAbierto(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[var(--background)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <h2 className="font-display text-xl font-semibold">
                Ordenar por
              </h2>
              <button
                onClick={() => setOrdenarAbierto(false)}
                className="grid size-9 place-items-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[#ffd700]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-1">
                {[
                  { value: 'relevancia', label: 'Relevancia' },
                  { value: 'precio-asc', label: 'Precio: menor a mayor' },
                  { value: 'precio-desc', label: 'Precio: mayor a menor' },
                  { value: 'rating', label: 'Mejor valorados' },
                  { value: 'nuevos', label: 'Más recientes' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setOrdenar(opt.value as Ordenar)
                      setOrdenarAbierto(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                      ordenar === opt.value
                        ? 'bg-[#ffd700]/[0.08] text-[#ffd700]'
                        : 'text-[var(--foreground)] hover:bg-[var(--card)] hover:text-[#ffd700]'
                    }`}
                  >
                    {opt.label}
                    {ordenar === opt.value && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </main>
  )
}

/* ============================================================
   COMPONENTES
   ============================================================ */

function QuickTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'bg-[#ffd700] text-black'
          : 'border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
      }`}
    >
      <span className={active ? 'text-black' : 'text-[#ffd700]'}>{icon}</span>
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
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? 'border-[#ffd700]/50 bg-[#ffd700]/[0.08] text-[#ffd700]'
          : 'border-[var(--border)] bg-[var(--card)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {hasChevron && (
        <ChevronDown size={12} className="text-[var(--muted-foreground)]" />
      )}
    </button>
  )
}