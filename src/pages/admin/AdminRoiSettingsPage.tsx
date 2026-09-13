import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useRoiSettings, useUpdateRoiSettings } from "@/hooks/use-roi-calculator"
import { getErrorMessage } from "@/lib/utils"
import type { RoiTariffSlab } from "@/types/database"

type FormState = {
  residential_slabs: RoiTariffSlab[]
  commercial_rate: string
  industrial_rate: string
  avg_peak_sun_hours_per_day: string
  system_efficiency_factor: string
  cost_per_kw_installed_bdt: string
  panel_lifespan_years: string
  annual_degradation_rate: string
  annual_electricity_price_escalation: string
  annual_maintenance_cost_rate: string
}

const EMPTY_FORM: FormState = {
  residential_slabs: [],
  commercial_rate: "0",
  industrial_rate: "0",
  avg_peak_sun_hours_per_day: "0",
  system_efficiency_factor: "0",
  cost_per_kw_installed_bdt: "0",
  panel_lifespan_years: "25",
  annual_degradation_rate: "0",
  annual_electricity_price_escalation: "0",
  annual_maintenance_cost_rate: "0",
}

export default function AdminRoiSettingsPage() {
  const { data: settings, isLoading } = useRoiSettings()
  const updateSettings = useUpdateRoiSettings()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    if (!settings) return
    setForm({
      residential_slabs: settings.residential_slabs,
      commercial_rate: String(settings.commercial_rate),
      industrial_rate: String(settings.industrial_rate),
      avg_peak_sun_hours_per_day: String(settings.avg_peak_sun_hours_per_day),
      system_efficiency_factor: String(settings.system_efficiency_factor),
      cost_per_kw_installed_bdt: String(settings.cost_per_kw_installed_bdt),
      panel_lifespan_years: String(settings.panel_lifespan_years),
      annual_degradation_rate: String(settings.annual_degradation_rate),
      annual_electricity_price_escalation: String(settings.annual_electricity_price_escalation),
      annual_maintenance_cost_rate: String(settings.annual_maintenance_cost_rate),
    })
  }, [settings])

  const updateSlab = (i: number, patch: Partial<RoiTariffSlab>) =>
    setForm((f) => ({
      ...f,
      residential_slabs: f.residential_slabs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }))

  const addSlab = () =>
    setForm((f) => ({
      ...f,
      residential_slabs: [...f.residential_slabs, { minUnits: 0, maxUnits: null, rate: 0 }],
    }))

  const removeSlab = (i: number) =>
    setForm((f) => ({ ...f, residential_slabs: f.residential_slabs.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings.mutateAsync({
        residential_slabs: form.residential_slabs,
        commercial_rate: Number(form.commercial_rate),
        industrial_rate: Number(form.industrial_rate),
        avg_peak_sun_hours_per_day: Number(form.avg_peak_sun_hours_per_day),
        system_efficiency_factor: Number(form.system_efficiency_factor),
        cost_per_kw_installed_bdt: Number(form.cost_per_kw_installed_bdt),
        panel_lifespan_years: Number(form.panel_lifespan_years),
        annual_degradation_rate: Number(form.annual_degradation_rate),
        annual_electricity_price_escalation: Number(form.annual_electricity_price_escalation),
        annual_maintenance_cost_rate: Number(form.annual_maintenance_cost_rate),
      })
      toast.success("ROI calculator settings saved")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save settings"))
    }
  }

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-text">ROI Calculator Settings</h1>
        <p className="mt-1 text-sm text-muted">
          These tariffs and constants drive the public Solar ROI Calculator's math. Update them whenever BERC
          changes electricity rates — no code deploy needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-[720px] flex-col gap-5">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-1 font-heading text-base font-extrabold text-text">Residential Tariff Slabs</div>
          <p className="mb-4 text-xs text-muted">
            Monthly units (kWh) ranges and their rate (৳/kWh). Leave "Max units" blank for the top, open-ended
            slab.
          </p>
          <div className="flex flex-col gap-2.5">
            {form.residential_slabs.map((slab, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-surface-2 p-3">
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  Min
                  <input
                    type="number"
                    value={slab.minUnits}
                    onChange={(e) => updateSlab(i, { minUnits: Number(e.target.value) })}
                    className="h-9 w-20 rounded-lg border border-border bg-surface px-2 text-center text-[13px] text-text outline-none"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  Max
                  <input
                    type="number"
                    value={slab.maxUnits ?? ""}
                    placeholder="∞"
                    onChange={(e) => updateSlab(i, { maxUnits: e.target.value === "" ? null : Number(e.target.value) })}
                    className="h-9 w-20 rounded-lg border border-border bg-surface px-2 text-center text-[13px] text-text outline-none"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  Rate (৳/kWh)
                  <input
                    type="number"
                    step="0.01"
                    value={slab.rate}
                    onChange={(e) => updateSlab(i, { rate: Number(e.target.value) })}
                    className="h-9 w-24 rounded-lg border border-border bg-surface px-2 text-center text-[13px] text-text outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeSlab(i)}
                  className="ml-auto flex size-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addSlab}>
            <Plus className="size-4" /> Add slab
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 font-heading text-base font-extrabold text-text">Commercial / Industrial Rates</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Commercial (৳/kWh)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.commercial_rate}
                onChange={(e) => setForm((f) => ({ ...f, commercial_rate: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Industrial (৳/kWh)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.industrial_rate}
                onChange={(e) => setForm((f) => ({ ...f, industrial_rate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-orange-500/40 bg-orange-500/5 p-5">
          <div className="mb-1 font-heading text-base font-extrabold text-text">
            Installed Cost <span className="text-orange-500">— most important number</span>
          </div>
          <p className="mb-3 text-xs text-muted">
            RSP's actual per-kW installed price (panels + inverter + installation). Every investment/payback
            figure the calculator shows scales directly off this.
          </p>
          <Label className="mb-1.5 block">Cost per kW installed (৳)</Label>
          <Input
            type="number"
            value={form.cost_per_kw_installed_bdt}
            onChange={(e) => setForm((f) => ({ ...f, cost_per_kw_installed_bdt: e.target.value }))}
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 font-heading text-base font-extrabold text-text">System &amp; Financial Assumptions</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Avg. peak sun hours/day</Label>
              <Input
                type="number"
                step="0.1"
                value={form.avg_peak_sun_hours_per_day}
                onChange={(e) => setForm((f) => ({ ...f, avg_peak_sun_hours_per_day: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">System efficiency factor (0–1)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.system_efficiency_factor}
                onChange={(e) => setForm((f) => ({ ...f, system_efficiency_factor: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Panel lifespan (years)</Label>
              <Input
                type="number"
                value={form.panel_lifespan_years}
                onChange={(e) => setForm((f) => ({ ...f, panel_lifespan_years: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Annual degradation rate (e.g. 0.006 = 0.6%)</Label>
              <Input
                type="number"
                step="0.001"
                value={form.annual_degradation_rate}
                onChange={(e) => setForm((f) => ({ ...f, annual_degradation_rate: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Annual electricity price escalation (e.g. 0.08 = 8%)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.annual_electricity_price_escalation}
                onChange={(e) => setForm((f) => ({ ...f, annual_electricity_price_escalation: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Annual maintenance cost rate (e.g. 0.005 = 0.5%)</Label>
              <Input
                type="number"
                step="0.001"
                value={form.annual_maintenance_cost_rate}
                onChange={(e) => setForm((f) => ({ ...f, annual_maintenance_cost_rate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="self-start" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  )
}
