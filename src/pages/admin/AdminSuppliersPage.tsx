import { useState } from "react"
import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useDeleteSupplier,
  useSupplierPayments,
  useSupplierPurchases,
  useSuppliers,
  useUpsertSupplier,
} from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"
import type { Supplier } from "@/types/database"

export default function AdminSuppliersPage() {
  const { data: suppliers = [], isLoading } = useSuppliers()
  const deleteSupplier = useDeleteSupplier()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (s: Supplier) => {
    setEditing(s)
    setDialogOpen(true)
  }

  const handleDelete = async (s: Supplier) => {
    if (!confirm(`Delete supplier "${s.name}"? This can't be undone.`)) return
    try {
      await deleteSupplier.mutateAsync(s.id)
      toast.success("Supplier deleted")
    } catch {
      toast.error("Couldn't delete — this supplier may have purchase history")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Suppliers</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New Supplier
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No suppliers yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Current Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailSupplier(s)}
                      className="font-semibold text-text hover:text-blue"
                    >
                      {s.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={s.current_due > 0 ? "font-bold tabular-nums text-red-500" : "tabular-nums text-text"}>
                      {formatBDT(s.current_due)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.is_active ? "green" : "neutral"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" title="View" onClick={() => setDetailSupplier(s)}>
                        <Eye className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" title="Edit" onClick={() => openEdit(s)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(s)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SupplierDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} supplier={editing} />
      {detailSupplier && (
        <SupplierDetailDialog supplier={detailSupplier} onClose={() => setDetailSupplier(null)} />
      )}
    </div>
  )
}

function SupplierDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
}) {
  const upsertSupplier = useUpsertSupplier()
  const [name, setName] = useState(supplier?.name ?? "")
  const [phone, setPhone] = useState(supplier?.phone ?? "")
  const [email, setEmail] = useState(supplier?.email ?? "")
  const [address, setAddress] = useState(supplier?.address ?? "")
  const [paymentTerms, setPaymentTerms] = useState(supplier?.payment_terms ?? "")
  const [openingBalance, setOpeningBalance] = useState(String(supplier?.opening_balance ?? 0))
  const [isActive, setIsActive] = useState(supplier?.is_active ?? true)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Enter a supplier name")
      return
    }
    setSubmitting(true)
    try {
      await upsertSupplier.mutateAsync({
        id: supplier?.id,
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        address: address || null,
        payment_terms: paymentTerms || null,
        opening_balance: Number(openingBalance) || 0,
        current_due: supplier?.current_due ?? (Number(openingBalance) || 0),
        is_active: isActive,
      })
      toast.success(supplier ? "Supplier updated" : "Supplier created")
      onOpenChange(false)
    } catch {
      toast.error("Couldn't save this supplier")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit Supplier" : "New Supplier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 block">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 block">Payment terms</Label>
              <Input placeholder="e.g. Net 30" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Opening balance (৳)</Label>
              <Input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                disabled={!!supplier}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text">
            <input type="checkbox" className="size-4" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SupplierDetailDialog({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  const { data: purchases = [], isLoading: loadingPurchases } = useSupplierPurchases(supplier.id)
  const { data: payments = [], isLoading: loadingPayments } = useSupplierPayments(supplier.id)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-[640px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-2 flex items-center gap-2 text-sm">
          <span className="text-muted">Current due:</span>
          <span className={supplier.current_due > 0 ? "font-bold text-red-500" : "font-bold text-text"}>
            {formatBDT(supplier.current_due)}
          </span>
        </div>
        <Tabs defaultValue="purchases">
          <TabsList>
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
          <TabsContent value="purchases">
            {loadingPurchases ? (
              <Skeleton className="h-24 w-full" />
            ) : purchases.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No purchases yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {purchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                    <div>
                      <div className="font-semibold text-text">{p.invoice_number}</div>
                      <div className="text-xs text-muted">{p.purchase_date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold tabular-nums text-text">{formatBDT(p.total_amount)}</div>
                      <div className="text-xs text-muted">Due: {formatBDT(p.due_amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="payments">
            {loadingPayments ? (
              <Skeleton className="h-24 w-full" />
            ) : payments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No payments recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                    <div>
                      <div className="font-semibold text-text uppercase">{p.payment_method}</div>
                      <div className="text-xs text-muted">{p.payment_date}</div>
                    </div>
                    <span className="font-bold tabular-nums text-green-600">{formatBDT(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
