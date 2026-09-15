import {
  BadgeCheck,
  ChevronRight,
  FileText,
  Headphones,
  Leaf,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sun,
  Wrench,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { CtaBand } from "@/pages/home/CtaBand"
import { SEO_KEYWORDS, SITE_DESCRIPTION } from "@/data/company"
import { useSeo } from "@/hooks/use-seo"
import { useSiteContent } from "@/hooks/use-site-content"

const STATS = [
  { value: "12,000+", label: "Orders delivered" },
  { value: "500+", label: "Products in stock" },
  { value: "8+", label: "Years in business" },
  { value: "64", label: "Districts covered" },
]

const MISSION_PILLARS = [
  { icon: Leaf, title: "Clean Energy", body: "Renewable power that cuts bills and carbon together." },
  { icon: Lightbulb, title: "Smart Solutions", body: "Correctly sized systems, engineered for real conditions." },
  { icon: Sun, title: "Brighter Future", body: "Reliable power for every home, business and institution." },
]

const FOCUS = [
  "Genuine products",
  "Technical support",
  "Professional installation",
  "Transparent quotation",
  "Reliable after-sales service",
]

const WHY_CHOOSE = [
  {
    icon: BadgeCheck,
    tint: "rgba(33,124,202,.14)",
    color: "#217CCA",
    title: "Genuine Products",
    body: "Verified sourcing and brand-focused product supply.",
  },
  {
    icon: Headphones,
    tint: "rgba(103,167,14,.14)",
    color: "#67A70E",
    title: "Technical Support",
    body: "Product selection and solar system guidance.",
  },
  {
    icon: Wrench,
    tint: "rgba(244,158,9,.16)",
    color: "#F49E09",
    title: "Professional Installation",
    body: "Site survey, installation and commissioning support.",
  },
  {
    icon: FileText,
    tint: "rgba(11,63,148,.14)",
    color: "#0B3F94",
    title: "Transparent Pricing",
    body: "Clear quotation and scope.",
  },
  {
    icon: ShieldCheck,
    tint: "rgba(226,59,59,.13)",
    color: "#E23B3B",
    title: "After-Sales Support",
    body: "Warranty and service coordination.",
  },
]

export default function AboutPage() {
  useSeo({
    title: "About Us",
    description: SITE_DESCRIPTION,
    keywords: SEO_KEYWORDS,
  })
  const { data: cms } = useSiteContent()
  const badge = cms?.about_badge || "Bangladesh's trusted solar & electrical partner"
  const title = cms?.about_title || "Solar products, EPC & installation"
  const highlight = cms?.about_highlight || "across Bangladesh."
  const intro =
    cms?.about_intro ||
    "Rising Sun Power BD is a Bangladesh-based solar and electrical products supplier and solar EPC & installation service provider. We provide solar PV products, inverters, batteries, electrical protection equipment and complete solar solutions for residential, commercial, and institutional applications."
  const storyParagraphs = (cms?.about_story || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const offices = [
    {
      name: cms?.showroom_1_name || "Head Office",
      address:
        cms?.showroom_1_address ||
        "House No-125/4, Hosen Ali Road, Baganbari, North Vashantek, Near to CMH, Dhaka Cantonment-1206",
    },
    {
      name: cms?.showroom_2_name || "Local Office",
      address: cms?.showroom_2_address || "Lotra Bazar, Saharasti, Chandpur-3620",
    },
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

      {/* Intro */}
      <section className="relative mx-auto max-w-[1280px] overflow-hidden px-4 pb-10 pt-4 sm:px-6">
        <div
          className="pointer-events-none absolute -top-10 left-[6%] size-[340px] rounded-full opacity-15 blur-[18px]"
          style={{ background: "radial-gradient(circle,#217CCA 0%,transparent 68%)" }}
        />
        <div
          className="pointer-events-none absolute right-[2%] top-[80px] size-[320px] rounded-full opacity-15 blur-[20px]"
          style={{ background: "radial-gradient(circle,#F49E09 0%,transparent 66%)" }}
        />
        <div className="relative mx-auto max-w-[820px] text-center">
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
              {i > 0 && <div className="hidden h-10 w-px bg-border sm:block" />}
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

      {/* Our Mission */}
      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-6 sm:px-6">
        <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(160deg,#052C6E,#04214f_55%,#03163a)] p-7 shadow-[0_24px_60px_rgba(5,44,110,.35)] sm:p-11">
          <div
            className="pointer-events-none absolute -right-10 -top-16 size-[300px] rounded-full opacity-30 blur-[12px]"
            style={{ background: "radial-gradient(circle,#67A70E 0%,transparent 68%)" }}
          />
          <div className="relative text-center">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-400">Our Mission</span>
            <h2 className="mt-2.5 font-heading text-[clamp(22px,3.4vw,34px)] font-extrabold tracking-tight text-white">
              Clean Energy <span className="text-gold-400">•</span> Smart Solutions{" "}
              <span className="text-gold-400">•</span> Brighter Future
            </h2>
          </div>
          <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {MISSION_PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/12 bg-white/[0.07] p-5 backdrop-blur-md"
              >
                <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-white/10">
                  <p.icon className="size-5 text-gold-400" />
                </span>
                <div className="font-heading text-base font-bold text-white">{p.title}</div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#9DB6DA]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Focus */}
      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Our Focus</span>
          <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
            What we hold ourselves to
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FOCUS.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-500/16">
                <Sparkles className="size-[18px] text-green-600" />
              </span>
              <span className="text-[13.5px] font-bold leading-tight text-text">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Why RSP</span>
          <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
            Why Choose Rising Sun Power BD?
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE.map((item) => (
            <div
              key={item.title}
              className="rounded-[18px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[var(--shadow)]"
            >
              <span
                className="mb-4 flex size-[50px] items-center justify-center rounded-2xl"
                style={{ background: item.tint }}
              >
                <item.icon className="size-6" style={{ color: item.color }} />
              </span>
              <div className="font-heading text-base font-bold text-text">{item.title}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Optional CMS story */}
      {storyParagraphs.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
          <div className="mx-auto max-w-[820px]">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Our story</span>
            <h2 className="mt-2 font-heading text-[clamp(22px,3vw,28px)] font-extrabold tracking-tight text-text">
              From one office to a nationwide supplier
            </h2>
            {storyParagraphs.map((p, i) => (
              <p key={i} className="mt-4 text-[15px] leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Offices */}
      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Visit us</span>
          <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
            Our offices
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {offices.map((s) => (
            <OfficeCard key={s.name} name={s.name} address={s.address} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/solar-assessment">Get Free Solar Assessment</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>

      <CtaBand />
    </main>
  )
}

function OfficeCard({ name, address }: { name: string; address: string }) {
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
