import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, Leaf, Lock, MessageCircle, TrendingUp, Wallet } from "lucide-react"
import { useForm } from "react-hook-form"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { bdDivisions, districtsFor } from "@/data/bd-geo"
import { useCreateLead } from "@/hooks/use-leads"
import { useRoiSettings } from "@/hooks/use-roi-calculator"
import { useSeo } from "@/hooks/use-seo"
import { generateRefId } from "@/lib/queries/leads"
import { type RoiLeadFormValues, roiLeadSchema } from "@/lib/schemas/roi-calculator"
import { calculateSolarROI, type RoiCalculatorResult, type RoiCustomerType } from "@/lib/solar-roi"
import { cn, formatBDT } from "@/lib/utils"
import type { LeadInsert } from "@/types/database"

type InputMode = "units" | "bill"

const CUSTOMER_TYPES: { value: RoiCustomerType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
]

export default function SolarROICalculatorPage() {
  useSeo({
    title: "Solar ROI & Payback Calculator",
    description:
      "See your solar payback period and lifetime ROI in Bangladesh — enter your monthly bill or units and get an instant investment breakdown.",
  })
  const { data: settings, isLoading, isError } = useRoiSettings()

  const [inputMode, setInputMode] = useState<InputMode>("bill")
  const [monthlyUnits, setMonthlyUnits] = useState("")
  const [monthlyBill, setMonthlyBill] = useState("")
  const [customerType, setCustomerType] = useState<RoiCustomerType>("residential")
  const [netMetering, setNetMetering] = useState(true)
  const [result, setResult] = useState<RoiCalculatorResult | null>(null)

  const rawValue = inputMode === "units" ? monthlyUnits : monthlyBill
  const canCalculate = Number(rawValue) > 0

  const handleCalculate = () => {
    if (!settings || !canCalculate) return
    const res = calculateSolarROI(
      {
        monthlyUnitsKWh: inputMode === "units" ? Number(monthlyUnits) : undefined,
        monthlyBillBDT: inputMode === "bill" ? Number(monthlyBill) : undefined,
        customerType,
        netMetering,
      },
      settings,
    )
    setResult(res)
  }

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">ROI Calculator</span>
      </div>

      <div className="mx-auto mb-7 max-w-[640px] text-center">
        <h1 className="text-balance font-heading text-[clamp(26px,4vw,38px)] font-extrabold leading-tight tracking-tight text-text">
          Solar Payback &amp; ROI Calculator
        </h1>
        <p className="mt-3.5 text-[clamp(15px,2vw,17px)] leading-relaxed text-muted">
          See how fast solar pays for itself and how much you'll save over its 25-year lifetime.
        </p>
      </div>

      {isError ? (
        <div className="rounded-[22px] border border-red-500/30 bg-red-500/5 p-7 text-center text-sm text-muted">
          Couldn't load the calculator right now. Please refresh the page or try again shortly.
        </div>
      ) : isLoading || !settings ? (
        <Skeleton className="h-80 w-full rounded-[22px]" />
      ) : (
        <div className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-[var(--shadow-sm)]">
          <div className="px-[18px] py-6 sm:px-7">
            <div className="mb-5 flex max-w-[420px] gap-1 rounded-[13px] border border-border bg-surface-2 p-1">
              <button
                onClick={() => setInputMode("bill")}
                className={cn(
                  "h-10 flex-1 rounded-[10px] text-[13.5px] font-bold transition-colors",
                  inputMode === "bill" ? "bg-orange-500 text-white" : "text-muted",
                )}
              >
                My monthly bill (৳)
              </button>
              <button
                onClick={() => setInputMode("units")}
                className={cn(
                  "h-10 flex-1 rounded-[10px] text-[13.5px] font-bold transition-colors",
                  inputMode === "units" ? "bg-orange-500 text-white" : "text-muted",
                )}
              >
                My units (kWh)
              </button>
            </div>

            <label className="flex max-w-[360px] flex-col gap-2">
              <span className="text-[13px] font-semibold text-muted">
                {inputMode === "bill" ? "Average Monthly Bill (৳)" : "Average Monthly Units (kWh)"}
              </span>
              <input
                value={rawValue}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "")
                  if (inputMode === "bill") setMonthlyBill(v)
                  else setMonthlyUnits(v)
                }}
                placeholder={inputMode === "bill" ? "e.g. 4500" : "e.g. 350"}
                inputMode="numeric"
                className="h-[60px] rounded-2xl border border-border bg-surface-2 px-[18px] font-heading text-2xl font-extrabold text-text outline-none"
              />
            </label>

            <div className="mt-5">
              <span className="mb-2 block text-[13px] font-semibold text-muted">Customer Type</span>
              <div className="flex flex-wrap gap-2.5">
                {CUSTOMER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setCustomerType(t.value)}
                    className={cn(
                      "h-11 rounded-xl border-[1.5px] px-[18px] text-[13.5px] font-semibold transition-colors",
                      customerType === t.value ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border text-text",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="mb-1 block text-[13px] font-semibold text-muted">Net Metering</span>
              <p className="mb-2.5 text-xs text-muted">
                With net metering your daytime surplus is exported to the grid for credit. Without it, only
                the units you use while the sun is up actually cut your bill — which changes the payback a lot.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { value: true, label: "With net metering" },
                  { value: false, label: "Without net metering" },
                ].map((o) => (
                  <button
                    key={String(o.value)}
                    onClick={() => setNetMetering(o.value)}
                    className={cn(
                      "h-11 rounded-xl border-[1.5px] px-[18px] text-[13.5px] font-semibold transition-colors",
                      netMetering === o.value
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-border text-text",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border bg-surface-2 px-[18px] py-4 sm:px-7">
            <span className="text-xs text-muted">Estimate only — a formal quote refines every number.</span>
            <Button size="lg" disabled={!canCalculate} onClick={handleCalculate}>
              Calculate ROI →
            </Button>
          </div>
        </div>
      )}

      {result && <RoiResults result={result} customerType={customerType} />}
    </main>
  )
}

function RoiResults({ result, customerType }: { result: RoiCalculatorResult; customerType: RoiCustomerType }) {
  const crossoverYear = useMemo(
    () => result.yearlyBreakdown.find((y) => y.cumulativeSavingsBDT >= result.totalInvestmentBDT)?.year ?? null,
    [result],
  )

  const chartData = useMemo(
    () =>
      result.yearlyBreakdown.map((y) => ({
        year: y.year,
        cumulative: Math.round(y.cumulativeSavingsBDT),
        investment: Math.round(result.totalInvestmentBDT),
      })),
    [result],
  )

  const waMessage = `Hi RSP, my solar ROI estimate: ~${result.requiredSystemSizeKW.toFixed(1)}kW system, ~${formatBDT(
    result.totalInvestmentBDT,
  )} investment, ~${result.paybackPeriodYears.toFixed(1)} year payback. Please advise.`

  return (
    <div className="mt-7 overflow-hidden rounded-[22px] border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className="px-[18px] py-7 sm:px-7">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-500/16 px-3.5 py-1.5 text-[13px] font-bold text-green-600">
            Your solar ROI estimate
          </span>
        </div>

        <div className="mx-auto max-w-[420px] rounded-[18px] bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-7 text-center text-white shadow-[0_14px_34px_rgba(5,44,110,.3)]">
          <span className="text-[13px] font-semibold text-[#B7D2F2]">Payback Period</span>
          <div className="mt-1.5 font-heading text-[44px] font-extrabold leading-none">
            {Number.isFinite(result.paybackPeriodYears)
              ? result.paybackPeriodYears.toFixed(1)
              : "25+"}{" "}
            <span className="text-2xl">years</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Recommended System" value={`${result.requiredSystemSizeKW.toFixed(1)} kW`} />
          <StatCard label="Estimated Investment" value={formatBDT(result.totalInvestmentBDT)} />
          <StatCard label="Monthly Savings (Yr 1)" value={formatBDT(result.monthlySavingsY1BDT)} />
          <StatCard label="25-Year Total Savings" value={formatBDT(result.totalLifetimeSavingsBDT)} />
          <StatCard label="Lifetime ROI" value={`${result.roiPercentLifetime.toFixed(0)}%`} icon={TrendingUp} />
          <StatCard
            label="Return Rate (IRR)"
            value={result.irr == null ? "—" : `${(result.irr * 100).toFixed(1)}%`}
            sub="Annual return over the system's life"
          />
          <StatCard
            label="Your Cost per Unit"
            value={`${result.lcoeBDTPerKWh.toFixed(2)} ৳/kWh`}
            sub="Solar electricity vs your grid tariff"
          />
          <StatCard
            label="Generation You Use"
            value={`${(result.utilisationRatio * 100).toFixed(0)}%`}
            sub={
              result.utilisationRatio > 0.8
                ? "Surplus exported to the grid for credit"
                : "Surplus is lost without net metering"
            }
          />
          <StatCard
            label="CO₂ Offset / Year"
            value={`${Math.round(result.annualCO2OffsetKg).toLocaleString("en-US")} kg`}
            sub={`~${Math.round(result.treesEquivalent)} trees equivalent`}
            icon={Leaf}
          />
        </div>

        <div className="mt-7">
          <div className="mb-3 font-heading text-base font-extrabold text-text">
            Cumulative Savings vs. Investment
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text)", fontWeight: 700 }}
                  labelFormatter={(year) => `Year ${year}`}
                  formatter={(value, name) => [
                    formatBDT(Number(value)),
                    name === "cumulative" ? "Cumulative savings" : "Total investment",
                  ]}
                />
                {crossoverYear && (
                  <ReferenceLine
                    x={crossoverYear}
                    stroke="#67A70E"
                    strokeDasharray="4 4"
                    label={{ value: "Payback", position: "top", fontSize: 11, fill: "#67A70E", fontWeight: 700 }}
                  />
                )}
                <Line type="monotone" dataKey="cumulative" stroke="#217CCA" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="investment" stroke="#F49E09" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full bg-blue" /> Cumulative savings
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full bg-orange-500" /> Total investment
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-4 text-xs leading-relaxed text-muted">
          Assumes electricity prices rise ~8%/year (based on recent BERC hike patterns) and panel output
          degrades ~0.6%/year over a 25-year lifespan. Actual results depend on your roof, usage pattern and
          future tariff changes — this is an estimate, not a guarantee.
        </div>
      </div>

      <RoiLeadForm result={result} customerType={customerType} waMessage={waMessage} />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon = Wallet,
}: {
  label: string
  value: string
  sub?: string
  icon?: typeof Wallet
}) {
  return (
    <div className="rounded-[18px] border border-border bg-surface-2 p-5 text-center">
      <span className="mb-2.5 inline-flex size-10 items-center justify-center rounded-2xl bg-orange-500/16">
        <Icon className="size-5 text-orange-500" />
      </span>
      <div className="font-heading text-xl font-extrabold text-text">{value}</div>
      <div className="mt-1 text-[12.5px] text-muted">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted">{sub}</div>}
    </div>
  )
}

