import { useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  ChevronRight,
  Handshake,
  HardHat,
  MessageCircle,
  Package,
  Phone,
  Store,
  Truck,
  Wallet,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COMPANY, SEO_KEYWORDS, telLink, whatsappLink } from "@/data/company"
import { useCreateLead } from "@/hooks/use-leads"
import { useSeo } from "@/hooks/use-seo"
import { generateRefId } from "@/lib/queries/leads"
import {
  type WholesaleFormValues,
  wholesaleInquiryTypes,
  wholesaleSchema,
} from "@/lib/schemas/wholesale"
import { cn } from "@/lib/utils"
import type { LeadInsert } from "@/types/database"

const BUYERS = [
  { icon: Store, title: "Dealers", body: "Retail shops and distributors across all 64 districts." },
  { icon: HardHat, title: "Installers", body: "Solar installers and EPC teams needing reliable stock." },
  { icon: Building2, title: "Contractors", body: "Electrical contractors sourcing protection devices." },
  { icon: Package, title: "Project Buyers", body: "Institutional and commercial bulk procurement." },
]

const BENEFITS = [
  { icon: Wallet, title: "Competitive Slab Pricing", body: "Volume-based pricing with a clear, written scope." },
  { icon: Package, title: "Genuine Brand Stock", body: "Verified sourcing — panels, inverters, batteries, SPD/MCB." },
  { icon: Truck, title: "Nationwide Dispatch", body: "Courier and transport support to your district." },
  { icon: Handshake, title: "Dealer Support", body: "Technical training, product guidance and after-sales help." },
]

