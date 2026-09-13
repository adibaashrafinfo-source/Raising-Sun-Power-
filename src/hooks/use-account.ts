import { useQuery } from "@tanstack/react-query"

import { fetchMyOrders } from "@/lib/queries/account"

export function useMyOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-orders", userId],
    queryFn: () => fetchMyOrders(userId!),
    enabled: !!userId,
  })
}
