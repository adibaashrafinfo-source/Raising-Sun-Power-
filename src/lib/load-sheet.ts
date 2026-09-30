/** One row of the calculator's load sheet. */
export type LoadRow = {
  id: string
  name: string
  watt: number
  qty: number
  hours: number
  icon: string
}

/** What the inverter has to carry when everything is on at once. */
export function peakLoadWatt(rows: LoadRow[]): number {
  return rows.reduce((total, r) => total + r.watt * r.qty, 0)
}

/** Energy over a day, summed per appliance from its own running hours. */
export function dailyEnergyWh(rows: LoadRow[]): number {
  return rows.reduce((total, r) => total + r.watt * r.qty * r.hours, 0)
}
