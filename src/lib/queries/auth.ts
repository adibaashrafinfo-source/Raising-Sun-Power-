import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/database"

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, patch: Partial<Pick<Profile, "full_name" | "phone">>) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId)
  if (error) throw error
}

export async function signUp(params: { email: string; password: string; fullName: string; phone: string }) {
  const { error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: { full_name: params.fullName, phone: params.phone } },
  })
  if (error) throw error
}

export async function signIn(params: { email: string; password: string }) {
  const { error } = await supabase.auth.signInWithPassword(params)
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  })
  if (error) throw error
}

/**
 * Where a user belongs immediately after signing in: staff go straight to the
 * admin dashboard, everyone else to their account. Read directly rather than
 * via AuthProvider so the decision never races the profile fetch.
 */
export async function fetchLandingPath(): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return "/account"
    const profile = await fetchProfile(user.id)
    const role = profile?.role
    return role === "admin" || role === "manager" || role === "staff" ? "/admin" : "/account"
  } catch {
    return "/account"
  }
}
