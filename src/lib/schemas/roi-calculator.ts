import { z } from "zod"

export const roiLeadSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
  division: z.string().min(1, "Select a division"),
  district: z.string().min(1, "Select a district"),
})

export type RoiLeadFormValues = z.infer<typeof roiLeadSchema>
