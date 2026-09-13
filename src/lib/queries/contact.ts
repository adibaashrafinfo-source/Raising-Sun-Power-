import { supabase } from "@/lib/supabase"
import type { ContactMessageInsert } from "@/types/database"

export async function createContactMessage(input: ContactMessageInsert): Promise<void> {
  const { error } = await supabase.from("contact_messages").insert(input)
  if (error) throw error
}
