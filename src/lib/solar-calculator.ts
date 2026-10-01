/**
 * The engineering constants the sizing is built on. They ship as defaults and
 * are overridden by the calculator_settings row, so the admin panel can retune
 * the calculator (panel size, sun hours, battery depth of discharge…) without
 * a deploy.
 */
export type SolarCalculatorConfig = {
  inverterSizesVa: number[]
  batteryVoltage: number
  depthOfDischarge: number
  inverterEfficiency: number
  avgSunHours: number
  panelUnitWp: number
  inverterHeadroom: number
}

export const DEFAULT_CALCULATOR_CONFIG: SolarCalculatorConfig = {
  inverterSizesVa: [400, 600, 800, 1000, 1500, 2000, 2600],
  batteryVoltage: 12,
  depthOfDischarge: 0.5,
  inverterEfficiency: 0.85,
  avgSunHours: 4.5,
  panelUnitWp: 55,
  inverterHeadroom: 1.275,
}

export type ApplianceInput = {
  name: string
  watt: number
  qty: number
}

export type SolarCalculatorInput = {
  totalLoadWatt: number
  backupHours: number
  dailyUsageHours?: number
  /** Per-appliance hours give a truer daily figure than one blanket number. */
  dailyEnergyWh?: number
  batteryType?: "leadacid" | "lithium" | "notsure"
}

export type SolarCalculatorResult = {
  totalLoadWatt: number
  backupHours: number
  dailyUsageHours: number
  inverterVA: number
  batteryAh: number
  solarWp: number
  panelCount: number
  panelUnitWp: number
  dailyEnergyWh: number
  batteryVoltage: number
  batteryType: "leadacid" | "lithium" | "notsure"
}

export function sumApplianceLoad(appliances: ApplianceInput[]): number {
  return appliances.reduce((total, a) => total + a.watt * a.qty, 0)
}

function roundUpToNearest(value: number, step: number): number {
  return Math.ceil(value / step) * step
}

function roundToNearestInverterSize(value: number, sizes: number[]): number {
  const size = [...sizes].sort((a, b) => a - b).find((s) => s >= value)
  return size ?? roundUpToNearest(value, 200)
}

export function calculateSolarSystem(
  input: SolarCalculatorInput,
  config: SolarCalculatorConfig = DEFAULT_CALCULATOR_CONFIG,
): SolarCalculatorResult {
  const { totalLoadWatt, backupHours } = input
  const dailyUsageHours = input.dailyUsageHours ?? backupHours
  const batteryType = input.batteryType ?? "notsure"

  const inverterVA = roundToNearestInverterSize(
    Math.ceil(totalLoadWatt * config.inverterHeadroom),
    config.inverterSizesVa,
  )

  const batteryAhRaw =
    (totalLoadWatt * backupHours) /
    (config.batteryVoltage * config.depthOfDischarge * config.inverterEfficiency)
  const batteryAh = roundUpToNearest(batteryAhRaw, 10)

  const dailyEnergyWh = input.dailyEnergyWh ?? totalLoadWatt * dailyUsageHours
  const solarWpRaw = Math.ceil(dailyEnergyWh / config.avgSunHours)
  const solarWp = roundUpToNearest(solarWpRaw, config.panelUnitWp)
  const panelCount = Math.max(1, Math.ceil(solarWp / config.panelUnitWp))

  return {
    totalLoadWatt,
    backupHours,
    dailyUsageHours,
    inverterVA,
    batteryAh,
    solarWp,
    panelCount,
    panelUnitWp: config.panelUnitWp,
    dailyEnergyWh,
    batteryVoltage: config.batteryVoltage,
    batteryType,
  }
}

/** Maps a calculator_settings row onto the config the sizing takes. */
export function configFromSettings(
  row:
    | {
        battery_voltage: number
        depth_of_discharge: number
        inverter_efficiency: number
        avg_sun_hours: number
        panel_unit_wp: number
        inverter_headroom: number
        inverter_sizes_va: number[]
      }
    | null
    | undefined,
): SolarCalculatorConfig {
  if (!row) return DEFAULT_CALCULATOR_CONFIG
  return {
    inverterSizesVa: row.inverter_sizes_va?.length
      ? row.inverter_sizes_va
      : DEFAULT_CALCULATOR_CONFIG.inverterSizesVa,
    batteryVoltage: Number(row.battery_voltage) || DEFAULT_CALCULATOR_CONFIG.batteryVoltage,
    depthOfDischarge: Number(row.depth_of_discharge) || DEFAULT_CALCULATOR_CONFIG.depthOfDischarge,
    inverterEfficiency: Number(row.inverter_efficiency) || DEFAULT_CALCULATOR_CONFIG.inverterEfficiency,
    avgSunHours: Number(row.avg_sun_hours) || DEFAULT_CALCULATOR_CONFIG.avgSunHours,
    panelUnitWp: Number(row.panel_unit_wp) || DEFAULT_CALCULATOR_CONFIG.panelUnitWp,
    inverterHeadroom: Number(row.inverter_headroom) || DEFAULT_CALCULATOR_CONFIG.inverterHeadroom,
  }
}
