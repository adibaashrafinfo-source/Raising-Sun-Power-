import { useState } from "react"
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCalculatorAppliancesAdmin,
  useCalculatorSettings,
  useDeleteCalculatorAppliance,
  useUpdateCalculatorSettings,
  useUpsertCalculatorAppliance,
} from "@/hooks/use-calculator"
import { DEFAULT_CALCULATOR_CONFIG } from "@/lib/solar-calculator"
import { getErrorMessage } from "@/lib/utils"
import type { CalculatorAppliance, CalculatorSettings } from "@/types/database"

/** The icons LoadStep knows how to draw. */
const ICON_CHOICES = [
  "bulb",
  "fan",
  "ac",
  "tv",
  "fridge",
  "pump",
  "desktop",
  "phone",
  "wifi",
  "iron",
  "custom",
]

export default function AdminCalculatorPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-text">Solar Calculator</h1>
        <p className="mt-1 text-sm text-muted">
          Everything the public calculator runs on: the appliances people can quick-add, and the
          engineering constants the system size is worked out from.
        </p>
      </div>
      <SettingsCard />
      <AppliancesCard />
    </div>
  )
}

type SettingsForm = {
  battery_voltage: string
  depth_of_discharge: string
  inverter_efficiency: string
  avg_sun_hours: string
  panel_unit_wp: string
  inverter_headroom: string
  inverter_sizes_va: string
}

function SettingsCard() {
  const { data: settings, isLoading } = useCalculatorSettings()

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />
  // Remounted when the row changes, so the form's initial state is the saved
  // row — no effect copying one into the other.
  return <SettingsForm key={settings?.updated_at ?? "defaults"} settings={settings ?? null} />
}

