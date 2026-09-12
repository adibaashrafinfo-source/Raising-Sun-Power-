import { z } from "zod"

export const checkoutSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
    email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
    division: z.string().min(1, "Select a division"),
    district: z.string().min(1, "Select a district"),
    upazila: z.string().optional(),
    area: z.string().optional(),
    address: z.string().min(5, "Enter your full address"),
    landmark: z.string().optional(),
    deliveryMethod: z.enum(["courier", "pickup"]),
    paymentMethod: z.enum(["cod", "bkash", "nagad"]),
    paymentSenderNumber: z.string().optional(),
    paymentReference: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "cod") {
      if (!data.paymentSenderNumber?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentSenderNumber"],
          message: "Enter the number you sent payment from",
        })
      }
      if (!data.paymentReference?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentReference"],
          message: "Enter the transaction ID",
        })
      }
    }
  })

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
