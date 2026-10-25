import { Link } from "react-router-dom"

export type MenuPanelItem = {
  key: string
  to: string
  label: string
  tagline?: string | null
  badge?: string | null
  icon: React.ReactNode
}

/** Width of a two-column panel. The header uses it to keep the panel on screen. */
export const MENU_PANEL_WIDTH = 520

/**
 * The dropdown under a header menu: a rounded card anchored to the item that
 * opened it, two columns of entries, each with its icon, tagline and badge.
 * The header bar forces light tokens, so the panel picks its own colours per
 * theme instead of reading them.
 */
export function MegaMenu({
  items,
  left,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  items: MenuPanelItem[]
  /** Offset from the header's left edge, already clamped by the header. */
  left: number
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ left, width: MENU_PANEL_WIDTH }}
      className="absolute top-full z-50 mt-1.5 max-w-[calc(100vw-16px)] rounded-2xl border border-black/10 bg-white p-2.5 shadow-[0_24px_60px_rgba(0,0,0,.18)] before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-[''] dark:border-white/10 dark:bg-[#111318] dark:shadow-[0_24px_60px_rgba(0,0,0,.6)]"
    >
      <div className="grid grid-cols-2 gap-0.5">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 no-underline transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/[.05] dark:bg-white/[.07]">
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span className="text-[13px] font-bold leading-tight text-black dark:text-white">{item.label}</span>
                {item.badge && <MenuBadge label={item.badge} />}
              </span>
              {item.tagline && (
                <span className="mt-0.5 block truncate text-[11px] text-neutral-700 dark:text-neutral-400">
                  {item.tagline}
                </span>
              )}
            </span>
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
