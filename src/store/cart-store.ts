import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"

import type { Coupon } from "@/types/database"
import type { ProductCardData } from "@/types/product"

export type CartThumbnail =
  | { kind: "art"; art: ProductCardData["art"]; tint: string }
  | { kind: "image"; src: string }

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  thumbnail: CartThumbnail
}

export type AddToCartInput = {
  id: string
  name: string
  price: number
  thumbnail: CartThumbnail
}

type CartState = {
  items: CartItem[]
  /** Validated on the cart page; the checkout reads it back so the discount
      actually reaches the order. */
  coupon: Coupon | null
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  openCart: () => void
  closeCart: () => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  addItem: (product: AddToCartInput, qty?: number) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  removeItem: (id: string) => void
  cartCount: () => number
  subtotal: () => number
  setCoupon: (coupon: Coupon | null) => void
  discount: () => number
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isCartOpen: false,
      isMobileMenuOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      addItem: (product, qty = 1) => {
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
                thumbnail: product.thumbnail,
              },
            ],
            isCartOpen: true,
          }
        })
        toast.success(`${product.name} added to cart`)
      },
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
      setCoupon: (coupon) => set({ coupon }),
      discount: () => {
        const { coupon } = get()
        if (!coupon) return 0
        const subtotal = get().items.reduce((a, i) => a + i.qty * i.price, 0)
        return coupon.discount_type === "percent"
          ? Math.round((subtotal * coupon.discount_value) / 100)
          : Math.min(coupon.discount_value, subtotal)
      },
      clearCart: () => set({ items: [], coupon: null }),
    }),
    {
      name: "rsp-cart",
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    },
  ),
)
