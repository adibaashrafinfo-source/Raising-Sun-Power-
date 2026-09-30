/** Presets for the calculator's quick-add grid: typical running wattage and a
 *  sensible default of hours per day for a Bangladeshi household. */
export type AppliancePreset = {
  name: string
  bn: string
  watt: number
  hours: number
  icon: string
}

export const appliancePresets: AppliancePreset[] = [
  { name: "LED Bulb", bn: "এলইডি বাল্ব", watt: 9, hours: 6, icon: "bulb" },
  { name: "Ceiling Fan", bn: "সিলিং ফ্যান", watt: 75, hours: 12, icon: "fan" },
  { name: "Air Conditioner", bn: "এয়ার কন্ডিশনার", watt: 1400, hours: 6, icon: "ac" },
  { name: "LED Television", bn: "এলইডি টিভি", watt: 100, hours: 5, icon: "tv" },
  { name: "Refrigerator", bn: "ফ্রিজ", watt: 150, hours: 24, icon: "fridge" },
  { name: "Water Pump", bn: "ওয়াটার পাম্প", watt: 750, hours: 1, icon: "pump" },
  { name: "Computer Desktop", bn: "কম্পিউটার", watt: 200, hours: 6, icon: "desktop" },
  { name: "Smartphone Charger", bn: "মোবাইল চার্জার", watt: 15, hours: 4, icon: "phone" },
  { name: "WiFi Router", bn: "ওয়াইফাই রাউটার", watt: 10, hours: 24, icon: "wifi" },
  { name: "Electric Iron", bn: "ইস্ত্রি", watt: 1000, hours: 1, icon: "iron" },
]

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
