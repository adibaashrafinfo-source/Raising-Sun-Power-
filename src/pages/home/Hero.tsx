import { ArrowRight, CheckCircle2, Leaf } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Typewriter } from "@/components/ui/typewriter"
import { useSiteContent } from "@/hooks/use-site-content"

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

  return (
    <section className="relative overflow-hidden">
      {/* Brand gradient backdrop — no photograph, so the copy always stays crisp
          and the section costs nothing to load on a phone. */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#052C6E_0%,#04214f_55%,#03163a_100%)]" />
        <div
          className="pointer-events-none absolute -left-[10%] -top-[15%] size-[420px] rounded-full opacity-30 blur-[70px] sm:size-[560px]"
          style={{ background: "radial-gradient(circle,#217CCA 0%,transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -right-[12%] top-[35%] size-[380px] rounded-full opacity-25 blur-[70px] sm:size-[520px]"
          style={{ background: "radial-gradient(circle,#67A70E 0%,transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute right-[18%] -top-[10%] size-[260px] rounded-full opacity-20 blur-[60px] sm:size-[340px]"
          style={{ background: "radial-gradient(circle,#F49E09 0%,transparent 70%)" }}
        />
        {/* faint grid for texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* fade into the page below */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,var(--bg))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-11 sm:px-6 sm:py-14 lg:py-20">
        <div className="max-w-[640px]">
          <span
            className="rsp-animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm"
            style={{ animationDelay: "0ms" }}
          >
            <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.25)]" />
            {badge}
          </span>

          <h1 className="mt-5 text-balance font-heading text-[clamp(28px,7vw,54px)] font-extrabold leading-[1.08] tracking-tight text-white">
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

          <p className="mt-5 min-h-[4.5em] max-w-[520px] text-[clamp(14.5px,3.6vw,18px)] sm:mt-6 sm:min-h-[3.5em] leading-relaxed text-[#C9DAF2] sm:min-h-[3em]">
            <Typewriter text={subheading} />
          </p>

          <div className="rsp-animate-fade-up mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5" style={{ animationDelay: "420ms" }}>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/products">
                Shop Solar <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full border border-white/25 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
            >
              <Link to="/products">Explore Products</Link>
            </Button>
          </div>

          <div className="rsp-animate-fade-up mt-8 grid max-w-[420px] grid-cols-2 gap-x-5 gap-y-4 sm:mt-9 sm:gap-x-6 sm:gap-y-5" style={{ animationDelay: "540ms" }}>
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

      </div>
    </section>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div>
      <div
        className="font-heading text-[clamp(19px,5vw,26px)] font-extrabold tabular-nums text-white"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="text-[13px] font-medium text-white/70">{label}</div>
    </div>
  )
}
