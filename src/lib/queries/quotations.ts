import { type QuotationFees, type QuotationLine, quotationTotals } from "@/lib/quotation"
import { supabase } from "@/lib/supabase"

export const QUOTATION_STATUSES = ["draft", "sent", "accepted", "rejected", "converted"] as const
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number]

export type QuotationCustomer = {
  name: string
  phone: string
  email: string
  company: string
  location: string
}

export type QuotationRecord = {
  id: string
  number: string
  quote_date: string
  valid_until: string | null
  status: QuotationStatus
  customer: QuotationCustomer
  lines: QuotationLine[]
  fees: QuotationFees
  vat_percent: number
  notes: string | null
  terms: string | null
  subtotal: number
  total: number
  invoice_id: string | null
  created_at: string
  updated_at: string
}

export type QuotationDraft = {
  number: string
  quoteDate: string
  validUntil: string
  status: QuotationStatus
  customer: QuotationCustomer
  lines: QuotationLine[]
  fees: QuotationFees
  vatPercent: number
  notes: string
  terms: string
}

export function newQuotationNumber(): string {
  const d = new Date()
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `QT-${stamp}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
}

export async function fetchQuotations(): Promise<QuotationRecord[]> {
  const { data, error } = await supabase.from("quotations").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as QuotationRecord[]
}

export async function fetchQuotation(id: string): Promise<QuotationRecord | null> {
  const { data, error } = await supabase.from("quotations").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data as unknown as QuotationRecord | null
}

/** Inserts a new quotation, or updates the one with `id`. Totals are recomputed here so they always match the PDF. */
export async function saveQuotation(draft: QuotationDraft, id?: string): Promise<QuotationRecord> {
  const { subtotal, total } = quotationTotals({ lines: draft.lines, fees: draft.fees, vatRate: draft.vatPercent })
  const row = {
    number: draft.number.trim(),
    quote_date: draft.quoteDate,
    valid_until: draft.validUntil || null,
    status: draft.status,
    customer: draft.customer,
    lines: draft.lines,
    fees: draft.fees,
    vat_percent: draft.vatPercent,
    notes: draft.notes.trim() || null,
    terms: draft.terms.trim() || null,
    subtotal,
    total,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    const { data, error } = await supabase.from("quotations").update(row).eq("id", id).select("*").maybeSingle()
    if (error) throw error
    if (!data) throw new Error("Nothing was saved — you may not have permission to edit this quotation.")
    return data as unknown as QuotationRecord
  }

  const { data: auth } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("quotations")
    .insert({ ...row, created_by: auth.user?.id ?? null })
    .select("*")
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error("Nothing was saved — you may not have permission to create quotations.")
  return data as unknown as QuotationRecord
}

export async function setQuotationStatus(id: string, status: QuotationStatus, invoiceId?: string): Promise<void> {
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (invoiceId) patch.invoice_id = invoiceId
  const { data, error } = await supabase.from("quotations").update(patch).eq("id", id).select("id")
  if (error) throw error
  if (!data || data.length === 0) throw new Error("Nothing was updated — you may not have permission.")
}

export async function deleteQuotation(id: string): Promise<void> {
  const { data, error } = await supabase.from("quotations").delete().eq("id", id).select("id")
  if (error) throw error
  if (!data || data.length === 0) throw new Error("Nothing was deleted — you may not have permission.")
}
