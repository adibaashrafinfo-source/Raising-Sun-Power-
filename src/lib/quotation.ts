// A one-page printable quotation.
//
// Used from the admin lead dialog's "Build Quotation" dialog: lets the sales
// team price a wholesale enquiry (lines + fees + discount) and hand the buyer
// a PDF through the browser's own Save as PDF print flow. Keeps the pattern
// the invoice already uses — no PDF library ships with the bundle.

import QRCode from "qrcode"

import { COMPANY } from "@/data/company"
import type { InvoiceMeta } from "@/lib/invoice"
import type { Office } from "@/lib/offices"
import { formatBDT } from "@/lib/utils"

export type QuotationLine = {
  product_name: string
  qty: number
  unit_price: number
}

export type QuotationFees = {
  service_charge: number
  installation_charge: number
  delivery_cost: number
  other_charges: number
  discount: number
}

export type QuotationCustomer = {
  name: string
  phone: string
  company?: string | null
  location?: string | null
}

export type QuotationInput = {
  ref: string
  date: string
  customer: QuotationCustomer
  lines: QuotationLine[]
  fees: QuotationFees
  notes?: string
  meta: InvoiceMeta & { offices: Office[] }
}

/** Totals, matching exactly what the printed sheet shows. */
export function quotationTotals(input: Pick<QuotationInput, "lines" | "fees">) {
  const subtotal = input.lines.reduce((sum, line) => sum + line.qty * line.unit_price, 0)
  const addon =
    input.fees.service_charge +
    input.fees.installation_charge +
    input.fees.delivery_cost +
    input.fees.other_charges
  const total = Math.max(0, subtotal + addon - input.fees.discount)
  return { subtotal, addon, total }
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

async function buildQuotationQr(input: QuotationInput): Promise<string> {
  const payload = {
    v: 1,
    type: "quotation",
    ref: input.ref,
    date: input.date,
    company: {
      name: COMPANY.name,
      phone: input.meta.phone,
      whatsapp: input.meta.whatsapp,
      email: input.meta.email,
      website: input.meta.website,
    },
    customer: input.customer,
    lines: input.lines,
    fees: input.fees,
    totals: quotationTotals(input),
  }
  try {
    return await QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    })
  } catch {
    return ""
  }
}

