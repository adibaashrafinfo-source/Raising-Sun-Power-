import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Ban, FileDown, Pencil, Plus, Receipt, Wallet } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminInvoices, useUpdateOrderStatus } from "@/hooks/use-admin"
import { useSettings } from "@/hooks/use-checkout"
import { useSiteContent } from "@/hooks/use-site-content"
import { invoiceMetaFrom, printInvoice, printReceipt } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import { fetchOrderPayments } from "@/lib/queries/admin"
import { fetchOrderItems } from "@/lib/queries/checkout"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import { RecordOrderPaymentDialog } from "@/pages/admin/AdminOrdersPage"
import type { CustomerPayment, Order } from "@/types/database"

const STATUS_VARIANT = { due: "neutral", partial: "gold", paid: "green" } as const

const isOverdue = (o: Order) =>
  o.status !== "cancelled" && Number(o.due_amount) > 0 && !!o.due_date && new Date(o.due_date).getTime() < Date.now() - 86_400_000
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
  const [receiptsFor, setReceiptsFor] = useState<Order | null>(null)
  const navigate = useNavigate()
  const setStatus = useUpdateOrderStatus()

  const cancelInvoice = async (order: Order) => {
    if (!window.confirm(`Cancel invoice ${order.order_number}? Stock taken by it is returned. Payments already collected stay on record.`)) return
    try {
      await setStatus.mutateAsync({ id: order.id, status: "cancelled" })
      toast.success(`Invoice ${order.order_number} cancelled`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't cancel the invoice"))
    }
  }

  const q = search.trim().toLowerCase()
  const shown = invoices.filter(
    (o) =>
      (filter === "all" || o.payment_status === filter) &&
      (!q || o.order_number.toLowerCase().includes(q) || o.guest_name.toLowerCase().includes(q) || o.guest_phone.includes(q)),
  )

  const live = invoices.filter((o) => o.status !== "cancelled")
  const invoiced = live.reduce((s, o) => s + Number(o.total), 0)
  const collected = live.reduce((s, o) => s + Number(o.paid_amount), 0)
  const outstanding = live.reduce((s, o) => s + Number(o.due_amount), 0)
  const overdueCount = live.filter(isOverdue).length

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat label="Invoiced" value={formatBDT(invoiced)} />
        <Stat label="Collected" value={formatBDT(collected)} tone="text-green-600" />
        <Stat label="Outstanding" value={formatBDT(outstanding)} tone={outstanding > 0 ? "text-red-500" : undefined} />
        <Stat label="Overdue invoices" value={String(overdueCount)} tone={overdueCount > 0 ? "text-red-500" : undefined} />
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
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Due date</th>
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
                  <td className={`px-4 py-3 ${isOverdue(order) ? "font-semibold text-red-500" : "text-muted"}`}>
                    {order.due_date ? new Date(order.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    {isOverdue(order) && <div className="text-[11px]">overdue</div>}
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
                    {order.status === "cancelled" ? (
                      <Badge variant="neutral">cancelled</Badge>
                    ) : (
                      <Badge variant={STATUS_VARIANT[order.payment_status]}>{order.payment_status}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" disabled={Number(order.due_amount) <= 0 || order.status === "cancelled"} onClick={() => setCollecting(order)}>
                        <Wallet className="size-3.5" /> Collect
                      </Button>
                      <Button variant="outline" size="sm" disabled={downloading === order.id} onClick={() => download(order)}>
                        <FileDown className="size-3.5" /> {downloading === order.id ? "…" : "PDF"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setReceiptsFor(order)} aria-label="Receipts">
                        <Receipt className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/invoices/${order.id}/edit`)} aria-label="Edit invoice">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={order.status === "cancelled"} onClick={() => cancelInvoice(order)} aria-label="Cancel invoice">
                        <Ban className="size-3.5" />
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
      {receiptsFor && (
        <ReceiptsDialog order={receiptsFor} meta={{ ...invoiceMetaFrom(settings, cms), offices: officesFrom(cms) }} onClose={() => setReceiptsFor(null)} />
      )}
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

/** Every payment collected against an invoice, each with a printable money receipt. */
function ReceiptsDialog({ order, meta, onClose }: { order: Order; meta: ReturnType<typeof invoiceMetaFrom>; onClose: () => void }) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["order-payments", order.id],
    queryFn: () => fetchOrderPayments(order.id),
  })

  // payments arrive newest first; balance after each = total − everything paid up to and including it.
  const chronological = [...(payments ?? [])].reverse()
  let running = 0
  const balances = new Map<string, number>()
  for (const p of chronological) {
    running += Number(p.amount)
    balances.set(p.id, Number(order.total) - running)
  }

  const print = (p: CustomerPayment) =>
    printReceipt(order, p, meta, balances.get(p.id) ?? 0).catch((err) => toast.error(getErrorMessage(err, "Couldn't build the receipt")))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-lg font-bold text-text">Receipts — {order.order_number}</h2>
        <div className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
          {isLoading && <Skeleton className="h-16 w-full" />}
          {!isLoading && (payments ?? []).length === 0 && <p className="py-4 text-center text-sm text-muted">No payments collected yet.</p>}
          {(payments ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
              <div className="text-sm">
                <div className="font-semibold text-text">{formatBDT(Number(p.amount))}</div>
                <div className="text-xs capitalize text-muted">
                  {new Date(p.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {p.payment_method}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => print(p)}>
                <FileDown className="size-3.5" /> Receipt
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
