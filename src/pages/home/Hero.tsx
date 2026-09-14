import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Truck, Wallet } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Typewriter } from "@/components/ui/typewriter"
import { useSiteContent } from "@/hooks/use-site-content"

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
  const { data: cms } = useSiteContent()
  const badge = cms?.hero_badge || "Bangladesh's trusted solar & electrical store"
  const headlinePrefix = cms?.hero_headline_prefix || "Powering Bangladesh with green &"
  const headlineHighlight = cms?.hero_headline_highlight || "renewable energy."
  const subheading =
    cms?.hero_subheading ||
    "Genuine solar panels, inverters, batteries, MCB & MCCB and complete power solutions — delivered nationwide with Cash on Delivery, bKash & Nagad."
  const heroImage = cms?.hero_image_url || "/hero-product-cutout.png"

  return (
    <section className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative mx-auto max-w-[1280px] px-4 pb-10 pt-8 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.15fr_0.62fr_1.1fr] lg:gap-6">
          <div>
            <span
              className="rsp-animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-muted shadow-[var(--shadow-sm)] backdrop-blur-sm"
              style={{ animationDelay: "0ms" }}
            >
              <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.2)]" />
              {badge}
            </span>
            <h1 className="mt-5 text-balance font-heading text-[clamp(32px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-tight text-text">
              <span className="rsp-animate-fade-up block" style={{ animationDelay: "120ms" }}>
                {headlinePrefix}
              </span>
              <span className="rsp-animate-fade-up block" style={{ animationDelay: "260ms" }}>
                <span className="relative inline-block bg-[linear-gradient(120deg,#2A6B08,#67A70E)] bg-clip-text text-transparent">
                  {headlineHighlight}
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
              </span>
            </h1>
            <p className="mt-6 min-h-[3.5em] max-w-[480px] text-[clamp(15px,2vw,18px)] leading-relaxed text-muted sm:min-h-[3em]">
              <Typewriter text={subheading} />
            </p>
            <div className="rsp-animate-fade-up mt-7 flex flex-wrap gap-3.5" style={{ animationDelay: "420ms" }}>
              <Button asChild size="lg">
                <Link to="/products">
                  Shop Solar <ArrowRight className="size-[18px]" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/products">Explore Products</Link>
              </Button>
            </div>
            <div
              className="rsp-animate-fade-up mt-9 grid max-w-[360px] grid-cols-2 gap-x-6 gap-y-5"
              style={{ animationDelay: "540ms" }}
            >
              <Stat value="12,000+" label="Orders delivered" />
              <Stat value="500+" label="Products in stock" />
              <Stat value="5★" label="Rated service" color="#67A70E" />
              <Stat value="24/7" label="Customer support" />
            </div>
          </div>

          <div className="rsp-animate-fade-up flex flex-row gap-3 lg:flex-col" style={{ animationDelay: "360ms" }}>
            {FEATURE_CARDS.map((f) => (
              <div
                key={f.title}
                className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-surface/85 p-3.5 shadow-[var(--shadow-sm)] backdrop-blur-sm lg:flex-none"
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

          <div className="rsp-animate-fade-up" style={{ animationDelay: "300ms" }}>
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
                src={heroImage}
                alt="Solar panels, Longi battery, Luminous battery, Growatt inverter and Schneider MCBs"
                className="mx-auto w-full max-w-[560px] object-contain drop-shadow-[0_24px_50px_rgba(5,44,110,.3)]"
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
      </div>
    </section>
  )
}

// Full-bleed layered hero backdrop approximating the reference art: a soft
// sky gradient, colored glows, a faint city skyline along the horizon and
// green "foliage" glows at the lower corners. Theme-aware: light sky by day,
// deep navy at night.
function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* base sky gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#eaf1fb_0%,#f5f8fd_45%,#eaf6dd_100%)] dark:bg-[linear-gradient(160deg,#041d3a_0%,#052C6E_45%,#08361f_100%)]" />
      {/* blue glow top-left */}
      <div
        className="absolute -left-[6%] -top-[10%] size-[460px] rounded-full opacity-30 blur-[40px] dark:opacity-40"
        style={{ background: "radial-gradient(circle,#217CCA 0%,transparent 68%)" }}
      />
      {/* warm sun glow right */}
      <div
        className="absolute right-[6%] top-[8%] size-[420px] rounded-full opacity-25 blur-[40px] dark:opacity-35"
        style={{ background: "radial-gradient(circle,#F49E09 0%,transparent 66%)" }}
      />
      {/* green foliage glows lower corners */}
      <div
        className="absolute -bottom-[12%] left-[-4%] size-[380px] rounded-full opacity-30 blur-[46px] dark:opacity-45"
        style={{ background: "radial-gradient(circle,#67A70E 0%,transparent 70%)" }}
      />
      <div
        className="absolute -bottom-[14%] right-[8%] size-[340px] rounded-full opacity-25 blur-[46px] dark:opacity-40"
        style={{ background: "radial-gradient(circle,#2A6B08 0%,transparent 70%)" }}
      />
      {/* faint city skyline along the horizon */}
      <svg
        viewBox="0 0 1440 240"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[45%] w-full text-blue-strong/10 dark:text-white/[0.06]"
        aria-hidden="true"
      >
        <g fill="currentColor">
          <rect x="40" y="120" width="46" height="120" />
          <rect x="96" y="90" width="34" height="150" />
          <rect x="140" y="140" width="52" height="100" />
          <rect x="205" y="70" width="30" height="170" />
          <rect x="245" y="110" width="44" height="130" />
          <rect x="300" y="150" width="60" height="90" />
          <rect x="372" y="95" width="34" height="145" />
          <rect x="416" y="130" width="48" height="110" />
          <rect x="474" y="60" width="28" height="180" />
          <rect x="512" y="115" width="50" height="125" />
          <rect x="574" y="145" width="56" height="95" />
          <rect x="640" y="100" width="32" height="140" />
          <rect x="682" y="135" width="46" height="105" />
          <rect x="738" y="80" width="30" height="160" />
          <rect x="778" y="120" width="52" height="120" />
          <rect x="840" y="150" width="58" height="90" />
          <rect x="908" y="98" width="34" height="142" />
          <rect x="952" y="132" width="48" height="108" />
          <rect x="1010" y="66" width="28" height="174" />
          <rect x="1048" y="118" width="50" height="122" />
          <rect x="1108" y="148" width="56" height="92" />
          <rect x="1174" y="102" width="32" height="138" />
          <rect x="1216" y="138" width="46" height="102" />
          <rect x="1272" y="86" width="30" height="154" />
          <rect x="1312" y="124" width="52" height="116" />
          <rect x="1374" y="150" width="46" height="90" />
        </g>
      </svg>
    </div>
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
