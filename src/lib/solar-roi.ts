import type { RoiCalculatorSettings, RoiTariffSlab } from "@/types/database"

// Approximate Bangladesh grid emission factor (kg CO2/kWh) and the commonly
// used "kg CO2 absorbed per tree per year" figure.
const CO2_FACTOR_KG_PER_KWH = 0.65
const KG_CO2_PER_TREE_PER_YEAR = 21

export type RoiCustomerType = "residential" | "commercial" | "industrial"

export type RoiCalculatorInput = {
  monthlyUnitsKWh?: number
  monthlyBillBDT?: number
  customerType: RoiCustomerType
  /**
   * Net metering exports surplus to the grid for credit. Without it, only the
   * units consumed while the sun is up actually save money.
   */
  netMetering?: boolean
  /** Optional cap, e.g. 70% of sanctioned load under the net metering rules. */
  maxSystemSizeKW?: number
}

export type RoiYearBreakdown = {
  year: number
  generationKWh: number
  /** Average effective rate the offset units were worth that year. */
  tariffRate: number
  /** Bill reduction before costs. */
  grossSavingsBDT: number
  /** O&M plus any inverter replacement falling in this year. */
  costsBDT: number
  netSavingsBDT: number
  cumulativeSavingsBDT: number
}

export type RoiCalculatorResult = {
  monthlyUnitsKWh: number
  monthlyBillBDT: number
  requiredSystemSizeKW: number
  sizeCappedByLimit: boolean
  totalInvestmentBDT: number
  annualGenerationY1KWh: number
  /** Share of year-1 generation that actually turns into bill savings. */
  utilisationRatio: number
  annualSavingsY1BDT: number
  monthlySavingsY1BDT: number
  /** Years until cumulative net savings repay the investment. */
  paybackPeriodYears: number
  totalLifetimeSavingsBDT: number
  netLifetimeProfitBDT: number
  roiPercentLifetime: number
  /** Net present value of the project at the configured discount rate. */
  npvBDT: number
  /** Internal rate of return, as a fraction (0.18 = 18%). */
  irr: number | null
  /** Levelised cost of energy, BDT per kWh produced over the system's life. */
  lcoeBDTPerKWh: number
  annualCO2OffsetKg: number
  treesEquivalent: number
  lifetimeGenerationKWh: number
  yearlyBreakdown: RoiYearBreakdown[]
}

/** Slabs sorted low→high, defensive against unsorted admin input. */
function sortedSlabs(settings: RoiCalculatorSettings): RoiTariffSlab[] {
  return [...settings.residential_slabs].sort((a, b) => a.minUnits - b.minUnits)
}

/**
 * Bangladesh residential tariff is progressive: each block of units is charged
 * at its own rate. Solar offsets the MOST expensive units first, so the bill
 * has to be computed properly rather than multiplying by one average rate.
 */
export function monthlyBillForUnits(
  units: number,
  customerType: RoiCustomerType,
  settings: RoiCalculatorSettings,
): number {
  if (units <= 0) return 0
  if (customerType === "commercial") return units * settings.commercial_rate
  if (customerType === "industrial") return units * settings.industrial_rate

  let remaining = units
  let bill = 0
  let previousCeiling = 0
  for (const slab of sortedSlabs(settings)) {
    if (remaining <= 0) break
    const ceiling = slab.maxUnits ?? Infinity
    const blockSize = ceiling - previousCeiling
    const unitsInBlock = Math.min(remaining, blockSize)
    bill += unitsInBlock * slab.rate
    remaining -= unitsInBlock
    previousCeiling = ceiling
  }
  return bill
}

/**
 * Inverse of the above — turn a bill the customer actually pays back into units.
 * Walks the slabs instead of dividing by a guessed average rate.
 */
export function unitsForMonthlyBill(
  bill: number,
  customerType: RoiCustomerType,
  settings: RoiCalculatorSettings,
): number {
  if (bill <= 0) return 0
  if (customerType === "commercial") return bill / settings.commercial_rate
  if (customerType === "industrial") return bill / settings.industrial_rate

  let remainingBill = bill
  let units = 0
  let previousCeiling = 0
  for (const slab of sortedSlabs(settings)) {
    const ceiling = slab.maxUnits ?? Infinity
    const blockSize = ceiling - previousCeiling
    const blockCost = blockSize * slab.rate
    if (remainingBill <= blockCost || blockSize === Infinity) {
      units += remainingBill / slab.rate
      return units
    }
    units += blockSize
    remainingBill -= blockCost
    previousCeiling = ceiling
  }
  return units
}

