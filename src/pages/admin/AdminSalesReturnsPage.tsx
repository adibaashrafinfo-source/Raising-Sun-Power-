import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAllOrders, useCreateSalesReturn, useSalesReturns } from "@/hooks/use-admin"
import { useOrderItems } from "@/hooks/use-checkout"
import { formatBDT } from "@/lib/utils"

const REFUND_VARIANT = { pending: "gold", refunded: "green", rejected: "neutral" } as const

export default function AdminSalesReturnsPage() {
  const { data: returns = [], isLoading } = useSalesReturns()
  const { data: orders = [] } = useAllOrders({})
  const [orderId, setOrderId] = useState("")
  const [reason, setReason] = useState("")
  const [returnQty, setReturnQty] = useState<Record<string, string>>({})
  const { data: items = [] } = useOrderItems(orderId || undefined)
  const createReturn = useCreateSalesReturn()

  const selectedOrder = orders.find((o) => o.id === orderId)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) {
      toast.error("Select an order")
      return
    }
    if (!reason.trim()) {
      toast.error("Enter a reason for the return")
      return
    }
    const returnItems = items
      .filter((item) => Number(returnQty[item.id]) > 0)
      .map((item) => ({
        product_id: item.product_id!,
        quantity: Number(returnQty[item.id]),
        unit_price: item.unit_price,
      }))
      .filter((item) => item.product_id)
    if (returnItems.length === 0) {
      toast.error("Enter a return quantity for at least one item")
      return
    }
    try {
      await createReturn.mutateAsync({
        order_id: selectedOrder.id,
        reason: reason.trim(),
        items: returnItems,
      })
      toast.success("Return recorded — stock updated")
      setOrderId("")
      setReason("")
      setReturnQty({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't record this return")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl font-extrabold text-text">Sales Returns</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5">
        <div className="font-heading text-base font-extrabold text-text">New Return</div>
        <div>
          <Label className="mb-1.5 block">Order *</Label>
          <select
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value)
              setReturnQty({})
            }}
            className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
          >
            <option value="">Select an order</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number} — {o.guest_name}
              </option>
            ))}
          </select>
        </div>

        {selectedOrder && (
          <div className="flex flex-col gap-2">
            <Label>Items to return</Label>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-text">{item.product_name}</div>
                  <div className="text-xs text-muted">
                    Ordered {item.qty} @ {formatBDT(item.unit_price)}
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={item.qty}
                  placeholder="Return qty"
                  className="w-28"
                  disabled={!item.product_id}
                  value={returnQty[item.id] ?? ""}
                  onChange={(e) => setReturnQty((prev) => ({ ...prev, [item.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <Label className="mb-1.5 block">Reason *</Label>
          <Input placeholder="e.g. wrong item shipped" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <Button type="submit" className="self-start" disabled={createReturn.isPending || !orderId}>
          {createReturn.isPending ? "Saving…" : "Record Return"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : returns.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No sales returns yet.</p>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Return #</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Refund</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{r.return_number}</td>
                  <td className="px-4 py-3 text-muted">{r.order?.order_number ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{r.return_date}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(r.total_amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={REFUND_VARIANT[r.refund_status]}>{r.refund_status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
