import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  ShoppingBag,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStats } from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"
import type { OrderStatus } from "@/types/database"

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#F49E09" },
  confirmed: { label: "Confirmed", color: "#217CCA" },
  shipped: { label: "Shipped", color: "#0B3F94" },
  delivered: { label: "Delivered", color: "#67A70E" },
  cancelled: { label: "Cancelled", color: "#E23B3B" },
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Skeleton className="h-[340px] w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[340px] w-full rounded-2xl" />
        </div>
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

  const statusEntries = (Object.keys(STATUS_META) as OrderStatus[])
    .map((status) => ({
      status,
      label: STATUS_META[status].label,
      color: STATUS_META[status].color,
      value: data.statusCounts[status] ?? 0,
    }))
    .filter((entry) => entry.value > 0)

  const trendChartData = data.salesTrend.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-text">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">Here's what's happening with your store today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          icon={DollarSign}
          label="Today's Sales"
          value={formatBDT(data.todaySales)}
          color="#67A70E"
          changePct={data.salesChangePct}
        />
        <KpiCard icon={ShoppingBag} label="Today's Orders" value={String(data.todayOrderCount)} color="#217CCA" />
        <KpiCard icon={Clock} label="Pending Orders" value={String(data.pendingCount)} color="#F49E09" />
        <KpiCard icon={Users} label="Customers" value={String(data.customerCount)} color="#0B3F94" />
        <KpiCard icon={AlertTriangle} label="Low Stock" value={String(data.lowStockCount)} color="#E23B3B" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <div className="mb-1 font-heading text-base font-extrabold text-text">Revenue</div>
          <p className="mb-4 text-xs text-muted">Last 14 days</p>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F49E09" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F49E09" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  interval={Math.ceil(trendChartData.length / 6) - 1}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text)", fontWeight: 700 }}
                  formatter={(value) => [formatBDT(Number(value)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#F49E09"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-1 font-heading text-base font-extrabold text-text">Order Status</div>
          <p className="mb-4 text-xs text-muted">All-time breakdown</p>
          {statusEntries.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusEntries}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {statusEntries.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {statusEntries.map((entry) => (
                  <div key={entry.status} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="size-2 rounded-full" style={{ background: entry.color }} />
                      {entry.label}
                    </span>
                    <span className="font-bold tabular-nums text-text">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
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
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-text">{order.order_number}</div>
                    <div className="truncate text-xs text-muted">{order.guest_name}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: STATUS_META[order.status].color,
                        color: STATUS_META[order.status].color,
                      }}
                    >
                      {STATUS_META[order.status].label}
                    </Badge>
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
          <div className="mb-4 flex items-center justify-between">
            <div className="font-heading text-base font-extrabold text-text">Top products</div>
            <Link to="/admin/products" className="text-sm font-semibold text-blue no-underline">
              View all →
            </Link>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No products yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.topProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-extrabold text-muted">
                    {i + 1}
                  </span>
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="size-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="size-9 shrink-0 rounded-lg bg-surface-2" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
                    {product.name}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-xs text-muted">
                    {product.rating_count} sold
                  </span>
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
  changePct,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  color: string
  changePct?: number
}) {
  const showChange = changePct !== undefined
  const isUp = (changePct ?? 0) >= 0

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <span
          className="mb-3 flex size-10 items-center justify-center rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon className="size-5" style={{ color }} />
        </span>
        {showChange && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold ${isUp ? "text-green-600" : "text-red-500"}`}
          >
            {isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(changePct ?? 0).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="font-heading text-xl font-extrabold tabular-nums text-text">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  )
}
