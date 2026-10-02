/**
 * How each courier status reads and looks. Shared by the order page, the
 * courier tracking page and anywhere else a consignment is shown, so a status
 * never means one thing in one place and another somewhere else.
 */
export const COURIER_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  in_review: { label: "In review", className: "bg-blue-500/15 text-blue" },
  delivered_approval_pending: {
    label: "Delivery approval pending",
    className: "bg-blue-500/15 text-blue",
  },
  partial_delivered: {
    label: "Partially delivered",
    className: "bg-orange-500/15 text-orange-500",
  },
  hold: { label: "On hold", className: "bg-orange-500/15 text-orange-500" },
  delivered: { label: "Delivered", className: "bg-green-500/15 text-green-600" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-500" },
  returned: { label: "Returned", className: "bg-red-500/15 text-red-500" },
  unknown: { label: "Unknown", className: "bg-surface-3 text-muted" },
}

export function courierStatusMeta(status: string | null | undefined) {
  const key = String(status ?? "").toLowerCase()
  return (
    COURIER_STATUS_META[key] ?? {
      // An unmapped status is still worth showing — Steadfast may add new ones.
      label: key ? key.replace(/_/g, " ") : "Unknown",
      className: "bg-surface-3 text-muted",
    }
  )
}

/** Statuses that will not change again, so they are not re-synced. */
export const FINAL_COURIER_STATUSES = ["delivered", "cancelled", "returned"]
