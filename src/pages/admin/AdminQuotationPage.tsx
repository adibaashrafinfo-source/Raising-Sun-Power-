import { useState } from "react"
import { ArrowLeft, FileDown, FileText, Loader2, Receipt, Save, Trash2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { QuotationProductList } from "@/components/admin/QuotationProductList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuotation, useSaveQuotation } from "@/hooks/use-quotations"
import { useSettings } from "@/hooks/use-checkout"
import { useSiteContent } from "@/hooks/use-site-content"
import { invoiceMetaFrom } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import { type QuotationLine, lineFromProduct, printQuotation, quotationTotals } from "@/lib/quotation"
import {
  newQuotationNumber,
  QUOTATION_STATUSES,
  type QuotationDraft,
  type QuotationRecord,
  type QuotationStatus,
} from "@/lib/queries/quotations"
import { formatBDT, getErrorMessage } from "@/lib/utils"

const DEFAULT_TERMS =
  "Warranty : as stated against each item above.\nWork completed : within the timeline agreed with the customer."

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-sm text-text outline-none"

type Line = QuotationLine & { key: string }

const today = () => new Date().toISOString().slice(0, 10)
const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
const withKeys = (lines: QuotationLine[]): Line[] => lines.map((l, i) => ({ ...l, key: `l-${i}-${Date.now()}` }))
const num = (v: number) => (v ? String(v) : "")

/** Opens a saved quotation, or starts a new one — for a customer who phoned in a requirement. */
export default function AdminQuotationPage() {
  const { id } = useParams<{ id: string }>()
  const { data: record, isLoading } = useQuotation(id)

  if (id && isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />
  }
  if (id && !record) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
        That quotation doesn't exist (or you don't have access).{" "}
        <Link to="/admin/quotations" className="font-semibold text-blue">
          Back to quotations
        </Link>
      </div>
    )
  }
  // Keyed so switching between quotations resets the form to the new record.
  return <QuotationEditor key={record?.id ?? "new"} record={record ?? null} />
}

