import type { RoiCalculatorSettings } from "@/types/database"

// Rough weighted average residential rate — used only to back-estimate
// monthly units from a bill amount when the customer doesn't know their kWh.
// Not exact slab-reverse math; fine for a lead-gen estimate, not for billing.
const RESIDENTIAL_AVG_RATE_FOR_ESTIMATION = 9.5

// Approximate Bangladesh grid emission factor (kg CO2/kWh) and the commonly
// used "kg CO2 absorbed per tree per year" figure — both marketing-angle
// placeholders, not authoritative sources.
const CO2_FACTOR_KG_PER_KWH = 0.65
const KG_CO2_PER_TREE_PER_YEAR = 21

export type RoiCustomerType = "residential" | "commercial" | "industrial"

export type RoiCalculatorInput = {
  monthlyUnitsKWh?: number
  monthlyBillBDT?: number
  customerType: RoiCustomerType
}

export type RoiYearBreakdown = {
  year: number
  generationKWh: number
  tariffRate: number
  netSavingsBDT: number
  cumulativeSavingsBDT: number
}

export type RoiCalculatorResult = {
  monthlyUnitsKWh: number
  requiredSystemSizeKW: number
  totalInvestmentBDT: number
  annualGenerationY1KWh: number
  annualSavingsY1BDT: number
  monthlySavingsY1BDT: number
  paybackPeriodYears: number
  totalLifetimeSavingsBDT: number
  netLifetimeProfitBDT: number
  roiPercentLifetime: number
  annualCO2OffsetKg: number
  treesEquivalent: number
  yearlyBreakdown: RoiYearBreakdown[]
}

export function getEffectiveTariffRate(
  units: number,
  customerType: RoiCustomerType,
  settings: RoiCalculatorSettings,
): number {
  if (customerType === "commercial") return settings.commercial_rate
  if (customerType === "industrial") return settings.industrial_rate
  const slab = settings.residential_slabs.find(
    (s) => units >= s.minUnits && (s.maxUnits === null || units <= s.maxUnits),
  )
  return slab?.rate ?? settings.residential_slabs[settings.residential_slabs.length - 1].rate
}

export function calculateSolarROI(
  input: RoiCalculatorInput,
  settings: RoiCalculatorSettings,
): RoiCalculatorResult {
  const avgRate =
    input.customerType === "residential"
      ? RESIDENTIAL_AVG_RATE_FOR_ESTIMATION
      : input.customerType === "commercial"
        ? settings.commercial_rate
        : settings.industrial_rate

  const monthlyUnitsKWh = input.monthlyUnitsKWh ?? (input.monthlyBillBDT ?? 0) / avgRate

  const dailyEnergyNeedKWh = monthlyUnitsKWh / 30
  const requiredSystemSizeKW =
    dailyEnergyNeedKWh / (settings.avg_peak_sun_hours_per_day * settings.system_efficiency_factor)

  const totalInvestmentBDT = requiredSystemSizeKW * settings.cost_per_kw_installed_bdt

  const annualGenerationY1KWh =
    requiredSystemSizeKW * settings.avg_peak_sun_hours_per_day * settings.system_efficiency_factor * 365

  const effectiveTariffRate = getEffectiveTariffRate(monthlyUnitsKWh, input.customerType, settings)
  const annualSavingsY1BDT = annualGenerationY1KWh * effectiveTariffRate

  const paybackPeriodYears = totalInvestmentBDT / annualSavingsY1BDT

  const yearlyBreakdown: RoiYearBreakdown[] = []
  let cumulative = 0
  let totalLifetimeSavingsBDT = 0

  for (let y = 1; y <= settings.panel_lifespan_years; y++) {
    const generation = annualGenerationY1KWh * Math.pow(1 - settings.annual_degradation_rate, y - 1)
    const tariff = effectiveTariffRate * Math.pow(1 + settings.annual_electricity_price_escalation, y - 1)
    const gross = generation * tariff
    const maintenance = totalInvestmentBDT * settings.annual_maintenance_cost_rate
    const net = gross - maintenance
    cumulative += net
    totalLifetimeSavingsBDT += net
    yearlyBreakdown.push({
      year: y,
      generationKWh: generation,
      tariffRate: tariff,
      netSavingsBDT: net,
      cumulativeSavingsBDT: cumulative,
    })
  }

  const netLifetimeProfitBDT = totalLifetimeSavingsBDT - totalInvestmentBDT
  const roiPercentLifetime = (netLifetimeProfitBDT / totalInvestmentBDT) * 100

  const annualCO2OffsetKg = annualGenerationY1KWh * CO2_FACTOR_KG_PER_KWH
  const treesEquivalent = annualCO2OffsetKg / KG_CO2_PER_TREE_PER_YEAR

  return {
    monthlyUnitsKWh,
    requiredSystemSizeKW,
    totalInvestmentBDT,
    annualGenerationY1KWh,
    annualSavingsY1BDT,
    monthlySavingsY1BDT: annualSavingsY1BDT / 12,
    paybackPeriodYears,
    totalLifetimeSavingsBDT,
    netLifetimeProfitBDT,
    roiPercentLifetime,
    annualCO2OffsetKg,
    treesEquivalent,
    yearlyBreakdown,
  }
}
