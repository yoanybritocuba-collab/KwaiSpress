'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from './cart-context'

export function CartButton() {
  const { totalItems, openCart } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /* Evitar parpadeo en el primer render */
  if (!mounted) {
    return (
      <div className="size-10 rounded-full border border-[var(--border)]" />
    )
  }

  return (
    <button
      onClick={openCart}
      className="relative grid size-10 place-items-center rounded-full text-[var(--foreground)] transition-colors hover:text-[#ffd700]"
      aria-label={`Carrito${totalItems > 0 ? ` (${totalItems} productos)` : ''}`}
    >
      <ShoppingCart size={18} />

      {totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-[#3ecf8e] px-1 text-[10px] font-bold leading-4 text-black">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  )
}