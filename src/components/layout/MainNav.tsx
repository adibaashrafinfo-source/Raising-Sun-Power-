import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"

import { MenuBadge } from "@/components/layout/MegaMenu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MenuGroup } from "@/lib/category-tree"

export type NavItem = {
  key: string
  label: string
  to: string
  /** Small pill after the label, e.g. HOT or FREE. */
  badge?: string
  /** Set on a category item: hovering it opens that group's mega menu. */
  group?: MenuGroup
}

/** Room kept free for the "More" button once anything has to move into it. */
const MORE_RESERVE = 58

const ITEM_CLASS =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-[10px] px-1.5 py-1.5 text-[12.5px] font-semibold text-muted no-underline hover:bg-surface-2 hover:text-blue xl:gap-1.5 xl:px-2.5 xl:text-[13px]"

/**
 * The header's primary navigation row. Everything stays on a single line: the
 * row measures itself and whatever does not fit moves into a "More" dropdown,
 * so adding categories from the admin panel can never push links onto a second
 * line. The mega menu itself is rendered by the header, not from here, because
 * this row clips its own overflow.
 */
export function MainNav({
  items,
  leading,
  hasMegaMenu,
  onOpenGroup,
  onCloseGroup,
}: {
  items: NavItem[]
  /** Always-visible element pinned to the left (the All Categories button). */
  leading?: React.ReactNode
  hasMegaMenu: boolean
  onOpenGroup: (slug: string) => void
  onCloseGroup: () => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [limit, setLimit] = useState(items.length)
  // Bumped to force a fresh measuring pass. Resetting the limit alone is not
  // enough: when nothing is in the "More" menu yet the limit does not change,
  // so no render — and therefore no measurement — would follow a resize.
  const [pass, setPass] = useState(0)

  // A width change starts the measurement over: every item goes back on the
  // row (clipped, never wrapped) so the next pass can measure them all.
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const restart = () => {
      setLimit(items.length)
      setPass((p) => p + 1)
    }
    const observer = new ResizeObserver(restart)
    observer.observe(row)
    return () => observer.disconnect()
  }, [items.length])

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const kids = Array.from(row.children) as HTMLElement[]
    const itemEls = kids.filter((k) => k.dataset.nav === "item")
    // Already sliced — the widths of the hidden items are unknown, so wait for
    // the next full pass rather than measuring a partial row.
    if (itemEls.length < items.length) return

    const total = row.clientWidth
    // Read rather than assume: the gap is what actually separates the items.
    const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0
    const leadWidth = kids
      .filter((k) => k.dataset.nav === "lead")
      .reduce((sum, k) => sum + k.offsetWidth + gap, 0)

    const fitCount = (reserve: number) => {
      let used = leadWidth + reserve
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
    <div ref={rowRef} className="flex items-center gap-0.5 overflow-hidden py-1">
      {leading && (
        <div data-nav="lead" className="shrink-0">
          {leading}
        </div>
      )}
      {visible.map((item) => (
        <div
          key={item.key}
          data-nav="item"
          className="shrink-0"
          onMouseEnter={hasMegaMenu && item.group ? () => onOpenGroup(item.group!.slug) : undefined}
          onMouseLeave={hasMegaMenu && item.group ? onCloseGroup : undefined}
        >
          <Link to={item.to} className={ITEM_CLASS}>
            {item.label}
            {item.badge && <MenuBadge label={item.badge} />}
            {hasMegaMenu && item.group && <ChevronDown className="size-[13px]" />}
          </Link>
        </div>
      ))}
      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More menu items"
            className={`${ITEM_CLASS} shrink-0 outline-none`}
          >
            <MoreHorizontal className="size-[17px]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflow.map((item) => (
              <DropdownMenuItem key={item.key} asChild>
                <Link to={item.to}>
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
