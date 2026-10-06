import QRCode from "qrcode"

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
  /** Printed in the footer so a saved PDF still leads back to us. */
  website?: string
  facebook?: string
}

/**
 * The invoice's letterhead, assembled from the settings and CMS rows every
 * page that offers a download already has to hand.
 */
export function invoiceMetaFrom(
  settings: { support_phone?: string | null; whatsapp_number?: string | null; contact_email?: string | null; facebook_url?: string | null } | undefined,
  cms: { header_logo_url?: string | null } | undefined,
): InvoiceMeta {
  const origin = typeof window === "undefined" ? "" : window.location.origin
  return {
    offices: [],
    phone: settings?.support_phone || COMPANY.phone,
    whatsapp: settings?.whatsapp_number || COMPANY.whatsapp,
    email: settings?.contact_email || COMPANY.email,
    logoUrl: cms?.header_logo_url || `${origin}/logo.png`,
    website: origin,
    facebook: settings?.facebook_url || undefined,
  }
}

const DELIVERY_LABELS: Record<string, string> = {
  courier: "By Courier",
  pickup: "By Pick-up",
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer",
  card: "Card",
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function invoiceHtml(order: Order, items: OrderItem[], meta: InvoiceMeta, qrDataUrl = ""): string {
  const date = new Date(order.created_at ?? Date.now()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const address = [order.address_line, order.upazila, order.district, order.division]
    .filter(Boolean)
    .join(", ")

  const rows = items
    .map((item, i) => {
      const warranty = formatWarranty(item.warranty_months)
      const notes = [warranty, item.serda_serial_number ? `SERDA: ${item.serda_serial_number}` : null]
        .filter(Boolean)
        .join(" · ")
      return `
        <tr>
          <td class="num">${i + 1}</td>
          <td>
            <div>${esc(item.product_name)}</div>
            ${notes ? `<div class="muted" style="font-size:11.5px;margin-top:2px">${esc(notes)}</div>` : ""}
          </td>
          <td class="num">${esc(item.qty)}</td>
          <td class="num">${esc(formatBDT(item.unit_price))}</td>
          <td class="num">${esc(formatBDT(item.line_total))}</td>
        </tr>`
    })
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
  tfoot td { border-bottom: none; padding: 5px 10px; }
  tfoot tr:first-child td { padding-top: 12px; }
  .sum-label { text-align: right; color: #5a6b85; }
  tfoot .grand td { border-top: 2px solid #14213a; padding-top: 9px; font-size: 17px;
                    font-weight: 800; color: #F49E09; }
  .note { margin-top: 20px; background: #fff7e8; border: 1px solid #f6dfae; border-radius: 8px;
          padding: 10px 12px; font-size: 12px; }
  footer { margin-top: 26px; border-top: 1px solid #e8edf5; padding-top: 12px; font-size: 11.5px; }
  footer div + div { margin-top: 3px; }
  .qr { display: block; margin-top: 10px; margin-left: auto; width: 120px; height: 120px; }
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
      ${qrDataUrl ? `<img class="qr" src="${qrDataUrl}" alt="Scan for order details" />` : ""}
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
      <div>Delivery: <b>${esc(DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method)}</b></div>
      <div>Status: <b>${esc(titleCase(order.status))}</b></div>
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
    <tfoot>
      <tr>
        <td colspan="3" rowspan="${2 + (order.discount > 0 ? 1 : 0) + (order.delivery_charge > 0 ? 1 : 0)}"></td>
        <td class="sum-label">Subtotal</td>
        <td class="num">${esc(formatBDT(order.subtotal))}</td>
      </tr>
      ${
        order.discount > 0
          ? `<tr><td class="sum-label">Discount</td><td class="num">-${esc(formatBDT(order.discount))}</td></tr>`
          : ""
      }
      ${
        order.delivery_charge > 0
          ? `<tr><td class="sum-label">Delivery</td><td class="num">${esc(formatBDT(order.delivery_charge))}</td></tr>`
          : ""
      }
      <tr class="grand">
        <td class="sum-label">Total</td>
        <td class="num">${esc(formatBDT(order.total))}</td>
      </tr>
    </tfoot>
  </table>

  <div class="note">
    Delivery charge is not included in this invoice. It is calculated for your address and
    added to the quotation our team sends you before dispatch.
  </div>

  <footer>
    ${offices}
    <div style="margin-top:8px">
      ${meta.website ? `Website: <b>${esc(meta.website)}</b>` : ""}
      ${meta.website && meta.facebook ? " · " : ""}
      ${meta.facebook ? `Facebook: <b>${esc(meta.facebook)}</b>` : ""}
    </div>
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
export async function printInvoice(order: Order, items: OrderItem[], meta: InvoiceMeta): Promise<void> {
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

  // The QR is generated as a data URL rather than fetched, so an offline save
  // of the invoice still renders it.
  const qrDataUrl = await buildInvoiceQr(order, items, meta).catch(() => "")

  const doc = frame.contentWindow?.document
  if (!doc) return cleanUp()
  doc.open()
  doc.write(invoiceHtml(order, items, meta, qrDataUrl))
  doc.close()
}

/** The QR carries the company, the order, every line item and the totals, so a
 *  scanner reads back everything the invoice itself prints. */
async function buildInvoiceQr(order: Order, items: OrderItem[], meta: InvoiceMeta): Promise<string> {
  const payload = {
    v: 1,
    company: {
      name: COMPANY.name,
      phone: meta.phone,
      whatsapp: meta.whatsapp,
      email: meta.email,
      website: meta.website,
      facebook: meta.facebook,
    },
    order: {
      number: order.order_number,
      date: order.created_at,
      status: order.status,
      payment: order.payment_method,
      total: Number(order.total),
      paid: Number(order.paid_amount ?? 0),
      due: Number(order.due_amount ?? 0),
      consignment: order.consignment_id ?? null,
      tracking: order.courier_tracking_code ?? null,
    },
    customer: {
      name: order.guest_name,
      phone: order.guest_phone,
      address: [order.address_line, order.upazila, order.district, order.division]
        .filter(Boolean)
        .join(", "),
    },
    items: items.map((item) => ({
      name: item.product_name,
      qty: Number(item.qty),
      price: Number(item.unit_price),
      total: Number(item.line_total),
      warranty_months: item.warranty_months ?? null,
      serda: item.serda_serial_number ?? null,
    })),
  }
  return QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
  })
}

/** Months → a short human string. "Lifetime" for 0 would be wrong, so blank. */
function formatWarranty(months: number | null | undefined): string | null {
  if (!months || months <= 0) return null
  if (months % 12 === 0) {
    const years = months / 12
    return years === 1 ? "Warranty: 1 year" : `Warranty: ${years} years`
  }
  return `Warranty: ${months} months`
}