function RoiLeadForm({
  result,
  customerType,
  waMessage,
}: {
  result: RoiCalculatorResult
  customerType: RoiCustomerType
  waMessage: string
}) {
  const navigate = useNavigate()
  const createLead = useCreateLead()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RoiLeadFormValues>({ resolver: zodResolver(roiLeadSchema) })

  const division = watch("division")
  const districts = useMemo(() => districtsFor(division), [division])

  const onSubmit = async (values: RoiLeadFormValues) => {
    const refId = generateRefId()
    const lead: LeadInsert = {
      ref_id: refId,
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      division: values.division,
      district: values.district,
      load_watt: Math.round(result.requiredSystemSizeKW * 1000),
      backup_hours: null,
      budget_range: null,
      roof_type: null,
      timeline: null,
      notes: `ROI Calculator: ${customerType} customer, ~${result.requiredSystemSizeKW.toFixed(1)}kW system, ~${formatBDT(
        result.totalInvestmentBDT,
      )} investment, ~${result.paybackPeriodYears.toFixed(1)}yr payback, ~${formatBDT(
        result.totalLifetimeSavingsBDT,
      )} 25-year savings.`,
      source: "roi_calculator",
      status: "new",
    }

    try {
      const created = await createLead.mutateAsync(lead)
      setSubmitted(true)
      navigate(`/quotation-received/${created.ref_id}`, { state: { lead: created } })
    } catch {
      toast.error("Couldn't submit your request. Please check your connection and try again.")
    }
  }

  if (submitted) return null

  return (
    <div className="border-t border-border bg-surface-2 px-[18px] py-7 sm:px-7">
      <div className="mb-5 text-center">
        <div className="font-heading text-lg font-extrabold text-text">Get a Formal Quotation</div>
        <p className="mt-1.5 text-[13.5px] text-muted">
          Share your contact info — our team will refine this estimate into a formal quote.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-[560px] flex-col gap-3.5">
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
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 text-base text-text outline-none sm:text-sm"
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
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 text-base text-text outline-none sm:text-sm disabled:opacity-50"
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
        <Button size="lg" type="submit" disabled={createLead.isPending}>
          {createLead.isPending ? "Submitting…" : "Get My Free Quotation"}
        </Button>
        <div className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-muted">
          <Lock className="size-3.5" />
          Your information is only used to prepare your quote. No spam.
        </div>
        <a
          href={`https://wa.me/8801786896390?text=${encodeURIComponent(waMessage)}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-[13.5px] font-bold text-text no-underline"
        >
          <MessageCircle className="size-4" />
          Or talk to an expert on WhatsApp
        </a>
      </form>
    </div>
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
