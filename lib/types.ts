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
