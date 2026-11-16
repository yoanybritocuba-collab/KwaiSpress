import { CategoriesManager } from '@/components/admin/categories-manager'
import { requireAdminPage } from '@/lib/auth/admin-session'
import { getAllCategoriesWithCounts } from '@/lib/db/queries-admin'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriasPage() {
  await requireAdminPage('/admin/categorias')
  const categorias = await getAllCategoriesWithCounts()

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Categorías</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">Organiza el catálogo en categorías y subcategorías.</p>
      </div>
      <CategoriesManager categorias={categorias} />
    </div>
  )
}
