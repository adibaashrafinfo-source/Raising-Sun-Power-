import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { useMenuGroups } from "@/lib/category-tree"
import { CategoryIcon } from "@/pages/home/CategoryIcon"
import { SectionHeader } from "@/pages/home/SectionHeader"

// One brand wash per card, cycled so a new menu group still gets a look.
const WASHES = [
  "linear-gradient(160deg,#217CCA,#052C6E)",
  "linear-gradient(160deg,#F49E09,#a8620a)",
  "linear-gradient(160deg,#4C9412,#1f4d06)",
  "linear-gradient(160deg,#0B3F94,#03163a)",
]

/** The big entry cards: one per menu group, listing what is filed under it. */
export function OurCategory() {
  const groups = useMenuGroups()
  if (groups.length === 0) return null

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <SectionHeader
        kicker="Shop the range"
        kickerColor="#67A70E"
        title="Our categories"
        linkTo="/products"
        linkLabel="See the full catalogue"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group, i) => (
          <Link
            key={group.id}
            to={`/category/${group.slug}`}
            className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[20px] p-5 text-white no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
            style={{ background: WASHES[i % WASHES.length] }}
          >
            <span
              className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
              style={{ background: "#ffffff" }}
            />
            <span className="relative mb-auto flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <CategoryIcon slug={group.children[0]?.slug ?? group.slug} />
            </span>
            <span className="relative mt-4 block font-heading text-[19px] font-extrabold leading-tight">
              {group.name}
            </span>
            <span className="relative mt-1 block text-[12.5px] leading-snug text-white/80">
              {group.children
                .slice(0, 3)
                .map((c) => c.name)
                .join(" · ")}
            </span>
            <span className="relative mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold">
              {group.children.length} categories
              <ArrowRight className="size-[15px] transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
