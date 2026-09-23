'use client'

import { useState, useRef } from 'react'

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
  const [posicion, setPosicion] = useState({ x: 50, y: 50 })
  const contenedorRef = useRef<HTMLDivElement>(null)

  if (imagenes.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="aspect-square grid place-items-center text-6xl text-[var(--muted-foreground)]/20">
          📦
        </div>
      </div>
    )
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contenedorRef.current) return
    const rect = contenedorRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPosicion({ x, y })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Miniaturas verticales */}
      {imagenes.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
          {imagenes.map((url, i) => (
            <button
              key={url}
              onClick={() => setActiva(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-20 ${
                activa === i
                  ? 'border-[#ffd700]'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={url}
                alt={`${titulo} ${i + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Imagen con zoom interno (estilo Amazon) */}
      <div className="order-1 flex-1 sm:order-2">
        <div
          ref={contenedorRef}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMouseMove}
          className="relative aspect-square w-full max-w-[500px] cursor-crosshair overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
        >
          <img
            src={imagenes[activa]}
            alt={titulo}
            className="size-full object-cover transition-transform duration-150"
            style={
              zoom
                ? {
                    transform: 'scale(2.5)',
                    transformOrigin: `${posicion.x}% ${posicion.y}%`,
                  }
                : {}
            }
          />

          {/* Badge descuento */}
          {descuento && !zoom && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              -{descuento}%
            </span>
          )}

          {/* Badge personalizado */}
          {!descuento && badge && !zoom && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd700] backdrop-blur-sm">
              {badge}
            </span>
          )}

          {/* Indicador zoom (solo cuando no está zoom) */}
          {!zoom && (
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
              Pasa el cursor para ampliar
            </span>
          )}
        </div>
      </div>
    </div>
  )
}