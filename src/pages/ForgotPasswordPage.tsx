import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSeo } from "@/hooks/use-seo"
import { requestPasswordReset } from "@/lib/queries/auth"
import { type ForgotPasswordFormValues, forgotPasswordSchema } from "@/lib/schemas/auth"

export default function ForgotPasswordPage() {
  useSeo({ title: "Reset Password", noIndex: true })
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await requestPasswordReset(values.email)
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the reset link.")
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to reset it"
      footer={
        <Link to="/login" className="font-semibold text-blue no-underline">
          ← Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-green-500/16">
            <Check className="size-6 text-green-600" />
          </span>
          <p className="text-sm text-muted">
            If an account exists for that email, a reset link is on its way. Check your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <span className="text-xs font-medium text-red-500">{errors.email.message}</span>}
          </div>
          <Button size="lg" type="submit" disabled={isSubmitting} className="mt-1.5 w-full">
            {isSubmitting ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
