import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Truck, Wallet } from "lucide-react"
import { Link } from "react-router-dom"

import { ProductArt } from "@/components/product/ProductArt"
import { Button } from "@/components/ui/button"

const FEATURE_CARDS = [
  {
    icon: Leaf,
    tint: "rgba(103,167,14,.14)",
    color: "#67A70E",
    title: "Genuine Products",
    body: "100% authentic & branded",
  },
  {
    icon: ShieldCheck,
    tint: "rgba(33,124,202,.14)",
    color: "#217CCA",
    title: "Warranty Support",
    body: "Peace of mind",
  },
  {
    icon: Truck,
    tint: "rgba(244,158,9,.16)",
    color: "#F49E09",
    title: "Nationwide Delivery",
    body: "Fast & reliable",
  },
  {
    icon: Wallet,
    tint: "rgba(139,92,246,.14)",
    color: "#8B5CF6",
    title: "Multiple Payment Options",
    body: "COD, bKash, Nagad",
  },
]

const SHOWCASE_POINTS = [
  { icon: Leaf, label: "Save Electricity Cost" },
  { icon: CheckCircle2, label: "A Greener Bangladesh" },
  { icon: ArrowRight, label: "Sustainable Future" },
]

export function Hero() {
  return (
    <section className="relative mx-auto max-w-[1280px] overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pt-16">
      <div
        className="pointer-events-none absolute -top-10 left-[6%] size-[340px] rounded-full opacity-15 blur-[18px]"
        style={{ background: "radial-gradient(circle,#217CCA 0%,transparent 68%)" }}
      />
      <div
        className="pointer-events-none absolute right-[2%] top-[120px] size-[380px] rounded-full opacity-15 blur-[20px]"
        style={{ background: "radial-gradient(circle,#F49E09 0%,transparent 66%)" }}
      />
      <div className="relative grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.15fr_0.62fr_1.1fr] lg:gap-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-[var(--shadow-sm)]">
            <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.2)]" />
            Bangladesh's trusted solar &amp; electrical store
          </span>
          <h1 className="mt-5 text-balance font-heading text-[clamp(32px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-tight text-text">
            Powering Bangladesh with{" "}
            <span className="text-blue">clean,</span>{" "}
            <span className="relative inline-block bg-[linear-gradient(120deg,#2A6B08,#67A70E)] bg-clip-text text-transparent">
              reliable energy.
              <svg
                viewBox="0 0 220 14"
                className="absolute -bottom-2 left-0 h-3 w-full text-orange-500"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 10c40-10 140-10 216 1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-[480px] text-[clamp(15px,2vw,18px)] leading-relaxed text-muted">
            Genuine solar panels, inverters, batteries, MCB &amp; MCCB and complete power
            solutions — delivered nationwide with Cash on Delivery, bKash &amp; Nagad.
          </p>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <Button asChild size="lg">
              <Link to="/products">
                Shop Solar <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/products">Explore Products</Link>
            </Button>
          </div>
          <div className="mt-9 grid max-w-[360px] grid-cols-2 gap-x-6 gap-y-5">
            <Stat value="12,000+" label="Orders delivered" />
            <Stat value="500+" label="Products in stock" />
            <Stat value="5★" label="Rated service" color="#67A70E" />
            <Stat value="24/7" label="Customer support" />
          </div>
        </div>

        <div className="flex flex-row gap-3 lg:flex-col">
          {FEATURE_CARDS.map((f) => (
            <div
              key={f.title}
              className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-sm)] lg:flex-none"
            >
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: f.tint }}
              >
                <f.icon className="size-5" style={{ color: f.color }} />
              </span>
              <div className="hidden min-w-0 sm:block">
                <div className="truncate font-heading text-[13.5px] font-bold text-text">{f.title}</div>
                <div className="truncate text-xs text-muted">{f.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-7 pb-10 shadow-[0_24px_60px_rgba(5,44,110,.4)]">
            <div className="relative flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#F4D560,#F49E09)] px-3 py-1.5 text-xs font-extrabold text-[#3a2600]">
                ☀ Best Seller
              </span>
              <span className="hidden max-w-[150px] rounded-xl bg-white/12 px-3 py-2 text-right text-[11px] font-bold leading-tight text-white backdrop-blur-sm sm:block">
                Clean Energy,
                <br />
                <span className="text-gold-400">Brighter Tomorrow</span>
              </span>
            </div>
            <div className="relative mt-5 flex h-[190px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#EAF1FB,#C9DCF3)] shadow-[inset_0_1px_0_rgba(255,255,255,.7)]">
              <ProductArt art="panel" className="h-[120px] w-[150px]" />
            </div>
            <div className="relative mt-5 flex items-end justify-between gap-3">
              <div>
                <div className="font-heading text-base font-bold text-[#EAF1FB]">
                  Longi Hi-MO 550W Mono Panel
                </div>
                <div className="mt-1 text-[13px] text-[#B7D2F2]">
                  Tier-1 · 25-yr performance warranty
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-[#93A2BC] line-through">৳21,000</div>
                <div className="font-heading text-2xl font-extrabold tabular-nums text-orange-400">
                  ৳18,500
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-2xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow)]">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-green-500/15">
              <Leaf className="size-[18px] text-green-600" />
            </span>
            <div>
              <div className="text-[13px] font-bold text-text">Sustainable Today</div>
              <div className="text-xs text-muted">Brighter Tomorrow</div>
            </div>
            <span className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
              <ArrowRight className="size-4" />
            </span>
          </div>
          </div>

          <div className="mt-9 hidden flex-col gap-2.5 sm:flex">
            {SHOWCASE_POINTS.map((p) => (
              <div key={p.label} className="flex items-center gap-2.5 text-[13px] font-semibold text-muted">
                <span className="flex size-7 items-center justify-center rounded-full bg-green-500/14">
                  <p.icon className="size-[13px] text-green-600" />
                </span>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div>
      <div
        className="font-heading text-[clamp(20px,2.6vw,24px)] font-extrabold tabular-nums text-text"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="text-[13px] font-medium text-muted">{label}</div>
    </div>
  )
}
