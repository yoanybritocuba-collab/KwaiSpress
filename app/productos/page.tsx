import { TrendingUp, Search } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProductGrid } from '@/components/product/product-grid'
import { getPublishedProducts, searchProducts } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? '').trim().slice(0, 80)
  const productos = query ? await searchProducts(query) : await getPublishedProducts(100)

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="border-b border-[var(--border)] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3ecf8e]">
            {query ? <Search size={12} /> : <TrendingUp size={12} />}
            {query ? 'Resultados de búsqueda' : 'Catálogo completo'}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {query ? `“${query}”` : 'Todos los productos'}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {productos.length} producto{productos.length !== 1 ? 's' : ''}{' '}
            {query ? 'encontrados' : 'disponibles'}
          </p>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProductGrid
            products={productos}
            emptyMessage={
              query ? 'No encontramos productos con esa búsqueda' : 'Todavía no hay productos publicados'
            }
          />
        </div>
      </section>
    </main>
  )
}
