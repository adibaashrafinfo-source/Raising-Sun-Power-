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
  type QuotationLine,
  printQuotation,
  quotationTotals,
} from "@/lib/quotation"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import type { Lead } from "@/types/database"

/** Lets the sales team price a wholesale enquiry and hand the buyer a PDF. */
export function QuotationBuilderDialog({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()

  const seedLines: QuotationLine[] =
    lead.interested_products && lead.interested_products.length
      ? lead.interested_products.map((name) => ({ product_name: name, qty: 1, unit_price: 0 }))
      : [{ product_name: "", qty: 1, unit_price: 0 }]
  const [lines, setLines] = useState<QuotationLine[]>(seedLines)
  const [fees, setFees] = useState({
    service_charge: "0",
    installation_charge: "0",
    delivery_cost: "0",
    other_charges: "0",
    discount: "0",
  })
  const [notes, setNotes] = useState(
    "Delivery charge is included where listed. Prices valid for 14 days.",
  )
  const [printing, setPrinting] = useState(false)

  const feeNumbers = {
    service_charge: Number(fees.service_charge) || 0,
    installation_charge: Number(fees.installation_charge) || 0,
    delivery_cost: Number(fees.delivery_cost) || 0,
    other_charges: Number(fees.other_charges) || 0,
    discount: Number(fees.discount) || 0,
  }
  const { subtotal, total } = quotationTotals({ lines, fees: feeNumbers })

  const updateLine = (index: number, patch: Partial<QuotationLine>) =>
    setLines((ls) => ls.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  const removeLine = (index: number) => setLines((ls) => ls.filter((_, i) => i !== index))
  const addLine = () => setLines((ls) => [...ls, { product_name: "", qty: 1, unit_price: 0 }])

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
        customer: {
          name: lead.name,
          phone: lead.phone,
          // interested_products carries no company name, so the sales team
          // takes it from the admin-notes field when a lead has one.
          company: null,
          location: lead.location ?? null,
        },
        lines: validLines,
        fees: feeNumbers,
        notes: notes.trim() || undefined,
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
      <DialogContent className="max-h-[85vh] max-w-[720px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quotation for {lead.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border">
            <div className="grid grid-cols-[1fr_72px_120px_120px_34px] gap-2 border-b border-border bg-surface-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit price</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            {lines.map((line, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_72px_120px_120px_34px] items-center gap-2 border-b border-border px-3 py-2 last:border-0"
              >
                <Input
                  value={line.product_name}
                  onChange={(e) => updateLine(i, { product_name: e.target.value })}
                  placeholder="Product or service"
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

          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
            <div>
              <div className="text-xs text-muted">Subtotal {formatBDT(subtotal)}</div>
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
