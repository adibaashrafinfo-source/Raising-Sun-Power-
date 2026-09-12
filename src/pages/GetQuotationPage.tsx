import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, Lock, Minus, Plus, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { budgetOptions, roofOptions, timelineOptions } from "@/data/calculator-appliances"
import { bdDivisions, districtsFor } from "@/data/bd-geo"
import { useCreateLead } from "@/hooks/use-leads"
import { generateRefId } from "@/lib/queries/leads"
import { type QuotationFormValues, quotationSchema } from "@/lib/schemas/quotation"
import { cn } from "@/lib/utils"
import type { LeadInsert } from "@/types/database"

export default function GetQuotationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromCalc = location.state as { load?: number; backupHours?: number; fromCalculator?: boolean } | null
  const [bannerShown, setBannerShown] = useState(!!fromCalc?.fromCalculator)
  const createLead = useCreateLead()

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      load: fromCalc?.load ? String(fromCalc.load) : "",
      backupHours: fromCalc?.backupHours ?? 4,
    },
  })

  const division = watch("division")
  const districts = useMemo(() => districtsFor(division), [division])
  const backupHours = watch("backupHours")

  const onSubmit = async (values: QuotationFormValues) => {
    const refId = generateRefId()
    const lead: LeadInsert = {
      ref_id: refId,
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      division: values.division,
      district: values.district,
      load_watt: Number(values.load),
      backup_hours: values.backupHours,
      budget_range: values.budget || null,
      roof_type: values.roof || null,
      timeline: values.timeline || null,
      notes: values.notes || null,
      source: fromCalc?.fromCalculator ? "calculator" : "direct",
      status: "new",
    }

    try {
      const created = await createLead.mutateAsync(lead)
      navigate(`/quotation-received/${created.ref_id}`, { state: { lead: created } })
    } catch {
      toast.error("Couldn't submit your request. Please check your connection and try again.")
    }
  }

  return (
    <main className="mx-auto max-w-[760px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Free Quotation</span>
      </div>

      <div className="mb-6">
        <h1 className="text-balance font-heading text-[clamp(24px,3.6vw,34px)] font-extrabold leading-tight tracking-tight text-text">
          Get Your Free Solar Quotation
        </h1>
        <p className="mt-3 text-[clamp(15px,2vw,17px)] leading-relaxed text-muted">
          Tell us a bit about your home or business — our team will prepare a custom quote.
        </p>
      </div>

      {bannerShown && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-500/35 bg-green-500/14 px-4 py-3.5">
          <span className="flex-1 text-[13.5px] font-medium text-text">
            Filled in from your Solar Calculator result — feel free to adjust.
          </span>
          <button
            onClick={() => setBannerShown(false)}
            aria-label="Dismiss"
            className="shrink-0 text-muted hover:text-text"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-[26px]"
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Name *" error={errors.name?.message}>
            <Input placeholder="Your name" {...register("name")} />
          </Field>
          <Field label="Mobile Number (+880) *" error={errors.phone?.message}>
            <Input placeholder="01XXX-XXXXXX" {...register("phone")} />
          </Field>
          <Field label="Email (optional)" className="sm:col-span-2" error={errors.email?.message}>
            <Input placeholder="you@example.com" type="email" {...register("email")} />
          </Field>
          <Field label="Division *" error={errors.division?.message}>
            <select
              {...register("division")}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
            >
              <option value="">Select division</option>
              {bdDivisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="District *" error={errors.district?.message}>
            <select
              {...register("district")}
              disabled={!division}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none disabled:opacity-50"
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3.5 border-t border-border pt-4 sm:grid-cols-2">
          <Field label="Load Requirement (Watt) *" error={errors.load?.message}>
            <Input placeholder="e.g. 800" inputMode="numeric" {...register("load")} />
            <Link to="/solar-calculator" className="text-[11.5px] text-blue no-underline">
              Don't know? Use our Solar Calculator →
            </Link>
          </Field>
          <div className="flex flex-col gap-1.5">
            <Label>Backup Requirement (hours)</Label>
            <Controller
              control={control}
              name="backupHours"
              render={({ field }) => (
                <div className="flex h-11 w-fit items-center overflow-hidden rounded-[var(--radius-sm)] border border-border">
                  <button
                    type="button"
                    onClick={() => field.onChange(Math.max(1, field.value - 1))}
                    aria-label="Decrease"
                    className="flex h-full w-11 items-center justify-center bg-surface-3 text-text"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="min-w-14 text-center font-heading text-[15px] font-bold tabular-nums text-text">
                    {backupHours}h
                  </span>
                  <button
                    type="button"
                    onClick={() => field.onChange(Math.min(12, field.value + 1))}
                    aria-label="Increase"
                    className="flex h-full w-11 items-center justify-center bg-surface-3 text-text"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Field label="Budget Range (optional)">
            <select
              {...register("budget")}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
            >
              <option value="">Select budget</option>
              {budgetOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Roof / Installation (optional)">
            <select
              {...register("roof")}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
            >
              <option value="">Select type</option>
              {roofOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Install Timeline (optional)">
            <select
              {...register("timeline")}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
            >
              <option value="">Select timeline</option>
              {timelineOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Additional Notes (optional)">
          <textarea
            placeholder="Anything else we should know…"
            {...register("notes")}
            className="min-h-[84px] w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-3 text-sm text-text outline-none"
          />
        </Field>

        <Button size="lg" type="submit" disabled={createLead.isPending} className={cn("w-full")}>
          {createLead.isPending ? "Submitting…" : "Get My Free Quotation"}
        </Button>
        <div className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-muted">
          <Lock className="size-3.5" />
          Your information is only used to prepare your quote. No spam.
        </div>
      </form>
    </main>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}
