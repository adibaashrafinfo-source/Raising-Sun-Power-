import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import type { MenuGroup } from "@/lib/category-tree"
import { CategoryIcon } from "@/pages/home/CategoryIcon"

/**
 * One menu's panel: the categories filed under that group, two or three to a
 * row, each with its icon, its tagline and its badge. Everything on it is a
 * category row, so the admin panel is what edits it.
 */
export function MegaMenu({
  group,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  group: MenuGroup
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-[var(--shadow)] before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-extrabold text-text">{group.name}</h2>
            {group.tagline && <p className="text-[12.5px] text-muted">{group.tagline}</p>}
          </div>
          <Link
            to={`/category/${group.slug}`}
            onClick={onClose}
            className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-blue no-underline"
          >
            See everything in {group.name} <ArrowRight className="size-[16px]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
          {group.children.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              onClick={onClose}
              className="flex items-start gap-3 rounded-[14px] border border-transparent px-3 py-2.5 no-underline transition-colors hover:border-blue-500/30 hover:bg-surface-2"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 shadow-[inset_0_1px_0_rgba(255,255,255,.35)]">
                <CategoryIcon slug={cat.slug} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-heading text-[13.5px] font-bold text-text">
                    {cat.name}
                  </span>
                  {cat.badge && <MenuBadge label={cat.badge} />}
                </span>
                {cat.tagline && (
                  <span className="mt-0.5 block truncate text-[11.5px] text-muted">{cat.tagline}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const BADGE_TONE: Record<string, string> = {
  hot: "bg-orange-500 text-white",
  new: "bg-green-500 text-white",
  free: "bg-blue text-white",
}

export function MenuBadge({ label }: { label: string }) {
  const tone = BADGE_TONE[label.trim().toLowerCase()] ?? "bg-blue text-white"
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase leading-none ${tone}`}>
      {label}
    </span>
  )
}
