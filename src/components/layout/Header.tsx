import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Calculator,
  ClipboardCheck,
  FileText,
  Heart,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Newspaper,
  Package,
  Phone,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Sun,
  TrendingUp,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { MainNav, type NavItem } from "@/components/layout/MainNav"
import { MegaMenu, MENU_PANEL_WIDTH, type MenuPanelItem } from "@/components/layout/MegaMenu"
import { SearchSuggest } from "@/components/search/SearchSuggest"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePackageCategories } from "@/hooks/use-packages"
import { useSiteContent } from "@/hooks/use-site-content"
import { isAdminRole } from "@/lib/admin-access"
import { useAuth } from "@/lib/auth-provider"
import { useMenuGroups } from "@/lib/category-tree"
import { clampLogoHeight, DEFAULT_LOGO_HEIGHT } from "@/lib/logo-size"
import { signOut } from "@/lib/queries/auth"
import { useTheme } from "@/lib/theme-provider"
import { CategoryIcon } from "@/pages/home/CategoryIcon"
import { useCartStore } from "@/store/cart-store"

const ICON = "size-[17px]"

const CALCULATOR_PANEL: MenuPanelItem[] = [
  {
    key: "solar-calculator",
    to: "/solar-calculator",
    label: "Solar Calculator",
    tagline: "Size a system for your load",
    icon: <Calculator className={`${ICON} text-orange-500`} />,
  },
  {
    key: "roi",
    to: "/solar-roi-calculator",
    label: "ROI Calculator",
    tagline: "Savings and payback years",
    icon: <TrendingUp className={`${ICON} text-green-500`} />,
  },
  {
    key: "assessment",
    to: "/solar-assessment",
    label: "Free Solar Assessment",
    tagline: "Book a site survey",
    icon: <ClipboardCheck className={`${ICON} text-blue`} />,
  },
  {
    key: "quotation",
    to: "/get-quotation",
    label: "Get Free Quotation",
    tagline: "Priced for your project",
    badge: "Free",
    icon: <FileText className={`${ICON} text-orange-500`} />,
  },
]

