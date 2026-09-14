import { Award, BadgeCheck, ChevronRight, HeartHandshake, MapPin, ShieldCheck, Truck, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { CtaBand } from "@/pages/home/CtaBand"
import { useSeo } from "@/hooks/use-seo"
import { useSiteContent } from "@/hooks/use-site-content"

const STATS = [
  { value: "12,000+", label: "Orders delivered" },
  { value: "500+", label: "Products in stock" },
  { value: "8+", label: "Years in business" },
  { value: "64", label: "Districts covered" },
]

const VALUES = [
  {
    icon: BadgeCheck,
    tint: "rgba(33,124,202,.14)",
    color: "#217CCA",
    title: "Genuine Products Only",
    body: "Every panel, inverter and battery we sell is sourced directly from authorized distributors — no gray-market or counterfeit stock, ever.",
  },
  {
    icon: ShieldCheck,
    tint: "rgba(103,167,14,.14)",
    color: "#67A70E",
    title: "Warranty You Can Trust",
    body: "Brand-backed warranty support on every product, with our team handling the claims process for you, not passing you back to the manufacturer.",
  },
  {
    icon: Truck,
    tint: "rgba(244,158,9,.16)",
    color: "#F49E09",
    title: "Nationwide Delivery",
    body: "From Dhaka to the furthest upazila, we deliver in 2–4 days with Cash on Delivery, bKash and Nagad payment options.",
  },
  {
    icon: HeartHandshake,
    tint: "rgba(11,63,148,.14)",
    color: "#0B3F94",
    title: "After-Sales, Actually",
    body: "Free sizing consultations, WhatsApp support, and engineers who answer the phone — before and after you buy.",
  },
]

export default function AboutPage() {
  useSeo({
    title: "About Us",
    description:
      "Rising Sun Power BD is Bangladesh's trusted solar & electrical products store — genuine brands, engineered reliability, nationwide delivery.",
  })
  const { data: cms } = useSiteContent()
  const badge = cms?.about_badge || "Bangladesh's trusted solar & electrical store"
  const title = cms?.about_title || "Powering Bangladeshi homes and businesses"
  const highlight = cms?.about_highlight || "since day one."
  const intro =
    cms?.about_intro ||
    "Rising Sun Power BD started with a simple frustration: too many customers were being sold mismatched, undersized or outright fake solar equipment. We built a store — and a team — around fixing that."
  const storyParagraphs = (cms?.about_story || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const showrooms = [
    { name: cms?.showroom_1_name || "Dhaka Showroom", address: cms?.showroom_1_address || "Nawabpur Road, Electrical Market, Dhaka 1100" },
    { name: cms?.showroom_2_name || "Chattogram Branch", address: cms?.showroom_2_address || "Reazuddin Bazar, Kotwali, Chattogram 4000" },
  ].filter((s) => s.name || s.address)

  return (
    <main>
      <div className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-6 sm:pt-7">
        <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
          <Link to="/" className="text-muted no-underline hover:text-blue">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-text">About Us</span>
        </div>
      </div>

      <section className="relative mx-auto max-w-[1280px] overflow-hidden px-4 pb-10 pt-4 sm:px-6">
        <div
          className="pointer-events-none absolute -top-10 left-[6%] size-[340px] rounded-full opacity-15 blur-[18px]"
          style={{ background: "radial-gradient(circle,#217CCA 0%,transparent 68%)" }}
        />
        <div
          className="pointer-events-none absolute right-[2%] top-[80px] size-[320px] rounded-full opacity-15 blur-[20px]"
          style={{ background: "radial-gradient(circle,#F49E09 0%,transparent 66%)" }}
        />
        <div className="relative mx-auto max-w-[760px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-[var(--shadow-sm)]">
            <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.2)]" />
            {badge}
          </span>
          <h1 className="mt-5 text-balance font-heading text-[clamp(30px,4.6vw,48px)] font-extrabold leading-[1.1] tracking-tight text-text">
            {title}{" "}
            <span className="bg-[linear-gradient(120deg,#217CCA,#F49E09_52%,#67A70E)] bg-clip-text text-transparent">
              {highlight}
            </span>
          </h1>
          <p className="mt-5 text-[clamp(15px,2vw,17px)] leading-relaxed text-muted">{intro}</p>
        </div>

        <div className="mx-auto mt-9 flex max-w-[820px] flex-wrap items-center justify-center gap-6 sm:gap-10">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-6 sm:gap-10">
              {i > 0 && <div className="h-10 w-px bg-border" />}
              <div className="text-center">
                <div className="font-heading text-[clamp(22px,3vw,28px)] font-extrabold tabular-nums text-text">
                  {s.value}
                </div>
                <div className="text-[13px] font-medium text-muted">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-6 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Our story</span>
            <h2 className="mt-2 font-heading text-[clamp(22px,3vw,28px)] font-extrabold tracking-tight text-text">
              From one showroom to a nationwide supplier
            </h2>
            {storyParagraphs.map((p, i) => (
              <p key={i} className="mt-4 text-[15px] leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Our mission</span>
            <div className="mt-2 flex flex-col gap-4">
              <div className="rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
                <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-orange-500/16">
                  <Award className="size-5 text-orange-500" />
                </span>
                <div className="font-heading text-base font-bold text-text">Reliability first</div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  Make genuine, correctly-sized solar and electrical equipment accessible to every Bangladeshi
                  household and business.
                </p>
              </div>
              <div className="rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
                <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-blue/16">
                  <Users className="size-5 text-blue" />
                </span>
                <div className="font-heading text-base font-bold text-text">Customers, not just orders</div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  Free sizing advice, honest recommendations, and support that doesn't disappear after
                  checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Why RSP</span>
          <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
            What we promise, every order
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((item) => (
            <div key={item.title} className="rounded-[18px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
              <span className="mb-4 flex size-[50px] items-center justify-center rounded-2xl" style={{ background: item.tint }}>
                <item.icon className="size-6" style={{ color: item.color }} />
              </span>
              <div className="font-heading text-base font-bold text-text">{item.title}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Visit us</span>
          <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
            Our showrooms
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {showrooms.map((s) => (
            <ShowroomCard key={s.name} name={s.name} address={s.address} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>

      <CtaBand />
    </main>
  )
}

function ShowroomCard({ name, address }: { name: string; address: string }) {
  return (
    <div className="flex items-start gap-3.5 rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/16">
        <MapPin className="size-5 text-orange-500" />
      </span>
      <div>
        <div className="font-heading text-base font-bold text-text">{name}</div>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{address}</p>
      </div>
    </div>
  )
}
