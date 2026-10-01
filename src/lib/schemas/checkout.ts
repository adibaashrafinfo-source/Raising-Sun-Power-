import { z } from "zod"

export const checkoutSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
    email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
    // Address is required for courier only — see the refinement below.
    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    area: z.string().optional(),
    address: z.string().optional(),
    landmark: z.string().optional(),
    deliveryMethod: z.enum(["courier", "pickup"]),
    paymentMethod: z.enum(["cod", "bkash", "nagad"]),
    paymentSenderNumber: z.string().optional(),
    paymentReference: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Picking the order up from an office needs no delivery address.
    if (data.deliveryMethod === "courier") {
      if (!data.division?.trim()) {
        ctx.addIssue({ code: "custom", path: ["division"], message: "Select a division" })
      }
      if (!data.district?.trim()) {
        ctx.addIssue({ code: "custom", path: ["district"], message: "Select a district" })
      }
      if ((data.address?.trim().length ?? 0) < 5) {
        ctx.addIssue({ code: "custom", path: ["address"], message: "Enter your full address" })
      }
    }
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
