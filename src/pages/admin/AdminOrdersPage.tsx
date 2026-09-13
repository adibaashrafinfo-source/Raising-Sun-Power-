import { useState } from "react"
import { Search, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/use-admin"
import { useOrderItems } from "@/hooks/use-checkout"
import { formatBDT } from "@/lib/utils"
import type { Order, OrderStatus } from "@/types/database"

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Order | null>(null)
  const { data: orders = [], isLoading } = useAllOrders({
    status: status || undefined,
    search: search || undefined,
  })
  const updateStatus = useUpdateOrderStatus()

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status: newStatus })
      toast.success(`Order ${order.order_number} marked ${newStatus}`)
    } catch {
      toast.error("Couldn't update order status")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Orders</h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search order # or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
            className="h-11 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No orders found.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-3 font-semibold text-text">{order.order_number}</td>
                  <td className="px-4 py-3 text-muted">
                    {order.guest_name}
                    <div className="text-xs">{order.guest_phone}</div>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-text">{formatBDT(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{order.payment_method.toUpperCase()}</Badge>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className="h-9 rounded-lg border border-border bg-surface-2 px-2.5 text-xs font-semibold text-text outline-none"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <OrderDetailDialog order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function OrderDetailDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { data: items = [] } = useOrderItems(order?.id)

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto" showClose={false}>
        {order && (
          <>
            <div className="flex items-center justify-between">
              <DialogTitle>{order.order_number}</DialogTitle>
              <button onClick={onClose} className="text-muted hover:text-text">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <span className="text-muted">Customer: </span>
                <span className="font-semibold text-text">{order.guest_name}</span> ({order.guest_phone})
              </div>
              <div>
                <span className="text-muted">Address: </span>
                <span className="text-text">
                  {order.address_line}, {order.district}, {order.division}
                </span>
              </div>
              {order.payment_reference && (
                <div>
                  <span className="text-muted">Payment ref: </span>
                  <span className="text-text">{order.payment_reference}</span> (from{" "}
                  {order.payment_sender_number})
                </div>
              )}
              {order.notes && (
                <div>
                  <span className="text-muted">Notes: </span>
                  <span className="text-text">{order.notes}</span>
                </div>
              )}
              <div className="rounded-xl border border-border p-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.product_name} × {item.qty}
                    </span>
                    <span className="font-semibold">{formatBDT(item.line_total)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
                  <span>Total</span>
                  <span>{formatBDT(order.total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
