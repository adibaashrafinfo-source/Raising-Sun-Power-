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

export const PROJECT_CATEGORIES = ["Residential Project", "Commercial Project"] as const
export const PROJECT_SYSTEM_TYPES = [
  "Rooftop On-grid",
  "Hybrid (grid + battery)",
  "Off-grid",
  "Supply only",
  "Maintenance / AMC",
  "Other",
] as const

export type QuotationLine = {
  product_name: string
  qty: number
  unit_price: number
  /** Printed under the description, e.g. "pcs", "set", "lot". */
  unit?: string
  /** Brand, model, specification — printed under the item description. */
  details?: string
  guarantee?: string
  warranty?: string
  service_warranty?: string
  replacement_warranty?: string
  /** SREDA (Sustainable and Renewable Energy Development Authority) enlisted
   *  product serial number — one per unit is fine as free text. */
  sreda_serial?: string
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
  email?: string | null
  company?: string | null
  location?: string | null
}

export type QuotationProject = {
  category?: string
  systemType?: string
  sizeKw?: number
  site?: string
}

export type QuotationSavingsEstimate = {
  show: boolean
  advancePercent: number
  sunHoursPerDay: number
  tariffPerKwh: number
  tariffLabel: string
}

export type QuotationInput = {
  ref: string
  date: string
  validUntil?: string
  customer: QuotationCustomer
  project?: QuotationProject
  lines: QuotationLine[]
  fees: QuotationFees
  vatRate?: number
  savings?: QuotationSavingsEstimate
  notes?: string
  terms?: string
  meta: InvoiceMeta & { offices: Office[] }
}

/** Totals, matching exactly what the printed sheet shows. */
export function quotationTotals(input: Pick<QuotationInput, "lines" | "fees" | "vatRate">) {
  const subtotal = input.lines.reduce((sum, line) => sum + line.qty * line.unit_price, 0)
  const addon =
    input.fees.service_charge +
    input.fees.installation_charge +
    input.fees.delivery_cost +
    input.fees.other_charges
  const vat = input.vatRate ? ((subtotal + addon - input.fees.discount) * input.vatRate) / 100 : 0
  const total = Math.max(0, subtotal + addon - input.fees.discount + vat)
  return { subtotal, addon, vat, total }
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function belowHundred(n: number): string {
  return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "")
}
function belowThousand(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? belowHundred(r) : "")
}
/** Converts an integer (Indian/Bangladeshi grouping — Crore/Lakh/Thousand) to English words. */
function numberToWords(n: number): string {
  if (n === 0) return "Zero"
  const parts: string[] = []
  let rest = n
  const crore = Math.floor(rest / 1e7)
  rest %= 1e7
  const lakh = Math.floor(rest / 1e5)
  rest %= 1e5
  const thousand = Math.floor(rest / 1e3)
  rest %= 1e3
  if (crore) parts.push(numberToWords(crore) + " Crore")
  if (lakh) parts.push(belowThousand(lakh) + " Lakh")
  if (thousand) parts.push(belowThousand(thousand) + " Thousand")
  if (rest) parts.push(belowThousand(rest))
  return parts.join(" ")
}

