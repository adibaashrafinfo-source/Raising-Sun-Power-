import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Enter a subject"),
  message: z.string().min(10, "Message should be at least 10 characters"),
})

export type ContactFormValues = z.infer<typeof contactSchema>
