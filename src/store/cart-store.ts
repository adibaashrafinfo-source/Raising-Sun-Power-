import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { ProductCardData } from "@/types/product"

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  tint: string
  art: ProductCardData["art"]
}

type CartState = {
  items: CartItem[]
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  openCart: () => void
  closeCart: () => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  addItem: (product: ProductCardData, qty?: number) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  removeItem: (id: string) => void
  cartCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isMobileMenuOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + qty } : i,
              ),
              isCartOpen: true,
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                qty,
                tint: product.tint,
                art: product.art,
              },
            ],
            isCartOpen: true,
          }
        }),
      incrementItem: (id) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
        })),
      decrementItem: (id) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      cartCount: () => get().items.reduce((a, i) => a + i.qty, 0),
      subtotal: () => get().items.reduce((a, i) => a + i.qty * i.price, 0),
    }),
    { name: "rsp-cart" },
  ),
)
