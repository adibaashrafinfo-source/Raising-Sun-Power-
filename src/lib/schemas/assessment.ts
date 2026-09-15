import { z } from "zod"

export const customerTypes = ["Residential", "Commercial", "Industrial", "Institution"] as const
export const systemTypes = ["On-grid", "Hybrid", "Off-grid", "Not sure"] as const
export const monthlyBillOptions = [
  "Under ৳2,000",
  "৳2,000–5,000",
  "৳5,000–10,000",
  "৳10,000–25,000",
  "৳25,000+",
]

export const assessmentSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  location: z.string().min(2, "Enter your location (area, district)"),
  customerType: z.enum(customerTypes, { message: "Select a customer type" }),
  systemType: z.enum(systemTypes, { message: "Select the system you need" }),
  monthlyBill: z.string().optional(),
  roofType: z.string().optional(),
  message: z.string().optional(),
})

export type AssessmentFormValues = z.infer<typeof assessmentSchema>
