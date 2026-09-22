'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

export type CartItem = {
  id: string
  title: string
  price: number
  imageUrl: string | null
  sellerId: string
  sellerName: string
  sellerWhatsapp: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'kwaisspress-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  /* Cargar carrito al montar */
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          /* Filtrar items inválidos */
          const validItems = parsed.filter(
            (i) => i && typeof i === 'object' && i.id && i.title,
          )
          setItems(validItems)
        }
      }
    } catch {
      // Ignorar
    }
  }, [])

  /* Guardar en localStorage cuando cambia */
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignorar
    }
  }, [items, mounted])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    if (!item || !item.id) return

    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      const existing = safePrev.find((i) => i?.id === item.id)
      if (existing) {
        return safePrev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...safePrev, { ...item, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      return safePrev.filter((i) => i?.id !== id)
    })
  }, [])

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id)
        return
      }
      setItems((prev) => {
        const safePrev = Array.isArray(prev) ? prev : []
        return safePrev.map((i) => (i?.id === id ? { ...i, quantity } : i))
      })
    },
    [removeItem],
  )

  const clearCart = useCallback(() => setItems([]), [])

  /* Blindaje: asegurar siempre array válido */
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  const totalItems = safeItems.reduce(
    (sum, i) => sum + (i?.quantity || 0),
    0,
  )

  const totalPrice = safeItems.reduce(
    (sum, i) => sum + (i?.price || 0) * (i?.quantity || 0),
    0,
  )

  return (
    <CartContext.Provider
      value={{
        items: safeItems,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}