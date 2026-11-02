import { useState } from "react"
import { FileDown, Plus, Wallet } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminInvoices } from "@/hooks/use-admin"
import { useSettings } from "@/hooks/use-checkout"
import { useSiteContent } from "@/hooks/use-site-content"
import { invoiceMetaFrom, printInvoice } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import { fetchOrderPayments } from "@/lib/queries/admin"
import { fetchOrderItems } from "@/lib/queries/checkout"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import { RecordOrderPaymentDialog } from "@/pages/admin/AdminOrdersPage"
import type { Order } from "@/types/database"

const STATUS_VARIANT = { due: "neutral", partial: "gold", paid: "green" } as const
const FILTERS = ["all", "due", "partial", "paid"] as const

/** Invoices raised from the admin panel: what is owed, what is collected, and the PDF for each. */
export default function AdminInvoicesPage() {
  const { data: invoices = [], isLoading } = useAdminInvoices()
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all")
  const [search, setSearch] = useState("")
  const [collecting, setCollecting] = useState<Order | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const q = search.trim().toLowerCase()
  const shown = invoices.filter(
    (o) =>
      (filter === "all" || o.payment_status === filter) &&
      (!q || o.order_number.toLowerCase().includes(q) || o.guest_name.toLowerCase().includes(q) || o.guest_phone.includes(q)),
  )

  const invoiced = invoices.reduce((s, o) => s + Number(o.total), 0)
  const collected = invoices.reduce((s, o) => s + Number(o.paid_amount), 0)
  const outstanding = invoices.reduce((s, o) => s + Number(o.due_amount), 0)

  const download = async (order: Order) => {
    setDownloading(order.id)
    try {
      const [items, payments] = await Promise.all([fetchOrderItems(order.id), fetchOrderPayments(order.id)])
      await printInvoice(order, items, { ...invoiceMetaFrom(settings, cms), offices: officesFrom(cms) }, payments)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't build the invoice"))
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Invoices</h1>
        <Button asChild>
          <Link to="/admin/invoices/new">
            <Plus className="size-4" /> New Invoice
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Invoiced" value={formatBDT(invoiced)} />
        <Stat label="Collected" value={formatBDT(collected)} tone="text-green-600" />
        <Stat label="Outstanding" value={formatBDT(outstanding)} tone={outstanding > 0 ? "text-red-500" : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === f ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border text-muted"
            }`}
          >
            {f}
          </button>
        ))}
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search number, name, phone…" className="max-w-[260px]" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : shown.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            {invoices.length === 0 ? "No invoices yet — create the first one." : "No invoices match."}
          </p>
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                <th className="px-4 py-3 text-right font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{order.order_number}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-text">{order.guest_name}</div>
                    <div className="text-xs text-muted">{order.guest_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatBDT(Number(order.total))}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-green-600">{formatBDT(Number(order.paid_amount))}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${Number(order.due_amount) > 0 ? "text-red-500" : "text-muted"}`}>
                    {formatBDT(Number(order.due_amount))}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[order.payment_status]}>{order.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" disabled={Number(order.due_amount) <= 0} onClick={() => setCollecting(order)}>
                        <Wallet className="size-3.5" /> Collect
                      </Button>
                      <Button variant="outline" size="sm" disabled={downloading === order.id} onClick={() => download(order)}>
                        <FileDown className="size-3.5" /> {downloading === order.id ? "…" : "PDF"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {collecting && <RecordOrderPaymentDialog order={collecting} onClose={() => setCollecting(null)} />}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-heading text-xl font-extrabold tabular-nums ${tone ?? "text-text"}`}>{value}</div>
    </div>
  )
}
