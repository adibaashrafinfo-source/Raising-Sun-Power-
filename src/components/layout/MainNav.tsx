import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"

import { MenuBadge, type MenuPanelItem } from "@/components/layout/MegaMenu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type NavItem = {
  key: string
  label: string
  to: string
  /** Small pill over the label, e.g. HOT or FREE. */
  badge?: string
  /** Entries for the dropdown this item opens on hover. */
  panel?: MenuPanelItem[]
}

/** Room kept free for the "More" button once anything has to move into it. */
const MORE_RESERVE = 40

const ITEM_CLASS =
  "relative inline-flex items-center gap-0.5 whitespace-nowrap rounded-lg px-1.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.01em] text-text no-underline transition-colors hover:text-orange-500 xl:gap-1 xl:px-2 xl:text-[12.5px]"

/** The "More" overflow panel sits in the portal root, outside the header's
 *  forced-light scope, so it needs its own light styling to match the bar
 *  rather than following the page theme (dark mode would otherwise hand it
 *  the page's dark surface tokens while the header row stays light). */
const MORE_PANEL_CLASS =
  "min-w-[180px] rounded-2xl border border-black/10 bg-white p-1.5 text-black shadow-[0_24px_60px_rgba(0,0,0,.18)]"
const MORE_ITEM_CLASS = "rounded-xl text-black hover:bg-black/[.05] focus:bg-black/[.05] data-[highlighted]:bg-black/[.05]"

/**
 * The header's primary navigation. It stays on one line: the row measures
 * itself and anything that does not fit moves into a "More" dropdown, so adding
 * categories from the admin panel can never wrap the bar. The dropdown panels
 * are drawn by the header, because this row clips its own overflow.
 */
export function MainNav({
  items,
  openKey,
  onOpen,
  onClose,
}: {
  items: NavItem[]
  openKey: string | null
  onOpen: (key: string, anchor: HTMLElement) => void
  onClose: () => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [limit, setLimit] = useState(items.length)
  // Bumped to force a fresh measuring pass: when nothing is in "More" yet the
  // limit does not change on resize, so no render (and no measuring) follows.
  const [pass, setPass] = useState(0)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const observer = new ResizeObserver(() => {
      setLimit(items.length)
      setPass((p) => p + 1)
    })
    observer.observe(row)
    return () => observer.disconnect()
  }, [items.length])

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const itemEls = (Array.from(row.children) as HTMLElement[]).filter((k) => k.dataset.nav === "item")
    // Already sliced: the hidden items' widths are unknown, so wait for a full pass.
    if (itemEls.length < items.length) return

    const total = row.clientWidth
    const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0
    const fitCount = (reserve: number) => {
      let used = reserve
      for (let i = 0; i < itemEls.length; i++) {
        used += itemEls[i].offsetWidth + gap
        if (used > total) return i
      }
      return items.length
    }
    const fits = fitCount(0)
    setLimit(fits === items.length ? items.length : fitCount(MORE_RESERVE))
  }, [items, limit, pass])

  const visible = items.slice(0, limit)
  const overflow = items.slice(limit)

  return (
    <div ref={rowRef} className="flex items-center gap-0 overflow-hidden py-2">
      {visible.map((item) => {
        const isOpen = openKey === item.key
        return (
          <div
            key={item.key}
            data-nav="item"
            className="shrink-0"
            onMouseEnter={item.panel ? (e) => onOpen(item.key, e.currentTarget) : undefined}
            onMouseLeave={item.panel ? onClose : undefined}
          >
            <Link to={item.to} className={cn(ITEM_CLASS, isOpen && "text-orange-500")}>
              {item.label}
              {item.panel && (
                <ChevronDown className={cn("size-3 transition-transform duration-200", isOpen && "rotate-180")} />
              )}
              {item.badge && (
                <span className="absolute -top-1.5 right-0.5">
                  <MenuBadge label={item.badge} />
                </span>
              )}
            </Link>
          </div>
        )
      })}
      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="More menu items" className={`${ITEM_CLASS} shrink-0 outline-none`}>
            <MoreHorizontal className="size-[18px]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={MORE_PANEL_CLASS}>
            {overflow.map((item) => (
              <DropdownMenuItem key={item.key} asChild className={MORE_ITEM_CLASS}>
                <Link to={item.to} className="flex items-center gap-2">
                  {item.label}
                  {item.badge && <MenuBadge label={item.badge} />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
