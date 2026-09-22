import Link from 'next/link'
import { ArrowRight, LayoutGrid, Lock, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { getCategoriesWithSubcategories } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const categorias = await getCategoriesWithSubcategories()

  const categoriasNormales = categorias.filter((c) => !c.isAdult)
  const categoriasAdultos = categorias.filter((c) => c.isAdult)

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="pointer-events-none absolute -right-40 -top-40 size-96 rounded-full bg-[#ffd700]/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-[#3ecf8e]/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ffd700]">
            <LayoutGrid size={12} />
            Catálogo completo
          </span>

          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Todas las categorías
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted-foreground)]">
            Explora las {categorias.length} categorías y encuentra exactamente lo
            que buscas.
          </p>
        </div>
      </section>

      {/* Categorías normales */}
      <section className="px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {categoriasNormales.map((cat) => (
            <CategoriaBlock key={cat.id} cat={cat} />
          ))}
        </div>
      </section>

      {/* Categoría adultos (separada) */}
      {categoriasAdultos.length > 0 && (
        <section className="border-t border-red-500/20 bg-red-500/[0.02] px-5 py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl border border-red-500/30 bg-red-500/[0.06]">
                <Lock size={18} className="text-red-400" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-red-400">
                  Contenido para adultos
                </h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Requiere verificación de edad (18+)
                </p>
              </div>
            </div>

            {categoriasAdultos.map((cat) => (
              <CategoriaBlock key={cat.id} cat={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
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

function CategoriaBlock({
  cat,
}: {
  cat: {
    id: string
    name: string
    slug: string
    icon: string | null
    isAdult: boolean | null
    subcategories: Array<{
      id: string
      name: string
      slug: string
    }>
  }
}) {
  return (
    <div>
      {/* Cabecera de la categoría */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={`/categoria/${cat.slug}`}
          className="group flex items-center gap-4"
        >
          <span
            className={`grid size-14 place-items-center rounded-2xl border text-3xl transition-all group-hover:scale-105 ${
              cat.isAdult
                ? 'border-red-500/40 bg-red-500/[0.06]'
                : 'border-[var(--border)] bg-[var(--card)] group-hover:border-[#ffd700]/40'
            }`}
          >
            {cat.icon || '📦'}
          </span>
          <div>
            <h2
              className={`flex items-center gap-2 font-display text-2xl font-semibold tracking-tight transition-colors ${
                cat.isAdult ? 'text-red-400' : 'group-hover:text-[#ffd700]'
              }`}
            >
              {cat.name}
              {cat.isAdult && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                  18+
                </span>
              )}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {cat.subcategories.length} subcategorías
            </p>
          </div>
        </Link>

        <Link
          href={`/categoria/${cat.slug}`}
          className="hidden items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700] sm:flex"
        >
          Ver todo
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Subcategorías */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cat.subcategories.map((sub) => (
          <Link
            key={sub.id}
            href={`/categoria/${sub.slug}`}
            className={`group flex items-center justify-between rounded-xl border bg-[var(--card)] px-4 py-3 transition-all hover:-translate-y-0.5 ${
              cat.isAdult
                ? 'border-red-500/20 hover:border-red-500/50'
                : 'border-[var(--border)] hover:border-[#ffd700]/40'
            }`}
          >
            <span
              className={`text-sm font-medium transition-colors ${
                cat.isAdult
                  ? 'text-red-400/80 group-hover:text-red-400'
                  : 'group-hover:text-[#ffd700]'
              }`}
            >
              {sub.name}
            </span>
            <ArrowRight
              size={14}
              className={`transition-all group-hover:translate-x-0.5 ${
                cat.isAdult
                  ? 'text-red-400/50 group-hover:text-red-400'
                  : 'text-[var(--muted-foreground)] group-hover:text-[#ffd700]'
              }`}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}