/** "৭৫,০০০.৫০" → "Seventy-Five Thousand Taka and Fifty Paisa Only" */
function amountInWords(total: number): string {
  const safe = Math.max(0, Math.round(total * 100) / 100)
  const taka = Math.floor(safe)
  const paisa = Math.round((safe - taka) * 100)
  return numberToWords(taka) + " Taka" + (paisa ? " and " + numberToWords(paisa) + " Paisa" : "") + " Only"
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

/** Per-item guarantee/warranty/service/replacement + SREDA serial, printed
 *  under the line's own description — mirrors the invoice's per-item notes. */
function lineNotesHtml(line: QuotationLine): string {
  const warrantyBits = [
    line.guarantee ? `<span>Guarantee: ${esc(line.guarantee)}</span>` : "",
    line.warranty ? `<span>Warranty: ${esc(line.warranty)}</span>` : "",
    line.service_warranty ? `<span>Service warranty: ${esc(line.service_warranty)}</span>` : "",
    line.replacement_warranty ? `<span>Replacement warranty: ${esc(line.replacement_warranty)}</span>` : "",
  ]
    .filter(Boolean)
    .join("")
  const warrantyRow = warrantyBits ? `<div class="wr">${warrantyBits}</div>` : ""
  const detailsRow = line.details ? `<div class="dt">${esc(line.details)}</div>` : ""
  const sredaRow = line.sreda_serial
    ? `<div class="sn"><b>SREDA enlisted serial no.:</b> ${esc(line.sreda_serial)}</div>`
    : ""
  return detailsRow + warrantyRow + sredaRow
}

/** The payment-split term, written out from the advance % and the total so
 *  the sales team never edits amounts by hand. Empty when no advance is set. */
export function paymentTermLine(advancePercent: number, total: number): string {
  const adv = Math.min(100, Math.max(0, advancePercent))
  if (adv <= 0) return ""
  const advAmt = Math.round((total * adv) / 100)
  if (adv >= 100) return `Payment : 100% advance with work order (${formatBDT(advAmt)}).`
  return `Payment : ${adv}% advance with work order (${formatBDT(advAmt)}), ${100 - adv}% on completion of installation and commissioning (${formatBDT(total - advAmt)}).`
}

function termsHtml(input: QuotationInput, total: number): string {
  const payment = paymentTermLine(input.savings?.advancePercent ?? 0, total)
  return [...(input.terms ?? "").split("\n"), payment]
    .map((line) => {
      if (!line.trim()) return ""
      const match = /^(.{1,32}?)\s*:\s+(.*)$/.exec(line)
      return `<div class="tl">${match ? `<b>${esc(match[1])}:</b> ${esc(match[2])}` : esc(line)}</div>`
    })
    .join("")
}

/** Energy production + ROI estimate, shown only when a system size and the
 *  savings estimate are both present — same arithmetic as the Solar Calculator. */
function energyOverviewHtml(input: QuotationInput, total: number): string {
  const kw = input.project?.sizeKw ?? 0
  if (!input.savings?.show || kw <= 0) return ""
  const hours = input.savings.sunHoursPerDay || 5
  const tariff = input.savings.tariffPerKwh || 14
  const label = input.savings.tariffLabel || ""
  const daily = kw * hours
  const monthly = daily * 30
  const yearly = monthly * 12
  const yearlySavings = yearly * tariff
  const f = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 })

  const rows = `
    <tr><td>Daily generation of solar power</td><td>${f(kw)} kWp × ${f(hours)} hours = <b>${f(daily)} kWh</b> (average ${f(hours)} hours of peak sunlight)</td></tr>
    <tr><td>Monthly generation of solar power</td><td>${f(daily)} kWh × 30 days = <b>${f(monthly)} kWh</b> (incl. winter &amp; rainy season)</td></tr>
    <tr><td>Annual generation of solar power</td><td>${f(monthly)} kWh × 12 = <b>${f(yearly)} kWh</b> (incl. winter &amp; rainy season)</td></tr>`

  let financeRows = `
    <tr><td>Per unit electricity price</td><td><b>${formatBDT(tariff)} per kWh</b>${label ? ` (${esc(label)})` : ""}</td></tr>
    <tr><td>Annual savings</td><td>${f(yearly)} kWh × ${formatBDT(tariff)} = <b>${formatBDT(yearlySavings)}</b></td></tr>`

  if (total > 0 && yearlySavings > 0) {
    const paybackYears = total / yearlySavings
    const roundedYears = Math.max(1, Math.round(paybackYears))
    financeRows += `
      <tr><td>Return of investment</td><td>${formatBDT(total)} ÷ ${formatBDT(yearlySavings)} = ${f(paybackYears)} ≈ <b>${roundedYears} years</b>; with 1 year margin, <b>${roundedYears + 1} years</b></td></tr>`
  }

  return `
    <div class="energy">
      <h4>Energy production overview</h4>
      <table><thead><tr><th>Parameter</th><th>Estimate</th></tr></thead><tbody>${rows}</tbody></table>
      <h4 style="margin-top:12px">Financial savings</h4>
      <table><tbody>${financeRows}</tbody></table>
      <p class="note">Note: system lifetime minimum 25 years. Figures are estimates based on the assumptions shown.</p>
    </div>`
}

