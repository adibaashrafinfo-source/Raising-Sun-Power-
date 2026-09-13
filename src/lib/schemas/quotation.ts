import { z } from "zod"

export const quotationSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
  division: z.string().min(1, "Select a division"),
  district: z.string().min(1, "Select a district"),
  load: z
    .string()
    .min(1, "Enter your load requirement")
    .refine((v) => Number(v) > 0, "Enter a valid wattage"),
  backupHours: z.number().min(1).max(12),
  budget: z.string().optional(),
  roof: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
})

export type QuotationFormValues = z.infer<typeof quotationSchema>
