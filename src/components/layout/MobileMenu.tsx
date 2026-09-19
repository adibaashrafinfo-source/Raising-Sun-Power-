import { X } from "lucide-react"
import { Link } from "react-router-dom"

import { SearchSuggest } from "@/components/search/SearchSuggest"
import { useCartStore } from "@/store/cart-store"

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
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
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            onClick={close}
            className="border-b border-border py-3.5 text-base font-semibold text-text no-underline last:border-b-0"
          >
            {link.label}
          </Link>
        ))}
      </aside>
    </>
  )
}
