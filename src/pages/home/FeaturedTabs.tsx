import { useState } from "react"
import { Link } from "react-router-dom"

import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/use-catalog"
import { useNavCategories } from "@/lib/category-nav"
import { cn } from "@/lib/utils"
import { SectionHeader } from "@/pages/home/SectionHeader"

const PAGE_SIZE = 8
const MAX_TABS = 5

/**
 * Featured products with category tabs. The tabs are the first few live
 * categories, so they follow the admin panel like every other category list.
 */
export function FeaturedTabs() {
  const categories = useNavCategories().slice(0, MAX_TABS)
  const [active, setActive] = useState<string | null>(null)

  const { data, isLoading, isFetching } = useProducts({
    sort: "popular",
    pageSize: PAGE_SIZE,
    categorySlug: active ?? undefined,
  })
  const products = data?.products ?? []

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <SectionHeader
        kicker="Top rated & stocked"
        kickerColor="#217CCA"
        title="Featured products"
        linkTo="/products"
        linkLabel="View all products"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Tab label="All" active={active === null} onClick={() => setActive(null)} />
        {categories.map((cat) => (
          <Tab
            key={cat.slug}
            label={cat.name}
            active={active === cat.slug}
            onClick={() => setActive(cat.slug)}
          />
        ))}
      </div>

      <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", isFetching && "opacity-70")}>
        {isLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-[20px]" />
            ))
          : products.map((product) => <CatalogProductCard key={product.id} product={product} />)}
      </div>

      {!isLoading && products.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">
          Nothing in this category yet — check the full catalogue.
        </p>
      )}

      <div className="mt-7 flex justify-center">
        <Button asChild size="lg" variant="outline">
          <Link to={active ? `/category/${active}` : "/products"}>View all products</Link>
        </Button>
      </div>
    </section>
  )
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
        active
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-border bg-surface text-muted hover:border-blue-500/40 hover:text-blue",
      )}
    >
      {label}
    </button>
  )
}
