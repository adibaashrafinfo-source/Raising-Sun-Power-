export type HeroSlide = {
  badge: string
  title: string
  highlight: string
  body: string
  ctaLabel: string
  ctaTo: string
  secondaryLabel: string
  secondaryTo: string
  glow: string
}

/** Slides for the homepage banner carousel. The first one's copy is overridden
 *  by the CMS hero fields, so editing those still changes the front of the site. */
export const heroSlides: HeroSlide[] = [
  {
    badge: "Bangladesh's trusted solar & electrical store",
    title: "Powering Bangladesh with",
    highlight: "green & renewable energy.",
    body: "Genuine solar panels, inverters, batteries, MCB & MCCB and complete power solutions.",
    ctaLabel: "Shop Solar",
    ctaTo: "/products",
    secondaryLabel: "Explore Products",
    secondaryTo: "/products",
    glow: "radial-gradient(circle,#217CCA 0%,transparent 70%)",
  },
  {
    badge: "Free system sizing",
    title: "Tell us your load —",
    highlight: "we size the system free.",
    body: "Our engineers pick the right panel, inverter and battery for your home or business, then send a written quotation.",
    ctaLabel: "Free Solar Assessment",
    ctaTo: "/solar-assessment",
    secondaryLabel: "Try the calculator",
    secondaryTo: "/solar-calculator",
    glow: "radial-gradient(circle,#67A70E 0%,transparent 70%)",
  },
  {
    badge: "Dealer & wholesale pricing",
    title: "Building a project?",
    highlight: "Buy at dealer rates.",
    body: "Installers, contractors and project buyers get wholesale pricing, stock backing and delivery to all 64 districts.",
    ctaLabel: "Wholesale & Dealer",
    ctaTo: "/wholesale",
    secondaryLabel: "Get a quotation",
    secondaryTo: "/get-quotation",
    glow: "radial-gradient(circle,#F49E09 0%,transparent 70%)",
  },
]

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
  { slug: "dc-fan", name: "DC Fan", count: "25+ items", tint: tO },
  { slug: "dc-light", name: "DC Light", count: "30+ items", tint: tG },
  { slug: "ac-fan", name: "AC Fan", count: "20+ items", tint: tB },
  { slug: "switch-socket", name: "Switch & Socket", count: "80+ items", tint: tGold },
  { slug: "gadgets", name: "Gadgets", count: "40+ items", tint: tO },
  { slug: "ips", name: "IPS", count: "35+ items", tint: tG },
  { slug: "portable-power-station", name: "Portable Power Station", count: "15+ items", tint: tB },
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
  "Akij Enover",
  "Chint",
  "Shiender",
  "Tomjon",
  "Sunteck",
  "Suntree",
  "SRNE",
  "Solis",
  "Deye",
  "Sorotec",
  "Longran",
  "AIKO",
  "Solargold",
  "Sunshine",
  "TKG",
  "Leader",
  "Goodwe",
  "Lvtopsun",
  "Crown Micro",
  "Sako",
  "Hinvert",
  "Luxwatt",
  "Growatt",
  "REC",
  "Astro Energy",
  "Wener",
  "Akij Bashir",
  "Bizli Cables",
  "Luminus",
  "Super Star",
  "Safe",
  "Demuda",
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
    body: "Courier delivery to all 64 districts, 2–4 days with COD.",
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
      "Ordered a full solar kit for our village home. Genuine products, real warranty papers, and it was delivered in 3 days with COD. Highly recommended.",
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

