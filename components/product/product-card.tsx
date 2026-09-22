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
      quantity: 1,
    })
  }

  const mainImage = product.imageUrl || product.imageUrls?.[0] || null

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd700]/40 hover:shadow-xl hover:shadow-[#ffd700]/5"
    >
      {/* Imagen con zoom al hover */}
      <div className="relative aspect-square overflow-hidden bg-[var(--background)]">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="grid size-full place-items-center text-5xl text-[var(--muted-foreground)]/20">
            📦
          </div>
        )}

        {/* Badge de descuento */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            -{discountPercent}%
          </span>
        )}

        {/* Badge personalizado */}
        {!hasDiscount && product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd700] backdrop-blur-sm">
            {product.badge}
          </span>
        )}

        {/* Botón favorito (aparece al hover) */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-[#ffd700] hover:text-black"
          aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            size={15}
            className={liked ? 'fill-rose-500 text-rose-500' : ''}
          />
        </button>
      </div>

      {/* Información */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Título */}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-[var(--foreground)] transition-colors group-hover:text-[#ffd700]">
          {product.title}
        </h3>

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i <= Math.round(product.rating!)
                      ? 'fill-[#ffd700] text-[#ffd700]'
                      : 'text-[var(--muted-foreground)]/30'
                  }
                />
              ))}
            </div>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              {product.rating.toFixed(1)}
              {product.reviewsCount && product.reviewsCount > 0 && (
                <span> · {product.reviewsCount}</span>
              )}
            </span>
          </div>
        )}

        {/* Precio + botón carrito */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-[var(--foreground)]">
              {Number(product.price).toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-[var(--muted-foreground)] line-through">
                {Number(product.oldPrice).toFixed(2)} €
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-all hover:scale-110 hover:border-[#3ecf8e] hover:bg-[#3ecf8e] hover:text-black"
            aria-label="Añadir al carrito"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </Link>
  )
}