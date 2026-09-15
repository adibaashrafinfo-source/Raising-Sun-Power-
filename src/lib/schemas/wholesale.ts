import { z } from "zod"

export const wholesaleInquiryTypes = [
  "Request Wholesale Price",
  "Become a Dealer",
  "Talk to Sales",
] as const

export type WholesaleInquiryType = (typeof wholesaleInquiryTypes)[number]

export const wholesaleSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  company: z.string().optional(),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  location: z.string().min(2, "Enter your location (area, district)"),
  inquiryType: z.enum(wholesaleInquiryTypes, { message: "Select an enquiry type" }),
  message: z.string().optional(),
})

export type WholesaleFormValues = z.infer<typeof wholesaleSchema>
