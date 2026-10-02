import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type SendToCourierInput,
  fetchCourierOrders,
  fetchCourierSettings,
  refreshCourierStatus,
  saveCourierCredentials,
  sendOrderToCourier,
  syncAllCourierStatuses,
  testCourierConnection,
} from "@/lib/queries/courier"

export function useCourierSettings() {
  return useQuery({ queryKey: ["courier-settings"], queryFn: fetchCourierSettings })
}

export function useCourierOrders(status?: string) {
  return useQuery({
    queryKey: ["courier-orders", status ?? "all"],
    queryFn: () => fetchCourierOrders(status),
    placeholderData: (prev) => prev,
  })
}

export function useSaveCourierCredentials() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveCourierCredentials,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courier-settings"] }),
  })
}

export function useTestCourierConnection() {
  return useMutation({ mutationFn: testCourierConnection })
}

/** Anything that changes an order's courier fields refreshes the order lists. */
function useCourierOrderMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      queryClient.invalidateQueries({ queryKey: ["courier-orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
    },
  })
}

export function useSendOrderToCourier() {
  return useCourierOrderMutation((input: SendToCourierInput) => sendOrderToCourier(input))
}

export function useRefreshCourierStatus() {
  return useCourierOrderMutation((orderId: string) => refreshCourierStatus(orderId))
}

export function useSyncAllCourierStatuses() {
  return useCourierOrderMutation(() => syncAllCourierStatuses())
}
