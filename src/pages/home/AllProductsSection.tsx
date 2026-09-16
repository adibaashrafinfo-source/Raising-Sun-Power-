import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/use-catalog"
import { SectionHeader } from "@/pages/home/SectionHeader"

const PAGE_STEP = 12

/**
 * The full catalogue on the homepage, revealed a dozen at a time. Keeping the
 * browsing on this page — rather than sending people straight to /products —
 * is what makes the homepage feel product-led.
 */
export function AllProductsSection() {
  const [limit, setLimit] = useState(PAGE_STEP)
  const { data, isLoading, isFetching } = useProducts({ sort: "popular", pageSize: limit })

  const products = data?.products ?? []
  const total = data?.count ?? 0
  const hasMore = products.length < total

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <SectionHeader
        kicker="Full catalogue"
        kickerColor="#217CCA"
        title="All products"
        linkTo="/products"
        linkLabel="Browse with filters"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: PAGE_STEP }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-[20px]" />
            ))
          : products.map((product) => <CatalogProductCard key={product.id} product={product} />)}
      </div>

      {!isLoading && products.length > 0 && (
        <div className="mt-7 flex flex-col items-center gap-3">
          <p className="text-[13px] text-muted">
            Showing {products.length} of {total} products
          </p>
          {hasMore ? (
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isFetching}
              onClick={() => setLimit((n) => n + PAGE_STEP)}
            >
              {isFetching ? (
                <>
                  <Loader2 className="size-[18px] animate-spin" /> Loading…
                </>
              ) : (
                <>Load more products</>
              )}
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/products">
                Browse with filters <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
