import { AlertTriangle, Clock, DollarSign, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStats } from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted">Couldn't load dashboard stats.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold text-text">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={DollarSign} label="Today's Sales" value={formatBDT(data.todaySales)} color="#67A70E" />
        <KpiCard icon={ShoppingBag} label="Today's Orders" value={String(data.todayOrderCount)} color="#217CCA" />
        <KpiCard icon={Clock} label="Pending Orders" value={String(data.pendingCount)} color="#F49E09" />
        <KpiCard icon={AlertTriangle} label="Low Stock" value={String(data.lowStockCount)} color="#E23B3B" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-heading text-base font-extrabold text-text">Recent orders</div>
            <Link to="/admin/orders" className="text-sm font-semibold text-blue no-underline">
              View all →
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div>
                    <div className="text-sm font-bold text-text">{order.order_number}</div>
                    <div className="text-xs text-muted">{order.guest_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{order.status}</Badge>
                    <span className="font-heading text-sm font-extrabold tabular-nums text-orange-500">
                      {formatBDT(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 font-heading text-base font-extrabold text-text">Top products</div>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No products yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{product.name}</span>
                  <span className="whitespace-nowrap text-xs text-muted">{product.rating_count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <span
        className="mb-3 flex size-10 items-center justify-center rounded-xl"
        style={{ background: `${color}20` }}
      >
        <Icon className="size-5" style={{ color }} />
      </span>
      <div className="font-heading text-xl font-extrabold tabular-nums text-text">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  )
}
