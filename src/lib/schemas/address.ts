import { z } from "zod"

export const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, "Enter a name"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  division: z.string().min(1, "Select a division"),
  district: z.string().min(1, "Select a district"),
  upazila: z.string().optional(),
  addressLine: z.string().min(5, "Enter the full address"),
  landmark: z.string().optional(),
  isDefault: z.boolean(),
})

export type AddressFormValues = z.infer<typeof addressSchema>
