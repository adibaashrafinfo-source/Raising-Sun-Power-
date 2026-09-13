import { useMemo, useState } from "react"
import { AlertTriangle, ArrowRightLeft, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdjustStock, useLocations, useProductStock, useTransferStock } from "@/hooks/use-admin"
import { getErrorMessage } from "@/lib/utils"
import type { ProductStock } from "@/types/database"

export default function AdminStockPage() {
  const { data: stock = [], isLoading } = useProductStock()
  const { data: locations = [] } = useLocations()
  const [locationFilter, setLocationFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [adjustRow, setAdjustRow] = useState<ProductStock | null>(null)
  const [transferRow, setTransferRow] = useState<ProductStock | null>(null)

  const categories = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of stock) {
      if (row.product?.category) map.set(row.product.category.id, row.product.category.name)
    }
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [stock])

  const filtered = stock.filter((row) => {
    if (locationFilter && row.location_id !== locationFilter) return false
    if (categoryFilter && row.product?.category?.id !== categoryFilter) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Stock</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="h-10 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-sm text-text outline-none"
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-sm text-text outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No stock records yet — stock is created automatically when a purchase is received.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Min level</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const low = row.quantity <= row.min_stock_level
                return (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text">{row.product?.name}</div>
                      <div className="text-xs text-muted">{row.product?.sku ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-text">{row.location?.name}</td>
                    <td className="px-4 py-3">
                      <span className={low ? "flex items-center gap-1.5 font-bold text-red-500" : "text-text"}>
                        {low && <AlertTriangle className="size-3.5" />}
                        {row.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">{row.min_stock_level}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAdjustRow(row)}>
                          <SlidersHorizontal className="size-3.5" />
                          Adjust
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setTransferRow(row)}>
                          <ArrowRightLeft className="size-3.5" />
                          Transfer
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {adjustRow && <AdjustStockDialog row={adjustRow} onClose={() => setAdjustRow(null)} />}
      {transferRow && (
        <TransferStockDialog row={transferRow} locations={locations} onClose={() => setTransferRow(null)} />
      )}
    </div>
  )
}

function AdjustStockDialog({ row, onClose }: { row: ProductStock; onClose: () => void }) {
  const [delta, setDelta] = useState("0")
  const [reason, setReason] = useState("")
  const adjustStock = useAdjustStock()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const deltaNum = Number(delta)
    if (!deltaNum) {
      toast.error("Enter a non-zero quantity")
      return
    }
    if (!reason.trim()) {
      toast.error("A reason is required")
      return
    }
    try {
      await adjustStock.mutateAsync({
        productId: row.product_id,
        locationId: row.location_id,
        delta: deltaNum,
        reason: reason.trim(),
      })
      toast.success("Stock adjusted")
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't adjust stock"))
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock — {row.product?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <p className="text-xs text-muted">
            Current: <b className="text-text">{row.quantity}</b> at {row.location?.name}
          </p>
          <div>
            <Label className="mb-1.5 block">Quantity change (+/-) *</Label>
            <Input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Reason *</Label>
            <Input
              placeholder="e.g. damaged in storage, stock count correction"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending ? "Saving…" : "Save adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TransferStockDialog({
  row,
  locations,
  onClose,
}: {
  row: ProductStock
  locations: { id: string; name: string }[]
  onClose: () => void
}) {
  const [toLocationId, setToLocationId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const transferStock = useTransferStock()
  const destinations = locations.filter((l) => l.id !== row.location_id)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = Number(quantity)
    if (!toLocationId) {
      toast.error("Select a destination location")
      return
    }
    if (!qty || qty <= 0) {
      toast.error("Enter a valid quantity")
      return
    }
    try {
      await transferStock.mutateAsync({
        productId: row.product_id,
        fromLocationId: row.location_id,
        toLocationId,
        quantity: qty,
      })
      toast.success("Stock transferred")
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't transfer stock"))
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Transfer Stock — {row.product?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <p className="text-xs text-muted">
            From <b className="text-text">{row.location?.name}</b> (available: {row.quantity})
          </p>
          <div>
            <Label className="mb-1.5 block">To location *</Label>
            <select
              value={toLocationId}
              onChange={(e) => setToLocationId(e.target.value)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
            >
              <option value="">Select location</option>
              {destinations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block">Quantity *</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={transferStock.isPending}>
              {transferStock.isPending ? "Transferring…" : "Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
