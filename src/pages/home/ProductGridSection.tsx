import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { SectionHeader } from "@/pages/home/SectionHeader"
import type { Product } from "@/types/database"

export function ProductGridSection({
  kicker,
  kickerColor,
  title,
  linkLabel,
  products,
  isLoading,
}: {
  kicker: string
  kickerColor: string
  title: string
  linkLabel: string
  products: Product[]
  isLoading?: boolean
}) {
  if (!isLoading && products.length === 0) return null

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <SectionHeader
        kicker={kicker}
        kickerColor={kickerColor}
        title={title}
        linkTo="/products"
        linkLabel={linkLabel}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-[20px]" />
            ))
          : products.map((product) => <CatalogProductCard key={product.id} product={product} />)}
      </div>
    </section>
  )
}
