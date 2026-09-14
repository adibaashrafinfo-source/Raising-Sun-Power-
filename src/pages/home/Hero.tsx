import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Truck, Wallet } from "lucide-react"
import { Link } from "react-router-dom"

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
            <span className="text-blue">green &amp;</span>{" "}
            <span className="relative inline-block bg-[linear-gradient(120deg,#2A6B08,#67A70E)] bg-clip-text text-transparent">
              renewable energy.
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
            <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#F4D560,#F49E09)] px-3 py-1.5 text-xs font-extrabold text-[#3a2600] shadow-[var(--shadow-sm)]">
              ☀ Best Seller
            </span>
            <span className="absolute right-0 top-0 z-10 hidden max-w-[150px] -rotate-2 text-right font-heading text-[15px] font-bold italic leading-tight text-blue sm:block">
              Clean Energy,
              <br />
              <span className="text-green-600">Brighter Tomorrow</span>
            </span>

            <img
              src="/hero-product-cutout.png"
              alt="Solar panels, Longi battery, Luminous battery, Growatt inverter and Schneider MCBs"
              className="mx-auto w-full max-w-[560px] object-contain"
            />

            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-2xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow)]">
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

          <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-2.5">
            {SHOWCASE_POINTS.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-[13px] font-semibold text-muted">
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
