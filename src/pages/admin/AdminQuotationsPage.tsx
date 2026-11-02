import { useState } from "react"
import { Copy, FileDown, Pencil, Plus, Receipt, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteQuotation, useQuotations, useSaveQuotation, useSetQuotationStatus } from "@/hooks/use-quotations"
import { useSettings } from "@/hooks/use-checkout"
import { useSiteContent } from "@/hooks/use-site-content"
import { invoiceMetaFrom } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import { printSavedQuotation } from "@/lib/quotation-print"
import {
  newQuotationNumber,
  QUOTATION_STATUSES,
  type QuotationRecord,
  type QuotationStatus,
} from "@/lib/queries/quotations"
import { formatBDT, getErrorMessage } from "@/lib/utils"

const STATUS_TONE: Record<QuotationStatus, string> = {
  draft: "bg-surface-3 text-muted",
  sent: "bg-blue/10 text-blue",
  accepted: "bg-green-500/15 text-green-600",
  rejected: "bg-red-500/10 text-red-500",
  converted: "bg-orange-500/15 text-orange-500",
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

/** Every saved quotation: open, change status, download, duplicate, turn into an invoice. */
export default function AdminQuotationsPage() {
  const navigate = useNavigate()
  const { data: quotations = [], isLoading, error } = useQuotations()
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()
  const setStatus = useSetQuotationStatus()
  const remove = useDeleteQuotation()
  const save = useSaveQuotation()
  const [filter, setFilter] = useState<"all" | QuotationStatus>("all")
  const [search, setSearch] = useState("")

  const q = search.trim().toLowerCase()
  const shown = quotations.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!q ||
        r.number.toLowerCase().includes(q) ||
        r.customer.name.toLowerCase().includes(q) ||
        r.customer.phone.includes(q) ||
        (r.customer.company ?? "").toLowerCase().includes(q)),
  )

  const open = quotations.filter((r) => r.status === "draft" || r.status === "sent")
  const accepted = quotations.filter((r) => r.status === "accepted" || r.status === "converted")
  const sum = (list: QuotationRecord[]) => list.reduce((s, r) => s + Number(r.total), 0)

  const changeStatus = async (record: QuotationRecord, status: QuotationStatus) => {
    try {
      await setStatus.mutateAsync({ id: record.id, status })
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't change the status"))
    }
  }

  const download = async (record: QuotationRecord) => {
    try {
      await printSavedQuotation(record, { ...invoiceMetaFrom(settings, cms), offices: officesFrom(cms) })
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't build the quotation"))
    }
  }

  const duplicate = async (record: QuotationRecord) => {
    try {
      const copy = await save.mutateAsync({
        draft: {
          number: newQuotationNumber(),
          quoteDate: new Date().toISOString().slice(0, 10),
          validUntil: "",
          status: "draft",
          customer: record.customer,
          lines: record.lines,
          fees: record.fees,
          vatPercent: Number(record.vat_percent) || 0,
          notes: record.notes ?? "",
          terms: record.terms ?? "",
        },
      })
      toast.success(`Copied as ${copy.number}`)
      navigate(`/admin/quotations/${copy.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't duplicate the quotation"))
    }
  }

  const del = async (record: QuotationRecord) => {
    if (!window.confirm(`Delete quotation ${record.number}? This can't be undone.`)) return
    try {
      await remove.mutateAsync(record.id)
      toast.success("Quotation deleted")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the quotation"))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Quotations</h1>
        <Button asChild>
          <Link to="/admin/quotations/new">
            <Plus className="size-4" /> New Quotation
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Quoted (all)" value={formatBDT(sum(quotations))} />
        <Stat label={`Waiting (${open.length})`} value={formatBDT(sum(open))} />
        <Stat label={`Won (${accepted.length})`} value={formatBDT(sum(accepted))} tone="text-green-600" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...QUOTATION_STATUSES] as const).map((f) => (
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
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-500">
            {getErrorMessage(error, "Couldn't load quotations")} — has rsp_quotations_invoices.sql been run?
          </p>
        ) : shown.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            {quotations.length === 0 ? "No quotations yet — create the first one." : "No quotations match."}
          </p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Quotation</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Valid until</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const expired =
                  !!r.valid_until && r.valid_until < new Date().toISOString().slice(0, 10) && (r.status === "draft" || r.status === "sent")
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                    <td className="px-4 py-3 font-semibold text-text">
                      <Link to={`/admin/quotations/${r.id}`} className="text-text no-underline hover:text-orange-500">
                        {r.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{fmtDate(r.quote_date)}</td>
                    <td className="px-4 py-3">
                      <div className="text-text">{r.customer.name}</div>
                      <div className="text-xs text-muted">{r.customer.company || r.customer.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatBDT(Number(r.total))}</td>
                    <td className={`px-4 py-3 ${expired ? "font-semibold text-red-500" : "text-muted"}`}>
                      {r.valid_until ? fmtDate(r.valid_until) : "—"}
                      {expired && " (expired)"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => changeStatus(r, e.target.value as QuotationStatus)}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold capitalize outline-none ${STATUS_TONE[r.status]}`}
                        aria-label={`Status of ${r.number}`}
                      >
                        {QUOTATION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <IconButton label="Edit" onClick={() => navigate(`/admin/quotations/${r.id}`)}>
                          <Pencil className="size-3.5" />
                        </IconButton>
                        <IconButton label="Download PDF" onClick={() => download(r)}>
                          <FileDown className="size-3.5" />
                        </IconButton>
                        <IconButton label="Duplicate" onClick={() => duplicate(r)}>
                          <Copy className="size-3.5" />
                        </IconButton>
                        <IconButton
                          label={r.invoice_id ? "Already converted" : "Convert to invoice"}
                          disabled={!!r.invoice_id}
                          onClick={() => navigate("/admin/invoices/new", { state: { quotation: r } })}
                        >
                          <Receipt className="size-3.5" />
                        </IconButton>
                        <IconButton label="Delete" onClick={() => del(r)} danger>
                          <Trash2 className="size-3.5" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
  danger,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={danger ? "text-red-500" : undefined}
    >
      {children}
    </Button>
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
