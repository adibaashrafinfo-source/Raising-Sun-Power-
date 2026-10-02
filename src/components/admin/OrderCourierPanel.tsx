import { useState } from "react"
import { AlertTriangle, Copy, Loader2, RefreshCw, Send, Truck } from "lucide-react"
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
import { useCourierSettings, useRefreshCourierStatus, useSendOrderToCourier } from "@/hooks/use-courier"
import { courierStatusMeta } from "@/lib/courier-status"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import type { Order } from "@/types/database"

const PROVIDER_LABELS: Record<string, string> = { steadfast: "Steadfast Courier" }

/**
 * The courier side of one order: either the button that books it, or the
 * consignment it already has. Rendered inside the admin order dialog.
 */
export function OrderCourierPanel({ order }: { order: Order }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const refreshStatus = useRefreshCourierStatus()
  const { data: couriers = [] } = useCourierSettings()

  const steadfast = couriers.find((row) => row.provider === "steadfast")
  const isConfigured = !!steadfast?.has_credentials && steadfast.is_active
  const isPickup = order.delivery_method === "pickup"
  const alreadySent = !!order.consignment_id

  const handleRefresh = async () => {
    try {
      const result = await refreshStatus.mutateAsync(order.id)
      toast.success(`Status: ${courierStatusMeta(result.courier_status).label}`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't refresh the courier status"))
    }
  }

  if (alreadySent) {
    const meta = courierStatusMeta(order.courier_status)
    return (
      <div className="rounded-xl border border-border p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
            <Truck className="size-3.5" />
            {PROVIDER_LABELS[order.courier_provider ?? ""] ?? order.courier_provider}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${meta.className}`}>
            {meta.label}
          </span>
        </div>

        <CopyRow label="Consignment ID" value={order.consignment_id ?? "—"} />
        <CopyRow label="Tracking code" value={order.courier_tracking_code ?? "—"} />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11.5px] text-muted">
            {order.courier_status_updated_at
              ? `Synced ${new Date(order.courier_status_updated_at).toLocaleString("en-GB")}`
              : "Not synced yet"}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshStatus.isPending}>
            {refreshStatus.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Refresh Status
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-text">Courier</div>
          <p className="mt-0.5 text-[11.5px] text-muted">
            {isPickup
              ? "Pick-up order — the customer collects it from the office."
              : !isConfigured
                ? "Add your Steadfast keys in Settings → Courier Integration first."
                : "Book this order with Steadfast and get a consignment ID."}
          </p>
        </div>
        <Button size="sm" disabled={isPickup || !isConfigured} onClick={() => setDialogOpen(true)}>
          <Send className="size-3.5" />
          Send to Courier
        </Button>
      </div>

      {dialogOpen && (
        <SendToCourierDialog order={order} onClose={() => setDialogOpen(false)} />
      )}
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-1.5 font-semibold text-text">
        {value}
        {value !== "—" && (
          <button
            type="button"
            aria-label={`Copy ${label}`}
            onClick={() => {
              void navigator.clipboard?.writeText(value)
              toast.success(`${label} copied`)
            }}
            className="text-muted hover:text-text"
          >
            <Copy className="size-3.5" />
          </button>
        )}
      </span>
    </div>
  )
}

/**
 * The last check before an order leaves: the recipient as the courier will see
 * it, editable, because a wrong digit in a phone number is the single most
 * common reason Steadfast rejects a booking.
 */
function SendToCourierDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const sendToCourier = useSendOrderToCourier()
  const [form, setForm] = useState({
    name: order.guest_name ?? "",
    phone: order.guest_phone ?? "",
    address: [order.address_line, order.upazila, order.district, order.division]
      .filter(Boolean)
      .join(", "),
    // What is still owed — a prepaid order is delivered without collecting cash.
    cod: String(order.due_amount ?? order.total ?? 0),
  })
  const [failed, setFailed] = useState<string | null>(null)

  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSend = async () => {
    setFailed(null)
    try {
      const result = await sendToCourier.mutateAsync({
        orderId: order.id,
        recipientName: form.name.trim(),
        recipientPhone: form.phone.trim(),
        recipientAddress: form.address.trim(),
        codAmount: Number(form.cod) || 0,
      })
      toast.success(
        `Sent to Steadfast — consignment ${result.consignment_id}${
          result.tracking_code ? `, tracking ${result.tracking_code}` : ""
        }`,
      )
      onClose()
    } catch (err) {
      // Kept on screen as well as toasted: Steadfast's message is what tells
      // the admin which field to fix before retrying.
      setFailed(getErrorMessage(err, "Couldn't send this order to Steadfast"))
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Send {order.order_number} to Steadfast</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block">Recipient name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Phone</Label>
            <Input
              value={form.phone}
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Delivery address</Label>
            <textarea
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              rows={3}
              className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-base text-text outline-none sm:text-sm"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Amount to collect (COD)</Label>
            <Input
              type="number"
              min="0"
              value={form.cod}
              onChange={(e) => set("cod", e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted">
              Order total {formatBDT(order.total)} · already paid {formatBDT(order.paid_amount)}. Send 0
              if nothing is to be collected on delivery.
            </p>
          </div>

          {failed && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[12.5px] text-red-500">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                {failed}
                <br />
                <b>The order was not sent.</b> Fix the details above and try again.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sendToCourier.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendToCourier.isPending}>
            {sendToCourier.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send className="size-4" /> {failed ? "Retry" : "Confirm & Send"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
