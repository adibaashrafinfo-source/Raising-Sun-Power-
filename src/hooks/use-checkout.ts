import { useMutation, useQuery } from "@tanstack/react-query"

import { createOrder, fetchOrder, fetchOrderItems, fetchSettings } from "@/lib/queries/checkout"
import type { OrderInsert, OrderItemInsert } from "@/types/database"

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60_000 })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ order, items }: { order: OrderInsert; items: OrderItemInsert[] }) =>
      createOrder(order, items),
  })
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
  })
}

export function useOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order-items", orderId],
    queryFn: () => fetchOrderItems(orderId!),
    enabled: !!orderId,
  })
}
