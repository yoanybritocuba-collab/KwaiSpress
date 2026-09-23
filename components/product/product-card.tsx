'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'

export type ProductCardData = {
  id: string
  title: string
  price: number
  oldPrice?: number | null
  imageUrl: string | null
  imageUrls?: string[]
  badge?: string | null
  rating?: number
  reviewsCount?: number
  sellerId?: string
  sellerName?: string
  sellerWhatsapp?: string
  categoryName?: string
  categoryId?: string | null
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const [liked, setLiked] = useState(false)
  const { addItem } = useCart()

  const hasDiscount =
    product.oldPrice && Number(product.oldPrice) > Number(product.price)

  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.oldPrice) - Number(product.price)) /
          Number(product.oldPrice)) *
          100,
      )
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      sellerId: product.sellerId || '',
      sellerName: product.sellerName || 'Vendedor',
      sellerWhatsapp: product.sellerWhatsapp || '',
    })
  }

  const mainImage = product.imageUrl || product.imageUrls?.[0] || null

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ffd700]/40 hover:shadow-lg hover:shadow-[#ffd700]/5"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-[var(--background)]">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-3xl text-[var(--muted-foreground)]/20">
            📦
          </div>
        )}

        {/* Badge descuento */}
        {hasDiscount && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
            -{discountPercent}%
          </span>
        )}

        {/* Badge personalizado */}
        {!hasDiscount && product.badge && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ffd700] backdrop-blur-sm">
            {product.badge}
          </span>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow transition-all group-hover:opacity-100 hover:scale-110 hover:bg-[#ffd700] hover:text-black"
          aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            size={12}
            className={liked ? 'fill-rose-500 text-rose-500' : ''}
          />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 min-h-8 text-[12px] font-medium leading-4 text-[var(--foreground)] transition-colors group-hover:text-[#ffd700]">
          {product.title}
        </h3>

        {product.rating && product.rating > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <Star size={10} className="fill-[#ffd700] text-[#ffd700]" />
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {product.rating.toFixed(1)}
              {product.reviewsCount && product.reviewsCount > 0 && (
                <span> ({product.reviewsCount})</span>
              )}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-2">
          <div className="flex flex-col min-w-0">
            <span className="font-display text-sm font-bold text-[var(--foreground)] truncate">
              {Number(product.price).toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-[9px] text-[var(--muted-foreground)] line-through">
                {Number(product.oldPrice).toFixed(2)} €
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-all hover:scale-110 hover:border-[#3ecf8e] hover:bg-[#3ecf8e] hover:text-black"
            aria-label="Añadir al carrito"
          >
            <ShoppingBag size={13} />
          </button>
        </div>
      </div>
    </Link>
  )
}