function SettingsForm({ settings }: { settings: CalculatorSettings | null }) {
  const updateSettings = useUpdateCalculatorSettings()
  const [form, setForm] = useState<SettingsForm>(() => ({
    battery_voltage: String(settings?.battery_voltage ?? DEFAULT_CALCULATOR_CONFIG.batteryVoltage),
    depth_of_discharge: String(settings?.depth_of_discharge ?? DEFAULT_CALCULATOR_CONFIG.depthOfDischarge),
    inverter_efficiency: String(
      settings?.inverter_efficiency ?? DEFAULT_CALCULATOR_CONFIG.inverterEfficiency,
    ),
    avg_sun_hours: String(settings?.avg_sun_hours ?? DEFAULT_CALCULATOR_CONFIG.avgSunHours),
    panel_unit_wp: String(settings?.panel_unit_wp ?? DEFAULT_CALCULATOR_CONFIG.panelUnitWp),
    inverter_headroom: String(settings?.inverter_headroom ?? DEFAULT_CALCULATOR_CONFIG.inverterHeadroom),
    inverter_sizes_va: (settings?.inverter_sizes_va ?? DEFAULT_CALCULATOR_CONFIG.inverterSizesVa).join(
      ", ",
    ),
  }))

  const set = <K extends keyof SettingsForm>(key: K, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sizes = form.inverter_sizes_va
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isFinite(v) && v > 0)
    if (sizes.length === 0) {
      toast.error("Enter at least one inverter size")
      return
    }
    try {
      await updateSettings.mutateAsync({
        battery_voltage: Number(form.battery_voltage),
        depth_of_discharge: Number(form.depth_of_discharge),
        inverter_efficiency: Number(form.inverter_efficiency),
        avg_sun_hours: Number(form.avg_sun_hours),
        panel_unit_wp: Number(form.panel_unit_wp),
        inverter_headroom: Number(form.inverter_headroom),
        inverter_sizes_va: sizes,
      })
      toast.success("Calculator settings saved")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save these settings"))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 font-heading text-base font-extrabold text-text">Sizing constants</div>
      <p className="mb-4 text-xs text-muted">
        These drive every result the calculator shows. Change one and the next visitor's estimate uses it.
      </p>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <NumField
          label="Panel size (Wp)"
          hint="The panel wattage the array is counted in"
          value={form.panel_unit_wp}
          onChange={(v) => set("panel_unit_wp", v)}
        />
        <NumField
          label="Average sun hours / day"
          hint="Bangladesh averages about 4.5"
          value={form.avg_sun_hours}
          onChange={(v) => set("avg_sun_hours", v)}
        />
        <NumField
          label="Battery voltage (V)"
          value={form.battery_voltage}
          onChange={(v) => set("battery_voltage", v)}
        />
        <NumField
          label="Depth of discharge"
          hint="0.5 means half the battery is usable"
          value={form.depth_of_discharge}
          onChange={(v) => set("depth_of_discharge", v)}
        />
        <NumField
          label="Inverter efficiency"
          hint="0.85 = 85%"
          value={form.inverter_efficiency}
          onChange={(v) => set("inverter_efficiency", v)}
        />
        <NumField
          label="Inverter headroom"
          hint="1.275 sizes the inverter 27.5% above the load"
          value={form.inverter_headroom}
          onChange={(v) => set("inverter_headroom", v)}
        />
        <div className="sm:col-span-2 lg:col-span-3">
          <Label className="mb-1.5 block">Inverter sizes sold (VA, comma separated)</Label>
          <Input
            value={form.inverter_sizes_va}
            onChange={(e) => set("inverter_sizes_va", e.target.value)}
          />
          <p className="mt-1.5 text-xs text-muted">
            The result is rounded up to the next size on this list, so it only ever recommends an
            inverter you actually stock.
          </p>
        </div>
      </div>
      <Button type="submit" className="mt-4" disabled={updateSettings.isPending}>
        {updateSettings.isPending ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  )
}

function AppliancesCard() {
  const { data: appliances = [], isLoading } = useCalculatorAppliancesAdmin()
  const upsert = useUpsertCalculatorAppliance()
  const remove = useDeleteCalculatorAppliance()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CalculatorAppliance | null>(null)

  const handleDelete = async (appliance: CalculatorAppliance) => {
    if (!confirm(`Delete "${appliance.name}"?`)) return
    try {
      await remove.mutateAsync(appliance.id)
      toast.success("Appliance deleted")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this appliance"))
    }
  }

  const toggleActive = async (appliance: CalculatorAppliance) => {
    try {
      const { created_at: _c, ...rest } = appliance
      await upsert.mutateAsync({ ...rest, is_active: !appliance.is_active })
      toast.success(appliance.is_active ? "Appliance hidden" : "Appliance shown")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update this appliance"))
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-heading text-base font-extrabold text-text">Quick-add appliances</div>
          <p className="mt-0.5 text-xs text-muted">
            The tiles people tap in step one. Watts and hours seed each row they add.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4" /> New Appliance
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : appliances.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No appliances yet — the calculator is showing its built-in list. Add one to take over.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Bangla</th>
                <th className="px-3 py-2.5 font-semibold">Watts</th>
                <th className="px-3 py-2.5 font-semibold">Hours / day</th>
                <th className="px-3 py-2.5 font-semibold">Order</th>
                <th className="px-3 py-2.5 font-semibold">State</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {appliances.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-3 py-2.5 font-semibold text-text">{a.name}</td>
                  <td className="px-3 py-2.5 text-muted">{a.name_bn || "—"}</td>
                  <td className="px-3 py-2.5 tabular-nums text-text">{a.watt}</td>
                  <td className="px-3 py-2.5 tabular-nums text-text">{Number(a.hours)}</td>
                  <td className="px-3 py-2.5 tabular-nums text-muted">{a.sort_order}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        a.is_active
                          ? "rounded-full bg-green-500/12 px-2 py-0.5 text-[11px] font-bold text-green-600"
                          : "rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-bold text-muted"
                      }
                    >
                      {a.is_active ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" title="Show / hide" onClick={() => toggleActive(a)}>
                        {a.is_active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit"
                        onClick={() => {
                          setEditing(a)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" title="Delete" onClick={() => handleDelete(a)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApplianceDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appliance={editing}
        nextOrder={appliances.length ? Math.max(...appliances.map((a) => a.sort_order)) + 1 : 0}
      />
    </div>
  )
}

function ApplianceDialog({
  open,
  onOpenChange,
  appliance,
  nextOrder,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appliance: CalculatorAppliance | null
  nextOrder: number
}) {
  const upsert = useUpsertCalculatorAppliance()
  const [form, setForm] = useState({
    name: appliance?.name ?? "",
    name_bn: appliance?.name_bn ?? "",
    watt: String(appliance?.watt ?? ""),
    hours: String(appliance?.hours ?? ""),
    icon: appliance?.icon ?? "custom",
    sort_order: String(appliance?.sort_order ?? nextOrder),
    is_active: appliance?.is_active ?? true,
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Enter a name")
      return
    }
    try {
      await upsert.mutateAsync({
        ...(appliance ? { id: appliance.id } : {}),
        name: form.name.trim(),
        name_bn: form.name_bn.trim() || null,
        watt: Number(form.watt) || 0,
        hours: Number(form.hours) || 1,
        icon: form.icon,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      })
      toast.success(appliance ? "Appliance updated" : "Appliance added")
      onOpenChange(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this appliance"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{appliance ? "Edit Appliance" : "New Appliance"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Bangla name</Label>
              <Input value={form.name_bn} onChange={(e) => set("name_bn", e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Watts *</Label>
              <Input type="number" value={form.watt} onChange={(e) => set("watt", e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Hours per day *</Label>
              <Input
                type="number"
                step="0.5"
                value={form.hours}
                onChange={(e) => set("hours", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Icon</Label>
              <select
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
              >
                {ICON_CHOICES.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">Order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="size-4 accent-[var(--blue)]"
            />
            Show in the calculator
          </label>
          <DialogFooter>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? "Saving…" : "Save Appliance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function NumField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
