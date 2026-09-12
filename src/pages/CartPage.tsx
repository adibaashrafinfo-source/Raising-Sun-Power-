import { useState } from "react"
import { ArrowLeft, ChevronRight, Minus, Plus, ShieldCheck, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { ProductArt } from "@/components/product/ProductArt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/hooks/use-checkout"
import { useSeo } from "@/hooks/use-seo"
import { fetchCouponByCode } from "@/lib/queries/checkout"
import { formatBDT } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"
import type { Coupon } from "@/types/database"

export default function CartPage() {
  useSeo({ title: "Shopping Cart", noIndex: true })
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const increment = useCartStore((s) => s.incrementItem)
  const decrement = useCartStore((s) => s.decrementItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore((s) => s.subtotal())
  const { data: settings } = useSettings()

  const [couponInput, setCouponInput] = useState("")
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [applying, setApplying] = useState(false)

  const freeThreshold = settings?.free_delivery_threshold ?? 5000
  const flatDelivery = settings?.delivery_charge_outside_dhaka ?? 120
  const delivery = items.length === 0 ? 0 : subtotal >= freeThreshold ? 0 : flatDelivery

  const discount = coupon
    ? coupon.discount_type === "percent"
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : Math.min(coupon.discount_value, subtotal)
    : 0
  const total = Math.max(0, subtotal - discount + delivery)

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplying(true)
    try {
      const found = await fetchCouponByCode(couponInput.trim())
      const now = new Date()
      if (!found) {
        setCoupon(null)
        setCouponMsg({ text: "Invalid or inactive coupon code.", ok: false })
      } else if (found.expires_at && new Date(found.expires_at) < now) {
        setCoupon(null)
        setCouponMsg({ text: "This coupon has expired.", ok: false })
      } else if (found.usage_limit != null && found.used_count >= found.usage_limit) {
        setCoupon(null)
        setCouponMsg({ text: "This coupon has reached its usage limit.", ok: false })
      } else {
        setCoupon(found)
        setCouponMsg({ text: `Coupon "${found.code}" applied!`, ok: true })
      }
    } catch {
      setCoupon(null)
      setCouponMsg({ text: "Couldn't validate the coupon. Try again.", ok: false })
    } finally {
      setApplying(false)
    }
  }

  return (
    <main className="mx-auto max-w-[1180px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Cart</span>
      </div>
      <h1 className="mb-6 font-heading text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-text">
        Shopping Cart{" "}
        <span className="text-lg font-semibold text-muted">
          ({items.reduce((a, i) => a + i.qty, 0)} items)
        </span>
      </h1>

      {items.length === 0 ? (
        <div className="rounded-[22px] border border-border bg-surface p-14 text-center shadow-[var(--shadow-sm)] sm:p-[70px]">
          <span className="mb-[18px] inline-flex size-[76px] items-center justify-center rounded-[20px] bg-surface-2">
            <X className="size-9 text-muted" />
          </span>
          <div className="font-heading text-xl font-extrabold text-text">Your cart is empty</div>
          <p className="my-2 text-[15px] text-muted">
            Browse our solar &amp; electrical products to get started.
          </p>
          <Button size="lg" className="mt-4" asChild>
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-3.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-[18px] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]"
              >
                <span
                  className="flex size-[84px] shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                  style={item.thumbnail.kind === "art" ? { background: item.thumbnail.tint } : undefined}
                >
                  {item.thumbnail.kind === "art" ? (
                    <ProductArt art={item.thumbnail.art} className="size-11" />
                  ) : (
                    <img src={item.thumbnail.src} alt={item.name} className="size-full object-cover" />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[15px] font-bold leading-snug text-text">{item.name}</div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove"
                      className="flex size-[30px] shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-red-500"
                    >
                      <X className="size-[17px]" />
                    </button>
                  </div>
                  <div className="mt-1 text-[12.5px] text-muted">
                    Unit price {formatBDT(item.price)}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex h-10 items-center overflow-hidden rounded-[11px] border border-border">
                      <button
                        onClick={() => decrement(item.id)}
                        aria-label="Decrease"
                        className="flex h-full w-9 items-center justify-center bg-surface-2 text-text"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-[38px] text-center text-sm font-bold tabular-nums text-text">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => increment(item.id)}
                        aria-label="Increase"
                        className="flex h-full w-9 items-center justify-center bg-surface-2 text-text"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="font-heading text-lg font-extrabold tabular-nums text-orange-500">
                      {formatBDT(item.price * item.qty)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="self-start" asChild>
              <Link to="/products">
                <ArrowLeft className="size-[17px]" />
                Continue shopping
              </Link>
            </Button>
          </div>

          <aside className="sticky top-24 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-4 font-heading text-[17px] font-extrabold text-text">Order Summary</div>
            <div className="mb-2.5 flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums text-text">{formatBDT(subtotal)}</span>
            </div>
            <div className="mb-2.5 flex justify-between text-sm text-muted">
              <span>Delivery</span>
              <span className={`font-bold tabular-nums ${delivery === 0 ? "text-green-600" : "text-text"}`}>
                {delivery === 0 ? "Free" : formatBDT(delivery)}
              </span>
            </div>
            {discount > 0 && (
              <div className="mb-2.5 flex justify-between text-sm font-semibold text-green-600">
                <span>Discount</span>
                <span className="tabular-nums">-{formatBDT(discount)}</span>
              </div>
            )}

            <div className="my-4 flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="h-11"
              />
              <Button variant="secondary" disabled={applying} onClick={applyCoupon}>
                Apply
              </Button>
            </div>
            {couponMsg && (
              <div className={`-mt-2 mb-3.5 text-[12.5px] font-semibold ${couponMsg.ok ? "text-green-600" : "text-red-500"}`}>
                {couponMsg.text}
              </div>
            )}

            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-[15px] font-bold text-text">Total</span>
              <span className="font-heading text-2xl font-extrabold tabular-nums text-orange-500">
                {formatBDT(total)}
              </span>
            </div>
            <Button
              size="lg"
              className="mt-[18px] w-full"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout →
            </Button>
            <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="size-3.5 text-green-600" />
              Secure checkout · COD available
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
