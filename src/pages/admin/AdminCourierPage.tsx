import { useState } from "react"
import { Loader2, RefreshCw, Truck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCourierOrders, useSyncAllCourierStatuses } from "@/hooks/use-courier"
import { courierStatusMeta } from "@/lib/courier-status"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import { COURIER_STATUSES } from "@/types/database"

const PROVIDER_LABELS: Record<string, string> = { steadfast: "Steadfast" }

const formatWhen = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—"

/** Every order that has been handed to a courier, and where each one stands. */
export default function AdminCourierPage() {
  const [status, setStatus] = useState("")
  const { data: orders = [], isLoading } = useCourierOrders(status || undefined)
  const syncAll = useSyncAllCourierStatuses()

  const handleSyncAll = async () => {
    try {
      const result = await syncAll.mutateAsync()
      toast.success(
        result.checked === 0
          ? "Nothing to refresh — every consignment is already settled."
          : `Checked ${result.checked} · updated ${result.updated}${
              result.failed ? ` · ${result.failed} failed` : ""
            }`,
      )
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't refresh the courier statuses"))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-text">
            <Truck className="size-6 text-orange-500" /> Courier Tracking
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Orders booked with a courier, and the status each consignment is in.
          </p>
        </div>
        <Button onClick={handleSyncAll} disabled={syncAll.isPending}>
          {syncAll.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {syncAll.isPending ? "Refreshing…" : "Refresh All"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All" active={status === ""} onClick={() => setStatus("")} />
        {COURIER_STATUSES.map((value) => (
          <FilterChip
            key={value}
            label={courierStatusMeta(value).label}
            active={status === value}
            onClick={() => setStatus(value)}
          />
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          {status
            ? "No consignments in this status."
            : "No orders have been sent to a courier yet. Open an order and use Send to Courier."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Order #</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Courier</th>
                <th className="px-4 py-3 font-semibold">Consignment</th>
                <th className="px-4 py-3 font-semibold">COD</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Sent</th>
                <th className="px-4 py-3 font-semibold">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const meta = courierStatusMeta(order.courier_status)
                return (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                    <td className="px-4 py-3 font-semibold text-text">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="text-text">{order.guest_name}</div>
                      <div className="text-xs text-muted">{order.guest_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {PROVIDER_LABELS[order.courier_provider ?? ""] ?? order.courier_provider}
                    </td>
                    <td className="px-4 py-3">
                      <div className="tabular-nums text-text">{order.consignment_id}</div>
                      {order.courier_tracking_code && (
                        <div className="text-xs text-muted">{order.courier_tracking_code}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-text">{formatBDT(order.due_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatWhen(order.sent_to_courier_at)}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatWhen(order.courier_status_updated_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border text-muted"
      }`}
    >
      {label}
    </button>
  )
}