function QuotationEditor({ record }: { record: QuotationRecord | null }) {
  const navigate = useNavigate()
  const save = useSaveQuotation()
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()

  const [number, setNumber] = useState(record?.number ?? newQuotationNumber)
  const [quoteDate, setQuoteDate] = useState(record?.quote_date ?? today())
  const [validUntil, setValidUntil] = useState(record?.valid_until ?? "")
  const [status, setStatus] = useState<QuotationStatus>(record?.status ?? "draft")
  const [customer, setCustomer] = useState(
    record?.customer ?? { name: "", phone: "", email: "", company: "", location: "" },
  )
  const [lines, setLines] = useState<Line[]>(() => withKeys(record?.lines ?? []))
  const [fees, setFees] = useState({
    service: num(record?.fees?.service_charge ?? 0),
    installation: num(record?.fees?.installation_charge ?? 0),
    delivery: num(record?.fees?.delivery_cost ?? 0),
    other: num(record?.fees?.other_charges ?? 0),
    discount: num(record?.fees?.discount ?? 0),
  })
  const [vatRate, setVatRate] = useState(num(record?.vat_percent ?? 0))
  const [notes, setNotes] = useState(record?.notes ?? "")
  const [terms, setTerms] = useState(record ? (record.terms ?? "") : DEFAULT_TERMS)
  const [printing, setPrinting] = useState(false)

  const feeNumbers = {
    service_charge: Number(fees.service) || 0,
    installation_charge: Number(fees.installation) || 0,
    delivery_cost: Number(fees.delivery) || 0,
    other_charges: Number(fees.other) || 0,
    discount: Number(fees.discount) || 0,
  }
  const vat = Number(vatRate) || 0
  const { subtotal, total } = quotationTotals({ lines, fees: feeNumbers, vatRate: vat })

  const updateLine = (key: string, patch: Partial<QuotationLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const plainLines = () => lines.map(({ key: _key, ...line }) => line)

  const validate = () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      toast.error("Customer name and phone are required.")
      return false
    }
    if (lines.length === 0) {
      toast.error("Add at least one product.")
      return false
    }
    if (!number.trim()) {
      toast.error("Quotation number is required.")
      return false
    }
    return true
  }

  const draft = (): QuotationDraft => ({
    number,
    quoteDate,
    validUntil,
    status,
    customer,
    lines: plainLines(),
    fees: feeNumbers,
    vatPercent: vat,
    notes,
    terms,
  })

  /** Saves and returns the stored record, or null after showing why it couldn't. */
  const persist = async (): Promise<QuotationRecord | null> => {
    if (!validate()) return null
    try {
      return await save.mutateAsync({ draft: draft(), id: record?.id })
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save the quotation."))
      return null
    }
  }

  const print = async () => {
    if (!validate()) return
    setPrinting(true)
    try {
      await printQuotation({
        ref: number,
        date: longDate(quoteDate),
        validUntil: validUntil ? longDate(validUntil) : undefined,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim() || null,
          company: customer.company.trim() || null,
          location: customer.location.trim() || null,
        },
        lines: plainLines(),
        fees: feeNumbers,
        vatRate: vat,
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
        meta: { ...invoiceMetaFrom(settings, cms), offices: officesFrom(cms) },
      })
      toast.success("Quotation opened — use Save as PDF in the print dialog.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't build the quotation."))
    } finally {
      setPrinting(false)
    }
  }

  const onSave = async () => {
    const saved = await persist()
    if (!saved) return
    toast.success(`Quotation ${saved.number} saved`)
    if (!record) navigate(`/admin/quotations/${saved.id}`, { replace: true })
  }

  const onSaveAndDownload = async () => {
    const saved = await persist()
    if (!saved) return
    toast.success(`Quotation ${saved.number} saved`)
    await print()
    if (!record) navigate(`/admin/quotations/${saved.id}`, { replace: true })
  }

  const onConvert = async () => {
    const saved = await persist()
    if (!saved) return
    navigate("/admin/invoices/new", { state: { quotation: saved } })
  }

  const busy = save.isPending || printing

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/quotations" className="mb-1 inline-flex items-center gap-1 text-[13px] font-semibold text-blue no-underline">
            <ArrowLeft className="size-3.5" /> All quotations
          </Link>
          <h1 className="font-heading text-2xl font-extrabold text-text">{record ? "Edit Quotation" : "New Quotation"}</h1>
          <p className="mt-0.5 text-sm text-muted">
            Pick products from the catalogue, add the customer, then save and download the PDF.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-4">
          <div>
            <Label className="mb-1.5 block">Number</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Date</Label>
            <Input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Valid until</Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as QuotationStatus)} className={selectClass}>
              {QUOTATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-heading text-base font-bold text-text">Customer</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name *" value={customer.name} onChange={(v) => setCustomer((c) => ({ ...c, name: v }))} />
            <Field label="Phone *" value={customer.phone} onChange={(v) => setCustomer((c) => ({ ...c, phone: v }))} />
            <Field label="Email" value={customer.email} onChange={(v) => setCustomer((c) => ({ ...c, email: v }))} />
            <Field label="Company" value={customer.company} onChange={(v) => setCustomer((c) => ({ ...c, company: v }))} />
            <div className="sm:col-span-2">
              <Field label="Address" value={customer.location} onChange={(v) => setCustomer((c) => ({ ...c, location: v }))} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-heading text-base font-bold text-text">Products</h2>
          <QuotationProductList
            onPick={(product) =>
              setLines((ls) => [...ls, { ...lineFromProduct(product), key: `${product.id}-${Date.now()}` }])
            }
          />
        </section>
      </div>

      <section className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[1fr_70px_110px_110px_34px] gap-2 border-b border-border bg-surface-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <span>Item</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          {lines.length === 0 && <p className="p-6 text-center text-sm text-muted">Click a product above to add it.</p>}
          {lines.map((line) => (
            <div key={line.key} className="border-b border-border px-3 py-2 last:border-0">
              <div className="grid grid-cols-[1fr_70px_110px_110px_34px] items-center gap-2">
                <div className="min-w-0 truncate text-sm font-medium text-text">{line.product_name}</div>
                <Input type="number" min="1" value={line.qty} className="text-right" onChange={(e) => updateLine(line.key, { qty: Number(e.target.value) || 0 })} />
                <Input type="number" min="0" value={line.unit_price} className="text-right" onChange={(e) => updateLine(line.key, { unit_price: Number(e.target.value) || 0 })} />
                <span className="text-right text-sm font-semibold tabular-nums text-text">{formatBDT(line.qty * line.unit_price)}</span>
                <button type="button" aria-label="Remove line" onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))} className="text-muted hover:text-red-500">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Input value={line.warranty ?? ""} onChange={(e) => updateLine(line.key, { warranty: e.target.value })} placeholder="Official Warranty" aria-label="Official Warranty" />
                <Input value={line.service_warranty ?? ""} onChange={(e) => updateLine(line.key, { service_warranty: e.target.value })} placeholder="Official Service Warranty" aria-label="Official Service Warranty" />
                <Input value={line.replacement_warranty ?? ""} onChange={(e) => updateLine(line.key, { replacement_warranty: e.target.value })} placeholder="Official Replacement Warranty" aria-label="Official Replacement Warranty" />
                <Input value={line.sreda_serial ?? ""} onChange={(e) => updateLine(line.key, { sreda_serial: e.target.value })} placeholder="SREDA serial no." aria-label="SREDA serial number" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Field label="Service charge (৳)" type="number" value={fees.service} onChange={(v) => setFees((f) => ({ ...f, service: v }))} />
          <Field label="Installation (৳)" type="number" value={fees.installation} onChange={(v) => setFees((f) => ({ ...f, installation: v }))} />
          <Field label="Delivery (৳)" type="number" value={fees.delivery} onChange={(v) => setFees((f) => ({ ...f, delivery: v }))} />
          <Field label="Other charges (৳)" type="number" value={fees.other} onChange={(v) => setFees((f) => ({ ...f, other: v }))} />
          <Field label="Special discount (৳)" type="number" value={fees.discount} onChange={(v) => setFees((f) => ({ ...f, discount: v }))} />
          <Field label="VAT (%)" type="number" value={vatRate} onChange={setVatRate} />
        </div>
        <div className="mt-3">
          <Field label="Notes (printed on the quotation)" value={notes} onChange={setNotes} />
        </div>
        <div className="mt-3">
          <Label className="mb-1.5 block">Terms &amp; conditions</Label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none"
          />
        </div>
      </section>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
        <div>
          <div className="text-xs text-muted">Subtotal {formatBDT(subtotal)}</div>
          <div className="font-heading text-lg font-extrabold text-text">Total {formatBDT(total)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onConvert} disabled={busy}>
            <Receipt className="size-4" /> Convert to invoice
          </Button>
          <Button variant="outline" onClick={print} disabled={busy}>
            <FileText className="size-4" /> PDF only
          </Button>
          <Button variant="outline" onClick={onSave} disabled={busy}>
            <Save className="size-4" /> Save
          </Button>
          <Button onClick={onSaveAndDownload} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            Save &amp; download PDF
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input type={type} min={type === "number" ? "0" : undefined} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
