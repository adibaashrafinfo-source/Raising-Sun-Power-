import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  ChevronRight,
  ClipboardCheck,
  Factory,
  GraduationCap,
  Home,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sun,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COMPANY, SEO_KEYWORDS, telLink, whatsappLink } from "@/data/company"
import { roofOptions } from "@/data/calculator-appliances"
import { useCreateLead } from "@/hooks/use-leads"
import { useSeo } from "@/hooks/use-seo"
import { generateRefId } from "@/lib/queries/leads"
import {
  type AssessmentFormValues,
  assessmentSchema,
  customerTypes,
  monthlyBillOptions,
  systemTypes,
} from "@/lib/schemas/assessment"
import { cn } from "@/lib/utils"
import type { LeadInsert } from "@/types/database"

const CUSTOMER_ICONS = {
  Residential: Home,
  Commercial: Building2,
  Industrial: Factory,
  Institution: GraduationCap,
} as const

const STEPS = [
  { icon: ClipboardCheck, title: "Share your details", body: "Tell us your load, location and system type." },
  { icon: Phone, title: "We call you back", body: "Our engineer confirms the requirement over phone." },
  { icon: Sun, title: "Free assessment", body: "You get a sized system and a transparent quotation." },
]

export default function SolarAssessmentPage() {
  useSeo({
    title: "Get Free Solar Assessment",
    description:
      "Request a free solar assessment from Rising Sun Power BD — on-grid, hybrid and off-grid system sizing, rooftop solar and net metering support across Bangladesh.",
    keywords: SEO_KEYWORDS,
  })
  const navigate = useNavigate()
  const createLead = useCreateLead()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentFormValues>({ resolver: zodResolver(assessmentSchema) })

  const customerType = watch("customerType")
  const systemType = watch("systemType")

  const onSubmit = async (values: AssessmentFormValues) => {
    const refId = generateRefId()
    const lead: LeadInsert = {
      ref_id: refId,
      name: values.name,
      phone: values.phone,
      email: null,
      division: null,
      district: null,
      location: values.location,
      customer_type: values.customerType,
      system_type: values.systemType,
      monthly_bill: values.monthlyBill || null,
      roof_type: values.roofType || null,
      load_watt: null,
      backup_hours: null,
      budget_range: null,
      timeline: null,
      notes: values.message || null,
      source: "assessment",
      status: "new",
    }
    try {
      await createLead.mutateAsync(lead)
      navigate(`/quotation-received/${refId}`, { state: { name: values.name } })
    } catch {
      toast.error("Couldn't submit your request. Please check your connection and try again.")
    }
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Solar Assessment</span>
      </div>

      <div className="mx-auto mb-9 max-w-[720px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-[var(--shadow-sm)]">
          <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.2)]" />
          Free · No obligation
        </span>
        <h1 className="mt-4 text-balance font-heading text-[clamp(28px,4vw,42px)] font-extrabold leading-tight tracking-tight text-text">
          Get Free Solar{" "}
          <span className="bg-[linear-gradient(120deg,#217CCA,#F49E09_52%,#67A70E)] bg-clip-text text-transparent">
            Assessment
          </span>
        </h1>
        <p className="mt-3.5 text-[clamp(15px,2vw,17px)] leading-relaxed text-muted">
          Tell us about your site and our engineers will size the right on-grid, hybrid or off-grid system —
          with a clear, transparent quotation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-[22px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-7"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name *" error={errors.name?.message}>
              <Input placeholder="Your full name" {...register("name")} />
            </Field>
            <Field label="Mobile *" error={errors.phone?.message}>
              <Input placeholder="01XXXXXXXXX" inputMode="numeric" {...register("phone")} />
            </Field>
          </div>

          <Field label="Location *" error={errors.location?.message}>
            <Input placeholder="Area, District (e.g. Saharasti, Chandpur)" {...register("location")} />
          </Field>

          {/* Customer type */}
          <div>
            <Label className="mb-2 block">Customer Type *</Label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {customerTypes.map((type) => {
                const Icon = CUSTOMER_ICONS[type]
                const active = customerType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("customerType", type, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all",
                      active
                        ? "border-blue bg-blue/10 text-blue shadow-[0_0_0_3px_rgba(33,124,202,.12)]"
                        : "border-border bg-surface-2 text-muted hover:border-blue/40",
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="text-[12.5px] font-bold leading-tight">{type}</span>
                  </button>
                )
              })}
            </div>
            {errors.customerType && (
              <span className="mt-1.5 block text-xs font-medium text-red-500">
                {errors.customerType.message}
              </span>
            )}
          </div>

          {/* System required */}
          <div>
            <Label className="mb-2 block">System Required *</Label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {systemTypes.map((type) => {
                const active = systemType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("systemType", type, { shouldValidate: true })}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-all",
                      active
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-border bg-surface-2 text-muted hover:border-orange-500/40",
                    )}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
            {errors.systemType && (
              <span className="mt-1.5 block text-xs font-medium text-red-500">
                {errors.systemType.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Average Monthly Electricity Bill">
              <select
                {...register("monthlyBill")}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
              >
                <option value="">Select a range</option>
                {monthlyBillOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Roof Type">
              <select
                {...register("roofType")}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
              >
                <option value="">Select roof type</option>
                {roofOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Message">
            <textarea
              placeholder="Anything else we should know — load details, timeline, site conditions…"
              {...register("message")}
              className="min-h-[110px] w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-3 text-sm text-text outline-none"
            />
          </Field>

          <Button size="lg" type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting…" : "Request Solar Assessment"}
          </Button>
          <p className="text-center text-xs text-muted">
            We never share your details. Our team usually calls back within one working day.
          </p>
        </form>

        {/* Side rail */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[22px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-4 font-heading text-base font-extrabold text-text">How it works</div>
            <div className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex gap-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue/12">
                    <s.icon className="size-5 text-blue" />
                  </span>
                  <div>
                    <div className="font-heading text-sm font-bold text-text">
                      {i + 1}. {s.title}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-3 flex items-center gap-2 font-heading text-base font-extrabold text-text">
              <ShieldCheck className="size-[18px] text-green-600" />
              Prefer to talk first?
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href={telLink()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue px-5 py-3.5 text-sm font-bold text-white no-underline"
              >
                <Phone className="size-[17px]" /> Call {COMPANY.phone}
              </a>
              <a
                href={whatsappLink("Hi, I'd like a free solar assessment.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-[#053a1d] no-underline"
              >
                <MessageCircle className="size-[17px]" /> WhatsApp {COMPANY.whatsapp}
              </a>
            </div>
            <p className="mt-3 text-center text-xs text-muted">{COMPANY.email}</p>
          </div>
        </div>
      </div>
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
