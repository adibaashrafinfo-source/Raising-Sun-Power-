import { ProductCard } from "@/components/product/ProductCard"
import { SectionHeader } from "@/pages/home/SectionHeader"
import type { ProductCardData } from "@/types/product"

export function ProductGridSection({
  kicker,
  kickerColor,
  title,
  linkLabel,
  products,
}: {
  kicker: string
  kickerColor: string
  title: string
  linkLabel: string
  products: ProductCardData[]
}) {
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
