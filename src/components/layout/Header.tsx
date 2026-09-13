import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { MegaMenu } from "@/components/layout/MegaMenu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-provider"
import { useWishlist } from "@/hooks/use-wishlist"
import { signOut } from "@/lib/queries/auth"
import { useTheme } from "@/lib/theme-provider"
import { useCartStore } from "@/store/cart-store"

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { session, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [megaOpen, setMegaOpen] = useState(false)
  const openCart = useCartStore((s) => s.openCart)
  const openMobileMenu = useCartStore((s) => s.openMobileMenu)
  const cartCount = useCartStore((s) => s.cartCount())
  const { items: wishlistItems } = useWishlist()
  const wishlistCount = wishlistItems.length

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out")
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-[60] border-b border-border bg-[var(--surface)]/85 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={openMobileMenu}
          aria-label="Menu"
          className="flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-text lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline">
          <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[var(--shadow-sm)]">
            <img src="/logo.jpg" alt="RSP" className="size-full object-cover" />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-heading text-base font-extrabold tracking-tight text-text">
              Rising Sun Power
            </span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-orange-500">
              Solar &amp; Electrical · BD
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center gap-4 lg:flex">
          <div className="flex h-11 min-w-0 max-w-[520px] flex-1 items-center rounded-xl border border-border bg-surface-2 transition-shadow focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--blue)_35%,transparent)]">
            <select className="h-full cursor-pointer border-r border-border bg-transparent px-3.5 text-[13px] font-semibold text-muted outline-none">
              <option>All</option>
              <option>Solar</option>
              <option>Inverters</option>
              <option>Batteries</option>
              <option>MCB/MCCB</option>
              <option>Cables</option>
            </select>
            <Search className="ml-3 size-[17px] shrink-0 text-muted" />
            <input
              placeholder="Search MCB, solar panel, inverter…"
              className="flex-1 bg-transparent px-3.5 text-sm text-text outline-none placeholder:text-muted"
            />
          </div>
          <nav className="flex shrink-0 gap-0.5 xl:gap-1">
            <Link
              to="/"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              Home
            </Link>
            <div
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
              >
                Products <ChevronDown className="size-[13px]" />
              </Link>
              {megaOpen && <MegaMenu onClose={() => setMegaOpen(false)} />}
            </div>
            <Link
              to="/solar-calculator"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              Solar Calculator
            </Link>
            <Link
              to="/solar-roi-calculator"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              ROI Calculator
            </Link>
            <a className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm">
              Brands
            </a>
            <a className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm">
              About
            </a>
            <a className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm">
              Contact
            </a>
          </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex size-[42px] items-center justify-center rounded-xl border border-border bg-surface-2 text-text transition-colors hover:bg-surface-3 active:scale-95"
          >
            {theme === "dark" ? (
              <Sun className="size-[19px]" stroke="#F4D560" />
            ) : (
              <Moon className="size-[19px]" stroke="#0B3F94" />
            )}
          </button>
          <Link
            to="/account/wishlist"
            aria-label="Wishlist"
            className="relative hidden size-[42px] items-center justify-center rounded-xl border border-border bg-surface-2 text-text no-underline transition-colors hover:bg-surface-3 lg:flex"
          >
            <Heart className="size-[19px]" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10.5px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            onClick={openCart}
            aria-label="Cart"
            className="relative flex size-[42px] items-center justify-center rounded-xl border border-border bg-surface-2 text-text transition-colors hover:bg-surface-3 active:scale-95"
          >
            <ShoppingCart className="size-[19px]" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-1 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(244,158,9,.5)]">
                {cartCount}
              </span>
            )}
          </button>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden h-[42px] items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-[13.5px] font-semibold text-text outline-none transition-colors hover:bg-surface-3 lg:inline-flex">
                <User className="size-[17px]" />
                {profile?.full_name?.split(" ")[0] ?? "Account"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile?.full_name ?? "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account">
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders">
                    <Package className="size-4" /> Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/wishlist">
                    <Heart className="size-4" /> Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/addresses">
                    <MapPin className="size-4" /> Addresses
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Settings className="size-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut} className="text-red-500 focus:bg-red-500/10">
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="hidden h-[42px] items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-[13.5px] font-semibold text-text no-underline transition-colors hover:bg-surface-3 lg:inline-flex"
            >
              <User className="size-[17px]" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