function quotationHtml(input: QuotationInput, qrDataUrl: string): string {
  const { subtotal, total } = quotationTotals(input)
  const offices = input.meta.offices
    .map((o) => `<div><b>${esc(o.name)}:</b> ${esc(o.address)}</div>`)
    .join("")
  const rows = input.lines
    .map(
      (line, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${esc(line.product_name)}</td>
        <td class="num">${esc(line.qty)}</td>
        <td class="num">${esc(formatBDT(line.unit_price))}</td>
        <td class="num">${esc(formatBDT(line.qty * line.unit_price))}</td>
      </tr>`,
    )
    .join("")

  const feeRow = (label: string, value: number) =>
    value > 0
      ? `<tr><td class="sum-label">${esc(label)}</td><td class="num">${esc(formatBDT(value))}</td></tr>`
      : ""

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Quotation ${esc(input.ref)} — ${esc(COMPANY.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px; font: 13px/1.55 "Helvetica Neue", Arial, sans-serif; color: #14213a; }
  .head { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start;
          border-bottom: 3px solid #217CCA; padding-bottom: 16px; }
  .brand { font-size: 21px; font-weight: 800; letter-spacing: .2px; }
  .brand small { display: block; font-size: 11px; font-weight: 600; color: #F49E09;
                 letter-spacing: 1.1px; text-transform: uppercase; }
  .title h1 { margin: 0; font-size: 26px; letter-spacing: .3px; }
  .title { text-align: right; }
  .muted { color: #566379; font-size: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
  .label { color: #566379; font-size: 11px; letter-spacing: .9px; text-transform: uppercase;
           font-weight: 700; margin-bottom: 6px; }
  table { width: 100%; margin-top: 22px; border-collapse: collapse; }
  th, td { padding: 10px 10px; font-size: 12.5px; text-align: left; vertical-align: top; }
  th { background: #eef3fa; color: #14213a; border-top: 1px solid #d7e0ec; border-bottom: 1px solid #d7e0ec; }
  tbody tr + tr td { border-top: 1px solid #e8edf5; }
  .num { text-align: right; }
  tfoot td { border-top: 1px solid #d7e0ec; font-weight: 700; }
  tfoot .sum-label { text-align: right; color: #566379; }
  tfoot .grand td { font-size: 15px; }
  .qr { display: block; margin-top: 10px; margin-left: auto; width: 120px; height: 120px; }
  .note { margin-top: 22px; padding: 12px 14px; border-radius: 10px; background: #eef3fa;
          font-size: 12px; color: #14213a; }
  footer { margin-top: 26px; border-top: 1px solid #e8edf5; padding-top: 12px; font-size: 11.5px; }
  footer div + div { margin-top: 3px; }
  @page { size: A4; margin: 14mm; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      ${input.meta.logoUrl ? `<img style="height:52px" src="${esc(input.meta.logoUrl)}" alt="" />` : ""}
      <div class="brand">${esc(COMPANY.name)}<small>Solar &amp; Electrical</small></div>
      <div class="muted" style="margin-top:6px">
        Call: ${esc(input.meta.phone)} · WhatsApp: ${esc(input.meta.whatsapp)}<br />${esc(input.meta.email)}
      </div>
    </div>
    <div class="title">
      <h1>Quotation</h1>
      <div class="muted" style="margin-top:6px">
        <b>${esc(input.ref)}</b><br />${esc(input.date)}
      </div>
      ${qrDataUrl ? `<img class="qr" src="${qrDataUrl}" alt="Scan for quotation details" />` : ""}
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="label">Prepared for</div>
      <div><b>${esc(input.customer.name)}</b></div>
      <div>${esc(input.customer.phone)}</div>
      ${input.customer.company ? `<div>${esc(input.customer.company)}</div>` : ""}
      ${input.customer.location ? `<div class="muted">${esc(input.customer.location)}</div>` : ""}
    </div>
    <div>
      <div class="label">Prepared by</div>
      <div><b>${esc(COMPANY.name)}</b></div>
      <div class="muted">${esc(input.meta.phone)}</div>
      ${input.meta.website ? `<div class="muted">${esc(input.meta.website)}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="num" style="width:34px">#</th>
        <th>Item</th>
        <th class="num" style="width:50px">Qty</th>
        <th class="num" style="width:96px">Unit price</th>
        <th class="num" style="width:104px">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" rowspan="${
          2 +
          (input.fees.service_charge > 0 ? 1 : 0) +
          (input.fees.installation_charge > 0 ? 1 : 0) +
          (input.fees.delivery_cost > 0 ? 1 : 0) +
          (input.fees.other_charges > 0 ? 1 : 0) +
          (input.fees.discount > 0 ? 1 : 0)
        }"></td>
        <td class="sum-label">Subtotal</td>
        <td class="num">${esc(formatBDT(subtotal))}</td>
      </tr>
      ${feeRow("Service charge", input.fees.service_charge)}
      ${feeRow("Installation / commissioning", input.fees.installation_charge)}
      ${feeRow("Delivery cost", input.fees.delivery_cost)}
      ${feeRow("Other charges", input.fees.other_charges)}
      ${
        input.fees.discount > 0
          ? `<tr><td class="sum-label">Discount</td><td class="num">-${esc(formatBDT(input.fees.discount))}</td></tr>`
          : ""
      }
      <tr class="grand">
        <td class="sum-label">Total</td>
        <td class="num">${esc(formatBDT(total))}</td>
      </tr>
    </tfoot>
  </table>

  ${input.notes ? `<div class="note">${esc(input.notes)}</div>` : ""}

  <footer>
    ${offices}
    <div style="margin-top:8px">
      ${input.meta.website ? `Website: <b>${esc(input.meta.website)}</b>` : ""}
      ${input.meta.website && input.meta.facebook ? " · " : ""}
      ${input.meta.facebook ? `Facebook: <b>${esc(input.meta.facebook)}</b>` : ""}
    </div>
    <div class="muted" style="margin-top:8px">
      This quotation is valid for 14 days from the date above, subject to stock and current rates.
    </div>
  </footer>
</body>
</html>`
}

/** Opens the browser's print dialog with a one-page quotation. */
export async function printQuotation(input: QuotationInput): Promise<void> {
  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;"
  document.body.appendChild(frame)
  const cleanUp = () => frame.remove()

  frame.onload = () => {
    const win = frame.contentWindow
    if (!win) return cleanUp()
    win.focus()
    win.print()
    win.addEventListener("afterprint", cleanUp)
    setTimeout(cleanUp, 60_000)
  }

  const qr = await buildQuotationQr(input).catch(() => "")
  const doc = frame.contentWindow?.document
  if (!doc) return cleanUp()
  doc.open()
  doc.write(quotationHtml(input, qr))
  doc.close()
}