/** Marginal (top-block) rate — what the first units of solar displace. */
export function getEffectiveTariffRate(
  units: number,
  customerType: RoiCustomerType,
  settings: RoiCalculatorSettings,
): number {
  if (customerType === "commercial") return settings.commercial_rate
  if (customerType === "industrial") return settings.industrial_rate
  const slabs = sortedSlabs(settings)
  const slab = slabs.find((s) => units >= s.minUnits && (s.maxUnits === null || units <= s.maxUnits))
  return slab?.rate ?? slabs[slabs.length - 1].rate
}

/**
 * Monthly bill reduction from a given generation, honouring self-consumption
 * and, where net metering applies, credit for exported surplus.
 */
function monthlySavings(
  monthlyUnits: number,
  monthlyGeneration: number,
  customerType: RoiCustomerType,
  settings: RoiCalculatorSettings,
  netMetering: boolean,
): { savings: number; offsetUnits: number } {
  const billBefore = monthlyBillForUnits(monthlyUnits, customerType, settings)

  // Energy used the moment it is produced always counts.
  const selfConsumed = Math.min(monthlyGeneration, monthlyUnits * settings.self_consumption_ratio)
  const surplus = Math.max(0, monthlyGeneration - selfConsumed)

  // Surplus only has value when it can be exported for credit.
  const creditedSurplus = netMetering ? surplus * settings.export_credit_ratio : 0
  const offsetUnits = Math.min(monthlyUnits, selfConsumed + creditedSurplus)

  const billAfter = monthlyBillForUnits(monthlyUnits - offsetUnits, customerType, settings)
  return { savings: billBefore - billAfter, offsetUnits }
}

function npvOf(cashflows: number[], rate: number): number {
  return cashflows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0)
}

/** IRR by bisection — robust for the single sign change a solar project has. */
function computeIRR(cashflows: number[]): number | null {
  let low = -0.9
  let high = 1.5
  if (npvOf(cashflows, low) * npvOf(cashflows, high) > 0) return null
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2
    const value = npvOf(cashflows, mid)
    if (Math.abs(value) < 1) return mid
    if (npvOf(cashflows, low) * value < 0) high = mid
    else low = mid
  }
  return (low + high) / 2
}

