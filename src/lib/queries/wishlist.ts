import { supabase } from "@/lib/supabase"
import type { WishlistItem } from "@/types/database"

const WISHLIST_SELECT =
  "*, product:products(*, category:categories(id,name,slug), brand:brands(id,name,slug,logo_url))"

export async function fetchWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(WISHLIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as unknown as WishlistItem[]) ?? []
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase.from("wishlist_items").insert({ user_id: userId, product_id: productId })
  if (error) throw error
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)
  if (error) throw error
}