function quotationHtml(input: QuotationInput, qrDataUrl: string): string {
  const { subtotal, vat, total } = quotationTotals(input)
  const offices = input.meta.offices
    .map((o) => `<div><b>${esc(o.name)}:</b> ${esc(o.address)}</div>`)
    .join("")
  const rows = input.lines
    .map(
      (line, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>
          <div>${esc(line.product_name)}</div>
          ${lineNotesHtml(line)}
        </td>
        <td class="num">${esc(line.unit || "pcs")}</td>
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

  const project = input.project
  const projectLine = [project?.category, project?.systemType, project?.sizeKw ? `${project.sizeKw} kWp` : null]
    .filter(Boolean)
    .join(" • ")

  const termsRows = termsHtml(input, total)
  const termsBlock = termsRows ? `<h4>Terms &amp; conditions</h4>${termsRows}` : ""
  const notesBlock = input.notes ? `<h4 style="margin-top:10px">Notes</h4><p>${esc(input.notes)}</p>` : ""

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
  .dt { color: #566379; font-size: 11.5px; margin-top: 2px; }
  .wr { margin-top: 4px; font-size: 11px; font-weight: 600; color: #2f8f1f; }
  .wr span { display: inline-block; margin-right: 12px; }
  .sn { margin-top: 4px; font-size: 11px; color: #14213a; word-break: break-word; }
  .sn b { color: #217CCA; }
  tfoot td { border-top: 1px solid #d7e0ec; font-weight: 700; }
  tfoot .sum-label { text-align: right; color: #566379; }
  tfoot .grand td { font-size: 15px; }
  .qr { display: block; margin-top: 10px; margin-left: auto; width: 120px; height: 120px; }
  .note { margin-top: 22px; padding: 12px 14px; border-radius: 10px; background: #eef3fa;
          font-size: 12px; color: #14213a; }
  .words { margin-top: 14px; font-size: 12px; color: #566379; }
  .words b { display: block; color: #14213a; font-size: 12.5px; margin-top: 2px; }
  .energy { margin-top: 20px; font-size: 12px; }
  .energy h4 { margin: 0 0 6px; font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase;
               color: #F49E09; font-weight: 700; }
  .energy table { margin-top: 0; }
  .energy th { background: #eef3fa; font-size: 10.5px; }
  .energy .note { margin-top: 8px; padding: 8px 10px; }
  .tl { margin: 0 0 5px; line-height: 1.55; font-size: 12.8px; }
  .tl b { font-weight: 800; }
  .sign { display: flex; justify-content: space-between; gap: 40px; margin-top: 46px; font-size: 12px; color: #566379; }
  .sign div { width: 200px; border-top: 1px solid #14213a; padding-top: 5px; text-align: center; }
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
        ${input.validUntil ? `<br />Valid until: ${esc(input.validUntil)}` : ""}
      </div>
      ${qrDataUrl ? `<img class="qr" src="${qrDataUrl}" alt="Scan for quotation details" />` : ""}
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="label">Prepared for</div>
      <div><b>${esc(input.customer.name)}</b></div>
      <div>${esc(input.customer.phone)}</div>
      ${input.customer.email ? `<div>${esc(input.customer.email)}</div>` : ""}
      ${input.customer.company ? `<div>${esc(input.customer.company)}</div>` : ""}
      ${input.customer.location ? `<div class="muted">${esc(input.customer.location)}</div>` : ""}
    </div>
    <div>
      <div class="label">Project</div>
      <div><b>${projectLine ? esc(projectLine) : "—"}</b></div>
      ${project?.site ? `<div class="muted">${esc(project.site)}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="num" style="width:34px">#</th>
        <th>Item</th>
        <th class="num" style="width:54px">Unit</th>
        <th class="num" style="width:50px">Qty</th>
        <th class="num" style="width:96px">Unit price</th>
        <th class="num" style="width:104px">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" rowspan="${
          2 +
          (input.fees.service_charge > 0 ? 1 : 0) +
          (input.fees.installation_charge > 0 ? 1 : 0) +
          (input.fees.delivery_cost > 0 ? 1 : 0) +
          (input.fees.other_charges > 0 ? 1 : 0) +
          (input.fees.discount > 0 ? 1 : 0) +
          (vat > 0 ? 1 : 0)
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
      ${vat > 0 ? `<tr><td class="sum-label">VAT (${esc(input.vatRate)}%)</td><td class="num">${esc(formatBDT(vat))}</td></tr>` : ""}
      <tr class="grand">
        <td class="sum-label">Total</td>
        <td class="num">${esc(formatBDT(total))}</td>
      </tr>
    </tfoot>
  </table>

  <div class="words">Amount in words<b>${esc(amountInWords(total))}</b></div>

  ${notesBlock || termsBlock ? `<div class="note">${notesBlock}${termsBlock}</div>` : ""}

  ${energyOverviewHtml(input, total)}

  <div class="sign">
    <div>Customer signature</div>
    <div>Authorized Signature<br />for ${esc(COMPANY.name)}</div>
  </div>

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
