import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Enter a product name"),
  slug: z.string().min(2, "Enter a URL slug"),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  sku: z.string().optional(),
  unit: z.string().min(1, "Enter a unit"),
  price: z.string().refine((v) => Number(v) > 0, "Enter a valid price"),
  salePrice: z.string().optional(),
  costPrice: z.string().refine((v) => v === "" || Number(v) >= 0, "Enter a valid cost price"),
  stockQty: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Enter stock quantity"),
  reorderLevel: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Enter a reorder level"),
  warrantyMonths: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Enter warranty months"),
  hasSerialTracking: z.boolean(),
  isActive: z.boolean(),
  description: z.string().optional(),
  badges: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
})

export type ProductFormValues = z.infer<typeof productSchema>

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
