import { TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProductGrid } from '@/components/product/product-grid'
import { getPublishedProducts } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const productos = await getPublishedProducts(100)

  const safeProductos = Array.isArray(productos) ? productos : []

  const formateados = safeProductos.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    imageUrl: p.imageUrl,
    badge: p.badge,
    rating: p.rating ? Number(p.rating) : 0,
    reviewsCount: p.reviewsCount || 0,
    sellerName: 'Vendedor',
  }))

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="border-b border-[var(--border)] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3ecf8e]">
            <TrendingUp size={12} />
            Catálogo completo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Todos los productos
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {safeProductos.length} producto{safeProductos.length !== 1 ? 's' : ''} disponibles
          </p>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProductGrid
            products={formateados}
            emptyMessage="Todavía no hay productos publicados"
          />
        </div>
      </section>
    </main>
  )
}