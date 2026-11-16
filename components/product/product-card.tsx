import Link from 'next/link'
import { MessageCircle, Star } from 'lucide-react'
import type { ProductCardData } from '@/lib/types'

export type { ProductCardData } from '@/lib/types'

export function ProductCard({ product: p }: { product: ProductCardData }) {
  const tieneOferta = p.oldPrice != null && p.oldPrice > p.price
  const descuento = tieneOferta
    ? Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100)
    : 0
  const rating = p.rating ?? 0

  return (
    <Link
      href={`/producto/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd700]/40 hover:shadow-[0_14px_40px_-14px_rgba(255,215,0,0.3)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--background)]">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="grid size-full place-items-center text-4xl text-[var(--muted-foreground)]/25">
            📦
          </div>
        )}

        {tieneOferta ? (
          <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-lg">
            -{descuento}%
          </span>
        ) : (
          p.badge && (
            <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ffd700] backdrop-blur-sm">
              {p.badge}
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {p.sellerName && (
          <p className="truncate text-[11px] font-medium text-[var(--muted-foreground)]">
            {p.sellerName}
          </p>
        )}

        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] font-sans text-sm font-medium leading-snug tracking-normal">
          {p.title}
        </h3>

        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
            <Star size={11} className="fill-[#ffd700] text-[#ffd700]" />
            <span className="font-medium text-[var(--foreground)]">
              {rating.toFixed(1)}
            </span>
            {!!p.reviewsCount && <span>({p.reviewsCount})</span>}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-lg font-bold">
            {p.price.toFixed(2)} €
          </span>
          {tieneOferta && (
            <span className="text-xs text-[var(--muted-foreground)] line-through">
              {p.oldPrice!.toFixed(2)} €
            </span>
          )}
        </div>

        <span className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#3ecf8e]/10 py-2 text-xs font-bold text-[#3ecf8e] transition-colors group-hover:bg-[#3ecf8e] group-hover:text-black">
          <MessageCircle size={13} />
          Hablar con el vendedor
        </span>
      </div>
    </Link>
  )
}