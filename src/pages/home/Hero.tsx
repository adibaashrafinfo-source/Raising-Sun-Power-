import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Truck, Wallet } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Typewriter } from "@/components/ui/typewriter"
import { useSiteContent } from "@/hooks/use-site-content"

const FEATURE_CARDS = [
  { icon: Leaf, color: "#67A70E", title: "Genuine Products", body: "100% authentic & branded" },
  { icon: ShieldCheck, color: "#4b9be6", title: "Warranty Support", body: "Peace of mind" },
  { icon: Truck, color: "#F49E09", title: "Nationwide Delivery", body: "Fast & reliable" },
  { icon: Wallet, color: "#b794f6", title: "Multiple Payment Options", body: "COD, bKash, Nagad" },
]

const SHOWCASE_POINTS = [
  { icon: Leaf, label: "Save Electricity Cost" },
  { icon: CheckCircle2, label: "A Greener Bangladesh" },
  { icon: ArrowRight, label: "Sustainable Future" },
]

export function Hero() {
  const { data: cms } = useSiteContent()
  const badge = cms?.hero_badge || "Bangladesh's trusted solar & electrical store"
  const headlinePrefix = cms?.hero_headline_prefix || "Powering Bangladesh with green &"
  const headlineHighlight = cms?.hero_headline_highlight || "renewable energy."
  const subheading =
    cms?.hero_subheading ||
    "Genuine solar panels, inverters, batteries, MCB & MCCB and complete power solutions — delivered nationwide with Cash on Delivery, bKash & Nagad."
  const heroBg = cms?.hero_image_url || "/hero-bg.png"

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden sm:min-h-[600px] lg:min-h-[660px]">
      {/* Full-bleed background image + legibility overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#04102a]" />
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
        />
        {/* left-weighted darkening so headline text stays readable */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,42,.94)_0%,rgba(4,16,42,.78)_38%,rgba(4,16,42,.45)_66%,rgba(4,16,42,.2)_100%)]" />
        {/* subtle bottom fade into the page */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,var(--bg))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-14 sm:px-6 lg:py-20">
        <div className="max-w-[640px]">
          <span
            className="rsp-animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm"
            style={{ animationDelay: "0ms" }}
          >
            <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.25)]" />
            {badge}
          </span>

          <h1 className="mt-5 text-balance font-heading text-[clamp(32px,5vw,54px)] font-extrabold leading-[1.08] tracking-tight text-white">
            <span className="rsp-animate-fade-up block" style={{ animationDelay: "120ms" }}>
              {headlinePrefix}
            </span>
            <span className="rsp-animate-fade-up block" style={{ animationDelay: "260ms" }}>
              <span className="relative inline-block bg-[linear-gradient(120deg,#8fe36a,#F4D560)] bg-clip-text text-transparent">
                {headlineHighlight}
                <svg
                  viewBox="0 0 220 14"
                  className="absolute -bottom-2 left-0 h-3 w-full text-orange-500"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 10c40-10 140-10 216 1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </h1>

          <p className="mt-6 min-h-[3.5em] max-w-[520px] text-[clamp(15px,2vw,18px)] leading-relaxed text-[#C9DAF2] sm:min-h-[3em]">
            <Typewriter text={subheading} />
          </p>

          <div className="rsp-animate-fade-up mt-7 flex flex-wrap gap-3.5" style={{ animationDelay: "420ms" }}>
            <Button asChild size="lg">
              <Link to="/products">
                Shop Solar <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
            >
              <Link to="/products">Explore Products</Link>
            </Button>
          </div>

          <div className="rsp-animate-fade-up mt-9 grid max-w-[420px] grid-cols-2 gap-x-6 gap-y-5" style={{ animationDelay: "540ms" }}>
            <Stat value="12,000+" label="Orders delivered" />
            <Stat value="500+" label="Products in stock" />
            <Stat value="5★" label="Rated service" color="#8fe36a" />
            <Stat value="24/7" label="Customer support" />
          </div>

          <div className="rsp-animate-fade-up mt-8 flex flex-wrap gap-x-5 gap-y-2.5" style={{ animationDelay: "620ms" }}>
            {SHOWCASE_POINTS.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-[13px] font-semibold text-white/85">
                <span className="flex size-6 items-center justify-center rounded-full bg-green-500/25">
                  <p.icon className="size-[13px] text-green-300" />
                </span>
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards — glass row across the bottom of the hero */}
        <div className="rsp-animate-fade-up mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: "700ms" }}>
          {FEATURE_CARDS.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.08] p-3.5 backdrop-blur-md"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <f.icon className="size-5" style={{ color: f.color }} />
              </span>
              <div className="min-w-0">
                <div className="truncate font-heading text-[13.5px] font-bold text-white">{f.title}</div>
                <div className="truncate text-xs text-white/65">{f.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div>
      <div
        className="font-heading text-[clamp(20px,2.6vw,26px)] font-extrabold tabular-nums text-white"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="text-[13px] font-medium text-white/70">{label}</div>
    </div>
  )
}
