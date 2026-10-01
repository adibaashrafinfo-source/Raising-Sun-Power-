import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { CategoryMenu } from "@/components/layout/CategoryMenu"
import { MainNav, type NavItem } from "@/components/layout/MainNav"
import { MegaMenu } from "@/components/layout/MegaMenu"
import { SearchSuggest } from "@/components/search/SearchSuggest"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-provider"
import { useSiteContent } from "@/hooks/use-site-content"
import { useMenuGroups } from "@/lib/category-tree"
import { clampLogoHeight, DEFAULT_LOGO_HEIGHT } from "@/lib/logo-size"
import { signOut } from "@/lib/queries/auth"
import { useTheme } from "@/lib/theme-provider"
import { useCartStore } from "@/store/cart-store"

/** How far you have to scroll on an inner page before the nav row slides away. */
const NAV_HIDE_AFTER = 80

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { session, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isHidden, setIsHidden] = useState(false)
  const [isNavHidden, setIsNavHidden] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const menuGroups = useMenuGroups()
  // The product page is dense enough without a full-width panel dropping over
  // it, so the mega menu is switched off there.
  const hasMegaMenu = !location.pathname.startsWith("/product/")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHome = location.pathname === "/"

  const openMega = (slug: string) => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current)
    setCategoryOpen(false)
    setOpenGroup(slug)
  }
  const scheduleCloseMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current)
    megaCloseTimer.current = setTimeout(() => setOpenGroup(null), 200)
  }

  // Two different behaviours, because the homepage hero is the only place the
  // whole bar can leave without costing you the search box: on the homepage the
  // bar slides away once the hero is behind you and comes back as you scroll up
  // into it; everywhere else only the nav row collapses as you scroll down, so
  // the logo, search and cart stay with you.
  useEffect(() => {
    let last = window.scrollY
    const evaluate = () => {
      const y = window.scrollY
      if (isHome) {
        const hero = document.querySelector<HTMLElement>("[data-hero]")
        setIsHidden(hero ? y > hero.offsetTop + hero.offsetHeight : false)
        setIsNavHidden(false)
      } else {
        setIsHidden(false)
        if (y <= NAV_HIDE_AFTER) setIsNavHidden(false)
        else if (y > last) setIsNavHidden(true)
        else if (y < last) setIsNavHidden(false)
      }
      last = y
    }
    // Deferred so the first run is not a synchronous setState inside the effect.
    const raf = requestAnimationFrame(evaluate)
    window.addEventListener("scroll", evaluate, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", evaluate)
    }
  }, [isHome, location.pathname])

  const openCart = useCartStore((s) => s.openCart)
  const openMobileMenu = useCartStore((s) => s.openMobileMenu)
  const cartCount = useCartStore((s) => s.cartCount())
  const { data: siteContent } = useSiteContent()
  const headerLogo = siteContent?.header_logo_url || "/logo.png"
  const logoHeight = siteContent?.header_logo_height || DEFAULT_LOGO_HEIGHT

  // One menu per top-level category, its items filed underneath. If the
  // categories haven't loaded, a plain Products link stands in so the nav is
  // never short of a way into the catalogue.
  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { key: "home", label: "Home", to: "/" },
      { key: "packages", label: "Packages", to: "/packages", badge: "HOT" },
    ]
    if (menuGroups.length === 0) {
      items.push({ key: "products", label: "Products", to: "/products" })
    }
    for (const group of menuGroups) {
      items.push({
        key: group.id,
        label: group.name,
        to: `/category/${group.slug}`,
        badge: group.badge ?? undefined,
        group,
      })
    }
    items.push(
      { key: "solar-calculator", label: "Solar Calculator", to: "/solar-calculator", badge: "FREE" },
      { key: "roi", label: "ROI Calculator", to: "/solar-roi-calculator" },
      { key: "wholesale", label: "Wholesale", to: "/wholesale" },
      { key: "article", label: "Article", to: "/blog" },
      { key: "about", label: "About", to: "/about" },
      { key: "contact", label: "Contact", to: "/contact" },
    )
    return items
  }, [menuGroups])

  // A collapsed nav row must not leave its panels hanging open, so both are
  // derived from it rather than being closed from an effect.
  const showCategoryPanel = categoryOpen && !isNavHidden
  const activeGroup = isNavHidden
    ? undefined
    : menuGroups.find((group) => group.slug === openGroup)

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out")
    navigate("/")
  }

  return (
    <header
      className={`rsp-topbar sticky top-0 z-[60] border-b border-border transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2 sm:px-6">
        <button
          onClick={openMobileMenu}
          aria-label="Menu"
          className="flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-text lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <BrandLogo src={headerLogo} height={logoHeight} />

        {/* Search — grows to fill row one */}
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <div className="w-full max-w-[460px]">
            <SearchSuggest />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex size-[38px] items-center justify-center rounded-xl border border-border bg-surface-2 text-text transition-colors hover:bg-surface-3 active:scale-95"
          >
            {theme === "dark" ? (
              <Sun className="size-[18px]" stroke="#F4D560" />
            ) : (
              <Moon className="size-[18px]" stroke="#0B3F94" />
            )}
          </button>
          <button
            onClick={openCart}
            aria-label="Cart"
            className="relative flex size-[38px] items-center justify-center rounded-xl border border-border bg-surface-2 text-text transition-colors hover:bg-surface-3 active:scale-95"
          >
            <ShoppingCart className="size-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-1 text-[10.5px] font-bold text-white shadow-[0_2px_8px_rgba(244,158,9,.5)]">
                {cartCount}
              </span>
            )}
          </button>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden h-[38px] items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 text-[13px] font-semibold text-text outline-none transition-colors hover:bg-surface-3 lg:inline-flex">
                <User className="size-[16px]" />
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
              className="hidden h-[38px] items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 text-[13px] font-semibold text-text no-underline transition-colors hover:bg-surface-3 lg:inline-flex"
            >
              <User className="size-[16px]" />
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Row two — primary navigation. It collapses on inner pages as you
          scroll, which is why the panels below are siblings of it rather than
          children: this row hides its own overflow. */}
      <div
        className={`hidden overflow-hidden transition-[max-height,opacity] duration-300 lg:block ${
          isNavHidden ? "max-h-0 opacity-0" : "max-h-[56px] border-t border-border opacity-100"
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <MainNav
            items={navItems}
            hasMegaMenu={hasMegaMenu}
            onOpenGroup={openMega}
            onCloseGroup={scheduleCloseMega}
            leading={
              /* Three-line button — the categories used to sit on the homepage,
                 they now open from here. */
              <button
                onClick={() => {
                  setOpenGroup(null)
                  setCategoryOpen((v) => !v)
                }}
                aria-expanded={categoryOpen}
                className="mr-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-border bg-surface-2 px-2.5 py-1.5 text-[12.5px] font-bold text-text transition-colors hover:bg-surface-3 xl:mr-1.5 xl:text-[13px]"
              >
                <Menu className="size-[16px]" />
                Categories
                <ChevronDown
                  className={`size-[13px] transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>
            }
          />
        </div>
      </div>
      {showCategoryPanel && <CategoryMenu onClose={() => setCategoryOpen(false)} />}
      {hasMegaMenu && activeGroup && (
        <MegaMenu
          group={activeGroup}
          onClose={() => setOpenGroup(null)}
          onMouseEnter={() => openMega(activeGroup.slug)}
          onMouseLeave={scheduleCloseMega}
        />
      )}
    </header>
  )
}

/**
 * The header brand. A wide lockup (icon + wordmark, like the full Rising Sun
 * Power BD logo) is shown whole and replaces the typed name, while a square
 * icon keeps its rounded tile with the name beside it. Which one we have is
 * decided from the image's own aspect ratio once it loads, so uploading a new
 * logo from the admin CMS is all it takes to switch between the two. Its height
 * comes from the CMS as well, so the bar can be tuned without a deploy.
 */
function BrandLogo({ src, height }: { src: string; height: number }) {
  const [isWide, setIsWide] = useState(false)
  const size = clampLogoHeight(height)

  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5 no-underline">
      <span
        className={
          isWide
            ? "flex items-center"
            : "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        }
        style={isWide ? undefined : { width: size, height: size }}
      >
        <img
          src={src}
          alt="Rising Sun Power BD"
          // The artwork ships on a white background; multiply against the white
          // bar drops it, so the logo reads as if it were transparent.
          style={{ mixBlendMode: "multiply", maxHeight: size }}
          onLoad={(e) => {
            const img = e.currentTarget
            setIsWide(img.naturalHeight > 0 && img.naturalWidth / img.naturalHeight >= 1.8)
          }}
          className={isWide ? "w-auto max-w-full object-contain" : "size-full object-contain"}
        />
      </span>
      {!isWide && (
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-heading text-base font-extrabold tracking-wide text-text">
            Rising Sun Power
          </span>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-orange-500">
            Solar &amp; Electrical
          </span>
        </span>
      )}
    </Link>
  )
}