const SERVICES_PANEL: MenuPanelItem[] = [
  {
    key: "wholesale",
    to: "/wholesale",
    label: "Wholesale & Dealer",
    tagline: "Bulk pricing for resellers",
    icon: <Store className={`${ICON} text-orange-500`} />,
  },
  {
    key: "track",
    to: "/track-order",
    label: "Track Order",
    tagline: "Where your order is now",
    icon: <Truck className={`${ICON} text-blue`} />,
  },
  {
    key: "article",
    to: "/blog",
    label: "Articles",
    tagline: "Solar guides and news",
    icon: <Newspaper className={`${ICON} text-green-500`} />,
  },
  {
    key: "about",
    to: "/about",
    label: "About Us",
    tagline: "Who we are",
    icon: <Info className={`${ICON} text-blue`} />,
  },
  {
    key: "contact",
    to: "/contact",
    label: "Contact",
    tagline: "Call, WhatsApp or visit",
    icon: <Phone className={`${ICON} text-orange-500`} />,
  },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isHidden, setIsHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [open, setOpen] = useState<{ key: string; left: number } | null>(null)
  const menuGroups = useMenuGroups()
  const { data: packageCategories = [] } = usePackageCategories()
  const headerRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHome = location.pathname === "/"

  // Panels and the search row close whenever the page changes.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setOpen(null)
    setSearchOpen(false)
  }

  const openPanel = (key: string, anchor: HTMLElement) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    const header = headerRef.current
    if (!header) return
    const bar = header.getBoundingClientRect()
    const item = anchor.getBoundingClientRect()
    const width = Math.min(MENU_PANEL_WIDTH, bar.width - 16)
    const left = Math.min(Math.max(8, item.left - bar.left - 16), bar.width - width - 8)
    setOpen({ key, left })
  }
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 180)
  }

  // On the homepage the bar slides away once the hero is behind you and comes
  // back as you scroll up into it. Batched into one animation frame so the
  // scroll handler never does synchronous React work.
  useEffect(() => {
    if (!isHome) {
      setIsHidden(false)
      return
    }
    let ticking = false
    const evaluate = () => {
      ticking = false
      const hero = document.querySelector<HTMLElement>("[data-hero]")
      setIsHidden(hero ? window.scrollY > hero.offsetTop + hero.offsetHeight : false)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(evaluate)
    }
    const raf = requestAnimationFrame(evaluate)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
    }
  }, [isHome])

  const openCart = useCartStore((s) => s.openCart)
  const openMobileMenu = useCartStore((s) => s.openMobileMenu)
  const cartCount = useCartStore((s) => s.cartCount())
  const { data: siteContent } = useSiteContent()
  const headerLogo = siteContent?.header_logo_url || "/logo.png"
  const logoHeight = siteContent?.header_logo_height || DEFAULT_LOGO_HEIGHT

  // Packages, then one menu per top-level category (its sub-categories become
  // the panel), then the calculators and services. Categories come from the
  // admin panel, so a new category shows up here without a deploy.
  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        key: "packages",
        label: "Packages",
        to: "/packages",
        badge: "HOT",
        panel: packageCategories.length
          ? packageCategories.map((cat) => ({
              key: cat.id,
              to: `/packages?category=${cat.slug}`,
              label: cat.name,
              tagline: cat.description,
              icon: <Zap className={`${ICON} text-orange-500`} />,
            }))
          : undefined,
      },
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
        panel: group.children.map((cat) => ({
          key: cat.id,
          to: `/category/${cat.slug}`,
          label: cat.name,
          tagline: cat.tagline,
          badge: cat.badge,
          icon: <CategoryIcon slug={cat.slug} className={ICON} />,
        })),
      })
    }
    items.push(
      { key: "calculator", label: "Calculator", to: "/solar-calculator", badge: "FREE", panel: CALCULATOR_PANEL },
      { key: "services", label: "Services", to: "/get-quotation", badge: "NEW", panel: SERVICES_PANEL },
    )
    return items
  }, [menuGroups, packageCategories])

  const openItem = open ? navItems.find((item) => item.key === open.key) : undefined

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out")
    navigate("/")
  }

  const iconButton =
    "relative flex size-10 shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-black/[.05] active:scale-95"

  return (
    <header
      ref={headerRef}
      className={`rsp-topbar sticky top-0 z-[60] border-b border-border transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* .5" (≈48px) wider than the rest of the site on each side, reclaimed
          from the page's own side margin, so the full menu row fits without
          dropping items into the overflow "More" button. */}
      <div className="mx-auto flex max-w-[1376px] items-center gap-2 px-4 py-1.5 sm:px-6 lg:gap-4">
        <button onClick={openMobileMenu} aria-label="Menu" className={`${iconButton} -ml-2 lg:hidden`}>
          <Menu className="size-[22px]" />
        </button>

        <BrandLogo src={headerLogo} height={logoHeight} />

        <nav aria-label="Main" className="hidden min-w-0 flex-1 lg:block">
          <MainNav
            items={navItems}
            openKey={open?.key ?? null}
            onOpen={openPanel}
            onClose={scheduleClose}
          />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
            className={`${iconButton} hidden lg:flex`}
          >
            {searchOpen ? <X className="size-[20px]" /> : <Search className="size-[20px]" />}
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme" className={iconButton}>
            {theme === "dark" ? (
              <Sun className="size-[20px]" stroke="#D9A400" />
            ) : (
              <Moon className="size-[20px]" stroke="#0B3F94" />
            )}
          </button>
          <button onClick={openCart} aria-label="Cart" className={iconButton}>
            <ShoppingCart className="size-[20px]" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10.5px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-[#FFD60A] px-4 text-[13px] font-bold text-black outline-none transition-[filter] hover:brightness-95 lg:inline-flex">
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
                {isAdminRole(profile?.role) && (
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
              className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-[#FFD60A] px-4 text-[13px] font-bold text-black no-underline transition-[filter] hover:brightness-95 lg:inline-flex"
            >
              <LogIn className="size-[16px]" />
              Login
            </Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="hidden border-t border-border lg:block">
          <div className="mx-auto max-w-[680px] px-6 py-3">
            <SearchSuggest onNavigate={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {open && openItem?.panel && (
        <MegaMenu
          items={openItem.panel}
          left={open.left}
          onClose={() => setOpen(null)}
          onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
          onMouseLeave={scheduleClose}
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
    <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5 no-underline">
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
