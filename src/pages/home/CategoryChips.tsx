import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { useNavCategories } from "@/lib/category-nav"
import { CategoryIcon } from "@/pages/home/CategoryIcon"

/** A compact icon rail of every category, straight from the categories table. */
export function CategoryChips() {
  const categories = useNavCategories()

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 sm:pt-12">
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-8">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 rounded-[16px] border border-border bg-surface px-2 py-3.5 text-center no-underline shadow-[var(--shadow-sm)] transition-[transform,border-color] duration-250 hover:-translate-y-1 hover:border-blue-500/40"
          >
            <span
              className="flex size-10 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
              style={{ background: cat.tint }}
            >
              <CategoryIcon slug={cat.slug} />
            </span>
            <span className="font-heading text-[11.5px] font-bold leading-tight text-text">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <Link
          to="/products"
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-[13px] font-bold text-blue no-underline shadow-[var(--shadow-sm)] transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-blue-500/45"
        >
          Browse all categories
          <ArrowRight className="size-[15px] transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  )
}
