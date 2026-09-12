export const bdGeo: Record<string, Record<string, string[]>> = {
  Dhaka: {
    Dhaka: ["Dhanmondi", "Mirpur", "Uttara", "Gulshan", "Mohammadpur"],
    Gazipur: ["Tongi", "Gazipur Sadar", "Kaliakair"],
    Narayanganj: ["Narayanganj Sadar", "Fatullah", "Siddhirganj"],
  },
  Chattogram: {
    Chattogram: ["Kotwali", "Pahartali", "Panchlaish", "Halishahar"],
    "Cox's Bazar": ["Cox's Bazar Sadar", "Teknaf", "Ukhia"],
    Cumilla: ["Cumilla Sadar", "Laksam"],
  },
  Khulna: {
    Khulna: ["Khulna Sadar", "Sonadanga", "Khalishpur"],
    Jashore: ["Jashore Sadar", "Benapole"],
  },
  Rajshahi: {
    Rajshahi: ["Boalia", "Motihar", "Rajpara"],
    Bogura: ["Bogura Sadar", "Sherpur"],
  },
  Sylhet: {
    Sylhet: ["Sylhet Sadar", "Beanibazar", "Golapganj"],
    Moulvibazar: ["Moulvibazar Sadar", "Sreemangal"],
  },
  Barishal: {
    Barishal: ["Barishal Sadar", "Bakerganj"],
    Bhola: ["Bhola Sadar", "Char Fasson"],
  },
  Rangpur: {
    Rangpur: ["Rangpur Sadar", "Mithapukur"],
    Dinajpur: ["Dinajpur Sadar", "Parbatipur"],
  },
  Mymensingh: {
    Mymensingh: ["Mymensingh Sadar", "Trishal", "Muktagacha"],
    Jamalpur: ["Jamalpur Sadar", "Sarishabari"],
  },
}

export const bdDivisions = Object.keys(bdGeo)

export function districtsFor(division: string | undefined): string[] {
  if (!division || !bdGeo[division]) return []
  return Object.keys(bdGeo[division])
}

export function upazilasFor(division: string | undefined, district: string | undefined): string[] {
  if (!division || !district) return []
  return bdGeo[division]?.[district] ?? []
}

export function isInsideDhaka(district: string | undefined): boolean {
  return district === "Dhaka"
}
