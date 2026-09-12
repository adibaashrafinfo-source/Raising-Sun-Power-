import { Heart, ShoppingCart, Star } from "lucide-react"

import { ProductArt } from "@/components/product/ProductArt"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"
import type { ProductCardData } from "@/types/product"

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow)]">
      <div
        className="relative flex aspect-square cursor-pointer items-center justify-center"
        style={{ background: product.tint }}
      >
        <span className="absolute left-3 top-3 flex gap-1.5">
          {product.off && (
            <span className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.4)]">
              {product.off}
            </span>
          )}
          {product.badge && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
              style={{ background: product.badgeBg, color: product.badgeColor }}
            >
              {product.badge}
            </span>
          )}
        </span>
        <button
          aria-label="Add to wishlist"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2.5 top-2.5 flex size-[34px] items-center justify-center rounded-full bg-white/70 backdrop-blur-md transition-transform hover:scale-110 active:scale-90 dark:bg-black/30"
        >
          <Heart className="size-[17px]" stroke="#E23B3B" strokeWidth={1.75} />
        </button>
        <ProductArt art={product.art} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-center bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-all duration-250 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="block w-full rounded-[11px] bg-surface py-2.5 text-center text-[13px] font-bold text-blue shadow-[var(--shadow-sm)]">
            Quick view
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-[15px] pb-[17px] pt-[15px]">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-green-600" />
          <span className="text-[11.5px] font-semibold text-green-600">In Stock</span>
          <span className="ml-auto text-[11.5px] text-muted">{product.cat}</span>
        </div>
        <div className="line-clamp-2 min-h-[38px] cursor-pointer text-[14.5px] font-bold leading-tight text-text">
          {product.name}
        </div>
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-0.5 text-gold-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-[13px] fill-current" />
            ))}
          </span>
          <span className="text-xs text-muted">
            {product.rating} ({product.count})
          </span>
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="font-heading text-xl font-extrabold tabular-nums text-orange-500">
            {product.priceStr}
          </span>
          {product.old && (
            <span className="text-[13px] tabular-nums text-muted line-through">{product.old}</span>
          )}
        </div>
        <button
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              thumbnail: { kind: "art", art: product.art, tint: product.tint },
            })
          }
          className={cn(
            "mt-1.5 flex h-11 items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-orange-500 to-orange-400 text-sm font-bold text-white shadow-[0_6px_18px_rgba(244,158,9,.32),inset_0_1px_0_rgba(255,255,255,.45)] transition-all",
            "hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(244,158,9,.42),inset_0_1px_0_rgba(255,255,255,.55)] active:translate-y-0 active:scale-[.98]",
          )}
        >
          <ShoppingCart className="size-[17px]" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
