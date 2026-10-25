import { Heart, ShoppingCart, Star } from "lucide-react"
import { Link } from "react-router-dom"

import { ProductArt } from "@/components/product/ProductArt"
import { artForCategory, tintForCategory } from "@/lib/category-art"
import { cn, formatBDT } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/types/database"

export function CatalogProductCard({ product, view = "grid" }: { product: Product; view?: "grid" | "list" }) {
  const addItem = useCartStore((s) => s.addItem)
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist()
  const isWishlisted = wishlistIds.has(product.id)
  const image = product.images[0]
  const tint = tintForCategory(product.category?.slug)
  const isOnSale = product.sale_price != null && product.sale_price < product.price
  const displayPrice = isOnSale ? product.sale_price! : product.price
  const offPct = isOnSale
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : null
  const inStock = product.stock_qty > 0

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      thumbnail: image
        ? { kind: "image", src: image }
        : { kind: "art", art: artForCategory(product.category?.slug), tint },
    })
  }

  if (view === "list") {
    return (
      <div className="flex gap-4 rounded-[18px] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
        <Link
          to={`/product/${product.slug}`}
          className="relative flex size-[110px] shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          style={image ? undefined : { background: tint }}
        >
          {image ? (
            <img src={image} alt={product.name} loading="lazy" className="absolute inset-0 size-full object-cover" />
          ) : (
            <ProductArt art={artForCategory(product.category?.slug)} className="size-16" />
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[11.5px]">
            <span className={cn("size-1.5 rounded-full", inStock ? "bg-green-600" : "bg-red-500")} />
            <span className={cn("font-semibold", inStock ? "text-green-600" : "text-red-500")}>
              {inStock ? "In Stock" : "Out of stock"}
            </span>
            <span className="ml-auto text-muted">{product.category?.name}</span>
          </div>
          <Link
            to={`/product/${product.slug}`}
            className="line-clamp-2 text-sm font-bold text-text no-underline"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Star className="size-3 fill-gold-400 text-gold-400" />
            {product.rating_avg} ({product.rating_count})
          </div>
          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-lg font-extrabold tabular-nums text-orange-500">
                {formatBDT(displayPrice)}
              </span>
              {isOnSale && (
                <span className="text-xs tabular-nums text-muted line-through">
                  {formatBDT(product.price)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={!inStock}
              className="flex h-9 items-center gap-1.5 rounded-[11px] bg-gradient-to-r from-orange-500 to-orange-400 px-3.5 text-xs font-bold text-white disabled:opacity-45"
            >
              <ShoppingCart className="size-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-[var(--shadow)]">
      <Link
        to={`/product/${product.slug}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-white"
        style={image ? undefined : { background: tint }}
      >
        {image ? (
          // Absolutely positioned so a tall or wide photo can never stretch the
          // card — every card in a row keeps the same square image box.
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductArt art={artForCategory(product.category?.slug)} />
        )}
        <span className="absolute left-2 top-2 flex flex-wrap gap-1">
          {offPct && (
            <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[10.5px] font-extrabold text-white">
              -{offPct}%
            </span>
          )}
          {product.badges[0] && (
            <span className="rounded-md bg-black px-1.5 py-0.5 text-[10.5px] font-extrabold uppercase text-white">
              {product.badges[0]}
            </span>
          )}
        </span>
        <button
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(product.id)
          }}
          className="absolute right-2 top-2 flex size-[30px] items-center justify-center rounded-full bg-white/85 shadow-sm transition-transform hover:scale-110 dark:bg-black/45"
        >
          <Heart className="size-[15px]" stroke="#E23B3B" fill={isWishlisted ? "#E23B3B" : "none"} strokeWidth={1.9} />
        </button>
        {!inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category?.name && (
          <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted">
            {product.category.name}
          </span>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[36px] text-[13.5px] font-semibold leading-snug text-text no-underline hover:text-orange-500"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div className="min-w-0">
            <div className="font-heading text-[16px] font-extrabold tabular-nums leading-tight text-orange-500">
              {formatBDT(displayPrice)}
            </div>
            {isOnSale && (
              <div className="text-[11.5px] tabular-nums text-muted line-through">{formatBDT(product.price)}</div>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            aria-label={`Add ${product.name} to cart`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFD60A] text-black transition-[transform,filter] hover:scale-105 hover:brightness-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ShoppingCart className="size-[16px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
