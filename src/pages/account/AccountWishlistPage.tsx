import { Heart } from "lucide-react"
import { Link } from "react-router-dom"

import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWishlist } from "@/hooks/use-wishlist"

export default function AccountWishlistPage() {
  const { items, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Skeleton className="aspect-[3/4] w-full rounded-[20px]" />
        <Skeleton className="aspect-[3/4] w-full rounded-[20px]" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-surface-2">
          <Heart className="size-6 text-muted" />
        </span>
        <div className="font-heading text-lg font-bold text-text">Your wishlist is empty</div>
        <p className="mt-1.5 text-sm text-muted">Save products you like to find them here later.</p>
        <Button className="mt-4" asChild>
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items
        .filter((item) => item.product)
        .map((item) => (
          <CatalogProductCard key={item.id} product={item.product!} />
        ))}
    </div>
  )
}
