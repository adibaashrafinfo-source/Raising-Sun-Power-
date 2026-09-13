import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-provider"
import { updatePassword, updateProfile } from "@/lib/queries/auth"

const profileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
})
type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function AccountProfilePage() {
  const { user, profile, refreshProfile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile?.full_name ?? "", phone: profile?.phone ?? "" },
  })

  const onSaveProfile = async (values: ProfileFormValues) => {
    if (!user) return
    try {
      await updateProfile(user.id, { full_name: values.fullName, phone: values.phone })
      await refreshProfile()
      toast.success("Profile updated")
    } catch {
      toast.error("Couldn't update your profile")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 font-heading text-base font-extrabold text-text">Profile details</div>
        <form onSubmit={handleSubmit(onSaveProfile)} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Full name</Label>
            <Input placeholder="Your name" {...register("fullName")} />
            {errors.fullName && (
              <span className="text-xs font-medium text-red-500">{errors.fullName.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phone</Label>
            <Input placeholder="01XXX-XXXXXX" {...register("phone")} />
            {errors.phone && <span className="text-xs font-medium text-red-500">{errors.phone.message}</span>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-1.5 self-start">
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </div>

      <PasswordSection />
    </div>
  )
}

function PasswordSection() {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  const onSubmit = async (values: PasswordFormValues) => {
    setSubmitting(true)
    try {
      await updatePassword(values.password)
      toast.success("Password updated")
      reset()
    } catch {
      toast.error("Couldn't update your password")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 font-heading text-base font-extrabold text-text">Change password</div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>New password</Label>
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
        </div>
        <Button type="submit" disabled={submitting} className="self-start">
          {submitting ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </div>
  )
}
