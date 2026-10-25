import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { Reveal } from "@/components/ui/reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories, useProducts } from "@/hooks/use-catalog"
import { CategoryIcon } from "@/pages/home/CategoryIcon"
import type { Category } from "@/types/database"

const PER_SECTION = 8
const MAX_SECTIONS = 10

/** The order the homepage shelves follow; anything unmatched comes after, in admin sort order. */
const PRIORITY: RegExp[] = [/panel/, /inverter/, /batter/, /controller|mppt|pwm/]

function rank(cat: Category): number {
  const key = `${cat.slug} ${cat.name}`.toLowerCase()
  const i = PRIORITY.findIndex((re) => re.test(key))
  return i === -1 ? PRIORITY.length : i
}

/**
 * One product shelf per category: solar panels first, then inverters,
 * batteries and charge controllers, then the rest. Shelves are the categories
 * products are actually filed under (a menu group only holds sub-categories),
 * and a shelf with nothing published in it does not render.
 */
export function CategoryProductSections() {
  const { data: categories = [] } = useCategories()

  const parentIds = new Set(categories.map((c) => c.parent_id).filter(Boolean))
  const shelves = categories
    .filter((c) => !parentIds.has(c.id))
    .sort((a, b) => rank(a) - rank(b) || a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .slice(0, MAX_SECTIONS)

  return (
    <>
      {shelves.map((cat) => (
        <Reveal key={cat.id}>
          <CategoryShelf category={cat} />
        </Reveal>
      ))}
    </>
  )
}

function CategoryShelf({ category }: { category: Category }) {
  const { data, isLoading } = useProducts({ categorySlug: category.slug, sort: "popular", pageSize: PER_SECTION })
  const products = data?.products ?? []
  if (!isLoading && products.length === 0) return null

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 sm:pt-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2.5 font-heading text-[clamp(20px,2.4vw,26px)] font-extrabold tracking-tight text-text">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
            <CategoryIcon slug={category.slug} className="size-[18px]" />
          </span>
          <span className="truncate">{category.name}</span>
        </h2>
        <Link
          to={`/category/${category.slug}`}
          className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-orange-500 no-underline"
        >
          Browse all
          <ArrowRight className="size-[15px] transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-[14px]" />
            ))
          : products.map((product) => <CatalogProductCard key={product.id} product={product} />)}
      </div>
    </section>
  )
}
