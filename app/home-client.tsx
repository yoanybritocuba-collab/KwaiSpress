'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Flame,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductGrid } from '@/components/product/product-grid'
import type { ProductCardData } from '@/lib/types'

type SubCategory = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
}
type Category = SubCategory & { subcategories?: SubCategory[] }

type Ordenar = 'relevancia' | 'precio-asc' | 'precio-desc' | 'rating' | 'nuevos'
type Acceso = 'todos' | 'ofertas' | 'novedades' | 'top'

const ORDEN_LABEL: Record<Ordenar, string> = {
  relevancia: 'Relevancia',
  'precio-asc': 'Menor precio',
  'precio-desc': 'Mayor precio',
  rating: 'Mejor valorados',
  nuevos: 'Más recientes',
}

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
  const [catAbierta, setCatAbierta] = useState(false)
  const [catExpandida, setCatExpandida] = useState<string | null>(null)
  const [catsActivas, setCatsActivas] = useState<Set<string>>(new Set())
  const [catsTemp, setCatsTemp] = useState<Set<string>>(new Set())

  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [precioMin, setPrecioMin] = useState<number | null>(null)
  const [precioMax, setPrecioMax] = useState<number | null>(null)
  const [ratingMin, setRatingMin] = useState<number | null>(null)
  const [tmpMin, setTmpMin] = useState(0)
  const [tmpMax, setTmpMax] = useState(500)
  const [tmpRating, setTmpRating] = useState<number | null>(null)

  const [ordenAbierto, setOrdenAbierto] = useState(false)
  const [orden, setOrden] = useState<Ordenar>('relevancia')
  const [acceso, setAcceso] = useState<Acceso>('todos')

  const rango = useMemo(() => {
    if (productos.length === 0) return { min: 0, max: 500 }
    const precios = productos.map((p) => p.price)
    return {
      min: Math.floor(Math.min(...precios)),
      max: Math.ceil(Math.max(...precios)),
    }
  }, [productos])

  const arbol = useMemo(
    () =>
      categorias
        .filter((c) => !c.parentId)
        .map((c) => ({
          ...c,
          subcategories: categorias.filter((s) => s.parentId === c.id),
        })),
    [categorias],
  )

  const base = useMemo(() => {
    if (acceso === 'ofertas') return ofertas
    if (acceso === 'novedades') return novedades
    if (acceso === 'top') return masVendidos
    return productos
  }, [acceso, productos, ofertas, novedades, masVendidos])

  const filtrados = useMemo(() => {
    let r = [...base]
    if (catsActivas.size > 0)
      r = r.filter((p) => p.categoryId && catsActivas.has(p.categoryId))
    if (precioMin !== null) r = r.filter((p) => p.price >= precioMin)
    if (precioMax !== null) r = r.filter((p) => p.price <= precioMax)
    if (ratingMin !== null) r = r.filter((p) => (p.rating || 0) >= ratingMin)
    if (orden === 'precio-asc') r.sort((a, b) => a.price - b.price)
    if (orden === 'precio-desc') r.sort((a, b) => b.price - a.price)
    if (orden === 'rating') r.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return r
  }, [base, catsActivas, precioMin, precioMax, ratingMin, orden])

  const numFiltros =
    (precioMin !== null ? 1 : 0) +
    (precioMax !== null ? 1 : 0) +
    (ratingMin !== null ? 1 : 0)
  const hayFiltros =
    numFiltros > 0 || catsActivas.size > 0 || orden !== 'relevancia' || acceso !== 'todos'

  const nombreCategoria = (id: string) => {
    for (const c of arbol) {
      if (c.id === id) return c.name
      const s = c.subcategories.find((x) => x.id === id)
      if (s) return s.name
    }
    return ''
  }

  const abrirCategorias = () => {
    setCatsTemp(new Set(catsActivas))
    setCatAbierta(true)
  }
  const toggleCatTemp = (id: string) =>
    setCatsTemp((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const abrirFiltros = () => {
    setTmpMin(precioMin ?? rango.min)
    setTmpMax(precioMax ?? rango.max)
    setTmpRating(ratingMin)
    setFiltrosAbiertos(true)
  }
  const aplicarFiltros = () => {
    const mn = Math.min(tmpMin, tmpMax)
    const mx = Math.max(tmpMin, tmpMax)
    setPrecioMin(mn > rango.min ? mn : null)
    setPrecioMax(mx < rango.max ? mx : null)
    setRatingMin(tmpRating)
    setFiltrosAbiertos(false)
  }

  const limpiarTodo = () => {
    setCatsActivas(new Set())
    setPrecioMin(null)
    setPrecioMax(null)
    setRatingMin(null)
    setOrden('relevancia')
    setAcceso('todos')
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      {/* ==================== PORTADA ==================== */}
      <section className="relative overflow-hidden border-b border-[var(--border)] px-5 py-14 sm:py-20 lg:px-8">
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="animate-fade-up relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3ecf8e]/30 bg-[#3ecf8e]/[0.07] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3ecf8e]">
            <MessageCircle size={12} />
            Compra hablando directo con el vendedor
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Encuentra lo que buscas.
            <br />
            <span className="text-gold-gradient">Pregunta y compra por chat.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm text-[var(--muted-foreground)] sm:text-base">
            Elige un producto, escribe al vendedor sin crear ninguna cuenta y
            cierra la compra en una conversación privada.
          </p>

          <form
            action="/productos"
            method="get"
            role="search"
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-lg focus-within:border-[#3ecf8e]/50"
          >
            <Search size={18} className="ml-3 shrink-0 text-[var(--muted-foreground)]" />
            <input
              type="search"
              name="q"
              maxLength={80}
              aria-label="Buscar productos"
              placeholder="¿Qué estás buscando?"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[#3ecf8e] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#ffd700]"
            >
              Buscar
            </button>
          </form>

          {arbol.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {arbol.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  href={`/categorias?cat=${c.slug}`}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-xs font-medium hover:border-[#ffd700]/50 hover:text-[#ffd700]"
                >
                  <span>{c.icon || '📦'}</span>
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <ul className="mt-10 grid gap-3 text-left sm:grid-cols-3">
            {[
              { icon: <ShieldCheck size={18} />, t: 'Vendedores verificados', d: 'Tiendas revisadas por nuestro equipo.' },
              { icon: <Zap size={18} />, t: 'Sin registro', d: 'Solo tu nombre y correo para chatear.' },
              { icon: <MessageCircle size={18} />, t: 'Chat privado', d: 'Solo tú y el vendedor veis la conversación.' },
            ].map((x) => (
              <li
                key={x.t}
                className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-4"
              >
                <span className="mt-0.5 text-[#3ecf8e]">{x.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{x.t}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{x.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ==================== ACCESOS RÁPIDOS ==================== */}
      <section className="border-b border-[var(--border)] px-5 py-3 lg:px-8">
        <div className="no-scrollbar mx-auto flex max-w-[1600px] gap-2 overflow-x-auto">
          <QuickTab icon={<TrendingUp size={13} />} label="Todos" active={acceso === 'todos'} onClick={() => setAcceso('todos')} />
          <QuickTab icon={<Flame size={13} />} label="Ofertas" active={acceso === 'ofertas'} onClick={() => setAcceso('ofertas')} />
          <QuickTab icon={<Sparkles size={13} />} label="Novedades" active={acceso === 'novedades'} onClick={() => setAcceso('novedades')} />
          <QuickTab icon={<Trophy size={13} />} label="Top ventas" active={acceso === 'top'} onClick={() => setAcceso('top')} />
        </div>
      </section>

      {/* ==================== FILTROS ==================== */}
      <section className="z-30 border-b border-[var(--border)] bg-[var(--background)]/95 px-5 py-3 backdrop-blur-xl md:sticky md:top-16 lg:px-8">
        <div className="no-scrollbar mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto">
          <Pill
            icon={<Filter size={12} />}
            label={numFiltros > 0 ? `Filtros (${numFiltros})` : 'Filtros'}
            active={numFiltros > 0}
            onClick={abrirFiltros}
          />
          <Pill
            icon={<ArrowUpDown size={12} />}
            label={`Ordenar: ${ORDEN_LABEL[orden]}`}
            active={orden !== 'relevancia'}
            onClick={() => setOrdenAbierto(true)}
          />
          <Pill
            label={catsActivas.size > 0 ? `Categoría (${catsActivas.size})` : 'Categoría'}
            active={catsActivas.size > 0}
            onClick={abrirCategorias}
          />

          {hayFiltros && (
            <button
              onClick={limpiarTodo}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/[0.06] px-3 py-1.5 text-xs font-medium text-red-400"
            >
              <X size={11} /> Limpiar
            </button>
          )}

          <span className="ml-auto hidden shrink-0 text-xs text-[var(--muted-foreground)] sm:block">
            {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {(catsActivas.size > 0 || precioMin !== null || precioMax !== null || ratingMin !== null) && (
          <div className="mx-auto mt-2 flex max-w-[1600px] flex-wrap gap-1.5">
            {Array.from(catsActivas).map((id) => (
              <Chip key={id} color="gold" onRemove={() => setCatsActivas((p) => { const n = new Set(p); n.delete(id); return n })}>
                {nombreCategoria(id)}
              </Chip>
            ))}
            {(precioMin !== null || precioMax !== null) && (
              <Chip color="green" onRemove={() => { setPrecioMin(null); setPrecioMax(null) }}>
                {precioMin ?? rango.min} - {precioMax ?? rango.max} €
              </Chip>
            )}
            {ratingMin !== null && (
              <Chip color="green" onRemove={() => setRatingMin(null)}>
                <Star size={10} className="fill-[#3ecf8e]" /> {ratingMin}+
              </Chip>
            )}
          </div>
        )}
      </section>

      {/* ==================== PRODUCTOS ==================== */}
      <section className="px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <ProductGrid products={filtrados} emptyMessage="No hay productos con esos filtros" />
        </div>
      </section>

      {/* ==================== CÓMO FUNCIONA ==================== */}
      <section className="border-t border-[var(--border)] px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Comprar es así de fácil
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { n: '1', t: 'Elige un producto', d: 'Mira fotos, precio y vendedor.' },
              { n: '2', t: 'Escribe al vendedor', d: 'Pon tu nombre y correo y pregunta lo que quieras.' },
              { n: '3', t: 'Cierra la compra', d: 'Acordáis pago y entrega en el chat privado.' },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <span className="grid size-9 place-items-center rounded-full bg-[#3ecf8e] text-sm font-black text-black">
                  {s.n}
                </span>
                <h3 className="mt-4 font-sans text-base font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== VENDER ==================== */}
      <section className="border-t border-[var(--border)] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3ecf8e]/30 bg-[#3ecf8e]/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3ecf8e]">
            <Sparkles size={12} /> Únete
          </span>
          <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            ¿Tienes algo que <em className="italic">vender</em>?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-[var(--muted-foreground)] sm:text-base">
            Abre tu tienda en KwaiSpress, recibe los mensajes de tus clientes
            con aviso y vende hoy mismo.
          </p>
          <Link
            href="/vender"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3ecf8e] px-7 py-3.5 text-sm font-semibold text-black hover:scale-105 hover:bg-[#ffd700]"
          >
            Abrir mi tienda <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <Footer />

      {/* ==================== PANEL CATEGORÍAS ==================== */}
      <Drawer
        open={catAbierta}
        onClose={() => setCatAbierta(false)}
        title="Filtrar por categoría"
        subtitle="Selecciona una o varias"
        footer={
          <>
            <button
              onClick={() => setCatsTemp(new Set())}
              disabled={catsTemp.size === 0}
              className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Restablecer
            </button>
            <button
              onClick={() => { setCatsActivas(new Set(catsTemp)); setCatAbierta(false) }}
              className="flex-1 rounded-full bg-[#3ecf8e] px-5 py-3 text-sm font-semibold text-black hover:bg-[#ffd700]"
            >
              Mostrar {catsTemp.size > 0 ? `(${catsTemp.size})` : ''}
            </button>
          </>
        }
      >
        <div className="space-y-1">
          {arbol.map((cat) => {
            const exp = catExpandida === cat.id
            const sel = catsTemp.has(cat.id)
            const hasSubs = cat.subcategories.length > 0
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleCatTemp(cat.id)}
                    className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
                      sel ? 'bg-[#ffd700]/[0.08] text-[#ffd700]' : 'hover:bg-[var(--card)] hover:text-[#ffd700]'
                    }`}
                  >
                    <span className={`grid size-5 shrink-0 place-items-center rounded-md border ${sel ? 'border-[#ffd700] bg-[#ffd700]' : 'border-[var(--border)]'}`}>
                      {sel && <Check size={12} className="text-black" strokeWidth={3} />}
                    </span>
                    <span className="text-xl">{cat.icon || '📦'}</span>
                    <span className="flex-1">{cat.name}</span>
                  </button>
                  {hasSubs && (
                    <button
                      onClick={() => setCatExpandida(exp ? null : cat.id)}
                      aria-label={exp ? 'Ocultar subcategorías' : 'Ver subcategorías'}
                      className="grid size-9 place-items-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[#ffd700]"
                    >
                      {exp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  )}
                </div>
                {exp && hasSubs && (
                  <div className="mb-2 ml-11 mt-1 flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => {
                      const s = catsTemp.has(sub.id)
                      return (
                        <button
                          key={sub.id}
                          onClick={() => toggleCatTemp(sub.id)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                            s
                              ? 'border-[#ffd700] bg-[#ffd700]/[0.12] text-[#ffd700]'
                              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
                          }`}
                        >
                          {s && <Check size={10} strokeWidth={3} />}
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
      </Drawer>

      {/* ==================== PANEL FILTROS ==================== */}
      <Drawer
        open={filtrosAbiertos}
        onClose={() => setFiltrosAbiertos(false)}
        title="Filtros"
        subtitle="Afina tu búsqueda"
        footer={
          <>
            <button
              onClick={() => { setTmpMin(rango.min); setTmpMax(rango.max); setTmpRating(null) }}
              className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:border-red-500/40 hover:text-red-400"
            >
              Restablecer
            </button>
            <button
              onClick={aplicarFiltros}
              className="flex-1 rounded-full bg-[#3ecf8e] px-5 py-3 text-sm font-semibold text-black hover:bg-[#ffd700]"
            >
              Aplicar filtros
            </button>
          </>
        }
      >
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold">Precio (€)</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Mínimo</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={tmpMin}
                  onChange={(e) => setTmpMin(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-[#3ecf8e]/60"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Máximo</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={tmpMax}
                  onChange={(e) => setTmpMax(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-[#ffd700]/60"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: 'Hasta 20 €', min: rango.min, max: 20 },
                { label: '20 – 50 €', min: 20, max: 50 },
                { label: '50 – 100 €', min: 50, max: 100 },
                { label: '100 € +', min: 100, max: rango.max },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => { setTmpMin(r.min); setTmpMax(Math.max(r.max, r.min)) }}
                  className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:border-[#3ecf8e]/50 hover:text-[#3ecf8e]"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold">Valoración</h3>
            <div className="grid grid-cols-2 gap-2">
              {[5, 4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => setTmpRating(tmpRating === r ? null : r)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 ${
                    tmpRating === r
                      ? 'border-[#ffd700]/50 bg-[#ffd700]/[0.08]'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[#ffd700]/30'
                  }`}
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i <= r ? 'fill-[#ffd700] text-[#ffd700]' : 'text-[var(--muted-foreground)]/30'}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${tmpRating === r ? 'text-[#ffd700]' : 'text-[var(--muted-foreground)]'}`}>
                    {r}+ estrellas
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      {/* ==================== PANEL ORDENAR ==================== */}
      <Drawer open={ordenAbierto} onClose={() => setOrdenAbierto(false)} title="Ordenar por">
        <div className="space-y-1">
          {(Object.keys(ORDEN_LABEL) as Ordenar[]).map((v) => (
            <button
              key={v}
              onClick={() => { setOrden(v); setOrdenAbierto(false) }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium ${
                orden === v ? 'bg-[#ffd700]/[0.08] text-[#ffd700]' : 'hover:bg-[var(--card)] hover:text-[#ffd700]'
              }`}
            >
              {ORDEN_LABEL[v]}
              {orden === v && <Check size={16} />}
            </button>
          ))}
        </div>
      </Drawer>
    </main>
  )
}

/* ============================================================
   COMPONENTES
   ============================================================ */

function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-[var(--background)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid size-9 place-items-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[#ffd700]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex gap-3 border-t border-[var(--border)] px-6 py-5">{footer}</div>}
      </aside>
    </>
  )
}

function QuickTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${
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

function Pill({ icon, label, active, onClick }: { icon?: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs ${
        active
          ? 'border-[#ffd700]/50 bg-[#ffd700]/[0.08] text-[#ffd700]'
          : 'border-[var(--border)] bg-[var(--card)] hover:border-[#ffd700]/40 hover:text-[#ffd700]'
      }`}
    >
      {icon}
      <span>{label}</span>
      <ChevronDown size={12} className="text-[var(--muted-foreground)]" />
    </button>
  )
}

function Chip({ color, onRemove, children }: { color: 'gold' | 'green'; onRemove: () => void; children: React.ReactNode }) {
  const c = color === 'gold' ? 'bg-[#ffd700]/[0.12] text-[#ffd700]' : 'bg-[#3ecf8e]/[0.12] text-[#3ecf8e]'
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${c}`}>
      {children}
      <button onClick={onRemove} aria-label="Quitar filtro">
        <X size={10} />
      </button>
    </span>
  )
}