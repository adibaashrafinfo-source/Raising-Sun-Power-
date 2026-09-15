import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSeo } from "@/hooks/use-seo"
import { fetchLandingPath, signIn } from "@/lib/queries/auth"
import { type LoginFormValues, loginSchema } from "@/lib/schemas/auth"

export default function LoginPage() {
  useSeo({ title: "Sign In" })
  const navigate = useNavigate()
  const location = useLocation()
  // Only set when a guard bounced the user here from a protected page.
  const from = (location.state as { from?: string } | null)?.from

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values)
      navigate(from ?? (await fetchLandingPath()), { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sign in. Check your credentials.")
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Rising Sun Power account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-blue no-underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <span className="text-xs font-medium text-red-500">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <Link to="/forgot-password" className="text-xs font-semibold text-blue no-underline">
              Forgot password?
            </Link>
          </div>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && (
            <span className="text-xs font-medium text-red-500">{errors.password.message}</span>
          )}
        </div>
        <Button size="lg" type="submit" disabled={isSubmitting} className="mt-1.5 w-full">
          {isSubmitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </AuthCard>
  )
}
