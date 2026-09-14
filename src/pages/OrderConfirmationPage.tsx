import { Check, MapPin, MessageCircle, Package, RefreshCw } from "lucide-react"
import { Link, useLocation, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrder, useOrderItems } from "@/hooks/use-checkout"
import { useSeo } from "@/hooks/use-seo"
import { formatBDT } from "@/lib/utils"
import type { Order, OrderItem } from "@/types/database"

export default function OrderConfirmationPage() {
  useSeo({ title: "Order Confirmed", noIndex: true })
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const navState = location.state as { order?: Order; items?: OrderItem[] } | null

  // Guest orders have no user_id, so RLS only lets an admin session read them
  // back — the state passed at checkout is the only reliable source right
  // after placing an order. Only fall back to a fetch (e.g. a page refresh)
  // when that state isn't there; for a guest it will simply come back empty.
  const shouldFetch = !navState?.order
  const { data: fetchedOrder, isLoading, isError, refetch } = useOrder(shouldFetch ? orderId : undefined)
  const { data: fetchedItems = [] } = useOrderItems(shouldFetch ? orderId : undefined)

  const order = navState?.order ?? fetchedOrder
  const items = navState?.items ?? fetchedItems

  if (shouldFetch && isLoading) {
    return (
      <main className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
        <Skeleton className="mx-auto h-[200px] w-full max-w-md rounded-3xl" />
      </main>
    )
  }

  if (isError || !order) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-[760px] flex-col items-center justify-center px-4 text-center">
        <span className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-surface-2">
          <RefreshCw className="size-7 text-muted" />
        </span>
        <h1 className="font-heading text-xl font-extrabold text-text">Couldn't load this order</h1>
        <p className="mt-2 text-sm text-muted">Check your connection and try again.</p>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => refetch()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      </main>
    )
  }

  const isPickup = order.delivery_method === "pickup"
  const eta = isPickup ? "Ready for pickup within 24 hours" : order.district === "Dhaka" ? "1–2 days" : "2–4 days"

  return (
    <main className="mx-auto max-w-[760px] px-4 pb-16 pt-8 sm:px-6">
      <div className="text-center">
        <span className="inline-flex size-[88px] items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-[0_14px_34px_rgba(103,167,14,.4)]">
          <Check className="size-11 text-white" strokeWidth={2.5} />
        </span>
        <h1 className="mt-5 font-heading text-[clamp(26px,4vw,34px)] font-extrabold tracking-tight text-text">
          Order Confirmed 🎉
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">
          আপনার অর্ডার সম্পন্ন হয়েছে — thank you, {order.guest_name}!
        </p>
        <div className="mt-[18px] inline-flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-5 py-3 shadow-[var(--shadow-sm)]">
          <span className="text-[13px] text-muted">Order ID</span>
          <span className="font-heading text-lg font-extrabold tracking-wide text-orange-500">
            {order.order_number}
          </span>
        </div>
        <p className="mx-auto mt-4 max-w-[440px] text-[13px] leading-relaxed text-muted">
          A confirmation SMS &amp; WhatsApp has been sent to <b className="text-text">{order.guest_phone}</b>.
          Our team will call to confirm before dispatch.
        </p>
      </div>

      <div className="mt-6 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 font-heading text-base font-extrabold text-text">Order summary</div>
        <div className="mb-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-muted">
                ×{item.qty}
              </span>
              <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-snug text-text">
                {item.product_name}
              </span>
              <span className="whitespace-nowrap text-sm font-bold tabular-nums text-text">
                {formatBDT(item.line_total)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-border pt-3.5 text-sm text-muted">
          <span>Subtotal</span>
          <span className="font-semibold tabular-nums text-text">{formatBDT(order.subtotal)}</span>
        </div>
        <div className="mt-2.5 flex justify-between text-sm text-muted">
          <span>Delivery</span>
          <span className="font-semibold tabular-nums text-text">
            {order.delivery_charge === 0 ? "Free" : formatBDT(order.delivery_charge)}
          </span>
        </div>
        {order.discount > 0 && (
          <div className="mt-2.5 flex justify-between text-sm font-semibold text-green-600">
            <span>Discount</span>
            <span className="tabular-nums">-{formatBDT(order.discount)}</span>
          </div>
        )}
        <div className="mt-3.5 flex items-baseline justify-between border-t border-border pt-3.5">
          <span className="text-[15px] font-bold text-text">Total</span>
          <span className="font-heading text-2xl font-extrabold tabular-nums text-orange-500">
            {formatBDT(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <Package className="mt-0.5 size-5 shrink-0 text-blue" />
          <div>
            <div className="text-[13.5px] font-bold text-text">Estimated delivery</div>
            <div className="mt-0.5 text-xs text-muted">{eta}</div>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-blue" />
          <div>
            <div className="text-[13.5px] font-bold text-text">
              {isPickup ? "Pickup location" : "Delivering to"}
            </div>
            <div className="mt-0.5 text-xs text-muted">
              {order.address_line}, {order.district}, {order.division}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="secondary" size="lg">
          <Link to="/products">Continue Shopping</Link>
        </Button>
        <Button asChild size="lg">
          <a href="https://wa.me/8801786896390">
            <MessageCircle className="size-[18px]" />
            WhatsApp Support
          </a>
        </Button>
      </div>
    </main>
  )
}
