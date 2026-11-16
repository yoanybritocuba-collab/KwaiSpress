'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductGallery({
  imagenes,
  titulo,
  descuento,
  badge,
}: {
  imagenes: string[]
  titulo: string
  descuento?: number | null
  badge?: string | null
}) {
  const [activa, setActiva] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const ref = useRef<HTMLDivElement>(null)

  if (imagenes.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="grid aspect-square place-items-center text-6xl text-[var(--muted-foreground)]/20">📦</div>
      </div>
    )
  }

  const total = imagenes.length
  const ir = (d: number) => setActiva((a) => (a + d + total) % total)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {total > 1 && (
        <div className="no-scrollbar order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
          {imagenes.map((url, i) => (
            <button
              key={`${url}-${i}`}
              onClick={() => setActiva(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 sm:w-20 ${
                activa === i ? 'border-[#ffd700]' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 flex-1 sm:order-2">
        <div
          ref={ref}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onMove}
          className="relative aspect-square w-full max-w-[560px] cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
        >
          <img
            src={imagenes[activa]}
            alt={titulo}
            className="size-full object-cover transition-transform duration-150"
            style={zoom ? { transform: 'scale(2.3)', transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />

          {descuento ? (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              -{descuento}%
            </span>
          ) : (
            badge && (
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd700] backdrop-blur-sm">
                {badge}
              </span>
            )
          )}

          {total > 1 && (
            <>
              <button
                onClick={() => ir(-1)}
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => ir(1)}
                aria-label="Imagen siguiente"
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
              >
                <ChevronRight size={18} />
              </button>
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white/80">
                {activa + 1} / {total}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}