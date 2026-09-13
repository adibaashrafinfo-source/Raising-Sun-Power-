import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCreatePurchaseReturn,
  usePurchaseItems,
  usePurchaseReturns,
  usePurchases,
} from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"

export default function AdminPurchaseReturnsPage() {
  const { data: returns = [], isLoading } = usePurchaseReturns()
  const { data: purchases = [] } = usePurchases()
  const [purchaseId, setPurchaseId] = useState("")
  const [reason, setReason] = useState("")
  const [returnQty, setReturnQty] = useState<Record<string, string>>({})
  const { data: items = [] } = usePurchaseItems(purchaseId || undefined)
  const createReturn = useCreatePurchaseReturn()

  const selectedPurchase = purchases.find((p) => p.id === purchaseId)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPurchase) {
      toast.error("Select a purchase")
      return
    }
    if (!reason.trim()) {
      toast.error("Enter a reason for the return")
      return
    }
    const returnItems = items
      .filter((item) => Number(returnQty[item.id]) > 0)
      .map((item) => ({
        product_id: item.product_id,
        quantity: Number(returnQty[item.id]),
        unit_cost: item.unit_cost,
      }))
    if (returnItems.length === 0) {
      toast.error("Enter a return quantity for at least one item")
      return
    }
    try {
      await createReturn.mutateAsync({
        purchase_id: selectedPurchase.id,
        supplier_id: selectedPurchase.supplier_id,
        location_id: selectedPurchase.location_id,
        return_date: new Date().toISOString().slice(0, 10),
        reason: reason.trim(),
        items: returnItems,
      })
      toast.success("Return recorded — stock updated")
      setPurchaseId("")
      setReason("")
      setReturnQty({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't record this return")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl font-extrabold text-text">Purchase Returns</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5">
        <div className="font-heading text-base font-extrabold text-text">New Return</div>
        <div>
          <Label className="mb-1.5 block">Purchase *</Label>
          <select
            value={purchaseId}
            onChange={(e) => {
              setPurchaseId(e.target.value)
              setReturnQty({})
            }}
            className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
          >
            <option value="">Select a purchase</option>
            {purchases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.invoice_number} — {p.supplier?.name}
              </option>
            ))}
          </select>
        </div>

        {selectedPurchase && (
          <div className="flex flex-col gap-2">
            <Label>Items to return</Label>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-text">{item.product?.name}</div>
                  <div className="text-xs text-muted">
                    Purchased {item.quantity} @ {formatBDT(item.unit_cost)}
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={item.quantity}
                  placeholder="Return qty"
                  className="w-28"
                  value={returnQty[item.id] ?? ""}
                  onChange={(e) => setReturnQty((prev) => ({ ...prev, [item.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <Label className="mb-1.5 block">Reason *</Label>
          <Input placeholder="e.g. damaged on arrival" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <Button type="submit" className="self-start" disabled={createReturn.isPending || !purchaseId}>
          {createReturn.isPending ? "Saving…" : "Record Return"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : returns.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No purchase returns yet.</p>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Return #</th>
                <th className="px-4 py-3 font-semibold">Purchase</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{r.return_number}</td>
                  <td className="px-4 py-3 text-muted">{r.purchase?.invoice_number ?? "—"}</td>
                  <td className="px-4 py-3 text-text">{r.supplier?.name}</td>
                  <td className="px-4 py-3 text-muted">{r.return_date}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(r.total_amount)}</td>
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
