import type { InvoiceMeta } from "@/lib/invoice"
import type { Office } from "@/lib/offices"
import { printQuotation } from "@/lib/quotation"
import type { QuotationRecord } from "@/lib/queries/quotations"

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

/** Opens the print dialog for a saved quotation, exactly as it was saved. */
export function printSavedQuotation(record: QuotationRecord, meta: InvoiceMeta & { offices: Office[] }) {
  return printQuotation({
    ref: record.number,
    date: longDate(record.quote_date),
    validUntil: record.valid_until ? longDate(record.valid_until) : undefined,
    customer: {
      name: record.customer.name,
      phone: record.customer.phone,
      email: record.customer.email || null,
      company: record.customer.company || null,
      location: record.customer.location || null,
    },
    lines: record.lines,
    fees: record.fees,
    vatRate: Number(record.vat_percent) || 0,
    notes: record.notes ?? undefined,
    terms: record.terms ?? undefined,
    meta,
  })
}
