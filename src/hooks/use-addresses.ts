import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/lib/auth-provider"
import { createAddress, deleteAddress, fetchAddresses, updateAddress } from "@/lib/queries/addresses"
import type { AddressInsert } from "@/types/database"

export function useAddresses() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => fetchAddresses(user!.id),
    enabled: !!user,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] })

  const createMutation = useMutation({
    mutationFn: (address: AddressInsert) => createAddress(address),
    onSuccess: invalidate,
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AddressInsert> }) =>
      updateAddress(id, user!.id, patch),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: invalidate,
  })

  return {
    addresses: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createAddress: createMutation.mutateAsync,
    updateAddress: updateMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
  }
}
