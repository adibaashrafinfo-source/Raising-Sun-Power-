import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSeo } from "@/hooks/use-seo"
import { signUp } from "@/lib/queries/auth"
import { type RegisterFormValues, registerSchema } from "@/lib/schemas/auth"

export default function RegisterPage() {
  useSeo({ title: "Create Account" })
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await signUp(values)
      toast.success("Account created! Check your email to verify, then sign in.")
      navigate("/login")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create your account.")
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Track orders, save addresses and your wishlist"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue no-underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Full name</Label>
          <Input placeholder="Your name" {...register("fullName")} />
          {errors.fullName && (
            <span className="text-xs font-medium text-red-500">{errors.fullName.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Phone (+880)</Label>
          <Input placeholder="01XXX-XXXXXX" {...register("phone")} />
          {errors.phone && <span className="text-xs font-medium text-red-500">{errors.phone.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <span className="text-xs font-medium text-red-500">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Password</Label>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && (
            <span className="text-xs font-medium text-red-500">{errors.password.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Confirm password</Label>
          <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <span className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</span>
          )}
        </div>
        <Button size="lg" type="submit" disabled={isSubmitting} className="mt-1.5 w-full">
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthCard>
  )
}
