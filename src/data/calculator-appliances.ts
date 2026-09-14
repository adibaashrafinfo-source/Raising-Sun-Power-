// Typical running-wattage figures for common Bangladeshi household appliances
// (LED lighting, standard AC ceiling fans, average compressor duty-cycle load
// for the fridge/AC rather than peak startup draw).
export const defaultAppliances = [
  { name: "LED Light / Bulb", watt: 12, qty: 4 },
  { name: "Ceiling Fan", watt: 75, qty: 2 },
  { name: "Refrigerator (Medium)", watt: 130, qty: 1 },
  { name: "LED TV (32\"–43\")", watt: 80, qty: 1 },
  { name: "Router / Modem", watt: 10, qty: 1 },
  { name: "Water Pump (1HP)", watt: 750, qty: 0 },
  { name: "Air Conditioner (1 Ton)", watt: 1200, qty: 0 },
  { name: "Iron", watt: 1000, qty: 0 },
  { name: "Desktop Computer", watt: 200, qty: 0 },
  { name: "Laptop", watt: 65, qty: 0 },
]

export const budgetOptions = ["Under ৳50k", "৳50k–1L", "৳1L–3L", "৳3L+", "Not sure"]
export const roofOptions = ["Rooftop – Tin", "Rooftop – Concrete", "Ground Mount", "Not sure"]
export const timelineOptions = ["ASAP", "Within 1 month", "Just exploring"]
