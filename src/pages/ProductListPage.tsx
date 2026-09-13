import { useMemo, useState } from "react"
import { ChevronRight, LayoutGrid, List, RefreshCw, SearchX, SlidersHorizontal } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { FilterPanel } from "@/components/product/FilterPanel"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useBrands, useCategories, useProducts } from "@/hooks/use-catalog"
import { useSeo } from "@/hooks/use-seo"
import { cn } from "@/lib/utils"
import type { ProductSort } from "@/types/database"

const PRICE_CAP = 100000
const PAGE_SIZE = 12

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
]

export default function ProductListPage() {
  const { slug: categorySlugParam } = useParams<{ slug?: string }>()
  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()

  const [categorySlugs, setCategorySlugs] = useState<string[]>(
    categorySlugParam ? [categorySlugParam] : [],
  )
  const [brandSlugs, setBrandSlugs] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(PRICE_CAP)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState<ProductSort>("popular")
  const [page, setPage] = useState(1)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useProducts({
    categorySlugs: categorySlugs.length ? categorySlugs : undefined,
    brandSlugs: brandSlugs.length ? brandSlugs : undefined,
    maxPrice: maxPrice < PRICE_CAP ? maxPrice : undefined,
    inStockOnly,
    sort,
    page,
    pageSize: PAGE_SIZE,
  })

  const products = data?.products ?? []
  const total = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const activeCategoryName = categorySlugParam
    ? categories.find((c) => c.slug === categorySlugParam)?.name
    : undefined

  useSeo({
    title: activeCategoryName ?? "All Products",
    description: activeCategoryName
      ? `Shop genuine ${activeCategoryName} in Bangladesh with nationwide delivery, COD, bKash & Nagad.`
      : "Browse solar panels, inverters, batteries, MCB/MCCB, cables and accessories — genuine brands, nationwide delivery.",
  })

  const chips = useMemo(() => {
    const catChips = categorySlugs.map((slug) => ({
      type: "category" as const,
      slug,
      label: categories.find((c) => c.slug === slug)?.name ?? slug,
    }))
    const brandChips = brandSlugs.map((slug) => ({
      type: "brand" as const,
      slug,
      label: brands.find((b) => b.slug === slug)?.name ?? slug,
    }))
    return [...catChips, ...brandChips]
  }, [categorySlugs, brandSlugs, categories, brands])

  const toggleCategory = (slug: string) => {
    setPage(1)
    setCategorySlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }
  const toggleBrand = (slug: string) => {
    setPage(1)
    setBrandSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }
  const clearFilters = () => {
    setCategorySlugs([])
    setBrandSlugs([])
    setMaxPrice(PRICE_CAP)
    setInStockOnly(false)
    setPage(1)
  }
  const removeChip = (chip: { type: "category" | "brand"; slug: string }) => {
    if (chip.type === "category") toggleCategory(chip.slug)
    else toggleBrand(chip.slug)
  }

  const filterPanelProps = {
    categories,
    brands,
    selectedCategorySlugs: categorySlugs,
    selectedBrandSlugs: brandSlugs,
    maxPrice,
    priceCap: PRICE_CAP,
    inStockOnly,
    onToggleCategory: toggleCategory,
    onToggleBrand: toggleBrand,
    onPriceChange: (v: number) => {
      setPage(1)
      setMaxPrice(v)
    },
    onToggleInStock: () => {
      setPage(1)
      setInStockOnly((v) => !v)
    },
    onClear: clearFilters,
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-3.5 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">{activeCategoryName ?? "Products"}</span>
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-text">
            {activeCategoryName ?? "All Products"}
          </h1>
          <div className="mt-1.5 text-[13.5px] text-muted">
            <b className="tabular-nums text-text">{total}</b> products found
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-24 hidden lg:block">
          <FilterPanel {...filterPanelProps} />
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-2.5 shadow-[var(--shadow-sm)]">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-[11px] border border-border bg-surface-2 px-3.5 text-[13.5px] font-semibold text-text lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
            <span className="hidden text-[13px] text-muted lg:inline">
              Showing <b className="tabular-nums text-text">{total}</b> results
            </span>
            <div className="ml-auto flex items-center gap-2.5">
              <label className="flex items-center gap-1.5 text-[13px] text-muted">
                <span className="whitespace-nowrap">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as ProductSort)
                    setPage(1)
                  }}
                  className="h-10 cursor-pointer rounded-[11px] border border-border bg-surface-2 px-2.5 text-[13.5px] font-semibold text-text outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-0.5 rounded-[11px] border border-border bg-surface-2 p-[3px]">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={cn(
                    "flex size-[34px] items-center justify-center rounded-lg",
                    view === "grid" ? "bg-blue text-white" : "text-muted",
                  )}
                >
                  <LayoutGrid className="size-[17px]" />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={cn(
                    "flex size-[34px] items-center justify-center rounded-lg",
                    view === "list" ? "bg-blue text-white" : "text-muted",
                  )}
                >
                  <List className="size-[17px]" />
                </button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={`${chip.type}-${chip.slug}`}
                  onClick={() => removeChip(chip)}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-blue-500/35 bg-blue-500/14 pl-3.5 pr-2 text-xs font-semibold text-blue"
                >
                  {chip.label}
                  <span className="flex size-[17px] items-center justify-center rounded-full bg-blue-500/22 text-[13px] leading-none">
                    ×
                  </span>
                </button>
              ))}
              <button onClick={clearFilters} className="text-xs font-semibold text-muted underline">
                Clear all
              </button>
            </div>
          )}

          {isError ? (
            <div className="rounded-[20px] border border-border bg-surface p-10 text-center sm:p-14">
              <span className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-surface-2">
                <RefreshCw className="size-7 text-muted" />
              </span>
              <div className="font-heading text-lg font-bold text-text">Couldn't load products</div>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Check your connection to Supabase and try again.
              </p>
              <Button className="mt-5" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full rounded-[20px]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[20px] border border-border bg-surface p-10 text-center sm:p-14">
              <span className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-surface-2">
                <SearchX className="size-7 text-muted" />
              </span>
              <div className="font-heading text-lg font-bold text-text">No products match your filters</div>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Try removing a filter or widening the price range.
              </p>
              <Button className="mt-5" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-3 sm:gap-4",
                view === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
              )}
            >
              {products.map((product) => (
                <CatalogProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-9 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      "flex h-[42px] min-w-[42px] items-center justify-center rounded-xl px-3 font-heading text-sm font-bold tabular-nums",
                      n === page
                        ? "border border-orange-500 bg-orange-500 text-white"
                        : "border border-border bg-surface text-text",
                    )}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle>Filters</DialogTitle>
          <FilterPanel {...filterPanelProps} />
          <Button className="w-full" onClick={() => setMobileFilterOpen(false)}>
            Show {total} results
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  )
}
