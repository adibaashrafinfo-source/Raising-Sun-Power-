import type { ProductCardData } from "@/types/product"

const tB = "linear-gradient(135deg,#EAF1FB,#C9DCF3)"
const tO = "linear-gradient(135deg,#FEF0D6,#F7D69B)"
const tG = "linear-gradient(135deg,#EAF6DD,#CDE9B7)"
const tGold = "linear-gradient(135deg,#FDF4D2,#F3DE94)"

export const trustChips = [
  { title: "100% Authentic", sub: "Genuine brands only", tint: "rgba(33,124,202,.14)", color: "#217CCA" },
  { title: "Warranty", sub: "Brand-backed cover", tint: "rgba(103,167,14,.14)", color: "#67A70E" },
  { title: "Fast Delivery", sub: "Nationwide · 2–4 days", tint: "rgba(244,158,9,.16)", color: "#F49E09" },
  { title: "COD Available", sub: "Pay on delivery", tint: "rgba(33,124,202,.14)", color: "#217CCA" },
]

export const categories = [
  { slug: "solar-panels", name: "Solar Panels", count: "120+ items", tint: tB },
  { slug: "inverters", name: "Inverters", count: "60+ items", tint: tO },
  { slug: "batteries", name: "Batteries", count: "45+ items", tint: tG },
  { slug: "mcb-mccb", name: "MCB & MCCB", count: "90+ items", tint: tB },
  { slug: "switchgear", name: "Switchgear", count: "70+ items", tint: tO },
  { slug: "cables-wires", name: "Cables & Wires", count: "110+ items", tint: tG },
  { slug: "complete-solutions", name: "Complete Solutions", count: "Custom builds", tint: tGold },
  { slug: "accessories", name: "Accessories", count: "200+ items", tint: tB },
]

export const bestSellers: ProductCardData[] = [
  {
    id: "longi-himo-550w",
    slug: "longi-himo-550w-mono-solar-panel",
    name: "Longi Hi-MO 550W Mono Solar Panel",
    cat: "Solar Panel",
    price: 18500,
    priceStr: "৳18,500",
    old: "৳21,000",
    off: "-12%",
    badge: "Best Seller",
    badgeBg: "linear-gradient(135deg,#F4D560,#F49E09)",
    badgeColor: "#3a2600",
    rating: "4.8",
    count: "126",
    tint: tB,
    art: "panel",
  },
  {
    id: "luminous-2kva-inverter",
    slug: "luminous-2kva-pure-sine-solar-inverter",
    name: "Luminous 2kVA Pure Sine Solar Inverter",
    cat: "Inverter",
    price: 24900,
    priceStr: "৳24,900",
    old: "৳28,500",
    off: "-13%",
    rating: "4.7",
    count: "84",
    tint: tO,
    art: "inverter",
  },
  {
    id: "hoppecke-200ah-battery",
    slug: "hoppecke-200ah-tall-tubular-battery",
    name: "Hoppecke 200Ah Tall Tubular Battery",
    cat: "Battery",
    price: 26400,
    priceStr: "৳26,400",
    old: "৳29,000",
    off: "-9%",
    rating: "4.9",
    count: "57",
    tint: tG,
    art: "battery",
  },
  {
    id: "schneider-63a-mccb",
    slug: "schneider-63a-mccb-3-pole-breaker",
    name: "Schneider 63A MCCB 3-Pole Breaker",
    cat: "MCCB",
    price: 4750,
    priceStr: "৳4,750",
    old: "৳5,400",
    off: "-12%",
    badge: "Eco",
    badgeBg: "linear-gradient(135deg,#67A70E,#4C9412)",
    badgeColor: "#fff",
    rating: "4.6",
    count: "41",
    tint: tB,
    art: "breaker",
  },
]

export const newArrivals: ProductCardData[] = [
  {
    id: "rsp-100ah-lifepo4",
    slug: "rsp-100ah-lifepo4-lithium-battery",
    name: "RSP 100Ah LiFePO4 Lithium Battery",
    cat: "Battery",
    price: 38500,
    priceStr: "৳38,500",
    badge: "New",
    badgeBg: "linear-gradient(135deg,#217CCA,#0B3F94)",
    badgeColor: "#fff",
    rating: "5.0",
    count: "49",
    tint: tG,
    art: "battery",
  },
  {
    id: "growatt-5kw-hybrid",
    slug: "growatt-5kw-hybrid-on-off-grid-inverter",
    name: "Growatt 5kW Hybrid On/Off-Grid Inverter",
    cat: "Inverter",
    price: 92000,
    priceStr: "৳92,000",
    badge: "New",
    badgeBg: "linear-gradient(135deg,#217CCA,#0B3F94)",
    badgeColor: "#fff",
    rating: "4.9",
    count: "63",
    tint: tGold,
    art: "inverter",
  },
  {
    id: "brb-2.5mm-cable",
    slug: "brb-2-5mm-copper-cable-100-yd-coil",
    name: "BRB 2.5mm² Copper Cable — 100 yd Coil",
    cat: "Cable",
    price: 6900,
    priceStr: "৳6,900",
    badge: "New",
    badgeBg: "linear-gradient(135deg,#217CCA,#0B3F94)",
    badgeColor: "#fff",
    rating: "4.9",
    count: "228",
    tint: tO,
    art: "cable",
  },
  {
    id: "havells-32a-mcb",
    slug: "havells-32a-mcb-single-pole-type-c",
    name: "Havells 32A MCB Single Pole (Type C)",
    cat: "MCB",
    price: 420,
    priceStr: "৳420",
    badge: "New",
    badgeBg: "linear-gradient(135deg,#217CCA,#0B3F94)",
    badgeColor: "#fff",
    rating: "4.8",
    count: "312",
    tint: tB,
    art: "breaker",
  },
]

