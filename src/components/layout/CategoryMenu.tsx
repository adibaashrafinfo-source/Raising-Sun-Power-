import { createPortal } from "react-dom"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { useNavCategories } from "@/lib/category-nav"
import { CategoryIcon } from "@/pages/home/CategoryIcon"

/**
 * The desktop category panel, opened from the three-line button on the left of
 * the nav row. The homepage no longer carries a category grid, so this — and
 * MobileCategorySheet on phones — is where categories are browsed.
 */
export function CategoryMenu({ onClose }: { onClose: () => void }) {
  const categories = useNavCategories()

  return (
    <>
      {/* Click-away layer. It is portalled to the body because the header's
          backdrop-blur makes the header a containing block for fixed children,
          which would otherwise trap this layer inside the header's own box. */}
      {createPortal(
        <div onClick={onClose} aria-hidden="true" className="fixed inset-0 z-[55]" />,
        document.body,
      )}
      <div className="absolute inset-x-0 top-full z-[56] border-b border-border bg-surface shadow-[var(--shadow)]">
        <div className="mx-auto max-w-[1280px] px-6 py-6">
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

          <div className="grid grid-cols-4 gap-3 xl:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-[14px] border border-border bg-surface-2 px-3 py-2.5 no-underline transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-blue-500/40"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
                  style={{ background: cat.tint }}
                >
                  <CategoryIcon slug={cat.slug} />
                </span>
                <span className="min-w-0 truncate font-heading text-[13px] font-bold leading-tight text-text">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
