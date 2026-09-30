import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Link } from "react-router-dom"

import { MenuBadge } from "@/components/layout/MegaMenu"
import { SearchSuggest } from "@/components/search/SearchSuggest"
import { useMenuGroups } from "@/lib/category-tree"
import { useCartStore } from "@/store/cart-store"

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/packages", label: "Packages" },
  { to: "/solar-calculator", label: "Solar Calculator" },
  { to: "/solar-roi-calculator", label: "ROI Calculator" },
  { to: "/solar-assessment", label: "Free Solar Assessment" },
  { to: "/wholesale", label: "Wholesale & Dealer" },
  { to: "/blog", label: "Article" },
  { to: "/track-order", label: "Track Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
]

export function MobileMenu() {
  const isOpen = useCartStore((s) => s.isMobileMenuOpen)
  const close = useCartStore((s) => s.closeMobileMenu)
  const groups = useMenuGroups()
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <>
      <div onClick={close} className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[3px]" />
      <aside className="fixed inset-y-0 left-0 z-[91] flex w-full max-w-[320px] flex-col border-r border-border bg-bg p-5 shadow-[var(--shadow)]">
        <div className="mb-5 flex items-center justify-between">
          <span className="font-heading text-lg font-extrabold text-text">Menu</span>
          <button
            onClick={close}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-[10px] border border-border bg-surface-2 text-text"
          >
            <X className="size-[18px]" />
          </button>
        </div>
        <div className="mb-4">
          <SearchSuggest variant="plain" onNavigate={close} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Same category tree as the desktop mega menus, as accordions. */}
          {groups.map((group) => (
            <div key={group.id} className="border-b border-border">
              <button
                onClick={() => setOpenGroup((g) => (g === group.slug ? null : group.slug))}
                aria-expanded={openGroup === group.slug}
                className="flex w-full items-center justify-between py-3.5 text-base font-semibold text-text"
              >
                <span className="flex items-center gap-2">
                  {group.name}
                  {group.badge && <MenuBadge label={group.badge} />}
                </span>
                <ChevronDown
                  className={`size-4 text-muted transition-transform duration-200 ${
                    openGroup === group.slug ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openGroup === group.slug && (
                <div className="flex flex-col gap-0.5 pb-3">
                  <Link
                    to={`/category/${group.slug}`}
                    onClick={close}
                    className="rounded-lg px-3 py-2 text-[13.5px] font-bold text-blue no-underline"
                  >
                    All {group.name}
                  </Link>
                  {group.children.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] text-muted no-underline"
                    >
                      {cat.name}
                      {cat.badge && <MenuBadge label={cat.badge} />}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={close}
              className="block border-b border-border py-3.5 text-base font-semibold text-text no-underline last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  )
}
