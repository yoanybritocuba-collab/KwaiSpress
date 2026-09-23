'use client'

import { useState } from 'react'
import { ChevronRight, Check, X, Search } from 'lucide-react'

type SubCategory = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
}

type Category = SubCategory & {
  subcategories?: SubCategory[]
}

export function CategoryPicker({
  categorias,
  categoriaId,
  onChange,
}: {
  categorias: Category[]
  categoriaId: string
  onChange: (id: string) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  // Categoría seleccionada
  const seleccionada = (() => {
    if (!categoriaId) return null
    for (const cat of categorias) {
      if (cat.id === categoriaId) return cat
      const sub = cat.subcategories?.find((s) => s.id === categoriaId)
      if (sub) return sub
    }
    return null
  })()

  // Categoría principal (por si es subcategoría)
  const padre = (() => {
    if (!seleccionada) return null
    if (!seleccionada.parentId) return null
    return categorias.find((c) => c.id === seleccionada.parentId) || null
  })()

  // Filtrar por búsqueda
  const filtradas = busqueda.trim()
    ? categorias.filter((cat) => {
        const matchPrincipal = cat.name
          .toLowerCase()
          .includes(busqueda.toLowerCase())
        const matchSub = cat.subcategories?.some((s) =>
          s.name.toLowerCase().includes(busqueda.toLowerCase()),
        )
        return matchPrincipal || matchSub
      })
    : categorias

  const seleccionar = (id: string) => {
    onChange(id)
    setAbierto(false)
    setBusqueda('')
    setExpandida(null)
  }

  return (
    <div>
      {/* Selector cerrado */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5 text-left transition-colors hover:border-[#ffd700]/50"
      >
        {seleccionada ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-xl">{padre?.icon || seleccionada.icon || '📦'}</span>
            <div className="min-w-0 flex-1">
              {padre && (
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {padre.name}
                </p>
              )}
              <p className="truncate text-sm font-medium">
                {seleccionada.name}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-[var(--muted-foreground)]">
            Selecciona una categoría
          </span>
        )}
        <ChevronRight
          size={16}
          className="shrink-0 text-[var(--muted-foreground)]"
        />
      </button>

      {/* Modal */}
      {abierto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
          />

          <div className="fixed inset-x-4 bottom-4 top-4 z-50 mx-auto flex max-w-md flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[80vh] sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  Elegir categoría
                </h3>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {categorias.length} categorías disponibles
                </p>
              </div>
              <button
                onClick={() => {
                  setAbierto(false)
                  setBusqueda('')
                }}
                className="grid size-8 place-items-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[#ffd700]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Buscador */}
            <div className="border-b border-[var(--border)] p-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
                />
              </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-2">
              {filtradas.length === 0 ? (
                <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">
                  No se encontraron categorías
                </p>
              ) : (
                <div className="space-y-0.5">
                  {filtradas.map((cat) => {
                    const isExpanded = expandida === cat.id
                    const isSelected = categoriaId === cat.id
                    const tieneSub = (cat.subcategories?.length || 0) > 0

                    return (
                      <div key={cat.id}>
                        {/* Categoría principal */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => seleccionar(cat.id)}
                            className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                              isSelected
                                ? 'bg-[#ffd700]/[0.08] text-[#ffd700]'
                                : 'hover:bg-[var(--card)]'
                            }`}
                          >
                            <span className="text-xl">{cat.icon || '📦'}</span>
                            <span className="flex-1 text-sm font-medium">
                              {cat.name}
                            </span>
                            {isSelected && (
                              <Check size={16} className="text-[#ffd700]" />
                            )}
                          </button>

                          {tieneSub && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandida(isExpanded ? null : cat.id)
                              }
                              className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
                                isExpanded
                                  ? 'bg-[#ffd700]/10 text-[#ffd700]'
                                  : 'text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[#ffd700]'
                              }`}
                            >
                              <ChevronRight
                                size={16}
                                className={`transition-transform ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Subcategorías */}
                        {isExpanded && tieneSub && (
                          <div className="ml-11 mb-2 mt-1 space-y-0.5 border-l border-[var(--border)] pl-3">
                            {cat.subcategories!.map((sub) => {
                              const isSubSelected = categoriaId === sub.id
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => seleccionar(sub.id)}
                                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                                    isSubSelected
                                      ? 'bg-[#ffd700]/[0.08] font-semibold text-[#ffd700]'
                                      : 'text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]'
                                  }`}
                                >
                                  <span className="flex-1">{sub.name}</span>
                                  {isSubSelected && (
                                    <Check
                                      size={12}
                                      className="text-[#ffd700]"
                                    />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {seleccionada && (
              <div className="border-t border-[var(--border)] p-3">
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    setAbierto(false)
                  }}
                  className="w-full rounded-xl border border-red-500/20 px-4 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/[0.08]"
                >
                  Quitar categoría
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}