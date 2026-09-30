import { useState } from "react"
import {
  AirVent,
  Calculator,
  Droplets,
  Fan,
  Lightbulb,
  Minus,
  Monitor,
  Plus,
  Refrigerator,
  RotateCcw,
  Smartphone,
  Trash2,
  Tv,
  Wifi,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type AppliancePreset, appliancePresets } from "@/data/calculator-appliances"
import { type LoadRow, dailyEnergyWh, peakLoadWatt } from "@/lib/load-sheet"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bulb: Lightbulb,
  fan: Fan,
  ac: AirVent,
  tv: Tv,
  fridge: Refrigerator,
  pump: Droplets,
  desktop: Monitor,
  phone: Smartphone,
  wifi: Wifi,
  iron: Zap,
  custom: Calculator,
}

function LoadIcon({ icon, className = "size-[18px]" }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Calculator
  return <Icon className={className} />
}

/**
 * Step one: pick appliances from the preset grid or add your own, then tune the
 * quantity and the hours each one runs. Hours are per appliance, so the daily
 * energy figure is a real sum rather than one blanket number.
 */
export function LoadStep({
  rows,
  setRows,
  onNext,
}: {
  rows: LoadRow[]
  setRows: React.Dispatch<React.SetStateAction<LoadRow[]>>
  onNext: () => void
}) {
  const [customName, setCustomName] = useState("")
  const [customWatt, setCustomWatt] = useState("")

  const peak = peakLoadWatt(rows)
  const daily = dailyEnergyWh(rows)

  const addPreset = (preset: AppliancePreset) => {
    setRows((prev) => {
      // Picking the same appliance twice bumps its quantity instead of
      // stacking duplicate rows.
      const existing = prev.find((r) => r.name === preset.name)
      if (existing) {
        return prev.map((r) => (r.id === existing.id ? { ...r, qty: r.qty + 1 } : r))
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: preset.name,
          watt: preset.watt,
          qty: 1,
          hours: preset.hours,
          icon: preset.icon,
        },
      ]
    })
  }

  const addCustom = () => {
    const watt = Number(customWatt)
    if (!customName.trim() || !watt || watt <= 0) return
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: customName.trim(), watt, qty: 1, hours: 4, icon: "custom" },
    ])
    setCustomName("")
    setCustomWatt("")
  }

  const patch = (id: string, change: Partial<LoadRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...change } : r)))

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Presets */}
      <div className="rounded-[18px] border border-border bg-surface-2 p-4 sm:p-5">
        <h2 className="font-heading text-[17px] font-extrabold text-text">
          Quick Add Preset <span className="text-muted">/ লোড সিলেক্ট করুন</span>
        </h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
          Select typical appliances to add them directly into your daily calculation sheet.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {appliancePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => addPreset(preset)}
              className="flex items-center gap-2 rounded-[14px] border border-border bg-surface px-2.5 py-2.5 text-left transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/50"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-orange-500">
                <LoadIcon icon={preset.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold leading-tight text-text">{preset.name}</span>
                <span className="block text-[11.5px] tabular-nums text-muted">{preset.watt} Watts</span>
              </span>
              <Plus className="size-4 shrink-0 text-muted" />
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-[14px] border border-border bg-surface p-3.5">
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Custom appliance / অন্যান্য লোড
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Appliance name (e.g. Iron)"
              className="flex-1"
            />
            <Input
              value={customWatt}
              onChange={(e) => setCustomWatt(e.target.value)}
              inputMode="numeric"
              placeholder="Watts (যেমন ১০০০)"
              className="sm:w-[150px]"
            />
          </div>
          <Button type="button" className="mt-2.5 w-full" onClick={addCustom}>
            Add Custom Load
          </Button>
        </div>
      </div>

      {/* Load list */}
      <div className="rounded-[18px] border border-border bg-surface-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-[17px] font-extrabold text-text">
              Your Load List ({rows.length})
            </h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Customize specific quantities and running hours daily.
            </p>
          </div>
          {rows.length > 0 && (
            <button
              onClick={() => setRows([])}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-red-500"
            >
              <RotateCcw className="size-3.5" /> Clear All
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {rows.length === 0 && (
            <p className="rounded-[14px] border border-dashed border-border bg-surface px-4 py-8 text-center text-[13px] text-muted">
              Nothing added yet — pick an appliance on the left to start.
            </p>
          )}

          {rows.map((row) => (
            <div key={row.id} className="rounded-[14px] border border-border bg-surface p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-orange-500">
                  <LoadIcon icon={row.icon} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-text">
                  {row.name}
                </span>
                <button
                  onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                  aria-label={`Remove ${row.name}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <input
                    value={row.watt}
                    onChange={(e) => patch(row.id, { watt: Number(e.target.value) || 0 })}
                    inputMode="numeric"
                    aria-label={`${row.name} watts`}
                    className="h-9 w-[70px] rounded-lg border border-border bg-surface-2 px-2 text-center text-[13px] font-bold tabular-nums text-text outline-none"
                  />
                  W
                </label>

                <div className="flex h-9 items-center overflow-hidden rounded-lg border border-border">
                  <button
                    onClick={() => patch(row.id, { qty: Math.max(1, row.qty - 1) })}
                    aria-label={`Fewer ${row.name}`}
                    className="flex h-full w-8 items-center justify-center bg-surface-2 text-text"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="min-w-9 text-center text-[13px] font-bold tabular-nums text-text">
                    {row.qty}
                  </span>
                  <button
                    onClick={() => patch(row.id, { qty: row.qty + 1 })}
                    aria-label={`More ${row.name}`}
                    className="flex h-full w-8 items-center justify-center bg-surface-2 text-text"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <input
                    value={row.hours}
                    onChange={(e) =>
                      patch(row.id, { hours: Math.min(24, Math.max(0, Number(e.target.value) || 0)) })
                    }
                    inputMode="numeric"
                    aria-label={`${row.name} hours per day`}
                    className="h-9 w-[64px] rounded-lg border border-border bg-surface-2 px-2 text-center text-[13px] font-bold tabular-nums text-text outline-none"
                  />
                  HRS
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard label="Peak sizing load" value={`${peak.toLocaleString("en-US")} W`} />
          <StatCard label="Daily energy demand" value={`${(daily / 1000).toFixed(2)} kWh`} />
        </div>

        <Button size="lg" className="mt-4 w-full" disabled={rows.length === 0} onClick={onNext}>
          Step 2: Backup Preferences / সায়জিং হিসেব করুন →
        </Button>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-3.5">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="mt-1 font-heading text-[26px] font-extrabold leading-none tabular-nums text-orange-500">
        {value}
      </div>
    </div>
  )
}
