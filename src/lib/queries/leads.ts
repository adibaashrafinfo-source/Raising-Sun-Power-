import { supabase } from "@/lib/supabase"
import type { Lead, LeadInsert } from "@/types/database"

export function generateRefId(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `RSP-Q-${num}`
}

export async function createLead(lead: LeadInsert): Promise<Lead> {
  // Only admins can SELECT leads, and Postgres applies SELECT policies to
  // INSERT...RETURNING too — chaining .select().single() here would throw
  // even on a successful insert. Generate the id client-side instead; the
  // caller already has every field it needs to render the confirmation.
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const { error } = await supabase.from("leads").insert({ ...lead, id })
  if (error) throw error
  return { ...lead, id, admin_notes: null, created_at: now, updated_at: now }
}
