import { useMemo, useState } from "react"
import { Plus, Trash2, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
import {
  useAllProductsAdmin,
  useCreatePurchase,
  useDeletePurchase,
  useLocations,
  usePurchases,
  useRecordSupplierPayment,
  useSuppliers,
} from "@/hooks/use-admin"
import { useAuth } from "@/lib/auth-provider"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import type { FinancePaymentMethod, Purchase } from "@/types/database"

const STATUS_VARIANT = { due: "neutral", partial: "gold", paid: "green" } as const

export default function AdminPurchasesPage() {
  const { data: purchases = [], isLoading } = usePurchases()
  const [newOpen, setNewOpen] = useState(false)
  const [payingPurchase, setPayingPurchase] = useState<Purchase | null>(null)
  const { isAdmin } = useAuth()
  const deletePurchase = useDeletePurchase()

  const handleDelete = async (purchase: Purchase) => {
    if (
      !confirm(
        `Delete purchase "${purchase.invoice_number}"? This reverses its stock and supplier due — can't be undone.`,
      )
    )
      return
    try {
      await deletePurchase.mutateAsync(purchase.id)
      toast.success("Purchase deleted")
    } catch {
      toast.error("Couldn't delete this purchase")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Purchases</h1>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4" />
          New Purchase
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : purchases.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No purchases yet.</p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{p.invoice_number}</td>
                  <td className="px-4 py-3 text-text">{p.supplier?.name}</td>
                  <td className="px-4 py-3 text-muted">{p.purchase_date}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(p.total_amount)}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(p.due_amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[p.payment_status]}>{p.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={p.due_amount <= 0}
                        onClick={() => setPayingPurchase(p)}
                      >
                        <Wallet className="size-3.5" />
                        Record Payment
                      </Button>
                      {isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(p)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <NewPurchaseDialog open={newOpen} onOpenChange={setNewOpen} />
      {payingPurchase && (
        <RecordPaymentDialog purchase={payingPurchase} onClose={() => setPayingPurchase(null)} />
      )}
    </div>
  )
}

type LineItem = { productId: string; quantity: string; unitCost: string }

function NewPurchaseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: suppliers = [] } = useSuppliers()
  const { data: locations = [] } = useLocations()
  const { data: products = [] } = useAllProductsAdmin()
  const createPurchase = useCreatePurchase()

  const [supplierId, setSupplierId] = useState("")
  const [locationId, setLocationId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [taxAmount, setTaxAmount] = useState("0")
  const [paidAmount, setPaidAmount] = useState("0")
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantity: "1", unitCost: "0" }])
  const [submitting, setSubmitting] = useState(false)

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitCost) || 0), 0),
    [items],
  )
  const total = subtotal + (Number(taxAmount) || 0)

  const updateItem = (i: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId || !locationId || !invoiceNumber.trim()) {
      toast.error("Fill in supplier, location and invoice number")
      return
    }
    const validItems = items.filter((i) => i.productId && Number(i.quantity) > 0)
    if (validItems.length === 0) {
      toast.error("Add at least one line item")
      return
    }
    setSubmitting(true)
    try {
      await createPurchase.mutateAsync({
        invoice_number: invoiceNumber.trim(),
        supplier_id: supplierId,
        location_id: locationId,
        purchase_date: purchaseDate,
        tax_amount: Number(taxAmount) || 0,
        paid_amount: Number(paidAmount) || 0,
        items: validItems.map((i) => ({
          product_id: i.productId,
          quantity: Number(i.quantity),
          unit_cost: Number(i.unitCost),
        })),
      })
      toast.success("Purchase recorded — stock updated")
      onOpenChange(false)
      setItems([{ productId: "", quantity: "1", unitCost: "0" }])
      setInvoiceNumber("")
      setPaidAmount("0")
      setTaxAmount("0")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this purchase"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[680px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Purchase</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Supplier *</Label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">Location *</Label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
              >
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">Invoice number *</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Purchase date *</Label>
              <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Line items *</Label>
            <div className="flex flex-col gap-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_100px_32px] items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, { productId: e.target.value })}
                    className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-2.5 text-xs text-text outline-none"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit cost"
                    value={item.unitCost}
                    onChange={(e) => updateItem(i, { unitCost: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setItems((prev) => [...prev, { productId: "", quantity: "1", unitCost: "0" }])}
              >
                <Plus className="size-3.5" /> Add item
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 block">Tax amount (৳)</Label>
              <Input type="number" step="0.01" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Paid now (৳)</Label>
              <Input type="number" step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="tabular-nums text-text">{formatBDT(subtotal)}</span>
            </div>
            <div className="mt-1.5 flex justify-between font-bold">
              <span className="text-text">Total</span>
              <span className="tabular-nums text-orange-500">{formatBDT(total)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Purchase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RecordPaymentDialog({ purchase, onClose }: { purchase: Purchase; onClose: () => void }) {
  const recordPayment = useRecordSupplierPayment()
  const [amount, setAmount] = useState(String(purchase.due_amount))
  const [method, setMethod] = useState<FinancePaymentMethod>("cash")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    try {
      await recordPayment.mutateAsync({
        supplier_id: purchase.supplier_id,
        purchase_id: purchase.id,
        amount: amt,
        payment_method: method,
        payment_date: date,
        reference_note: note || null,
        currentDue: purchase.due_amount,
      })
      toast.success("Payment recorded")
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't record payment"))
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Record Payment — {purchase.invoice_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <p className="text-xs text-muted">
            Due: <b className="text-text">{formatBDT(purchase.due_amount)}</b>
          </p>
          <div>
            <Label className="mb-1.5 block">Amount (৳) *</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Payment method *</Label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as FinancePaymentMethod)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
            >
              <option value="cash">Cash</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block">Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Reference note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={recordPayment.isPending}>
              {recordPayment.isPending ? "Saving…" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
