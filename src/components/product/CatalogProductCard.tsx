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
    <div className="group relative flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow)]">
      <Link
        to={`/product/${product.slug}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden"
        style={image ? undefined : { background: tint }}
      >
        <span className="absolute left-3 top-3 flex gap-1.5">
          {offPct && (
            <span className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-2.5 py-1 text-[11px] font-extrabold text-white">
              -{offPct}%
            </span>
          )}
          {product.badges[0] && (
            <span className="rounded-full bg-blue-700 px-2.5 py-1 text-[11px] font-extrabold text-white">
              {product.badges[0]}
            </span>
          )}
        </span>
        <button
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(product.id)
          }}
          className="absolute right-2.5 top-2.5 flex size-[34px] items-center justify-center rounded-full bg-white/70 backdrop-blur-md transition-transform hover:scale-110 dark:bg-black/30"
        >
          <Heart
            className="size-[17px]"
            stroke="#E23B3B"
            fill={isWishlisted ? "#E23B3B" : "none"}
            strokeWidth={1.75}
          />
        </button>
        {image ? (
          // Absolutely positioned so a tall or wide photo can never stretch the
          // card — every card in a row keeps the same square image box.
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <ProductArt art={artForCategory(product.category?.slug)} />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-[15px] pb-[17px] pt-[15px]">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", inStock ? "bg-green-600" : "bg-red-500")} />
          <span className={cn("text-[11.5px] font-semibold", inStock ? "text-green-600" : "text-red-500")}>
            {inStock ? "In Stock" : "Out of stock"}
          </span>
          <span className="ml-auto text-[11.5px] text-muted">{product.category?.name}</span>
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[38px] text-[14.5px] font-bold leading-tight text-text no-underline"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-0.5 text-gold-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-[13px] fill-current" />
            ))}
          </span>
          <span className="text-xs text-muted">
            {product.rating_avg} ({product.rating_count})
          </span>
        </div>
        <div className="mt-0.5 flex min-h-[30px] items-baseline gap-2">
          <span className="font-heading text-xl font-extrabold tabular-nums text-orange-500">
            {formatBDT(displayPrice)}
          </span>
          {isOnSale && (
            <span className="text-[13px] tabular-nums text-muted line-through">
              {formatBDT(product.price)}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="mt-auto flex h-11 items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-orange-500 to-orange-400 text-sm font-bold text-white shadow-[0_6px_18px_rgba(244,158,9,.32)] transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-45"
        >
          <ShoppingCart className="size-[17px]" />
          {inStock ? "Add to Cart" : "Out of stock"}
        </button>
      </div>
    </div>
  )
}
