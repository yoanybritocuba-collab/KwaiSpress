'use client'

import { ProductCard, type ProductCardData } from './product-card'

export function ProductGrid({
  products,
  emptyMessage = 'No hay productos disponibles',
}: {
  products: ProductCardData[]
  emptyMessage?: string
}) {
  if (products.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] py-20 text-center">
        <div>
          <p className="text-4xl">📦</p>
          <p className="mt-4 text-sm font-medium text-[var(--muted-foreground)]">
            {emptyMessage}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}