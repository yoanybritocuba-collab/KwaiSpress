import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Package, Star } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { db } from '@/lib/db'
import { sellers, products } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function VendedorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const sellerRows = await db
    .select()
    .from(sellers)
    .where(eq(sellers.slug, slug))
    .limit(1)

  const seller = sellerRows[0]
  if (!seller) notFound()

  const productos = await db
    .select()
    .from(products)
    .where(and(eq(products.sellerId, seller.id), eq(products.status, 'published')))
    .orderBy(desc(products.createdAt))

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="border-b border-[var(--border)] px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
        </div>
      </section>

      <section className="border-b border-[var(--border)] px-5 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-[#3ecf8e] to-[#3ecf8e]/60 text-3xl font-bold text-black">
            {seller.storeName.charAt(0).toUpperCase()}
          </span>

          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {seller.storeName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
              {seller.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {seller.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Package size={14} />
                {productos.length} productos
              </span>
              {seller.verified && (
                <span className="flex items-center gap-1.5 text-[#3ecf8e]">
                  <Star size={14} className="fill-[#3ecf8e]" />
                  Verificado
                </span>
              )}
            </div>

            {seller.description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                {seller.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">
            Productos
          </h2>

          {productos.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-20 text-center">
              <Package
                size={40}
                className="mx-auto text-[var(--muted-foreground)]/30"
              />
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                Este vendedor aún no tiene productos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {productos.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/producto/${prod.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all hover:-translate-y-1 hover:border-[#ffd700]/40"
                >
                  <div className="aspect-square overflow-hidden bg-[var(--background)]">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-4xl text-[var(--muted-foreground)]/20">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-[#ffd700]">
                      {prod.title}
                    </h3>
                    <p className="mt-2 font-display text-lg font-bold">
                      {Number(prod.price).toFixed(2)} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}