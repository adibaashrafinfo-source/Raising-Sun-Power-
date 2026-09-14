import { useState } from "react"
import {
  ArrowRight,
  Headphones,
  Heart,
  Leaf,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"

import { formatBDT } from "@/lib/utils"

// Curated marketing showcase. Product photos live in /public/featured/*.png — until
// those files are added, each tile shows a tasteful gradient fallback so the
// section still looks complete. Every CTA routes to the catalog.
const FEATURED = {
  badge: "Best Seller",
  eyebrow: "High Efficiency",
  name: "Longi 550W Solar Panel",
  tagline: "More power. More savings. A cleaner tomorrow.",
  image: "/featured/panel.png",
  price: 28500,
  original: 32000,
  features: [
    { icon: Zap, text: "High Conversion Efficiency (21.5%)" },
    { icon: ShieldCheck, text: "Durable & Weather Resistant" },
    { icon: Settings, text: "25 Years Performance Warranty" },
    { icon: Leaf, text: "Ideal for Home, Business & Agriculture" },
  ],
}

type MiniProduct = {
  name: string
  tagline: string
  image: string
  price: number
  original: number
  rating: number
  reviews: number
  offPct: number
}

const PRODUCTS: MiniProduct[] = [
  {
    name: "Growatt 5kW Solar Inverter",
    tagline: "Reliable. Efficient. Smart.",
    image: "/featured/inverter.png",
    price: 75000,
    original: 88000,
    rating: 4.5,
    reviews: 128,
    offPct: 15,
  },
  {
    name: "Deye 5kWh Lithium Battery",
    tagline: "Power Your Life, Uninterrupted.",
    image: "/featured/battery.png",
    price: 125000,
    original: 139000,
    rating: 4.5,
    reviews: 96,
    offPct: 10,
  },
  {
    name: "Schneider Electrical Accessories",
    tagline: "Safe. Reliable. Worldwide.",
    image: "/featured/accessories.png",
    price: 320,
    original: 365,
    rating: 4.5,
    reviews: 210,
    offPct: 12,
  },
  {
    name: "LED Lighting Solutions",
    tagline: "Bright Ideas. Brighter Spaces.",
    image: "/featured/lighting.png",
    price: 450,
    original: 565,
    rating: 4.5,
    reviews: 176,
    offPct: 20,
  },
]

const TRUST = [
  { icon: Truck, title: "Free Shipping", sub: "On orders over ৳5,000" },
  { icon: ShieldCheck, title: "Secure Payment", sub: "100% safe & trusted" },
  { icon: Headphones, title: "Expert Support", sub: "We're always here" },
  { icon: Leaf, title: "Clean Energy", sub: "A Greener Future" },
]

export function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-[2px] w-8 rounded-full bg-green-600" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-green-700 dark:text-green-500">
              Our Featured Products
            </span>
          </div>
          <h2 className="mt-2 font-heading text-[clamp(26px,3.6vw,40px)] font-extrabold leading-tight tracking-tight text-text">
            Powering a <span className="text-green-700 dark:text-green-500">Brighter Tomorrow</span>
          </h2>
          <p className="mt-1.5 text-[15px] text-muted">
            Premium solar and electrical products for a smarter, safer and greener life.
          </p>
        </div>
        <Link
          to="/products"
          className="hidden items-center gap-2 rounded-xl border border-green-600/40 px-4 py-2.5 text-sm font-bold text-green-700 no-underline transition-colors hover:bg-green-600 hover:text-white dark:text-green-500 sm:inline-flex"
        >
          View All Products <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.12fr_1fr]">
        <FeaturedCard />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <MiniCard key={p.name} product={p} />
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl border border-green-600/15 bg-green-50 px-5 py-5 dark:bg-green-500/[0.06] lg:grid-cols-4">
        {TRUST.map((t) => (
          <div key={t.title} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-600/12 text-green-700 dark:text-green-500">
              <t.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="truncate font-heading text-sm font-bold text-text">{t.title}</div>
              <div className="truncate text-xs text-muted">{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/products"
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-green-600/40 px-4 py-3 text-sm font-bold text-green-700 no-underline hover:bg-green-600 hover:text-white dark:text-green-500 sm:hidden"
      >
        View All Products <ArrowRight className="size-4" />
      </Link>
    </section>
  )
}

function FeaturedCard() {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-green-600/15 bg-[linear-gradient(155deg,#ecf8f0_0%,#f6fbf8_55%,#eef7f1_100%)] p-6 dark:bg-[linear-gradient(155deg,rgba(34,197,94,.10),rgba(34,197,94,.03))] sm:p-7">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_0.85fr]">
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-400 px-3 py-1.5 text-[12px] font-extrabold text-[#3d2f00]">
            <Zap className="size-3.5 fill-current" /> {FEATURED.badge}
          </span>
          <span className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.16em] text-muted">
            {FEATURED.eyebrow}
          </span>
          <h3 className="mt-1.5 font-heading text-[clamp(24px,3vw,32px)] font-extrabold leading-[1.1] tracking-tight text-text">
            {FEATURED.name}
          </h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{FEATURED.tagline}</p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {FEATURED.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-text">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                  <f.icon className="size-3.5" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-start justify-center">
          <ShowcaseImage src={FEATURED.image} alt={FEATURED.name} className="aspect-square w-full" />
          <span className="absolute right-0 top-0 flex size-[76px] flex-col items-center justify-center rounded-full bg-green-700 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wide text-white shadow-lg">
            <Leaf className="mb-0.5 size-3" />
            Save Energy
            <span className="my-0.5 h-px w-6 bg-white/40" />
            Save Money
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="font-heading text-[clamp(28px,4vw,36px)] font-extrabold tabular-nums text-green-700 dark:text-green-500">
          {formatBDT(FEATURED.price)}
        </span>
        <span className="text-lg tabular-nums text-muted line-through">{formatBDT(FEATURED.original)}</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1.1fr_0.9fr]">
        <Link
          to="/products"
          className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-green-600 text-[15px] font-bold text-white no-underline shadow-[0_10px_26px_rgba(22,163,74,.3)] transition-all hover:-translate-y-0.5 hover:bg-green-700"
        >
          <ShoppingCart className="size-[18px]" /> Add to Cart <ArrowRight className="size-[18px]" />
        </Link>
        <div className="flex items-center justify-around gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5">
          <MiniAssurance icon={Settings} title="Free" sub="Installation Support" />
          <span className="h-8 w-px bg-border" />
          <MiniAssurance icon={ShieldCheck} title="25 Years" sub="Warranty" />
        </div>
      </div>
    </div>
  )
}

function MiniAssurance({ icon: Icon, title, sub }: { icon: typeof Settings; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-5 shrink-0 text-green-700 dark:text-green-500" />
      <div className="leading-tight">
        <div className="text-[12.5px] font-extrabold text-text">{title}</div>
        <div className="text-[11px] text-muted">{sub}</div>
      </div>
    </div>
  )
}

function MiniCard({ product }: { product: MiniProduct }) {
  const [isWishlisted, setWishlisted] = useState(false)

  return (
    <div className="group relative flex flex-col rounded-[18px] border border-border bg-surface p-3.5 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow)]">
      <span className="absolute left-3 top-3 z-10 rounded-md bg-red-500 px-2 py-1 text-[10.5px] font-extrabold text-white">
        {product.offPct}% OFF
      </span>
      <button
        aria-label="Add to wishlist"
        onClick={() => setWishlisted((v) => !v)}
        className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/70 backdrop-blur-md transition-transform hover:scale-110 dark:bg-black/30"
      >
        <Heart className="size-4" stroke="#E23B3B" fill={isWishlisted ? "#E23B3B" : "none"} strokeWidth={1.75} />
      </button>

      <Link to="/products" className="flex items-center justify-center">
        <ShowcaseImage src={product.image} alt={product.name} className="aspect-[4/3] w-full" />
      </Link>

      <Link to="/products" className="mt-2 line-clamp-2 font-heading text-[14px] font-bold leading-tight text-text no-underline">
        {product.name}
      </Link>
      <p className="mt-1 line-clamp-1 text-[12px] text-muted">{product.tagline}</p>

      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="flex items-center gap-0.5 text-gold-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-[13px] fill-current" />
          ))}
        </span>
        <span className="text-[12px] text-muted">({product.reviews})</span>
      </div>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-heading text-[17px] font-extrabold tabular-nums text-green-700 dark:text-green-500">
          {formatBDT(product.price)}
        </span>
        <span className="text-[12.5px] tabular-nums text-muted line-through">{formatBDT(product.original)}</span>
      </div>

      <Link
        to="/products"
        className="mt-2.5 flex h-10 items-center justify-center gap-2 rounded-xl bg-green-600/12 text-[13px] font-bold text-green-700 no-underline transition-colors hover:bg-green-600 hover:text-white dark:text-green-500"
      >
        <ShoppingCart className="size-4" /> Add to Cart
      </Link>
    </div>
  )
}

// Renders the product photo, falling back to a branded gradient tile with the
// product's initial if the /public/featured/*.png file isn't present yet.
function ShowcaseImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[linear-gradient(150deg,#d8efe0,#eef7f1)] dark:bg-green-500/10 ${className ?? ""}`}
      >
        <span className="font-heading text-4xl font-extrabold text-green-700/40">{alt.charAt(0)}</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className ?? ""}`}
    />
  )
}
