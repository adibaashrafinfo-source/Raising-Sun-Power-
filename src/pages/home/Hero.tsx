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
    "Genuine solar panels, inverters, batteries, MCB & MCCB and complete power solutions."

  return (
    // data-hero lets the header find this section so it can hide itself once
    // the visitor scrolls past it.
    <section data-hero className="relative overflow-hidden">
      {/* Gradient backdrop — no photograph, so the copy always stays crisp and
          the section costs nothing to load on a phone. Every colour comes from
          a --hero-* token, which is how the section follows light/dark mode. */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ background: "var(--hero-bg)" }} />
        <div
          className="pointer-events-none absolute -left-[10%] -top-[15%] size-[420px] rounded-full blur-[70px] sm:size-[560px]"
          style={{
            background: "radial-gradient(circle,#217CCA 0%,transparent 70%)",
            opacity: "var(--hero-glow-opacity)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-[12%] top-[35%] size-[380px] rounded-full blur-[70px] sm:size-[520px]"
          style={{
            background: "radial-gradient(circle,#67A70E 0%,transparent 70%)",
            opacity: "var(--hero-glow-opacity)",
          }}
        />
        <div
          className="pointer-events-none absolute right-[18%] -top-[10%] size-[260px] rounded-full blur-[60px] sm:size-[340px]"
          style={{
            background: "radial-gradient(circle,#F49E09 0%,transparent 70%)",
            opacity: "var(--hero-glow-opacity)",
          }}
        />
        {/* faint grid for texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--hero-grid) 1px,transparent 1px),linear-gradient(90deg,var(--hero-grid) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
            opacity: "var(--hero-grid-opacity)",
          }}
        />
        {/* fade into the page below */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,var(--bg))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-9 text-center sm:px-6 sm:py-14 lg:py-20">
        <div className="mx-auto flex max-w-[760px] flex-col items-center">
          <span
            className="rsp-animate-fade-up inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-[var(--hero-text)] backdrop-blur-sm sm:px-3.5 sm:text-xs"
            style={{
              animationDelay: "0ms",
              background: "var(--hero-chip-bg)",
              borderColor: "var(--hero-chip-border)",
            }}
          >
            <span className="size-[7px] shrink-0 rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.25)]" />
            {badge}
          </span>

          <h1 className="mt-4 text-balance font-heading text-[clamp(25px,6vw,52px)] font-extrabold leading-[1.12] tracking-tight text-[var(--hero-text)] sm:mt-5 sm:leading-[1.08]">
            <span className="rsp-animate-fade-up block" style={{ animationDelay: "120ms" }}>
              {headlinePrefix}
            </span>
            <span className="rsp-animate-fade-up block" style={{ animationDelay: "260ms" }}>
              <span
                className="relative inline-block bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--hero-highlight)" }}
              >
                {headlineHighlight}
                <svg
                  viewBox="0 0 220 14"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-orange-500 sm:-bottom-2 sm:h-3"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 10c40-10 140-10 216 1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </h1>

          {/* The min-height reserves the typewriter's final line count so the
              buttons below never jump while the text types itself out. */}
          <p className="mx-auto mt-4 min-h-[3.4em] max-w-[560px] text-[clamp(14px,3.4vw,17px)] leading-relaxed text-[var(--hero-muted)] sm:mt-5 sm:min-h-[2.6em]">
            <Typewriter text={subheading} />
          </p>

          <div
            className="rsp-animate-fade-up mt-5 flex w-full flex-row flex-nowrap justify-center gap-2.5 sm:mt-7 sm:flex-wrap sm:gap-3.5"
            style={{ animationDelay: "420ms" }}
          >
            <Button asChild size="lg" className="min-w-0 flex-1 px-4 text-sm sm:flex-none sm:px-6 sm:text-base">
              <Link to="/products">
                Shop Solar <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="min-w-0 flex-1 border bg-[var(--hero-ghost-bg)] px-4 text-sm text-[var(--hero-text)] hover:brightness-95 sm:flex-none sm:px-6 sm:text-base"
            style={{ borderColor: "var(--hero-ghost-border)" }}
            >
              <Link to="/products">Explore Products</Link>
            </Button>
          </div>

          <div
            className="rsp-animate-fade-up mx-auto mt-6 grid w-full max-w-[560px] grid-cols-4 gap-x-2 sm:mt-9 sm:gap-x-6"
            style={{ animationDelay: "540ms" }}
          >
            <Stat value="12,000+" label="Orders delivered" />
            <Stat value="500+" label="Products in stock" />
            <Stat value="5★" label="Rated service" accent />
            <Stat value="24/7" label="Customer support" />
          </div>

          {/* Desktop only — on a phone these repeat the headline and only make
              the hero taller before the products come into view. */}
          <div
            className="rsp-animate-fade-up mt-8 hidden flex-wrap justify-center gap-x-5 gap-y-2.5 sm:flex"
            style={{ animationDelay: "620ms" }}
          >
            {SHOWCASE_POINTS.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-[13px] font-semibold text-[var(--hero-muted)]">
                <span className="flex size-6 items-center justify-center rounded-full bg-green-500/25">
                  <p.icon className="size-[13px] text-[var(--hero-accent)]" />
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

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div
        className="font-heading text-[clamp(15px,4.2vw,26px)] font-extrabold tabular-nums"
        style={{ color: accent ? "var(--hero-accent)" : "var(--hero-text)" }}
      >
        {value}
      </div>
      <div className="text-[11px] font-medium leading-tight text-[var(--hero-muted)] sm:text-[13px]">
        {label}
      </div>
    </div>
  )
}
