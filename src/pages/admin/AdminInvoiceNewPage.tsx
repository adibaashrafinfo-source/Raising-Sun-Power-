import { useEffect, useState } from "react"
import { ArrowLeft, FileDown, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { QuotationProductList } from "@/components/admin/QuotationProductList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminInvoices, useCreateAdminInvoice, useUpdateAdminInvoice } from "@/hooks/use-admin"
import { useSetQuotationStatus } from "@/hooks/use-quotations"
import type { QuotationRecord } from "@/lib/queries/quotations"
import { useSettings } from "@/hooks/use-checkout"
import { useSiteContent } from "@/hooks/use-site-content"
import { invoiceMetaFrom, printInvoice } from "@/lib/invoice"
import { officesFrom } from "@/lib/offices"
import { currentPrice } from "@/lib/quotation"
import { fetchOrderItems } from "@/lib/queries/checkout"
import { fetchOrderPayments, invoiceTotals, newInvoiceNumber } from "@/lib/queries/admin"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import type { FinancePaymentMethod } from "@/types/database"

type Line = {
  key: string
  product_id: string | null
  name: string
  qty: number
  unit_price: number
  warranty_months: number | null
  serda_serial_number: string | null
}

const METHODS: { value: FinancePaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank", label: "Bank transfer" },
  { value: "card", label: "Card" },
]

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-sm text-text outline-none"

/** Raise an invoice by hand: customer, products, charges, and the payment collected now. */
export default function AdminInvoiceNewPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const location = useLocation()
  const fromQuotation = (location.state as { quotation?: QuotationRecord } | null)?.quotation ?? null
  const create = useCreateAdminInvoice()
  const update = useUpdateAdminInvoice()
  const setQuoteStatus = useSetQuotationStatus()
  const { data: invoices = [], isLoading: loadingInvoices } = useAdminInvoices()
  const editing = editId ? invoices.find((o) => o.id === editId) ?? null : null
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()

  const [number, setNumber] = useState(newInvoiceNumber)
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", company: "", address: "", area: "" })
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "courier">("pickup")
  const [lines, setLines] = useState<Line[]>([])
  const [custom, setCustom] = useState({ name: "", price: "" })
  const [discount, setDiscount] = useState("")
  const [delivery, setDelivery] = useState("")
  const [vat, setVat] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [pay, setPay] = useState({ amount: "", method: "cash" as FinancePaymentMethod, note: "" })
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [deductStock, setDeductStock] = useState(true)

  // Prefill: from a quotation (convert) or from the invoice being edited.
  useEffect(() => {
    if (editing) {
      setNumber(editing.order_number)
      setCustomer({
        name: editing.guest_name,
        phone: editing.guest_phone,
        email: editing.customer_email ?? "",
        company: editing.customer_company ?? "",
        address: editing.address_line === "—" ? "" : editing.address_line,
        area: editing.district === "—" ? "" : editing.district,
      })
      setDeliveryMethod(editing.delivery_method === "courier" ? "courier" : "pickup")
      setDiscount(Number(editing.discount) ? String(editing.discount) : "")
      setDelivery(Number(editing.delivery_charge) ? String(editing.delivery_charge) : "")
      setVat(Number(editing.vat_percent) ? String(editing.vat_percent) : "")
      setDueDate(editing.due_date ?? "")
      setNotes(editing.notes ?? "")
      fetchOrderItems(editing.id)
        .then((items) =>
          setLines(
            items.map((i) => ({
              key: i.id,
              product_id: i.product_id,
              name: i.product_name,
              qty: Number(i.qty),
              unit_price: Number(i.unit_price),
              warranty_months: i.warranty_months ?? null,
              serda_serial_number: i.serda_serial_number ?? null,
            })),
          ),
        )
        .catch((err) => toast.error(getErrorMessage(err, "Couldn't load the invoice items")))
    } else if (fromQuotation) {
      const q = fromQuotation
      setCustomer({ name: q.customer.name, phone: q.customer.phone, email: q.customer.email ?? "", company: q.customer.company ?? "", address: q.customer.location ?? "", area: "" })
      const extra = (name: string, price: number): Line[] =>
        price > 0 ? [{ key: `x-${name}`, product_id: null, name, qty: 1, unit_price: price, warranty_months: null, serda_serial_number: null }] : []
      setLines([
        ...q.lines.map((l, i) => ({
          key: `q-${i}`,
          product_id: null,
          name: l.product_name,
          qty: l.qty,
          unit_price: l.unit_price,
          warranty_months: null,
          serda_serial_number: l.sreda_serial ?? null,
        })),
        ...extra("Service charge", q.fees.service_charge),
        ...extra("Installation charge", q.fees.installation_charge),
        ...extra("Other charges", q.fees.other_charges),
      ])
      setDelivery(q.fees.delivery_cost ? String(q.fees.delivery_cost) : "")
      setDiscount(q.fees.discount ? String(q.fees.discount) : "")
      setVat(q.vat_percent ? String(q.vat_percent) : "")
      setNotes([q.notes, q.terms].filter(Boolean).join("\n\n"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id, fromQuotation?.id])

  const totals = invoiceTotals({
    lines,
    discount: Number(discount) || 0,
    delivery: Number(delivery) || 0,
    vatPercent: Number(vat) || 0,
  })
  const paying = Number(pay.amount) || 0
  const editingBalance = Math.max(totals.total - (editing ? Number(editing.paid_amount) : paying), 0)

  const updateLine = (key: string, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const addCustom = () => {
    const price = Number(custom.price)
    if (!custom.name.trim() || !(price >= 0) || custom.price === "") {
      toast.error("Give the item a name and a price.")
      return
    }
    setLines((ls) => [
      ...ls,
      { key: `c-${Date.now()}`, product_id: null, name: custom.name.trim(), qty: 1, unit_price: price, warranty_months: null, serda_serial_number: null },
    ])
    setCustom({ name: "", price: "" })
  }

  const submit = async (andDownload: boolean) => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      toast.error("Customer name and phone are required.")
      return
    }
    if (!number.trim()) {
      toast.error("Invoice number is required.")
      return
    }
    if (lines.length === 0 || lines.some((l) => l.qty <= 0)) {
      toast.error("Add at least one item, each with a quantity.")
      return
    }
    if (paying > totals.total) {
      toast.error("The payment can't be more than the invoice total.")
      return
    }
    try {
      const input = {
        number,
        customer,
        lines,
        discount: Number(discount) || 0,
        delivery: Number(delivery) || 0,
        vatPercent: Number(vat) || 0,
        dueDate,
        notes,
        deliveryMethod,
        payment: paying > 0 ? { amount: paying, method: pay.method, date: payDate, note: pay.note } : null,
        deductStock,
      }
      let order: Awaited<ReturnType<typeof create.mutateAsync>>["order"]
      let warning: string | null = null
      if (editing) {
        order = await update.mutateAsync({ order: editing, input })
        toast.success(`Invoice ${order.order_number} updated`)
      } else {
        ;({ order, warning } = await create.mutateAsync(input))
        toast.success(`Invoice ${order.order_number} created`)
        if (fromQuotation) {
          await setQuoteStatus
            .mutateAsync({ id: fromQuotation.id, status: "converted", invoiceId: order.id })
            .catch(() => toast.warning("Invoice created, but the quotation couldn't be marked converted."))
        }
      }
      if (warning) toast.warning(warning, { duration: 9000 })
      if (andDownload) {
        const [items, payments] = await Promise.all([fetchOrderItems(order.id), fetchOrderPayments(order.id)])
        await printInvoice(order, items, { ...invoiceMetaFrom(settings, cms), offices: officesFrom(cms) }, payments)
      }
      navigate("/admin/invoices")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't create the invoice"))
    }
  }

  if (editId && loadingInvoices) return <p className="p-8 text-center text-sm text-muted">Loading…</p>
  if (editId && !editing) return <p className="p-8 text-center text-sm text-muted">Invoice not found.</p>

  const busy = create.isPending || update.isPending

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/invoices" className="mb-1 inline-flex items-center gap-1 text-[13px] font-semibold text-blue no-underline">
            <ArrowLeft className="size-3.5" /> All invoices
          </Link>
          <h1 className="font-heading text-2xl font-extrabold text-text">{editing ? "Edit Invoice" : "New Invoice"}</h1>
          {fromQuotation && !editing && <p className="mt-1 text-xs text-muted">From quotation {fromQuotation.number}</p>}
        </div>
        <div className="w-full sm:w-56">
          <Label className="mb-1.5 block">Invoice number</Label>
          <Input value={number} onChange={(e) => setNumber(e.target.value)} disabled={!!editing} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-heading text-base font-bold text-text">Customer</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Name *</Label>
              <Input value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block">Phone *</Label>
              <Input value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input type="email" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block">Company</Label>
              <Input value={customer.company} onChange={(e) => setCustomer((c) => ({ ...c, company: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Address</Label>
              <Input value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block">District / area</Label>
              <Input value={customer.area} onChange={(e) => setCustomer((c) => ({ ...c, area: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block">Delivery</Label>
              <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as "pickup" | "courier")} className={selectClass}>
                <option value="pickup">Pick-up from office</option>
                <option value="courier">By courier</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-heading text-base font-bold text-text">Products</h2>
          <QuotationProductList
            onPick={(product) =>
              setLines((ls) => [
                ...ls,
                {
                  key: `${product.id}-${Date.now()}`,
                  product_id: product.id,
                  name: product.name,
                  qty: 1,
                  unit_price: currentPrice(product),
                  warranty_months: product.warranty_months ?? null,
                  serda_serial_number: product.serda_serial_number ?? null,
                },
              ])
            }
          />
          <div className="mt-3 grid grid-cols-[1fr_110px_auto] items-end gap-2">
            <div>
              <Label className="mb-1.5 block">Custom item (service, labour…)</Label>
              <Input value={custom.name} onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))} placeholder="Item name" />
            </div>
            <Input type="number" min="0" value={custom.price} onChange={(e) => setCustom((c) => ({ ...c, price: e.target.value }))} placeholder="Price" />
            <Button type="button" variant="outline" onClick={addCustom}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
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
          {lines.length === 0 && <p className="p-6 text-center text-sm text-muted">Pick a product above, or add a custom item.</p>}
          {lines.map((line) => (
            <div key={line.key} className="grid grid-cols-[1fr_70px_110px_110px_34px] items-center gap-2 border-b border-border px-3 py-2 last:border-0">
              <div className="min-w-0 truncate text-sm font-medium text-text">{line.name}</div>
              <Input type="number" min="1" value={line.qty} className="text-right" onChange={(e) => updateLine(line.key, { qty: Number(e.target.value) || 0 })} />
              <Input type="number" min="0" value={line.unit_price} className="text-right" onChange={(e) => updateLine(line.key, { unit_price: Number(e.target.value) || 0 })} />
              <span className="text-right text-sm font-semibold tabular-nums text-text">{formatBDT(line.qty * line.unit_price)}</span>
              <button type="button" aria-label="Remove line" onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))} className="text-muted hover:text-red-500">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-heading text-base font-bold text-text">Charges &amp; notes</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-1.5 block">Discount (৳)</Label>
              <Input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">VAT (%)</Label>
              <Input type="number" min="0" value={vat} onChange={(e) => setVat(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Delivery (৳)</Label>
              <Input type="number" min="0" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 sm:w-1/2">
            <Label className="mb-1.5 block">Payment due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Label className="mb-1.5 mt-3 block">Notes / terms (printed on the invoice)</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Payment terms, warranty note, bank details…"
            className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none"
          />
        </section>

        {editing ? (
          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="mb-2 font-heading text-base font-bold text-text">Payments</h2>
            <p className="text-sm text-muted">
              Already collected: <b className="text-text">{formatBDT(Number(editing.paid_amount))}</b>. Payments aren't changed
              here — use <b>Collect</b> on the invoice list. Stock already deducted is not adjusted; change it from Stock.
            </p>
          </section>
        ) : (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-heading text-base font-bold text-text">Payment collected now</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Amount (৳)</Label>
              <Input type="number" min="0" value={pay.amount} onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <Label className="mb-1.5 block">Method</Label>
              <select value={pay.method} onChange={(e) => setPay((p) => ({ ...p, method: e.target.value as FinancePaymentMethod }))} className={selectClass}>
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">Date</Label>
              <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Reference / TrxID</Label>
              <Input value={pay.note} onChange={(e) => setPay((p) => ({ ...p, note: e.target.value }))} />
            </div>
          </div>
          <p className="mt-2.5 text-xs text-muted">
            Leave the amount empty if nothing is collected yet. Later payments are recorded from the invoice list.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={deductStock} onChange={(e) => setDeductStock(e.target.checked)} />
            Deduct stock now (marks the order confirmed)
          </label>
        </section>
        )}
      </div>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
        <div className="text-sm">
          <div className="text-xs text-muted">
            Items {formatBDT(totals.items)}
            {totals.discount > 0 && ` · Discount −${formatBDT(totals.discount)}`}
            {totals.vat > 0 && ` · VAT ${formatBDT(totals.vat)}`}
            {Number(delivery) > 0 && ` · Delivery ${formatBDT(Number(delivery))}`}
          </div>
          <div className="font-heading text-lg font-extrabold text-text">
            Total {formatBDT(totals.total)}
            <span className="ml-3 text-sm font-semibold text-muted">
              Paid {formatBDT(editing ? Number(editing.paid_amount) : paying)} · Due{" "}
              <span className={editingBalance > 0 ? "text-red-500" : "text-green-600"}>{formatBDT(editingBalance)}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => submit(false)} disabled={busy}>
            <Save className="size-4" /> {editing ? "Save changes" : "Create invoice"}
          </Button>
          <Button onClick={() => submit(true)} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {editing ? "Save & download PDF" : "Create & download PDF"}
          </Button>
        </div>
      </div>
    </div>
  )
}
