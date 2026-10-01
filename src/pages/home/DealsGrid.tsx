import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { ProductArt } from "@/components/product/ProductArt"
import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/use-catalog"
import { artForCategory, tintForCategory } from "@/lib/category-art"
import { formatBDT } from "@/lib/utils"

/**
 * The discount rail: whatever is currently on sale, with the deepest cut given
 * the hero card. Sorted client-side because the discount is a ratio of two
 * columns rather than a column of its own.
 */
export function DealsGrid() {
  const { data, isLoading } = useProducts({ sort: "popular", pageSize: 24 })

  const deals = (data?.products ?? [])
    .filter((p) => p.sale_price != null && p.sale_price < p.price)
    .map((p) => ({ product: p, off: Math.round(((p.price - p.sale_price!) / p.price) * 100) }))
    .sort((a, b) => b.off - a.off)
    .slice(0, 9)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-6 sm:pt-10">
        <Skeleton className="h-[300px] w-full rounded-[24px]" />
      </section>
    )
  }
  if (deals.length === 0) return null

  const [hero, ...rest] = deals

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-6 sm:pt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-red-500">
            <span className="size-1.5 rounded-full bg-red-500" /> On offer
          </span>
          <h2 className="mt-2 font-heading text-[clamp(20px,2.6vw,26px)] font-extrabold tracking-tight text-text">
            Hand-picked deals you shouldn't miss
          </h2>
        </div>
        <Link
          to="/products"
          className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-blue no-underline"
        >
          Browse all
          <ArrowRight className="size-[15px] transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <HeroDeal product={hero.product} off={hero.off} />
        {rest.map(({ product }) => (
          <CatalogProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function HeroDeal({ product, off }: { product: Parameters<typeof CatalogProductCard>[0]["product"]; off: number }) {
  const image = product.images[0]
  const price = product.sale_price ?? product.price

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative col-span-2 flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
    >
      <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
        -{off}%
      </span>
      <span
        className="relative flex min-h-[130px] flex-1 items-center justify-center overflow-hidden sm:min-h-[150px]"
        style={image ? undefined : { background: tintForCategory(product.category?.slug) }}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductArt art={artForCategory(product.category?.slug)} className="size-24" />
        )}
      </span>
      <span className="flex flex-col gap-1 p-3.5">
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">
          {product.category?.name ?? "Featured deal"}
        </span>
        <span className="line-clamp-2 font-heading text-[14px] font-bold leading-snug text-text sm:text-[15.5px]">
          {product.name}
        </span>
        <span className="mt-0.5 flex items-baseline gap-2">
          <span className="font-heading text-[17px] font-extrabold tabular-nums text-orange-500">
            {formatBDT(price)}
          </span>
          <span className="text-[13px] text-muted line-through">{formatBDT(product.price)}</span>
        </span>
      </span>
    </Link>
  )
}
