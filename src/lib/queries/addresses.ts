import { supabase } from "@/lib/supabase"
import type { Address, AddressInsert } from "@/types/database"

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createAddress(address: AddressInsert): Promise<void> {
  if (address.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", address.user_id)
  }
  const { error } = await supabase.from("addresses").insert(address)
  if (error) throw error
}

export async function updateAddress(id: string, userId: string, patch: Partial<AddressInsert>): Promise<void> {
  if (patch.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId)
  }
  const { error } = await supabase.from("addresses").update(patch).eq("id", id)
  if (error) throw error
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from("addresses").delete().eq("id", id)
  if (error) throw error
}
