import { ChevronRight, Package } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyOrders } from "@/hooks/use-account"
import { useAuth } from "@/lib/auth-provider"
import { formatBDT } from "@/lib/utils"
import type { OrderStatus } from "@/types/database"

const STATUS_VARIANT: Record<OrderStatus, "blue" | "gold" | "green" | "neutral"> = {
  pending: "gold",
  confirmed: "blue",
  shipped: "blue",
  delivered: "green",
  cancelled: "neutral",
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export default function AccountOrdersPage() {
  const { user } = useAuth()
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders(user?.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted">Couldn't load your orders.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-surface-2">
          <Package className="size-6 text-muted" />
        </span>
        <div className="font-heading text-lg font-bold text-text">No orders yet</div>
        <p className="mt-1.5 text-sm text-muted">Your order history will show up here.</p>
        <Button className="mt-4" asChild>
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/account/orders/${order.id}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 no-underline hover:bg-surface-2"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text">{order.order_number}</span>
              <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-base font-extrabold tabular-nums text-orange-500">
              {formatBDT(order.total)}
            </span>
            <ChevronRight className="size-4 text-muted" />
          </div>
        </Link>
      ))}
    </div>
  )
}
