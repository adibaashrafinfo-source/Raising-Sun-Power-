import { useState } from "react"
import { Check, ChevronRight, Download, PackageSearch, Search, X } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COMPANY, telLink, whatsappLink } from "@/data/company"
import { useSettings } from "@/hooks/use-checkout"
import { useSeo } from "@/hooks/use-seo"
import { useSiteContent } from "@/hooks/use-site-content"
import { printInvoice } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import { TrackingUnavailableError, trackOrder, type TrackedOrder } from "@/lib/queries/checkout"
import { cn, formatBDT } from "@/lib/utils"
import type { OrderStatus } from "@/types/database"

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
]

export default function TrackOrderPage() {
  useSeo({
    title: "Track Your Order",
    description:
      "Track a Rising Sun Power BD order with your order number and the phone number you ordered with.",
  })

  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()

  const [orderNumber, setOrderNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [result, setResult] = useState<TrackedOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !phone.trim()) return
    setIsSearching(true)
    setError(null)
    setResult(null)
    try {
      const found = await trackOrder(orderNumber.trim(), phone.trim())
      if (found) setResult(found)
      else setError("No order matches that order number and phone number. Check both and try again.")
    } catch (err) {
      setError(
        err instanceof TrackingUnavailableError
          ? "Order tracking isn't switched on yet. Please call or WhatsApp us and we'll check your order."
          : "Couldn't reach the server. Check your connection and try again.",
      )
    } finally {
      setIsSearching(false)
    }
  }

  const downloadInvoice = () => {
    if (!result) return
    printInvoice(result.order, result.items, {
      offices: officesFrom(cms),
      phone: settings?.support_phone || COMPANY.phone,
      whatsapp: settings?.whatsapp_number || COMPANY.whatsapp,
      email: settings?.contact_email || COMPANY.email,
      logoUrl: cms?.header_logo_url || `${window.location.origin}/logo.png`,
    })
  }

  const order = result?.order
  const stepIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1
  const isCancelled = order?.status === "cancelled"

  return (
    <main className="mx-auto max-w-[760px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Track order</span>
      </div>

      <div className="text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-surface-2">
          <PackageSearch className="size-7 text-blue" />
        </span>
        <h1 className="mt-3 font-heading text-[clamp(24px,3.6vw,32px)] font-extrabold tracking-tight text-text">
          Track your order
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Enter your order number and the phone number you ordered with.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block">Order number *</Label>
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="RSP-XXXXX-XXX"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Phone number *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-4 w-full sm:w-auto" disabled={isSearching}>
          <Search className="size-[18px]" />
          {isSearching ? "Searching…" : "Track order"}
        </Button>
        {error && <p className="mt-3 text-[13px] font-semibold text-red-500">{error}</p>}
      </form>

      {order && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-heading text-lg font-extrabold text-text">{order.order_number}</div>
                <div className="mt-0.5 text-xs text-muted">
                  Placed{" "}
                  {new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <Button variant="outline" onClick={downloadInvoice}>
                <Download className="size-[17px]" />
                Download Invoice
              </Button>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
                <X className="size-4" /> This order was cancelled.
              </div>
            ) : (
              <div className="flex">
                {STEPS.map((step, i) => {
                  const done = i <= stepIndex
                  return (
                    <div key={step.key} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : done ? "bg-green-500" : "bg-border")} />
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                            done
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-border bg-surface text-muted",
                          )}
                        >
                          {done ? <Check className="size-4" /> : i + 1}
                        </span>
                        <span
                          className={cn(
                            "h-0.5 flex-1",
                            i === STEPS.length - 1 ? "bg-transparent" : i < stepIndex ? "bg-green-500" : "bg-border",
                          )}
                        />
                      </div>
                      <span className={cn("mt-1.5 text-[11.5px] font-semibold", done ? "text-text" : "text-muted")}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-4 font-heading text-base font-extrabold text-text">Order summary</div>
            <div className="mb-4 flex flex-col gap-3">
              {result.items.map((item) => (
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
            {order.discount > 0 && (
              <div className="mt-2.5 flex justify-between text-sm font-semibold text-green-600">
                <span>Discount</span>
                <span className="tabular-nums">-{formatBDT(order.discount)}</span>
              </div>
            )}
            {order.delivery_charge > 0 && (
              <div className="mt-2.5 flex justify-between text-sm text-muted">
                <span>Delivery</span>
                <span className="font-semibold tabular-nums text-text">{formatBDT(order.delivery_charge)}</span>
              </div>
            )}
            <div className="mt-3.5 flex items-baseline justify-between border-t border-border pt-3.5">
              <span className="text-[15px] font-bold text-text">Total</span>
              <span className="font-heading text-2xl font-extrabold tabular-nums text-orange-500">
                {formatBDT(order.total)}
              </span>
            </div>
            <div className="mt-4 text-[12.5px] text-muted">
              Delivering to {order.address_line}, {order.district}, {order.division}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <a href={telLink(settings?.support_phone || COMPANY.phone)}>Call us</a>
        </Button>
        <Button asChild variant="outline">
          <a href={whatsappLink()} target="_blank" rel="noreferrer">
            WhatsApp us
          </a>
        </Button>
      </div>
    </main>
  )
}