export function calculateSolarROI(
  input: RoiCalculatorInput,
  settings: RoiCalculatorSettings,
): RoiCalculatorResult {
  const netMetering = input.netMetering ?? true

  const monthlyUnitsKWh =
    input.monthlyUnitsKWh ??
    unitsForMonthlyBill(input.monthlyBillBDT ?? 0, input.customerType, settings)
  const monthlyBillBDT = monthlyBillForUnits(monthlyUnitsKWh, input.customerType, settings)

  // Daily yield of 1 kWp on this site, after derate.
  const dailyYieldPerKW = settings.avg_peak_sun_hours_per_day * settings.system_efficiency_factor

  const idealSizeKW = dailyYieldPerKW > 0 ? monthlyUnitsKWh / 30 / dailyYieldPerKW : 0
  const cap = input.maxSystemSizeKW
  const sizeCappedByLimit = cap != null && idealSizeKW > cap
  const requiredSystemSizeKW = sizeCappedByLimit ? cap! : idealSizeKW

  const totalInvestmentBDT = requiredSystemSizeKW * settings.cost_per_kw_installed_bdt
  const annualGenerationY1KWh = requiredSystemSizeKW * dailyYieldPerKW * 365

  const yearlyBreakdown: RoiYearBreakdown[] = []
  const cashflows: number[] = [-totalInvestmentBDT]
  let cumulative = 0
  let totalLifetimeSavingsBDT = 0
  let lifetimeGenerationKWh = 0
  let utilisationRatio = 0
  let annualSavingsY1BDT = 0

  for (let year = 1; year <= settings.panel_lifespan_years; year++) {
    // Panels lose more in year one, then settle to a steady annual rate.
    const degradation =
      (1 - settings.first_year_degradation_rate) *
      Math.pow(1 - settings.annual_degradation_rate, Math.max(0, year - 2))
    const generation = annualGenerationY1KWh * (year === 1 ? 1 : degradation)

    const escalation = Math.pow(1 + settings.annual_electricity_price_escalation, year - 1)
    const escalatedSettings: RoiCalculatorSettings = {
      ...settings,
      commercial_rate: settings.commercial_rate * escalation,
      industrial_rate: settings.industrial_rate * escalation,
      residential_slabs: settings.residential_slabs.map((s) => ({ ...s, rate: s.rate * escalation })),
    }

    const { savings: monthlySaving, offsetUnits } = monthlySavings(
      monthlyUnitsKWh,
      generation / 12,
      input.customerType,
      escalatedSettings,
      netMetering,
    )
    const grossSavings = monthlySaving * 12

    // O&M rises with general inflation; the inverter is replaced mid-life.
    const maintenance = totalInvestmentBDT * settings.annual_maintenance_cost_rate * escalation
    const inverterReplacement =
      year === settings.inverter_replacement_year
        ? totalInvestmentBDT * settings.inverter_replacement_cost_ratio
        : 0
    const costs = maintenance + inverterReplacement

    const net = grossSavings - costs
    cumulative += net
    totalLifetimeSavingsBDT += net
    lifetimeGenerationKWh += generation
    cashflows.push(net)

    if (year === 1) {
      annualSavingsY1BDT = grossSavings
      utilisationRatio = generation > 0 ? (offsetUnits * 12) / generation : 0
    }

    yearlyBreakdown.push({
      year,
      generationKWh: generation,
      tariffRate: offsetUnits > 0 ? monthlySaving / offsetUnits : 0,
      grossSavingsBDT: grossSavings,
      costsBDT: costs,
      netSavingsBDT: net,
      cumulativeSavingsBDT: cumulative,
    })
  }

  // Payback read off the real cumulative cashflow, interpolated within the
  // year it crosses — not investment ÷ year-one savings, which ignores
  // degradation, rising tariffs, O&M and the inverter swap.
  let paybackPeriodYears = Number.POSITIVE_INFINITY
  for (let i = 0; i < yearlyBreakdown.length; i++) {
    const row = yearlyBreakdown[i]
    if (row.cumulativeSavingsBDT >= totalInvestmentBDT) {
      const previous = i === 0 ? 0 : yearlyBreakdown[i - 1].cumulativeSavingsBDT
      const shortfall = totalInvestmentBDT - previous
      const gained = row.cumulativeSavingsBDT - previous
      paybackPeriodYears = i + (gained > 0 ? shortfall / gained : 0)
      break
    }
  }

  const netLifetimeProfitBDT = totalLifetimeSavingsBDT - totalInvestmentBDT
  const roiPercentLifetime =
    totalInvestmentBDT > 0 ? (netLifetimeProfitBDT / totalInvestmentBDT) * 100 : 0

  const totalLifecycleCost =
    totalInvestmentBDT +
    yearlyBreakdown.reduce((sum, row) => sum + row.costsBDT, 0)
  const lcoeBDTPerKWh = lifetimeGenerationKWh > 0 ? totalLifecycleCost / lifetimeGenerationKWh : 0

  const annualCO2OffsetKg = annualGenerationY1KWh * CO2_FACTOR_KG_PER_KWH

  return {
    monthlyUnitsKWh,
    monthlyBillBDT,
    requiredSystemSizeKW,
    sizeCappedByLimit,
    totalInvestmentBDT,
    annualGenerationY1KWh,
    utilisationRatio,
    annualSavingsY1BDT,
    monthlySavingsY1BDT: annualSavingsY1BDT / 12,
    paybackPeriodYears,
    totalLifetimeSavingsBDT,
    netLifetimeProfitBDT,
    roiPercentLifetime,
    npvBDT: npvOf(cashflows, settings.discount_rate),
    irr: computeIRR(cashflows),
    lcoeBDTPerKWh,
    annualCO2OffsetKg,
    treesEquivalent: annualCO2OffsetKg / KG_CO2_PER_TREE_PER_YEAR,
    lifetimeGenerationKWh,
    yearlyBreakdown,
  }
}
