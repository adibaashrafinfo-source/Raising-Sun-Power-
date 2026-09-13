import { ChevronRight, Heart, MapPin, Package } from "lucide-react"
import { Link } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { useMyOrders } from "@/hooks/use-account"
import { useAuth } from "@/lib/auth-provider"
import { formatBDT } from "@/lib/utils"

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export default function AccountDashboardPage() {
  const { profile, user } = useAuth()
  const { data: orders = [], isLoading } = useMyOrders(user?.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="text-sm text-muted">Welcome back,</div>
        <div className="mt-0.5 font-heading text-xl font-extrabold text-text">
          {profile?.full_name || "there"} 👋
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink to="/account/orders" icon={Package} label="Orders" value={orders.length} />
        <QuickLink to="/account/wishlist" icon={Heart} label="Wishlist" />
        <QuickLink to="/account/addresses" icon={MapPin} label="Addresses" />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-heading text-base font-extrabold text-text">Recent orders</div>
          <Link to="/account/orders" className="text-sm font-semibold text-blue no-underline">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {orders.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5 no-underline hover:bg-surface-2"
              >
                <div>
                  <div className="text-sm font-bold text-text">{order.order_number}</div>
                  <div className="mt-0.5 text-xs text-muted">{STATUS_LABEL[order.status]}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-extrabold tabular-nums text-orange-500">
                    {formatBDT(order.total)}
                  </span>
                  <ChevronRight className="size-4 text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuickLink({
  to,
  icon: Icon,
  label,
  value,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: number
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 no-underline hover:bg-surface-2"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-orange-500/12">
        <Icon className="size-5 text-orange-500" />
      </span>
      <div>
        <div className="text-sm font-bold text-text">{label}</div>
        {value != null && <div className="text-xs text-muted">{value} total</div>}
      </div>
    </Link>
  )
}
