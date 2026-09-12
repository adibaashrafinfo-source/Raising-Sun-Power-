export type ProductCardData = {
  id: string
  slug: string
  name: string
  cat: string
  price: number
  priceStr: string
  old?: string
  off?: string
  badge?: string
  badgeBg?: string
  badgeColor?: string
  rating: string
  count: string
  tint: string
  art: "panel" | "inverter" | "battery" | "breaker" | "cable"
}
