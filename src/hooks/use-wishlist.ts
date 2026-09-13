import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth-provider"
import { addToWishlist, fetchWishlist, removeFromWishlist } from "@/lib/queries/wishlist"

export function useWishlist() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: () => fetchWishlist(user!.id),
    enabled: !!user,
  })

  const items = useMemo(() => query.data ?? [], [query.data])
  const ids = useMemo(() => new Set(items.map((i) => i.product_id)), [items])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] })

  const addMutation = useMutation({
    mutationFn: (productId: string) => addToWishlist(user!.id, productId),
    onSuccess: invalidate,
  })
  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(user!.id, productId),
    onSuccess: invalidate,
  })

  const toggle = (productId: string) => {
    if (!user) {
      toast.error("Sign in to save items to your wishlist.")
      return
    }
    if (ids.has(productId)) {
      removeMutation.mutate(productId)
    } else {
      addMutation.mutate(productId)
      toast.success("Added to wishlist")
    }
  }

  return { items, ids, isLoading: query.isLoading, toggle, remove: removeMutation.mutate }
}
