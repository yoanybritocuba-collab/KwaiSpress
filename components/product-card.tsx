'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Star } from 'lucide-react'

export type Product = {
  id: string
  title: string
  seller: string
  price: number
  oldPrice?: number
  category: string
  rating: number
  reviews: number
  color: string
  glyph: string
  badge: string
}

export function ProductCard({
  product,
  onAsk,
}: {
  product: Product
  onAsk: (product: Product) => void
}) {
  const [liked, setLiked] = useState(false)

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-[#0f0f0f]">
      <div
        className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${product.color}`}
      >
        <span className="select-none text-[72px] font-black text-white/80 drop-shadow-lg transition-transform duration-500 group-hover:scale-105">
          {product.glyph}
        </span>

        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {product.badge}
        </span>

        <button
          onClick={() => setLiked(!liked)}
          aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-slate-800 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#d4af37] hover:text-black"
        >
          <Heart
            className={liked ? 'fill-rose-500 text-rose-500' : ''}
            size={16}
          />
        </button>
      </div>

      <div className="p-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
          {product.category}
        </p>
        <h3 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-[#d4af37]">
          {product.title}
        </h3>
        <p className="mt-1 truncate text-xs text-white/40">{product.seller}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-[11px] text-white/30 line-through">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-white/60">
            <Star size={11} className="fill-[#d4af37] text-[#d4af37]" />
            {product.rating}
          </span>
        </div>

        <button
          onClick={() => onAsk(product)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
        >
          <MessageCircle size={14} /> Preguntar al vendedor
        </button>
      </div>
    </article>
  )
}