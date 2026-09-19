// Single source of truth for company contact details, offices and the SEO
// keyword set. Pages read from here so a change lands everywhere at once.
// (Admin Settings/CMS values, where present, still take precedence at runtime.)

export const COMPANY = {
  name: "Rising Sun Power BD",
  /** Voice calls */
  phone: "01705742208",
  phoneIntl: "+8801705742208",
  /** WhatsApp (different from the call number) */
  whatsapp: "01786896390",
  whatsappIntl: "8801786896390",
  email: "risingsunpowerbd6267@gmail.com",
  headOffice: {
    label: "Head Office",
    address:
      "House No-125/4, Hosen Ali Road, Baganbari, North Vashantek, Near to CMH, Dhaka Cantonment, Dhaka-1206",
  },
  localOffice: {
    label: "Local Office",
    address: "Lotra Bazar, Saharasti, Chandpur-3620",
  },
  office2: {
    label: "Office-2",
    address: "Paniwala Bazar, Ramgonj, Laximpur.",
  },
} as const

export const SITE_DESCRIPTION =
  "Rising Sun Power BD supplies solar panels, inverters, batteries and electrical products in Bangladesh with solar installation, EPC and net metering support."

export const SEO_KEYWORDS = [
  "Solar company Bangladesh",
  "Solar panel supplier Bangladesh",
  "Solar inverter Bangladesh",
  "Solar EPC Bangladesh",
  "Solar installation Bangladesh",
  "Rooftop solar Bangladesh",
  "Net metering Bangladesh",
  "Solar products Dhaka",
  "Solar supplier Chandpur",
  "Solar installer Chandpur",
]

/** Prefilled WhatsApp link helper. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${COMPANY.whatsappIntl}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function telLink(phone: string = COMPANY.phone): string {
  return `tel:${phone.replace(/[\s-]/g, "")}`
}
