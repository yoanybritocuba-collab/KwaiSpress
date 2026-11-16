import { getCategoriesWithSubcategories, getPublishedProducts } from '@/lib/db/queries'
import { CategoriasClient } from './categorias-client'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const [categorias, productos] = await Promise.all([
    getCategoriesWithSubcategories(),
    getPublishedProducts(200),
  ])

  return <CategoriasClient categorias={categorias} productos={productos} initialSlug={cat} />
}