export const solutions = [
  {
    title: "Home Solar",
    body: "Rooftop kits sized for load-shedding backup and monthly savings.",
    grad: "linear-gradient(160deg,#217CCA,#052C6E)",
  },
  {
    title: "Commercial Power",
    body: "Reliable three-phase supply, UPS and switchgear for shops & offices.",
    grad: "linear-gradient(160deg,#F49E09,#c46f00)",
  },
  {
    title: "Industrial Switchgear",
    body: "MCCB, distribution boards and protection engineered for factories.",
    grad: "linear-gradient(160deg,#67A70E,#2A6B08)",
  },
]

export const brands = [
  "Longi",
  "Luminous",
  "Schneider",
  "Havells",
  "Growatt",
  "Hoppecke",
  "BRB",
  "Jinko",
  "Victron",
  "Siemens",
  "ABB",
  "Walton",
]

export const whyRsp = [
  {
    title: "100% Genuine",
    body: "Every unit sourced from authorized channels with verifiable serials.",
    tint: "rgba(33,124,202,.14)",
    color: "#217CCA",
  },
  {
    title: "Warranty Support",
    body: "On-brand warranty handled locally — no shipping units abroad.",
    tint: "rgba(103,167,14,.14)",
    color: "#67A70E",
  },
  {
    title: "Fast Nationwide Delivery",
    body: "Steadfast courier to all 64 districts, 2–4 days with COD.",
    tint: "rgba(244,158,9,.16)",
    color: "#F49E09",
  },
  {
    title: "Expert Guidance",
    body: "Engineers help you size the right system — call or WhatsApp anytime.",
    tint: "rgba(33,124,202,.14)",
    color: "#217CCA",
  },
]

export const testimonials = [
  {
    quote:
      "Ordered a full solar kit for our village home. Genuine products, real warranty papers, and Steadfast delivered in 3 days with COD. Highly recommended.",
    name: "Rakibul Hasan",
    role: "Homeowner · Rangpur",
    initials: "RH",
    avatar: "linear-gradient(135deg,#217CCA,#0B3F94)",
  },
  {
    quote:
      "As an electrician I buy MCB and cables here regularly. Prices are fair and everything is authentic. The bulk pricing helped my business a lot.",
    name: "Md. Salauddin",
    role: "Electrician · Dhaka",
    initials: "MS",
    avatar: "linear-gradient(135deg,#F49E09,#c46f00)",
  },
  {
    quote:
      "Their team sized the inverter and battery for my shop perfectly. No more load-shedding downtime. Excellent after-sales support.",
    name: "Nusrat Jahan",
    role: "Shop owner · Chattogram",
    initials: "NJ",
    avatar: "linear-gradient(135deg,#67A70E,#2A6B08)",
  },
  {
    quote:
      "Bought a Growatt hybrid inverter — bKash payment was smooth and it arrived well packed. Will order again for the next site.",
    name: "Tanvir Ahmed",
    role: "Contractor · Sylhet",
    initials: "TA",
    avatar: "linear-gradient(135deg,#217CCA,#217CCA)",
  },
]

export const megaCols = [
  {
    title: "Solar",
    color: "#217CCA",
    items: ["Solar Panels", "Charge Controllers", "Mounting & Rails", "Solar Cables", "Combo Kits"],
  },
  {
    title: "Circuit Breakers",
    color: "#F49E09",
    items: ["MCB", "MCCB", "RCCB", "Distribution Boards", "Fuses"],
  },
  {
    title: "Inverters & Batteries",
    color: "#67A70E",
    items: ["Solar Inverters", "Hybrid Inverters", "Tubular Batteries", "Lithium Batteries", "IPS/UPS"],
  },
  {
    title: "Cables & Accessories",
    color: "#217CCA",
    items: ["Copper Cables", "Wires", "Connectors", "Switches & Sockets", "Tools"],
  },
  {
    title: "Switchgear",
    color: "#F49E09",
    items: ["Contactors", "Relays", "Timers", "Meters", "Enclosures"],
  },
]
