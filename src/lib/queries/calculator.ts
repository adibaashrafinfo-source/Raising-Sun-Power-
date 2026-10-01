import { supabase } from "@/lib/supabase"
import type { CalculatorAppliance, CalculatorSettings } from "@/types/database"

export async function fetchCalculatorSettings(): Promise<CalculatorSettings | null> {
  const { data, error } = await supabase.from("calculator_settings").select("*").eq("id", 1).maybeSingle()
  if (error) throw error
  return data
}

export async function updateCalculatorSettings(patch: Partial<CalculatorSettings>) {
  const { error } = await supabase.from("calculator_settings").update(patch).eq("id", 1)
  if (error) throw error
}

/** What the public calculator offers: the switched-on appliances, in order. */
export async function fetchCalculatorAppliances(): Promise<CalculatorAppliance[]> {
  const { data, error } = await supabase
    .from("calculator_appliances")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name")
  if (error) throw error
  return data ?? []
}

/** The admin list, which includes the ones switched off. */
export async function fetchCalculatorAppliancesAdmin(): Promise<CalculatorAppliance[]> {
  const { data, error } = await supabase
    .from("calculator_appliances")
    .select("*")
    .order("sort_order")
    .order("name")
  if (error) throw error
  return data ?? []
}

export type CalculatorApplianceInput = Omit<CalculatorAppliance, "id" | "created_at"> & { id?: string }

export async function upsertCalculatorAppliance(appliance: CalculatorApplianceInput) {
  const { error } = await supabase.from("calculator_appliances").upsert(appliance)
  if (error) throw error
}

export async function deleteCalculatorAppliance(id: string) {
  const { error } = await supabase.from("calculator_appliances").delete().eq("id", id)
  if (error) throw error
}
