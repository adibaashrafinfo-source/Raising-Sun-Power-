import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBDT(amount: number) {
  return "৳" + Math.round(amount).toLocaleString("en-US")
}

// Supabase/Postgrest errors carry the real, actionable detail in `hint` and
// `details`, not just `message` (e.g. `message` might just say "permission
// denied" while `hint` says exactly which policy/grant to fix). Always logs
// the full error so it's visible in the browser console for debugging.
export function getErrorMessage(err: unknown, fallback: string): string {
  console.error(err)
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string" && err.message) {
    const hint = "hint" in err && typeof err.hint === "string" ? err.hint : ""
    const details = "details" in err && typeof err.details === "string" ? err.details : ""
    return [err.message, hint, details].filter(Boolean).join(" — ")
  }
  return fallback
}
