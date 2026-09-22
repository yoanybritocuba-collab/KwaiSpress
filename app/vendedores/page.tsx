import Link from 'next/link'
import { Store, MapPin, Package, Star } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { db } from '@/lib/db'
import { sellers } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function VendedoresPage() {
  const lista = await db
    .select()
    .from(sellers)
    .where(eq(sellers.status, 'approved'))
    .orderBy(desc(sellers.createdAt))

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="border-b border-[var(--border)] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd700]">
            Vendedores
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Todas las tiendas
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Descubre todas las tiendas verificadas de KwaiSpress.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {lista.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-20 text-center">
              <Store
                size={40}
                className="mx-auto text-[var(--muted-foreground)]/30"
              />
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                Todavía no hay vendedores
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((seller) => (
                <Link
                  key={seller.id}
                  href={`/vendedor/${seller.slug}`}
                  className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:-translate-y-1 hover:border-[#ffd700]/40"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#3ecf8e] to-[#3ecf8e]/60 text-xl font-bold text-black">
                      {seller.storeName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold transition-colors group-hover:text-[#ffd700]">
                        {seller.storeName}
                      </h2>
                      {seller.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <MapPin size={11} />
                          {seller.location}
                        </p>
                      )}
                    </div>
                    {seller.verified && (
                      <Star size={14} className="shrink-0 fill-[#ffd700] text-[#ffd700]" />
                    )}
                  </div>

                  {seller.description && (
                    <p className="mt-4 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                      {seller.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Package size={12} />
                    Ver productos
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