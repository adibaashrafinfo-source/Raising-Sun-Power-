import { useEffect, useRef, useState } from "react"
import { ChevronRight, Heart, Minus, Plus, ShoppingCart, Star, Truck } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { CatalogProductCard } from "@/components/product/CatalogProductCard"
import { ProductArt } from "@/components/product/ProductArt"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProduct, useRelatedProducts, useReviews } from "@/hooks/use-catalog"
import { artForCategory, tintForCategory } from "@/lib/category-art"
import { formatBDT } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError, refetch } = useProduct(slug)
  const { data: related = [] } = useRelatedProducts(product?.category_id, product?.id)
  const { data: reviews = [] } = useReviews(product?.id)
  const addItem = useCartStore((s) => s.addItem)

  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [barVisible, setBarVisible] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQty(1)
    setActiveImage(0)
  }, [slug])

  useEffect(() => {
    const el = actionsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [product])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-[22px]" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-[1280px] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-text">Couldn't load this product</h1>
        <p className="mt-2 text-sm text-muted">Check your connection to Supabase and try again.</p>
        <Button className="mt-5" onClick={() => refetch()}>
          Try again
        </Button>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-[1280px] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-text">Product not found</h1>
        <p className="mt-2 text-sm text-muted">It may have been removed or is no longer available.</p>
        <Button asChild className="mt-5">
          <Link to="/products">Browse products</Link>
        </Button>
      </main>
    )
  }

  const tint = tintForCategory(product.category?.slug)
  const art = artForCategory(product.category?.slug)
  const images = product.images.length ? product.images : []
  const isOnSale = product.sale_price != null && product.sale_price < product.price
  const displayPrice = isOnSale ? product.sale_price! : product.price
  const savings = isOnSale ? product.price - product.sale_price! : 0
  const inStock = product.stock_qty > 0

  const thumbnail = images[0]
    ? { kind: "image" as const, src: images[0] }
    : { kind: "art" as const, art, tint }

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: displayPrice, thumbnail }, qty)
  }
  const handleBuyNow = () => {
    handleAdd()
    navigate("/checkout")
  }

  const specs = Object.entries(product.specifications ?? {})
  const avgRating = product.rating_avg

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-3.5 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/products" className="text-muted no-underline hover:text-blue">
          Products
        </Link>
        <ChevronRight className="size-3.5" />
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`} className="text-muted no-underline hover:text-blue">
              {product.category.name}
            </Link>
            <ChevronRight className="size-3.5" />
          </>
        )}
        <span className="font-semibold text-text">{product.name}</span>
      </div>

      <div className="grid items-start gap-8 sm:gap-11 lg:grid-cols-2">
        <div>
          <div
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[22px] shadow-[var(--shadow-sm)]"
            style={images[activeImage] ? undefined : { background: tint }}
          >
            {product.brand && (
              <span className="absolute left-4 top-4 rounded-full bg-[var(--surface)]/85 px-3 py-1.5 text-xs font-bold text-text backdrop-blur-md">
                {product.brand.name}
              </span>
            )}
            {images[activeImage] ? (
              <img src={images[activeImage]} alt={product.name} className="size-full object-cover" />
            ) : (
              <ProductArt art={art} className="h-[184px] w-[230px]" />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3.5 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className="flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-2xl border-2 transition-colors"
                  style={{ borderColor: i === activeImage ? "var(--blue)" : "var(--border)" }}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2.5 text-[12.5px] text-muted">
            {product.brand && <span className="font-bold text-blue">{product.brand.name}</span>}
            {product.sku && (
              <>
                <span>·</span>
                <span>SKU {product.sku}</span>
              </>
            )}
          </div>
          <h1 className="text-balance font-heading text-[clamp(24px,3.2vw,30px)] font-extrabold leading-tight tracking-tight text-text">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex gap-0.5 text-gold-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-[15px] fill-current" />
              ))}
            </span>
            <span className="text-[13px] text-muted">
              {avgRating} · {product.rating_count} reviews
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3.5">
            <span className="font-heading text-[clamp(30px,4vw,38px)] font-extrabold tabular-nums text-orange-500">
              {formatBDT(displayPrice)}
            </span>
            {isOnSale && (
              <span className="text-lg tabular-nums text-muted line-through">{formatBDT(product.price)}</span>
            )}
            {isOnSale && (
              <span className="rounded-full bg-green-500/16 px-3 py-1.5 text-[13px] font-extrabold text-green-600">
                Save {formatBDT(savings)}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`size-2 rounded-full ${inStock ? "bg-green-600" : "bg-red-500"}`} />
            <span className={`text-[13.5px] font-semibold ${inStock ? "text-green-600" : "text-red-500"}`}>
              {inStock ? `In Stock (${product.stock_qty} available)` : "Out of stock"}
            </span>
          </div>

          {specs.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-2 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
              {specs.slice(0, 4).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-[13px]">
                  <span className="text-muted">{k}:</span>
                  <span className="font-semibold text-text">{v}</span>
                </div>
              ))}
            </div>
          )}

          <div ref={actionsRef} className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex h-[52px] items-center overflow-hidden rounded-2xl border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
                className="flex h-full w-[46px] items-center justify-center text-text hover:bg-surface-2"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-11 text-center font-heading text-base font-bold tabular-nums text-text">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock_qty || 99, q + 1))}
                aria-label="Increase"
                className="flex h-full w-[46px] items-center justify-center text-text hover:bg-surface-2"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button size="lg" className="min-w-[180px] flex-1" disabled={!inStock} onClick={handleAdd}>
              <ShoppingCart className="size-[18px]" />
              Add to Cart
            </Button>
            <button
              aria-label="Wishlist"
              className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-red-500 hover:bg-surface-2"
            >
              <Heart className="size-5" />
            </button>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="mt-3 w-full"
            disabled={!inStock}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
          <div className="mt-3 text-[12.5px] text-muted">
            💳 EMI available on cards ·{" "}
            <b className="text-text">Need bulk pricing?</b>{" "}
            <a href="https://wa.me/8801705742208" className="text-blue no-underline">
              Ask on WhatsApp
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
            <div className="mb-2.5 flex items-center gap-2 text-[13.5px] font-bold text-text">
              <Truck className="size-[18px] text-blue" />
              Delivery estimate
            </div>
            <div className="text-[13px] text-muted">
              Charge <b className="text-text">৳60 (Dhaka) / ৳120 (outside Dhaka)</b> · arrives in{" "}
              <b className="text-text">2–4 days</b> via Steadfast Courier
            </div>
          </div>
        </div>
      </div>

      <div className="mt-11">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="max-w-[760px]">
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
              {product.description ||
                `The ${product.name} is sourced from authorized channels and shipped with genuine warranty documentation. Built for the Bangladeshi climate and grid conditions, it delivers dependable performance for home backup, commercial supply, or a full solar installation.`}
            </p>
            <p className="text-[15px] leading-relaxed text-muted">
              Every unit is inspected before dispatch and delivered nationwide through Steadfast Courier with
              Cash on Delivery available.
            </p>
          </TabsContent>
          <TabsContent value="specifications">
            {specs.length === 0 ? (
              <p className="text-sm text-muted">No specifications listed for this product yet.</p>
            ) : (
              <div className="max-w-[640px] overflow-hidden rounded-2xl border border-border">
                {specs.map(([k, v], i) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 px-4.5 py-3.5"
                    style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)" }}
                  >
                    <span className="text-[13.5px] text-muted">{k}</span>
                    <span className="text-right text-[13.5px] font-semibold text-text">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet — be the first to review this product.</p>
            ) : (
              <div className="flex max-w-[900px] flex-col gap-3.5">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-border bg-surface p-4.5">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-0.5 text-gold-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="size-3.5"
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2.5 text-sm leading-relaxed text-muted">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-1.5 font-heading text-[clamp(20px,2.6vw,26px)] font-extrabold tracking-tight text-text">
            Related products
          </h2>
          <p className="mb-5 text-sm text-muted">Pairs well with this product.</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <CatalogProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {barVisible && (
        <div className="fixed inset-x-0 bottom-[70px] z-[65] border-t border-border bg-[var(--surface)]/90 shadow-[0_-8px_30px_rgba(0,0,0,.18)] backdrop-blur-xl lg:bottom-0">
          <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-bold text-text">{product.name}</div>
              <div className="font-heading text-base font-extrabold tabular-nums text-orange-500">
                {formatBDT(displayPrice)}
              </div>
            </div>
            <Button disabled={!inStock} onClick={handleAdd}>
              <ShoppingCart className="size-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
