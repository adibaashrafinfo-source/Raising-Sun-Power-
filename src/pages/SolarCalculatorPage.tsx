import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, BatteryCharging, Calculator, ChevronRight, CircleHelp, Info, MessageCircle, PanelTop, Zap } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { appliancePresets } from "@/data/calculator-appliances"
import { useSeo } from "@/hooks/use-seo"
import { useCalculatorSettings } from "@/hooks/use-calculator"
import { calculateSolarSystem, configFromSettings } from "@/lib/solar-calculator"
import { cn } from "@/lib/utils"
import { type LoadRow, dailyEnergyWh, peakLoadWatt } from "@/lib/load-sheet"
import { LoadStep } from "@/pages/calculator/LoadStep"

type BatteryType = "leadacid" | "lithium" | "notsure"

const BACKUP_CHIPS = [2, 4, 6, 8]
const BATTERY_TYPES: { value: BatteryType; label: string }[] = [
  { value: "leadacid", label: "Lead-Acid" },
  { value: "lithium", label: "Lithium" },
  { value: "notsure", label: "Not sure" },
]

export default function SolarCalculatorPage() {
  useSeo({
    title: "Solar Calculator",
    description:
      "Free solar sizing calculator — get an instant estimate of the panel, inverter and battery you need for your home or business in Bangladesh.",
  })
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  // Seeded with the three loads almost every home starts from, so the sheet is
  // never blank on arrival.
  const [rows, setRows] = useState<LoadRow[]>(() =>
    ["LED Bulb", "Ceiling Fan", "LED Television"].map((name) => {
      const preset = appliancePresets.find((p) => p.name === name)!
      return {
        id: crypto.randomUUID(),
        name: preset.name,
        watt: preset.watt,
        qty: name === "LED Bulb" ? 4 : name === "Ceiling Fan" ? 3 : 1,
        hours: preset.hours,
        icon: preset.icon,
      }
    }),
  )
  const { data: calculatorSettings } = useCalculatorSettings()
  const [backupHours, setBackupHours] = useState(4)
  const [batteryType, setBatteryType] = useState<BatteryType>("notsure")
  const [expandHow, setExpandHow] = useState(false)

  const totalLoad = useMemo(() => peakLoadWatt(rows), [rows])
  const dailyWh = useMemo(() => dailyEnergyWh(rows), [rows])

  const result = useMemo(
    () =>
      step === 3
        ? calculateSolarSystem(
            {
              totalLoadWatt: totalLoad,
              backupHours,
              batteryType,
              dailyEnergyWh: dailyWh,
            },
            configFromSettings(calculatorSettings),
          )
        : null,
    [step, totalLoad, dailyWh, backupHours, batteryType, calculatorSettings],
  )

  const goToQuote = () => {
    navigate("/get-quotation", {
      state: { load: totalLoad, backupHours, fromCalculator: true },
    })
  }

  const waMessage = result
    ? `Hi RSP, my solar estimate: ~${result.solarWp}Wp panel, ${result.inverterVA}VA inverter, ${result.batteryAh}Ah battery for ${totalLoad}W load and ${backupHours}h backup. Please advise.`
    : "Hi RSP, I'd like help sizing a solar system."

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Solar Calculator</span>
      </div>

      <div className="mx-auto mb-7 max-w-[680px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">
          <Calculator className="size-3.5" />
          Smart solar calculator
        </span>
        <h1 className="mt-3.5 text-balance font-heading text-[clamp(26px,4.4vw,40px)] font-extrabold leading-tight tracking-tight text-text">
          Solar System Calculator
        </h1>
        <p className="mt-3 text-[clamp(14px,2vw,16px)] leading-relaxed text-muted">
          সরাসরি আপনার ব্যবহৃত ফ্যান, লাইট এবং অন্যান্য লোডের বিবরণ দিয়ে প্রয়োজনীয় সোলার সিস্টেমের
          নিখুঁত পরিমাপ করুন।
        </p>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-[var(--shadow-sm)]">
        <div className="px-[18px] pt-[22px] sm:px-7">
          <div className="flex items-center gap-2.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-1 items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-[30px] shrink-0 items-center justify-center rounded-full font-heading text-[13px] font-extrabold",
                    n <= step ? "bg-orange-500 text-white" : "bg-surface-2 text-muted",
                  )}
                >
                  {n}
                </span>
                <div className={cn("h-1 flex-1 rounded-full", n <= step ? "bg-orange-500" : "bg-surface-2")} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold text-muted">
            <span>Load</span>
            <span>Sizing</span>
            <span>Result</span>
          </div>
        </div>

        {step === 1 && (
          <div className="px-[18px] py-6 sm:px-7">
            <LoadStep rows={rows} setRows={setRows} onNext={() => setStep(2)} />
          </div>
        )}

        {step === 2 && (
          <>
            <div className="px-[18px] py-7 sm:px-7">
              <div className="mb-6 text-center">
                <div className="font-heading text-lg font-bold text-text">
                  How many hours of backup do you need?
                </div>
                <div className="mt-2.5 font-heading text-[clamp(38px,6vw,52px)] font-extrabold tabular-nums text-orange-500">
                  {backupHours >= 8 ? "8+ hours" : `${backupHours} hours`}
                </div>
              </div>
              <div className="mx-auto max-w-[520px]">
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={backupHours}
                  onChange={(e) => setBackupHours(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="mt-1.5 flex justify-between text-xs text-muted">
                  <span>1h</span>
                  <span>12h</span>
                </div>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  {BACKUP_CHIPS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setBackupHours(h)}
                      className={cn(
                        "h-[42px] min-w-16 rounded-xl border px-4 font-heading text-sm font-bold transition-colors",
                        backupHours === h
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-border text-text",
                      )}
                    >
                      {h === 8 ? "8h+" : `${h}h`}
                    </button>
                  ))}
                </div>
                <div className="mt-7 border-t border-border pt-[22px]">
                  <div className="mb-3 text-center text-[13px] font-semibold text-muted">
                    Battery type preference
                  </div>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {BATTERY_TYPES.map((b) => (
                      <button
                        key={b.value}
                        onClick={() => setBatteryType(b.value)}
                        className={cn(
                          "inline-flex h-11 items-center gap-2 rounded-xl border-[1.5px] px-[18px] text-[13.5px] font-semibold text-text transition-colors",
                          batteryType === b.value ? "border-orange-500" : "border-border",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-[18px] items-center justify-center rounded-full border-2",
                            batteryType === b.value ? "border-orange-500" : "border-border",
                          )}
                        >
                          {batteryType === b.value && <span className="size-[9px] rounded-full bg-orange-500" />}
                        </span>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border bg-surface-2 px-[18px] py-4 sm:px-7">
              <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                <ArrowLeft className="size-[17px]" />
                Back
              </Button>
              <Button size="lg" className="max-w-[320px] flex-1" onClick={() => setStep(3)}>
                Calculate My System →
              </Button>
            </div>
          </>
        )}

        {step === 3 && result && (
          <div className="px-[18px] py-7 sm:px-7">
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/16 px-3.5 py-1.5 text-[13px] font-bold text-green-600">
                <ArrowRight className="size-[15px] rotate-90" />
                Your recommended system
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[18px] bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-6 text-center text-white shadow-[0_14px_34px_rgba(5,44,110,.3)]">
                <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-white/15">
                  <PanelTop className="size-6 text-gold-400" />
                </span>
                <div className="font-heading text-[28px] font-extrabold">~{result.solarWp} Wp</div>
                <div className="mt-1 text-[13px] text-[#B7D2F2]">Solar Panel</div>
                <div className="mt-1.5 text-[12.5px] text-[#8FB3E0]">
                  {result.panelCount} × {result.panelUnitWp}W panels
                </div>
              </div>
              <div className="rounded-[18px] border border-border bg-surface-2 p-6 text-center">
                <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-orange-500/16">
                  <Zap className="size-6 text-orange-500" />
                </span>
                <div className="font-heading text-[28px] font-extrabold text-text">{result.inverterVA} VA</div>
                <div className="mt-1 text-[13px] text-muted">Inverter</div>
                <div className="mt-1.5 text-[12.5px] text-muted">30% safety headroom included</div>
              </div>
              <div className="rounded-[18px] border border-border bg-surface-2 p-6 text-center">
                <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-green-500/16">
                  <BatteryCharging className="size-6 text-green-600" />
                </span>
                <div className="font-heading text-[28px] font-extrabold text-text">{result.batteryAh} Ah</div>
                <div className="mt-1 text-[13px] text-muted">Battery</div>
                <div className="mt-1.5 text-[12.5px] text-muted">
                  {result.batteryVoltage}V, {result.batteryType === "lithium" ? "lithium" : "lead-acid"},{" "}
                  {result.backupHours}h backup
                </div>
              </div>
            </div>

            <div className="mt-[18px] overflow-hidden rounded-2xl border border-border">
              <button
                onClick={() => setExpandHow((v) => !v)}
                className="flex w-full items-center justify-between gap-3 bg-surface-2 px-[18px] py-4 text-left"
              >
                <span className="flex items-center gap-2 text-[13.5px] font-bold text-text">
                  <CircleHelp className="size-4 text-blue" />
                  How we calculated this
                </span>
                <span className="font-heading text-xl font-extrabold leading-none text-blue">
                  {expandHow ? "−" : "+"}
                </span>
              </button>
              {expandHow && (
                <div className="flex flex-col gap-3 bg-surface p-[18px] text-[13.5px] leading-relaxed text-muted">
                  <div>
                    <b className="text-text">Inverter size</b> = Total Load ({totalLoad}W) × 1.275 safety
                    margin, rounded up to the nearest common inverter size.
                  </div>
                  <div>
                    <b className="text-text">Battery (Ah)</b> = (Load × Backup Hours) ÷ (12V × 0.5 depth-of-discharge
                    × 0.85 inverter efficiency), rounded up to the nearest 10Ah.
                  </div>
                  <div>
                    <b className="text-text">Solar Panel (Wp)</b> = Daily energy need ({result.dailyEnergyWh} Wh) ÷
                    ~4.5 average Bangladesh sun-hours, rounded up to the nearest 55W panel.
                  </div>
                  <div className="text-xs italic text-muted">
                    These are simplified estimates. Our engineers refine them for your roof, budget and usage
                    pattern.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-[22px] rounded-2xl bg-[linear-gradient(120deg,#0B3F94,#052C6E)] p-6 shadow-[0_16px_40px_rgba(5,44,110,.32)] sm:p-7">
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="min-w-[220px] flex-1" onClick={goToQuote}>
                  Get a Formal Quotation →
                </Button>
                <a
                  href={`https://wa.me/8801786896390?text=${encodeURIComponent(waMessage)}`}
                  className="inline-flex h-[54px] min-w-[220px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/15 text-[15px] font-bold text-white no-underline"
                >
                  <MessageCircle className="size-[18px]" />
                  Talk to an Expert
                </a>
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-[#B7D2F2]">
                <ArrowRight className="size-3.5 rotate-90" />
                Free · No obligation · Response within 24 hours
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
              <button
                onClick={() => setStep(1)}
                className="text-[13.5px] font-semibold text-blue underline"
              >
                ↺ Start over
              </button>
              <Link to="/solar-roi-calculator" className="text-[13.5px] font-semibold text-blue no-underline hover:underline">
                See payback period &amp; ROI →
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3.5 sm:px-5">
        <Info className="mt-0.5 size-4 shrink-0 text-blue" />
        <p className="text-[12.5px] leading-relaxed text-muted">
          <b className="text-text">Disclaimer / সতর্কবার্তা:</b> This calculator gives an estimate for
          sizing. A real rooftop install needs structural checks, a shading survey and a direct load
          study by our technicians. Visit our Dhaka Cantonment office or send the result on WhatsApp
          for an official design and final quotation.
        </p>
      </div>
    </main>
  )
}
