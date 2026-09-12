import { Link } from "react-router-dom"

import { categories } from "@/data/home-content"
import { CategoryIcon } from "@/pages/home/CategoryIcon"
import { SectionHeader } from "@/pages/home/SectionHeader"

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
      <SectionHeader
        kicker="Shop by category"
        kickerColor="#F49E09"
        title="Everything to build a power system"
        linkTo="/products"
        linkLabel="View all"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="flex flex-col gap-3.5 rounded-[18px] border border-border bg-surface p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-250 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[var(--shadow)]"
          >
            <span
              className="flex size-[52px] items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
              style={{ background: cat.tint }}
            >
              <CategoryIcon slug={cat.slug} />
            </span>
            <div>
              <div className="font-heading text-[15px] font-bold text-text">{cat.name}</div>
              <div className="mt-0.5 text-[12.5px] text-muted">{cat.count}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
