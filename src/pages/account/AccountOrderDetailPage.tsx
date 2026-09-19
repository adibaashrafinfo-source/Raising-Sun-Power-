import { Check, ChevronRight, Download, X } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { COMPANY } from "@/data/company"
import { useOrder, useOrderItems, useSettings } from "@/hooks/use-checkout"
import { useSiteContent } from "@/hooks/use-site-content"
import { printInvoice } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import { cn, formatBDT } from "@/lib/utils"
import type { OrderStatus } from "@/types/database"

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
]

export default function AccountOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, isError, refetch } = useOrder(orderId)
  const { data: items = [] } = useOrderItems(orderId)
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()

  const downloadInvoice = () => {
    if (!order) return
    printInvoice(order, items, {
      offices: officesFrom(cms),
      phone: settings?.support_phone || COMPANY.phone,
      whatsapp: settings?.whatsapp_number || COMPANY.whatsapp,
      email: settings?.contact_email || COMPANY.email,
      logoUrl: cms?.header_logo_url || undefined,
    })
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />
  }

  if (isError || !order) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted">Couldn't load this order.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link to="/account/orders" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Orders
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">{order.order_number}</span>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-heading text-lg font-extrabold text-text">{order.order_number}</div>
            <div className="mt-0.5 text-xs text-muted">
              Placed{" "}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-heading text-xl font-extrabold tabular-nums text-orange-500">
              {formatBDT(order.total)}
            </span>
            <Button variant="outline" size="sm" onClick={downloadInvoice}>
              <Download className="size-[15px]" />
              Invoice
            </Button>
          </div>
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 p-3.5 text-sm font-semibold text-red-500">
            <X className="size-4" />
            This order was cancelled
          </div>
        ) : (
          <div className="flex items-center">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                      i <= currentStepIndex ? "bg-green-500 text-white" : "bg-surface-2 text-muted",
                    )}
                  >
                    {i <= currentStepIndex ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-semibold text-muted">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn("mx-1 h-0.5 flex-1", i < currentStepIndex ? "bg-green-500" : "bg-surface-2")}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 font-heading text-base font-extrabold text-text">Items</div>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text">
                {item.product_name} <span className="text-muted">× {item.qty}</span>
              </span>
              <span className="font-semibold tabular-nums text-text">{formatBDT(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="font-semibold tabular-nums text-text">{formatBDT(order.subtotal)}</span>
          </div>
          {order.delivery_charge > 0 && (
            <div className="flex justify-between text-muted">
              <span>Delivery</span>
              <span className="font-semibold tabular-nums text-text">
                {formatBDT(order.delivery_charge)}
              </span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between font-semibold text-green-600">
              <span>Discount</span>
              <span className="tabular-nums">-{formatBDT(order.discount)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 font-heading text-base font-extrabold text-text">Delivery details</div>
        <div className="text-sm text-muted">
          <div>
            {order.address_line}, {order.district}, {order.division}
          </div>
          {order.landmark && <div className="mt-1">Landmark: {order.landmark}</div>}
          <div className="mt-2">
            Payment: <span className="font-semibold text-text">{order.payment_method.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
