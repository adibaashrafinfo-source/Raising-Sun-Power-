import { useState } from "react"
import { FileDown, Loader2, Plus, Trash2 } from "lucide-react"
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
import { useSettings } from "@/hooks/use-checkout"
import { useSiteContent } from "@/hooks/use-site-content"
import { invoiceMetaFrom } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import {
  PROJECT_CATEGORIES,
  PROJECT_SYSTEM_TYPES,
  type QuotationLine,
  paymentTermLine,
  printQuotation,
  quotationTotals,
} from "@/lib/quotation"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import type { Lead } from "@/types/database"

const DEFAULT_TERMS =
  "Warranty : as stated against each item above.\nWork completed : within the timeline agreed with the customer."

/** Lets the sales team price a wholesale enquiry and hand the buyer a PDF. */
export function QuotationBuilderDialog({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()

  const seedLines: QuotationLine[] =
    lead.interested_products && lead.interested_products.length
      ? lead.interested_products.map((name) => ({ product_name: name, qty: 1, unit_price: 0, unit: "pcs" }))
      : [{ product_name: "", qty: 1, unit_price: 0, unit: "pcs" }]
  const [lines, setLines] = useState<QuotationLine[]>(seedLines)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [fees, setFees] = useState({
    service_charge: "0",
    installation_charge: "0",
    delivery_cost: "0",
    other_charges: "0",
    discount: "0",
  })
  const [vatRate, setVatRate] = useState("0")
  const [email, setEmail] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [project, setProject] = useState({ category: "", systemType: "", sizeKw: "", site: "" })
  const [showSavings, setShowSavings] = useState(false)
  const [savings, setSavings] = useState({ advancePercent: "40", sunHours: "5", tariff: "14", tariffLabel: "" })
  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [printing, setPrinting] = useState(false)

  const feeNumbers = {
    service_charge: Number(fees.service_charge) || 0,
    installation_charge: Number(fees.installation_charge) || 0,
    delivery_cost: Number(fees.delivery_cost) || 0,
    other_charges: Number(fees.other_charges) || 0,
    discount: Number(fees.discount) || 0,
  }
  const { subtotal, vat, total } = quotationTotals({ lines, fees: feeNumbers, vatRate: Number(vatRate) || 0 })
  const paymentLine = paymentTermLine(Number(savings.advancePercent) || 0, total)

  const updateLine = (index: number, patch: Partial<QuotationLine>) =>
    setLines((ls) => ls.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  const removeLine = (index: number) => setLines((ls) => ls.filter((_, i) => i !== index))
  const addLine = () => setLines((ls) => [...ls, { product_name: "", qty: 1, unit_price: 0, unit: "pcs" }])

  const handleDownload = async () => {
    const validLines = lines.filter((l) => l.product_name.trim().length > 0)
    if (validLines.length === 0) {
      toast.error("Add at least one item.")
      return
    }
    setPrinting(true)
    try {
      await printQuotation({
        ref: `QT-${lead.ref_id}`,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        validUntil: validUntil
          ? new Date(validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : undefined,
        customer: {
          name: lead.name,
          phone: lead.phone,
          email: email.trim() || null,
          company: null,
          location: lead.location ?? null,
        },
        project: {
          category: project.category || undefined,
          systemType: project.systemType || undefined,
          sizeKw: Number(project.sizeKw) || undefined,
          site: project.site || undefined,
        },
        lines: validLines,
        fees: feeNumbers,
        vatRate: Number(vatRate) || 0,
        savings: {
          show: showSavings,
          advancePercent: Number(savings.advancePercent) || 0,
          sunHoursPerDay: Number(savings.sunHours) || 0,
          tariffPerKwh: Number(savings.tariff) || 0,
          tariffLabel: savings.tariffLabel,
        },
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
        meta: {
          ...invoiceMetaFrom(settings, cms),
          offices: officesFrom(cms),
        },
      })
      toast.success("Quotation opened — use Save as PDF in the print dialog.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't build the quotation."))
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-[760px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quotation for {lead.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 block">Customer email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="optional"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Valid until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-border p-3.5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Project</div>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <select
                  value={project.category}
                  onChange={(e) => setProject((p) => ({ ...p, category: e.target.value }))}
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-sm text-text outline-none"
                >
                  <option value="">Select…</option>
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">System type</Label>
                <select
                  value={project.systemType}
                  onChange={(e) => setProject((p) => ({ ...p, systemType: e.target.value }))}
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-sm text-text outline-none"
                >
                  <option value="">Select…</option>
                  {PROJECT_SYSTEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">Size (kWp)</Label>
                <Input
                  type="number"
                  min="0"
                  value={project.sizeKw}
                  onChange={(e) => setProject((p) => ({ ...p, sizeKw: e.target.value }))}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Site address</Label>
                <Input
                  value={project.site}
                  onChange={(e) => setProject((p) => ({ ...p, site: e.target.value }))}
                  placeholder="If different"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <div className="min-w-[560px] grid grid-cols-[1fr_60px_56px_100px_100px_34px] gap-2 border-b border-border bg-surface-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <span>Item</span>
              <span className="text-right">Unit</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit price</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            {lines.map((line, i) => (
              <div key={i} className="min-w-[560px] border-b border-border px-3 py-2 last:border-0">
                <div className="grid grid-cols-[1fr_60px_56px_100px_100px_34px] items-center gap-2">
                  <Input
                    value={line.product_name}
                    onChange={(e) => updateLine(i, { product_name: e.target.value })}
                    placeholder="Product or service"
                  />
                  <Input
                    value={line.unit ?? ""}
                    onChange={(e) => updateLine(i, { unit: e.target.value })}
                    placeholder="pcs"
                    className="text-right"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={line.qty}
                    onChange={(e) => updateLine(i, { qty: Number(e.target.value) || 0 })}
                    className="text-right"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={line.unit_price}
                    onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) || 0 })}
                    className="text-right"
                  />
                  <span className="text-right text-sm font-semibold text-text tabular-nums">
                    {formatBDT(line.qty * line.unit_price)}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove line"
                    onClick={() => removeLine(i)}
                    className="text-muted hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded((e) => (e === i ? null : i))}
                  className="mt-1.5 text-[12px] font-semibold text-blue"
                >
                  {expanded === i ? "Hide" : "Add"} warranty / SREDA details
                </button>
                {expanded === i && (
                  <div className="mt-2 flex flex-col gap-2">
                    <Input
                      value={line.details ?? ""}
                      onChange={(e) => updateLine(i, { details: e.target.value })}
                      placeholder="Product details (brand, model, specifications)"
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <Input
                        value={line.guarantee ?? ""}
                        onChange={(e) => updateLine(i, { guarantee: e.target.value })}
                        placeholder="Guarantee, e.g. 10 years"
                      />
                      <Input
                        value={line.warranty ?? ""}
                        onChange={(e) => updateLine(i, { warranty: e.target.value })}
                        placeholder="Warranty, e.g. 25 years"
                      />
                      <Input
                        value={line.service_warranty ?? ""}
                        onChange={(e) => updateLine(i, { service_warranty: e.target.value })}
                        placeholder="Service warranty"
                      />
                      <Input
                        value={line.replacement_warranty ?? ""}
                        onChange={(e) => updateLine(i, { replacement_warranty: e.target.value })}
                        placeholder="Replacement warranty"
                      />
                    </div>
                    <Input
                      value={line.sreda_serial ?? ""}
                      onChange={(e) => updateLine(i, { sreda_serial: e.target.value })}
                      placeholder="SREDA enlisted product serial no."
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="px-3 py-2">
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="size-3.5" /> Add line
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            <FeeField
              label="Service charge"
              value={fees.service_charge}
              onChange={(v) => setFees((f) => ({ ...f, service_charge: v }))}
            />
            <FeeField
              label="Installation / commissioning"
              value={fees.installation_charge}
              onChange={(v) => setFees((f) => ({ ...f, installation_charge: v }))}
            />
            <FeeField
              label="Delivery cost"
              value={fees.delivery_cost}
              onChange={(v) => setFees((f) => ({ ...f, delivery_cost: v }))}
            />
            <FeeField
              label="Other charges"
              value={fees.other_charges}
              onChange={(v) => setFees((f) => ({ ...f, other_charges: v }))}
            />
            <FeeField
              label="Discount"
              value={fees.discount}
              onChange={(v) => setFees((f) => ({ ...f, discount: v }))}
            />
            <div>
              <Label className="mb-1.5 block">VAT (%)</Label>
              <Input type="number" min="0" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-border p-3.5">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={showSavings}
                onChange={(e) => setShowSavings(e.target.checked)}
              />
              Show energy &amp; savings overview (needs Size in kWp above)
            </label>
            {showSavings && (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                <div>
                  <Label className="mb-1.5 block">Peak sun hours/day</Label>
                  <Input
                    type="number"
                    min="0"
                    value={savings.sunHours}
                    onChange={(e) => setSavings((s) => ({ ...s, sunHours: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Electricity rate (৳/kWh)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={savings.tariff}
                    onChange={(e) => setSavings((s) => ({ ...s, tariff: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Rate basis</Label>
                  <Input
                    value={savings.tariffLabel}
                    onChange={(e) => setSavings((s) => ({ ...s, tariffLabel: e.target.value }))}
                    placeholder="e.g. Commercial rate"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">Notes (printed on the quotation)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none"
            />
          </div>

          <div>
            <Label className="mb-1.5 block">Terms &amp; conditions</Label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none"
            />
            <div className="mt-2.5 flex flex-wrap items-end gap-3">
              <div className="w-40">
                <Label className="mb-1.5 block">Advance with work order (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={savings.advancePercent}
                  onChange={(e) => setSavings((s) => ({ ...s, advancePercent: e.target.value }))}
                />
              </div>
              <p className="min-w-0 flex-1 pb-2 text-[12.5px] text-muted">
                {paymentLine
                  ? `Added to the terms automatically: ${paymentLine}`
                  : "Set an advance % to add the payment split to the terms."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
            <div>
              <div className="text-xs text-muted">
                Subtotal {formatBDT(subtotal)}
                {vat > 0 ? ` · VAT ${formatBDT(vat)}` : ""}
              </div>
              <div className="font-heading text-lg font-extrabold text-text">
                Total {formatBDT(total)}
              </div>
            </div>
            <span className="text-[11px] text-muted">PDF: use "Save as PDF" in the print dialog.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={printing}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={printing}>
            {printing ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {printing ? "Opening…" : "Download Quotation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label} (৳)</Label>
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
