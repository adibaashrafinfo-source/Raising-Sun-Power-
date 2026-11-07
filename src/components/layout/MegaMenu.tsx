import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export type MenuPanelItem = {
  key: string
  to: string
  label: string
  tagline?: string | null
  badge?: string | null
  icon: React.ReactNode
}

/** Width of the panel. The header uses it to keep the panel on screen. */
export const MENU_PANEL_WIDTH = 920

/**
 * The dropdown under a header menu: a roomy card anchored to the item that
 * opened it. A brand-gradient edge and a title strip (with "View all") sit
 * above two columns of entries, each with its icon tile, label, tagline and
 * badge. The header bar forces light tokens, so the panel picks its own colours
 * per theme instead of reading them.
 */
export function MegaMenu({
  items,
  left,
  title,
  viewAllTo,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  items: MenuPanelItem[]
  /** Offset from the header's left edge, already clamped by the header. */
  left: number
  title?: string
  viewAllTo?: string
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ left, width: MENU_PANEL_WIDTH }}
      className="absolute top-full z-50 mt-1.5 max-w-[calc(100vw-16px)] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_40px_100px_-10px_rgba(1,22,83,.38),0_12px_30px_rgba(1,22,83,.14)] before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-[''] dark:border-white/10 dark:bg-[#111318] dark:shadow-[0_30px_80px_rgba(0,0,0,.65)]"
    >
      <div className="h-1 w-full bg-[linear-gradient(90deg,#0352AF,#FA9104_50%,#3F8F0C)]" />
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-black/[.06] bg-[linear-gradient(180deg,rgba(3,82,175,.06),transparent)] px-6 py-4 dark:border-white/[.08]">
          <span className="font-heading text-[14px] font-extrabold uppercase tracking-[0.12em] text-black dark:text-white">
            {title}
          </span>
          {viewAllTo && (
            <Link
              to={viewAllTo}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[12.5px] font-bold text-blue no-underline hover:text-orange-500"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      )}
      <div className="grid max-h-[72vh] grid-cols-2 gap-1.5 overflow-y-auto p-4">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            onClick={onClose}
            className="group flex min-w-0 items-center gap-4 rounded-2xl border border-transparent px-4 py-3.5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#0352AF,#02296F)] hover:shadow-[0_14px_30px_-6px_rgba(3,82,175,.55)]"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(3,82,175,.12),rgba(250,145,4,.16))] ring-1 ring-black/[.05] transition-all duration-200 group-hover:scale-105 group-hover:bg-white group-hover:ring-white/40 dark:ring-white/10 [&>svg]:size-[26px]">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span className="text-[16px] font-bold leading-tight text-black transition-colors group-hover:text-white dark:text-white">{item.label}</span>
                {item.badge && <MenuBadge label={item.badge} />}
              </span>
              {item.tagline && (
                <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-neutral-700 transition-colors group-hover:text-white/85 dark:text-neutral-400">
                  {item.tagline}
                </span>
              )}
            </span>
            <ArrowRight className="size-5 shrink-0 -translate-x-1 text-white opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  )
}

const BADGE_TONE: Record<string, string> = {
  hot: "bg-red-500 text-white",
  new: "bg-red-500 text-white",
  free: "bg-red-500 text-white",
}

export function MenuBadge({ label }: { label: string }) {
  const tone = BADGE_TONE[label.trim().toLowerCase()] ?? "bg-blue text-white"
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase leading-none ${tone}`}>
      {label}
    </span>
  )
}
