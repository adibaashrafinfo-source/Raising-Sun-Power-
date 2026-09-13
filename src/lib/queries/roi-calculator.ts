import { supabase } from "@/lib/supabase"
import type { RoiCalculatorSettings } from "@/types/database"

export async function fetchRoiSettings(): Promise<RoiCalculatorSettings> {
  const { data, error } = await supabase.from("roi_calculator_settings").select("*").eq("id", 1).single()
  if (error) throw error
  return data
}

export async function updateRoiSettings(patch: Partial<RoiCalculatorSettings>) {
  const { error } = await supabase.from("roi_calculator_settings").update(patch).eq("id", 1)
  if (error) throw error
}
