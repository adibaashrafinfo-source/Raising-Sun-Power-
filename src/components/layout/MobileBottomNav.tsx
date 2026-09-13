import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"

export function MobileBottomNav() {
  const location = useLocation()
  const openMobileMenu = useCartStore((s) => s.openMobileMenu)
  const openCart = useCartStore((s) => s.openCart)
  const cartCount = useCartStore((s) => s.cartCount())

  const tabClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10.5px] font-semibold",
      active ? "text-blue" : "text-muted",
    )

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[70] flex justify-around border-t border-border bg-[var(--surface)]/85 px-1 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <Link to="/" className={tabClass(location.pathname === "/")}>
        <Home className="size-[21px]" />
        Home
      </Link>
      <Link to="/products" className={tabClass(location.pathname.startsWith("/products"))}>
        <LayoutGrid className="size-[21px]" />
        Categories
      </Link>
      <button onClick={openMobileMenu} className={tabClass(false)}>
        <Search className="size-[21px]" />
        Search
      </button>
      <button onClick={openCart} className={cn(tabClass(false), "relative")}>
        <span className="relative">
          <ShoppingCart className="size-[21px]" />
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </span>
        Cart
      </button>
      <Link to="/account" className={tabClass(location.pathname.startsWith("/account"))}>
        <User className="size-[21px]" />
        Account
      </Link>
    </nav>
  )
}
