'use client'

import { X, Trash2, Plus, Minus, MessageCircle } from 'lucide-react'
import { useCart } from './cart-context'

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart()

  if (!isOpen) return null

  /* Blindaje: asegurar que items siempre sea un array */
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  /* Construir mensaje de WhatsApp */
  const buildWhatsappUrl = (
    whatsapp: string,
    sellerItems: typeof safeItems,
  ) => {
    const cleanNumber = whatsapp.replace(/\D/g, '')
    const lines = sellerItems.map(
      (i) => `• ${i.title} ($${i.price.toFixed(2)}) x${i.quantity}`,
    )
    const message = `Hola, me interesan estos productos:\n\n${lines.join('\n')}\n\n¿Están disponibles?`
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
  }

  /* Agrupar por vendedor (con protección) */
  const itemsBySeller = safeItems.reduce<Record<string, typeof safeItems>>(
    (acc, item) => {
      if (!item || !item.sellerId) return acc
      if (!acc[item.sellerId]) acc[item.sellerId] = []
      acc[item.sellerId].push(item)
      return acc
    },
    {},
  )

  const sellers = Object.entries(itemsBySeller)

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[var(--card)] shadow-2xl">
        {/* Cabecera */}
        <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Tu interés</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="grid size-9 place-items-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--background)] hover:text-[#ffd700]"
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </header>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto">
          {safeItems.length === 0 ? (
            <div className="grid h-full place-items-center p-8 text-center">
              <div>
                <p className="text-4xl">🛒</p>
                <p className="mt-4 text-sm font-medium">
                  Tu carrito está vacío
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Añade productos para contactar con los vendedores
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {safeItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[var(--background)]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-2xl text-[var(--muted-foreground)]">
                        📦
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                      {item.sellerName}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <span className="font-semibold">
                        {Number(item.price).toFixed(2)} €
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="grid size-6 place-items-center rounded-md border border-[var(--border)] transition-colors hover:border-[#ffd700] hover:text-[#ffd700]"
                          aria-label="Reducir"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="grid size-6 place-items-center rounded-md border border-[var(--border)] transition-colors hover:border-[#ffd700] hover:text-[#ffd700]"
                          aria-label="Aumentar"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="grid size-6 place-items-center rounded-md text-[var(--muted-foreground)] transition-colors hover:text-red-400"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie con acciones */}
        {safeItems.length > 0 && (
          <footer className="border-t border-[var(--border)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[var(--muted-foreground)]">
                Total estimado
              </span>
              <span className="font-display text-2xl font-semibold">
                {totalPrice.toFixed(2)} €
              </span>
            </div>

            {sellers.length === 1 && sellers[0][1][0] ? (
              <a
                href={buildWhatsappUrl(
                  sellers[0][1][0].sellerWhatsapp,
                  sellers[0][1],
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3ecf8e] px-6 py-3.5 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]"
              >
                <MessageCircle size={16} />
                Contactar vendedor
              </a>
            ) : (
              <div className="space-y-2">
                <p className="mb-3 text-center text-xs text-[var(--muted-foreground)]">
                  {sellers.length} vendedores en tu carrito
                </p>
                {sellers.map(([sellerId, sellerItems]) => {
                  const firstItem = sellerItems[0]
                  if (!firstItem) return null
                  return (
                    <a
                      key={sellerId}
                      href={buildWhatsappUrl(
                        firstItem.sellerWhatsapp,
                        sellerItems,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3ecf8e] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]"
                    >
                      <MessageCircle size={15} />
                      Contactar {firstItem.sellerName}
                    </a>
                  )
                })}
              </div>
            )}

            <button
              onClick={clearCart}
              className="mt-3 w-full rounded-full border border-[var(--border)] px-6 py-2.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              Vaciar carrito
            </button>
          </footer>
        )}
      </aside>
    </>
  )
}