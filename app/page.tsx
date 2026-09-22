import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProductGrid } from '@/components/product/product-grid'
import { getCategories, getPublishedProducts } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [categorias, productos] = await Promise.all([
    getCategories(),
    getPublishedProducts(),
  ])

  const safeCategorias = Array.isArray(categorias) ? categorias : []
  const safeProductos = Array.isArray(productos) ? productos : []

  const productosFormateados = safeProductos.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    imageUrl: p.imageUrl,
    badge: p.badge,
    rating: p.rating ? Number(p.rating) : 0,
    reviewsCount: p.reviewsCount || 0,
    sellerName: 'Vendedor',
    categoryName: p.categoryId
      ? safeCategorias.find((c) => c.id === p.categoryId)?.name
      : undefined,
  }))

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="pointer-events-none absolute -right-40 -top-40 size-96 rounded-full bg-[#ffd700]/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-[#3ecf8e]/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ffd700]">
            <Sparkles size={12} />
            Marketplace verificado
          </span>

          <h1 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Productos <em className="italic">seleccionados</em>,
            <br />
            <span className="text-[var(--muted-foreground)]">
              atención directa.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Descubre productos de vendedores verificados y contacta
            directamente para cerrar tu compra sin intermediarios.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#productos"
              className="inline-flex items-center gap-2 rounded-full bg-[#3ecf8e] px-7 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-[#ffd700]"
            >
              Explorar catálogo
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/vender"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-7 py-3.5 text-sm font-medium transition-colors hover:border-[#ffd700] hover:text-[#ffd700]"
            >
              Vender aquí
            </Link>
          </div>
        </div>
      </section>

      {safeCategorias.length > 0 && (
        <section className="border-b border-[var(--border)] px-5 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Explora
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Categorías
                </h2>
              </div>
              <Link
                href="/categorias"
                className="hidden items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700] sm:flex"
              >
                Ver todas
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {safeCategorias.slice(0, 12).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-center transition-all hover:-translate-y-1 hover:border-[#ffd700]/40"
                >
                  <span className="text-3xl transition-transform group-hover:scale-110">
                    {cat.icon || '📦'}
                  </span>
                  <span className="text-xs font-medium transition-colors group-hover:text-[#ffd700]">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="productos" className="px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3ecf8e]">
                <TrendingUp size={12} />
                Catálogo
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Productos destacados
              </h2>
            </div>
          </div>

          <ProductGrid
            products={productosFormateados}
            emptyMessage="Todavía no hay productos publicados"
          />
        </div>
      </section>

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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display text-lg font-semibold tracking-tight">
            Kwai<span className="text-gold-gradient">Spress</span>
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            © 2026 KwaiSpress
          </p>
        </div>
      </footer>
    </main>
  )
}