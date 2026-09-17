import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  LayoutGrid,
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

import { CategoryMenu } from "@/components/layout/CategoryMenu"
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
import { useCategories } from "@/hooks/use-catalog"
import { useSiteContent } from "@/hooks/use-site-content"
import { signOut } from "@/lib/queries/auth"
import { useTheme } from "@/lib/theme-provider"
import { useCartStore } from "@/store/cart-store"

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { session, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [megaOpen, setMegaOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current)
    setCategoryOpen(false)
    setMegaOpen(true)
  }
  const scheduleCloseMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current)
    megaCloseTimer.current = setTimeout(() => setMegaOpen(false), 200)
  }
  const openCart = useCartStore((s) => s.openCart)
  const openMobileMenu = useCartStore((s) => s.openMobileMenu)
  const cartCount = useCartStore((s) => s.cartCount())
  const { data: categories = [] } = useCategories()
  const [searchCat, setSearchCat] = useState<{ label: string; slug: string | null }>({
    label: "All",
    slug: null,
  })
  const [searchTerm, setSearchTerm] = useState("")

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchTerm.trim()
    if (searchCat.slug) {
      navigate(q ? `/category/${searchCat.slug}?search=${encodeURIComponent(q)}` : `/category/${searchCat.slug}`)
    } else {
      navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products")
    }
  }
  const { data: siteContent } = useSiteContent()
  const headerLogo = siteContent?.header_logo_url || "/logo.jpg"

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out")
    navigate("/")
  }

  return (
    <header className="rsp-topbar sticky top-0 z-[60] border-b border-border">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={openMobileMenu}
          aria-label="Menu"
          className="flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-text lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <BrandLogo src={headerLogo} />

        {/* Search — grows to fill row one */}
        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 lg:flex">
          <div className="flex h-11 min-w-0 w-full items-center rounded-xl border border-border bg-surface-2 transition-shadow focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--blue)_35%,transparent)]">
            <DropdownMenu>
              <DropdownMenuTrigger className="group flex h-full shrink-0 items-center gap-1.5 rounded-l-xl border-r border-border px-3.5 text-[13px] font-semibold text-muted outline-none transition-colors hover:bg-surface-3 hover:text-text data-[state=open]:bg-surface-3 data-[state=open]:text-text">
                <LayoutGrid className="size-[15px]" />
                <span className="max-w-[110px] truncate">{searchCat.label}</span>
                <ChevronDown className="size-[13px] transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[320px] w-60 overflow-y-auto p-1.5">
                <DropdownMenuLabel className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted">
                  Shop by category
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={() => setSearchCat({ label: "All", slug: null })}
                  className="rounded-lg text-[13.5px] font-semibold"
                >
                  <LayoutGrid className="size-4 text-blue" /> All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onSelect={() => setSearchCat({ label: c.name, slug: c.slug })}
                    className="rounded-lg text-[13.5px]"
                  >
                    <span className="size-1.5 rounded-full bg-orange-500" />
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Search className="ml-3 size-[17px] shrink-0 text-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search MCB, solar panel, inverter…"
              className="min-w-0 flex-1 bg-transparent px-3.5 text-base text-text outline-none sm:text-sm placeholder:text-muted"
            />
          </div>
        </form>

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

      {/* Row two — primary navigation, so nothing is squeezed or cropped */}
      <div className="hidden border-t border-border lg:block">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <nav className="flex flex-wrap items-center gap-0.5 py-1.5 xl:gap-1">
            {/* Three-line button — the categories used to sit on the homepage,
                they now open from here. */}
            <button
              onClick={() => {
                setMegaOpen(false)
                setCategoryOpen((v) => !v)
              }}
              aria-expanded={categoryOpen}
              className="mr-1.5 inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-[13px] font-bold text-text transition-colors hover:bg-surface-3 xl:text-sm"
            >
              <Menu className="size-[17px]" />
              All Categories
              <ChevronDown
                className={`size-[13px] transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>
            <Link
              to="/"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              Home
            </Link>
            <div onMouseEnter={openMega} onMouseLeave={scheduleCloseMega}>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
              >
                Products <ChevronDown className="size-[13px]" />
              </Link>
              {megaOpen && (
                <MegaMenu onClose={() => setMegaOpen(false)} onMouseEnter={openMega} onMouseLeave={scheduleCloseMega} />
              )}
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
            <Link
              to="/wholesale"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              Wholesale
            </Link>
            <Link
              to="/blog"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              Blog
            </Link>
            <Link
              to="/about"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="whitespace-nowrap rounded-[10px] px-2.5 py-2 text-[13px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:px-3 xl:text-sm"
            >
              Contact
            </Link>
          </nav>
        </div>
        {categoryOpen && <CategoryMenu onClose={() => setCategoryOpen(false)} />}
      </div>
    </header>
  )
}

/**
 * The header brand. A wide lockup (icon + wordmark, like the full Rising Sun
 * Power BD logo) is shown whole and replaces the typed name, while a square
 * icon keeps its rounded tile with the name beside it. Which one we have is
 * decided from the image's own aspect ratio once it loads, so uploading a new
 * logo from the admin CMS is all it takes to switch between the two.
 */
function BrandLogo({ src }: { src: string }) {
  const [isWide, setIsWide] = useState(false)

  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5 no-underline">
      <span
        className={
          isWide
            ? "flex items-center"
            : "flex size-[144px] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-sm)] sm:size-[168px]"
        }
      >
        <img
          src={src}
          alt="Rising Sun Power BD"
          onLoad={(e) => {
            const img = e.currentTarget
            setIsWide(img.naturalHeight > 0 && img.naturalWidth / img.naturalHeight >= 1.8)
          }}
          className={
            isWide
              ? "max-h-[144px] w-auto max-w-full object-contain sm:max-h-[168px] lg:max-h-[192px]"
              : "size-full object-cover"
          }
        />
      </span>
      {!isWide && (
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-heading text-lg font-extrabold tracking-wide text-text">
            Rising Sun Power
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-500">
            Solar &amp; Electrical
          </span>
        </span>
      )}
    </Link>
  )
}
