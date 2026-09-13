const INVERTER_SIZES_VA = [400, 600, 800, 1000, 1500, 2000, 2600]
const BATTERY_VOLTAGE = 12
const DEPTH_OF_DISCHARGE = 0.5
const INVERTER_EFFICIENCY = 0.85
const BD_AVG_SUN_HOURS = 4.5
const PANEL_UNIT_WP = 55

export type ApplianceInput = {
  name: string
  watt: number
  qty: number
}

export type SolarCalculatorInput = {
  totalLoadWatt: number
  backupHours: number
  dailyUsageHours?: number
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

function roundToNearestInverterSize(value: number): number {
  const size = INVERTER_SIZES_VA.find((s) => s >= value)
  return size ?? roundUpToNearest(value, 200)
}

export function calculateSolarSystem(input: SolarCalculatorInput): SolarCalculatorResult {
  const { totalLoadWatt, backupHours } = input
  const dailyUsageHours = input.dailyUsageHours ?? backupHours
  const batteryType = input.batteryType ?? "notsure"

  const inverterVA = roundToNearestInverterSize(Math.ceil(totalLoadWatt * 1.275))

  const batteryAhRaw =
    (totalLoadWatt * backupHours) / (BATTERY_VOLTAGE * DEPTH_OF_DISCHARGE * INVERTER_EFFICIENCY)
  const batteryAh = roundUpToNearest(batteryAhRaw, 10)

  const dailyEnergyWh = totalLoadWatt * dailyUsageHours
  const solarWpRaw = Math.ceil(dailyEnergyWh / BD_AVG_SUN_HOURS)
  const solarWp = roundUpToNearest(solarWpRaw, PANEL_UNIT_WP)
  const panelCount = Math.max(1, Math.ceil(solarWp / PANEL_UNIT_WP))

  return {
    totalLoadWatt,
    backupHours,
    dailyUsageHours,
    inverterVA,
    batteryAh,
    solarWp,
    panelCount,
    panelUnitWp: PANEL_UNIT_WP,
    dailyEnergyWh,
    batteryVoltage: BATTERY_VOLTAGE,
    batteryType,
  }
}