export default function WholesalePage() {
  useSeo({
    title: "Wholesale & Dealer",
    description:
      "Wholesale solar panels, inverters, batteries and electrical protection devices for dealers, installers, contractors and project buyers across Bangladesh.",
    keywords: SEO_KEYWORDS,
  })
  const formRef = useRef<HTMLDivElement>(null)
  const createLead = useCreateLead()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WholesaleFormValues>({ resolver: zodResolver(wholesaleSchema) })

  const inquiryType = watch("inquiryType")

  const jumpToForm = (type: (typeof wholesaleInquiryTypes)[number]) => {
    setValue("inquiryType", type, { shouldValidate: false })
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const onSubmit = async (values: WholesaleFormValues) => {
    const refId = generateRefId()
    const noteParts = [
      values.company ? `Company: ${values.company}` : null,
      values.message || null,
    ].filter(Boolean)
    const lead: LeadInsert = {
      ref_id: refId,
      name: values.name,
      phone: values.phone,
      email: null,
      division: null,
      district: null,
      location: values.location,
      customer_type: values.inquiryType,
      system_type: null,
      monthly_bill: null,
      roof_type: null,
      load_watt: null,
      backup_hours: null,
      budget_range: null,
      timeline: null,
      notes: noteParts.join(" — ") || null,
      source: "wholesale",
      status: "new",
    }
    try {
      await createLead.mutateAsync(lead)
      toast.success("Request received — our sales team will contact you shortly.")
      reset()
    } catch {
      toast.error("Couldn't submit your request. Please check your connection and try again.")
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-6 sm:pt-7">
        <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
          <Link to="/" className="-my-1 py-1 text-muted no-underline hover:text-blue">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-text">Wholesale &amp; Dealer</span>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-4 pb-6 sm:px-6">
        <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(160deg,#052C6E,#04214f_55%,#03163a)] p-7 shadow-[0_24px_60px_rgba(5,44,110,.35)] sm:p-12">
          <div
            className="pointer-events-none absolute -right-10 -top-16 size-[320px] rounded-full opacity-30 blur-[12px]"
            style={{ background: "radial-gradient(circle,#F49E09 0%,transparent 68%)" }}
          />
          <div className="relative max-w-[720px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.25)]" />
              B2B &amp; Dealer Supply
            </span>
            <h1 className="mt-5 text-balance font-heading text-[clamp(28px,4.4vw,44px)] font-extrabold leading-[1.1] tracking-tight text-white">
              Wholesale Solar &amp;{" "}
              <span className="bg-[linear-gradient(120deg,#8fe36a,#F4D560)] bg-clip-text text-transparent">
                Electrical Products
              </span>
            </h1>
            <p className="mt-5 max-w-[620px] text-[clamp(15px,2vw,17px)] leading-relaxed text-[#C9DAF2]">
              We supply solar panels, inverters, batteries, electrical protection devices and related products
              for dealers, installers, contractors and project buyers across Bangladesh.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => jumpToForm("Request Wholesale Price")}>
                Request Wholesale Price
              </Button>
              <Button
                size="lg"
                className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
                onClick={() => jumpToForm("Become a Dealer")}
              >
                Become a Dealer
              </Button>
              <Button
                size="lg"
                className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
                onClick={() => jumpToForm("Talk to Sales")}
              >
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who we supply */}
      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">Who we supply</span>
          <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
            Built for trade buyers
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BUYERS.map((b) => (
            <div
              key={b.title}
              className="rounded-[18px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-1"
            >
              <span className="mb-4 flex size-[50px] items-center justify-center rounded-2xl bg-blue/12">
                <b.icon className="size-6 text-blue" />
              </span>
              <div className="font-heading text-base font-bold text-text">{b.title}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-3.5 rounded-2xl border border-border bg-surface-2 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/16">
                <b.icon className="size-5 text-green-600" />
              </span>
              <div>
                <div className="font-heading text-[14.5px] font-bold text-text">{b.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section ref={formRef} className="mx-auto max-w-[1280px] scroll-mt-24 px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 rounded-[22px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-7"
          >
            <div>
              <h2 className="font-heading text-xl font-extrabold text-text">Send a trade enquiry</h2>
              <p className="mt-1 text-sm text-muted">
                Tell us what you need and our sales team will get back with pricing and terms.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Enquiry Type *</Label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {wholesaleInquiryTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("inquiryType", type, { shouldValidate: true })}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-all",
                      inquiryType === type
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-border bg-surface-2 text-muted hover:border-orange-500/40",
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.inquiryType && (
                <span className="mt-1.5 block text-xs font-medium text-red-500">
                  {errors.inquiryType.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name *" error={errors.name?.message}>
                <Input placeholder="Your full name" {...register("name")} />
              </Field>
              <Field label="Business / Company">
                <Input placeholder="Shop or company name" {...register("company")} />
              </Field>
              <Field label="Mobile *" error={errors.phone?.message}>
                <Input placeholder="01XXXXXXXXX" inputMode="numeric" {...register("phone")} />
              </Field>
              <Field label="Location *" error={errors.location?.message}>
                <Input placeholder="Area, District" {...register("location")} />
              </Field>
            </div>

            <Field label="Message">
              <textarea
                placeholder="Products and quantities you're interested in…"
                {...register("message")}
                className="min-h-[110px] w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-3 text-base text-text outline-none sm:text-sm"
              />
            </Field>

            <Button size="lg" type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting…" : "Submit Enquiry"}
            </Button>
          </form>

          <div className="flex flex-col gap-4">
            <div className="rounded-[22px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
              <div className="mb-3 font-heading text-base font-extrabold text-text">Talk to sales directly</div>
              <div className="flex flex-col gap-2.5">
                <a
                  href={telLink()}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue px-5 py-3.5 text-sm font-bold text-white no-underline"
                >
                  <Phone className="size-[17px]" /> Call {COMPANY.phone}
                </a>
                <a
                  href={whatsappLink("Hi, I'd like wholesale/dealer pricing.")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-[#053a1d] no-underline"
                >
                  <MessageCircle className="size-[17px]" /> WhatsApp {COMPANY.whatsapp}
                </a>
              </div>
              <p className="mt-3 text-center text-xs text-muted">{COMPANY.email}</p>
            </div>

            <div className="rounded-[22px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
              <div className="mb-2 font-heading text-base font-extrabold text-text">Our offices</div>
              <p className="text-[13px] leading-relaxed text-muted">
                <b className="text-text">{COMPANY.headOffice.label}:</b> {COMPANY.headOffice.address}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                <b className="text-text">{COMPANY.localOffice.label}:</b> {COMPANY.localOffice.address}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}
