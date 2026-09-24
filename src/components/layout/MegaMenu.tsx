import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { CategoryIcon } from "@/pages/home/CategoryIcon"
import { useNavCategories } from "@/lib/category-nav"

/**
 * The Products dropdown. Every entry is a live category row, so the admin
 * panel's Categories page is what edits this menu.
 */
export function MegaMenu({
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const categories = useNavCategories()

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-[var(--shadow)] before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_260px] gap-6 px-6 py-6">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">
                Shop by category
              </span>
              <h2 className="font-heading text-lg font-extrabold text-text">
                Everything to build a power system
              </h2>
            </div>
            <Link
              to="/products"
              onClick={onClose}
              className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-blue no-underline"
            >
              View all products <ArrowRight className="size-[16px]" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5 xl:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-[14px] border border-transparent px-2.5 py-2 no-underline transition-colors hover:border-blue-500/30 hover:bg-surface-2"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
                  style={{ background: cat.tint }}
                >
                  <CategoryIcon slug={cat.slug} />
                </span>
                <span className="min-w-0 truncate font-heading text-[13px] font-bold text-text">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-5 text-white">
          <div>
            <span className="inline-block rounded-full bg-[linear-gradient(135deg,#F4D560,#F49E09)] px-2.5 py-1 text-[11px] font-extrabold text-[#3a2600]">
              Free sizing
            </span>
            <div className="mt-3 font-heading text-lg font-extrabold leading-tight">
              Not sure what you need? Our engineers size it free.
            </div>
          </div>
          <Link
            to="/solar-assessment"
            onClick={onClose}
            className="mt-4 flex h-10 items-center justify-center rounded-[11px] bg-[linear-gradient(100deg,#F49E09,#FFB43D)] text-[13px] font-bold text-white no-underline"
          >
            Get free assessment →
          </Link>
        </div>
      </div>
    </div>
  )
}
