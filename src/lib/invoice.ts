import { COMPANY } from "@/data/company"
import type { Office } from "@/lib/offices"
import { formatBDT } from "@/lib/utils"
import type { Order, OrderItem } from "@/types/database"

export type InvoiceMeta = {
  offices: Office[]
  phone: string
  whatsapp: string
  email: string
  logoUrl?: string
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer",
  card: "Card",
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function invoiceHtml(order: Order, items: OrderItem[], meta: InvoiceMeta): string {
  const date = new Date(order.created_at ?? Date.now()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const address = [order.address_line, order.upazila, order.district, order.division]
    .filter(Boolean)
    .join(", ")

  const rows = items
    .map(
      (item, i) => `
        <tr>
          <td class="num">${i + 1}</td>
          <td>${esc(item.product_name)}</td>
          <td class="num">${esc(item.qty)}</td>
          <td class="num">${esc(formatBDT(item.unit_price))}</td>
          <td class="num">${esc(formatBDT(item.line_total))}</td>
        </tr>`,
    )
    .join("")

  const offices = meta.offices
    .map((o) => `<div><b>${esc(o.name)}:</b> ${esc(o.address)}</div>`)
    .join("")

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${esc(order.order_number)} — ${esc(COMPANY.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px; font: 13px/1.55 "Helvetica Neue", Arial, sans-serif; color: #14213a; }
  .head { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start;
          border-bottom: 3px solid #217CCA; padding-bottom: 16px; }
  .brand { font-size: 21px; font-weight: 800; letter-spacing: .2px; }
  .brand small { display: block; font-size: 11px; font-weight: 600; color: #F49E09;
                 letter-spacing: 1.6px; text-transform: uppercase; }
  .logo { height: 54px; width: auto; margin-bottom: 6px; }
  .muted { color: #5a6b85; }
  .title { text-align: right; }
  .title h1 { margin: 0; font-size: 25px; letter-spacing: 3px; text-transform: uppercase; color: #217CCA; }
  .grid { display: flex; gap: 24px; margin-top: 20px; }
  .grid > div { flex: 1; }
  .label { font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
           color: #5a6b85; margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; margin-top: 22px; }
  th { background: #eef3fa; text-align: left; font-size: 11px; letter-spacing: .6px;
       text-transform: uppercase; padding: 9px 10px; border-bottom: 1px solid #d7e0ee; }
  td { padding: 9px 10px; border-bottom: 1px solid #e8edf5; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  th.num { text-align: right; }
  .totals { margin-top: 14px; margin-left: auto; width: 270px; }
  .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
  .totals .grand { border-top: 2px solid #14213a; margin-top: 6px; padding-top: 9px;
                   font-size: 17px; font-weight: 800; color: #F49E09; }
  .note { margin-top: 20px; background: #fff7e8; border: 1px solid #f6dfae; border-radius: 8px;
          padding: 10px 12px; font-size: 12px; }
  footer { margin-top: 26px; border-top: 1px solid #e8edf5; padding-top: 12px; font-size: 11.5px; }
  footer div + div { margin-top: 3px; }
  @page { size: A4; margin: 14mm; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      ${meta.logoUrl ? `<img class="logo" src="${esc(meta.logoUrl)}" alt="" />` : ""}
      <div class="brand">${esc(COMPANY.name)}<small>Solar &amp; Electrical</small></div>
      <div class="muted" style="margin-top:6px">
        Call: ${esc(meta.phone)} · WhatsApp: ${esc(meta.whatsapp)}<br />${esc(meta.email)}
      </div>
    </div>
    <div class="title">
      <h1>Invoice</h1>
      <div class="muted" style="margin-top:6px">
        <b>${esc(order.order_number)}</b><br />${esc(date)}
      </div>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="label">Billed to</div>
      <div><b>${esc(order.guest_name)}</b></div>
      <div>${esc(order.guest_phone)}</div>
      <div class="muted">${esc(address)}</div>
      ${order.landmark ? `<div class="muted">${esc(order.landmark)}</div>` : ""}
    </div>
    <div>
      <div class="label">Order details</div>
      <div>Payment: <b>${esc(PAYMENT_LABELS[order.payment_method] ?? order.payment_method)}</b></div>
      <div>Delivery: <b>By Courier</b></div>
      <div>Status: <b>${esc(order.status)}</b></div>
      ${order.payment_reference ? `<div class="muted">Ref: ${esc(order.payment_reference)}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="num" style="width:34px">#</th>
        <th>Product</th>
        <th class="num" style="width:50px">Qty</th>
        <th class="num" style="width:96px">Unit price</th>
        <th class="num" style="width:104px">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${esc(formatBDT(order.subtotal))}</span></div>
    ${order.discount > 0 ? `<div><span>Discount</span><span>-${esc(formatBDT(order.discount))}</span></div>` : ""}
    ${order.delivery_charge > 0 ? `<div><span>Delivery</span><span>${esc(formatBDT(order.delivery_charge))}</span></div>` : ""}
    <div class="grand"><span>Total</span><span>${esc(formatBDT(order.total))}</span></div>
  </div>

  <div class="note">
    Delivery charge is not included in this invoice. It is calculated for your address and
    added to the quotation our team sends you before dispatch.
  </div>

  <footer>
    ${offices}
    <div class="muted" style="margin-top:8px">
      This is a computer-generated invoice and needs no signature. Thank you for your order.
    </div>
  </footer>
</body>
</html>`
}

/**
 * Renders the invoice into a hidden iframe and opens the browser's print
 * dialog, where "Save as PDF" gives the customer a file. Printing beats
 * shipping a PDF library for one page, and it works on both mobile browsers.
 */
export function printInvoice(order: Order, items: OrderItem[], meta: InvoiceMeta): void {
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
    // Safari fires afterprint late or not at all, so the frame is also removed
    // on a timer — it is invisible either way.
    win.addEventListener("afterprint", cleanUp)
    setTimeout(cleanUp, 60_000)
  }

  const doc = frame.contentWindow?.document
  if (!doc) return cleanUp()
  doc.open()
  doc.write(invoiceHtml(order, items, meta))
  doc.close()
}
