import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
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
import { useAllCoupons, useDeleteCoupon, useUpsertCoupon } from "@/hooks/use-admin"
import type { Coupon } from "@/types/database"

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useAllCoupons()
  const deleteCoupon = useDeleteCoupon()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return
    try {
      await deleteCoupon.mutateAsync(coupon.id)
      toast.success("Coupon deleted")
    } catch {
      toast.error("Couldn't delete this coupon")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-text">Coupons</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4" /> New Coupon
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : coupons.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No coupons yet.</p>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Discount</th>
                <th className="px-4 py-3 font-semibold">Used</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-mono font-bold text-text">{coupon.code}</td>
                  <td className="px-4 py-3 text-text">
                    {coupon.discount_type === "percent" ? `${coupon.discount_value}%` : `৳${coupon.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {coupon.used_count}
                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={coupon.active ? "green" : "neutral"}>
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(coupon)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(coupon)}>
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

      <CouponDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} coupon={editing} />
    </div>
  )
}

function CouponDialog({
  open,
  onOpenChange,
  coupon,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: Coupon | null
}) {
  const upsertCoupon = useUpsertCoupon()
  const [code, setCode] = useState(coupon?.code ?? "")
  const [discountType, setDiscountType] = useState<"percent" | "flat">(coupon?.discount_type ?? "percent")
  const [discountValue, setDiscountValue] = useState(String(coupon?.discount_value ?? ""))
  const [usageLimit, setUsageLimit] = useState(coupon?.usage_limit != null ? String(coupon.usage_limit) : "")
  const [expiresAt, setExpiresAt] = useState(coupon?.expires_at?.slice(0, 10) ?? "")
  const [active, setActive] = useState(coupon?.active ?? true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertCoupon.mutateAsync({
        id: coupon?.id,
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        usage_limit: usageLimit ? Number(usageLimit) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        active,
      })
      toast.success(coupon ? "Coupon updated" : "Coupon created")
      onOpenChange(false)
    } catch {
      toast.error("Couldn't save this coupon")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "New Coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block">Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 block">Discount type</Label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percent" | "flat")}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat (৳)</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">Value</Label>
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 block">Usage limit</Label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Expires on</Label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-text">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 accent-orange-500"
            />
            Active
          </label>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
